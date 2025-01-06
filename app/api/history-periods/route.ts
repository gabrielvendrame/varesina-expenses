import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const user = await currentUser()
    if (!user) {
        redirect('/sign-in')
    }

    const periods = await getHistoryPeriods(user.id)

    return Response.json(periods)
}

export type GetHistoryPeriodsResponseType = Awaited<ReturnType<typeof getHistoryPeriods>>

async function getHistoryPeriods(userId: string) {
    const results = await prisma.monthHistory.findMany({
        where: {
            userId,
        },
        select: {
            year: true
        },
        distinct: ['year'],
        orderBy: [
            {
                year: 'asc'
            }
        ]
    });
    const years = results.map(result => result.year)
    if (years.length === 0) {
        return [new Date().getFullYear()]
    }

    return years

}
