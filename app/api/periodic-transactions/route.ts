import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function getPeriodicTransactions(userId: string) {
    return prisma.periodicTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })
}

export type GetPeriodicTransactionsResponseType = Awaited<ReturnType<typeof getPeriodicTransactions>>

export async function GET() {
    const user = await currentUser()
    if (!user) redirect('/sign-in')

    const data = await getPeriodicTransactions(user.id)
    return Response.json(data)
}
