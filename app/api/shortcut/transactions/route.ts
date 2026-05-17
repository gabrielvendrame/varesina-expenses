import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const ShortcutTransactionSchema = z.object({
    amount: z.coerce.number().positive().multipleOf(0.01),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    category: z.string().min(1, 'La categoria e obbligatoria'),
    type: z.union([z.literal('expense'), z.literal('income')]).default('expense'),
})

function secureCompare(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a)
    const bBuffer = Buffer.from(b)

    if (aBuffer.length !== bBuffer.length) {
        return false
    }

    return timingSafeEqual(aBuffer, bBuffer)
}

function getBearerToken(authorizationHeader: string | null): string | null {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return null
    }

    const token = authorizationHeader.slice('Bearer '.length).trim()
    return token.length > 0 ? token : null
}

export async function POST(request: Request) {
    const configuredToken = process.env.SHORTCUT_API_TOKEN
    const targetUserId = process.env.SHORTCUT_USER_ID

    if (!configuredToken || !targetUserId) {
        return NextResponse.json(
            { error: 'Server not configured for Shortcut API' },
            { status: 500 },
        )
    }

    const providedToken = getBearerToken(request.headers.get('authorization'))
    if (!providedToken || !secureCompare(providedToken, configuredToken)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 },
        )
    }

    const parsedBody = ShortcutTransactionSchema.safeParse(body)
    if (!parsedBody.success) {
        return NextResponse.json(
            {
                error: 'Validation error',
                details: parsedBody.error.flatten(),
            },
            { status: 400 },
        )
    }

    const { amount, category, description, type } = parsedBody.data
    const date = parsedBody.data.date ?? new Date()

    const categoryRow = await prisma.category.findFirst({
        where: {
            userId: targetUserId,
            name: category,
        },
    })

    if (!categoryRow) {
        return NextResponse.json(
            {
                error: 'Category not found for configured user',
                category,
            },
            { status: 404 },
        )
    }

    const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
            data: {
                userId: targetUserId,
                amount,
                date,
                description: description || '',
                type,
                category: categoryRow.name,
                categoryIcon: categoryRow.icon,
            },
        }),
        prisma.monthHistory.upsert({
            where: {
                userId_day_month_year: {
                    userId: targetUserId,
                    day: date.getUTCDate(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                },
            },
            create: {
                userId: targetUserId,
                day: date.getUTCDate(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === 'expense' ? amount : 0,
                income: type === 'income' ? amount : 0,
            },
            update: {
                expense: {
                    increment: type === 'expense' ? amount : 0,
                },
                income: {
                    increment: type === 'income' ? amount : 0,
                },
            },
        }),
        prisma.yearHistory.upsert({
            where: {
                userId_month_year: {
                    userId: targetUserId,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                },
            },
            create: {
                userId: targetUserId,
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === 'expense' ? amount : 0,
                income: type === 'income' ? amount : 0,
            },
            update: {
                expense: {
                    increment: type === 'expense' ? amount : 0,
                },
                income: {
                    increment: type === 'income' ? amount : 0,
                },
            },
        }),
    ])

    return NextResponse.json(
        {
            ok: true,
            transactionId: transaction.id,
        },
        { status: 201 },
    )
}
