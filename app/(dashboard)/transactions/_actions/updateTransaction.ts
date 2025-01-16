"use server"

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { UpdateTransactionSchemaType } from '@/schema/transacton';

export async function UpdateTransaction(id: string, oldAmount: number, updateBody: UpdateTransactionSchemaType) {
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in')
    }
    const transaction = await prisma.transaction.findUnique({
        where: {
            userId: user.id,
            id
        }
    })

    if (!transaction) {
        throw new Error('Transaction not found')
    }

    const transactionDelta = updateBody.amount - oldAmount

    const {category} = updateBody
    const categoryRow = await prisma.category.findFirst({
        where: {
            userId: user.id,
            name: category,
        }
    })

    if (!categoryRow) {
        throw new Error('Category not found')
    }

    await prisma.$transaction([
        prisma.transaction.update({
            where: {
                id,
                userId: user.id
            },
            data: {
                ...updateBody,
                category: categoryRow.name,
                categoryIcon: categoryRow.icon
            }
        }),
        prisma.monthHistory.update({
            where: {
                userId_day_month_year: {
                    userId: user.id,
                    day: transaction.date.getUTCDate(),
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear()
                }
            },
            data: {
                ...{[transaction.type]: {[transaction.type === 'expense' ? "decrement" : "increment"]: transactionDelta}}
            }
        }),
        prisma.yearHistory.update({
            where: {
                userId_month_year: {
                    userId: user.id,
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear()
                }
            },
            data: {
                ...{[transaction.type]: {[transaction.type === 'expense' ? "decrement" : "increment"]: transactionDelta}}
            }
        })
    ])
}
