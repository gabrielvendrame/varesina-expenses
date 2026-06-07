"use server"

import { CreatePeriodicTransactionSchema, CreatePeriodicTransactionSchemaType } from '@/schema/periodicTransaction'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateFirstNextRunAt } from '@/lib/helpers'

export async function CreatePeriodicTransaction(form: CreatePeriodicTransactionSchemaType) {
    const parsed = CreatePeriodicTransactionSchema.safeParse(form)
    if (!parsed.success) throw new Error(parsed.error.message)

    const user = await currentUser()
    if (!user) redirect('/sign-in')

    const { amount, description, category, type, intervalValue, intervalUnit, weekDay, startDate } = parsed.data

    const categoryRow = await prisma.category.findFirst({
        where: { userId: user.id, name: category }
    })
    if (!categoryRow) throw new Error('Categoria non trovata')

    const nextRunAt = calculateFirstNextRunAt(startDate, intervalUnit, weekDay)

    await prisma.periodicTransaction.create({
        data: {
            userId: user.id,
            amount,
            description: description || '',
            category: categoryRow.name,
            categoryIcon: categoryRow.icon,
            type,
            intervalValue,
            intervalUnit,
            weekDay: weekDay ?? null,
            startDate,
            nextRunAt,
        }
    })
}
