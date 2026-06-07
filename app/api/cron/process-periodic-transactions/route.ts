import { prisma } from '@/lib/prisma'
import { timingSafeEqual } from 'crypto'
import { calculateNextRunAt } from '@/lib/helpers'

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    const secret = process.env.CRON_SECRET

    if (!authHeader?.startsWith('Bearer ') || !secret) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    try {
        const tokenBuf = Buffer.from(token)
        const secretBuf = Buffer.from(secret)
        if (tokenBuf.length !== secretBuf.length || !timingSafeEqual(tokenBuf, secretBuf)) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
    } catch {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const due = await prisma.periodicTransaction.findMany({
        where: { nextRunAt: { lte: now } }
    })

    let processed = 0

    for (const periodic of due) {
        let current = periodic.nextRunAt

        while (current <= now) {
            const date = current
            await prisma.$transaction([
                prisma.transaction.create({
                    data: {
                        userId: periodic.userId,
                        amount: periodic.amount,
                        description: periodic.description ?? '',
                        date,
                        type: periodic.type,
                        category: periodic.category,
                        categoryIcon: periodic.categoryIcon,
                    }
                }),
                prisma.monthHistory.upsert({
                    where: {
                        userId_day_month_year: {
                            userId: periodic.userId,
                            day: date.getUTCDate(),
                            month: date.getUTCMonth(),
                            year: date.getUTCFullYear(),
                        }
                    },
                    create: {
                        userId: periodic.userId,
                        day: date.getUTCDate(),
                        month: date.getUTCMonth(),
                        year: date.getUTCFullYear(),
                        expense: periodic.type === 'expense' ? periodic.amount : 0,
                        income: periodic.type === 'income' ? periodic.amount : 0,
                    },
                    update: {
                        expense: { increment: periodic.type === 'expense' ? periodic.amount : 0 },
                        income: { increment: periodic.type === 'income' ? periodic.amount : 0 },
                    }
                }),
                prisma.yearHistory.upsert({
                    where: {
                        userId_month_year: {
                            userId: periodic.userId,
                            month: date.getUTCMonth(),
                            year: date.getUTCFullYear(),
                        }
                    },
                    create: {
                        userId: periodic.userId,
                        month: date.getUTCMonth(),
                        year: date.getUTCFullYear(),
                        expense: periodic.type === 'expense' ? periodic.amount : 0,
                        income: periodic.type === 'income' ? periodic.amount : 0,
                    },
                    update: {
                        expense: { increment: periodic.type === 'expense' ? periodic.amount : 0 },
                        income: { increment: periodic.type === 'income' ? periodic.amount : 0 },
                    }
                }),
            ])
            processed++
            current = calculateNextRunAt(current, periodic.intervalValue, periodic.intervalUnit)
        }

        await prisma.periodicTransaction.update({
            where: { id: periodic.id },
            data: { lastRunAt: now, nextRunAt: current }
        })
    }

    return Response.json({ processed })
}
