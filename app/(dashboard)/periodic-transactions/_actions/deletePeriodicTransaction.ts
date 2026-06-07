"use server"

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function DeletePeriodicTransaction(id: string) {
    const user = await currentUser()
    if (!user) redirect('/sign-in')

    await prisma.periodicTransaction.deleteMany({
        where: { id, userId: user.id }
    })
}
