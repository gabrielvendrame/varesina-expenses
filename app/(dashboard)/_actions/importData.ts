"use server"

import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function ImportData() {
    const user = await currentUser()
    if(!user){
        redirect('/sign-in')
    }

    const response = await fetch('http://localhost:3000/temp.json')
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    const data: ImportData2[] = await response.json()

    let formattedData = data.map((item: ImportData2) => {
        return {
            amount: item.amount < 0 ? item.amount * -1 : item.amount,
            description: item.description,
            date: new Date(item.expenseDate.seconds * 1000),
            category: 1,
            type: item.amount < 0 ? "expense" : "income"
        }
    })

    formattedData = formattedData.slice(300, formattedData.length)
    const categoryName = 'Senza categoria'
    const categoryIcon = '🫰🏼'

    for(const data of formattedData){
        await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: data.amount,
                    date: data.date,
                    description: data.description || "",
                    type: data.type,
                    category: categoryName,
                    categoryIcon: categoryIcon
                }
            }),
            prisma.monthHistory.upsert({
                where: {
                    userId_day_month_year: {
                        userId: user.id,
                        day: data.date.getUTCDate(),
                        month: data.date.getUTCMonth(),
                        year: data.date.getUTCFullYear(),
                    }
                },
                create: {
                    userId: user.id,
                    day: data.date.getUTCDate(),
                    month: data.date.getUTCMonth(),
                    year: data.date.getUTCFullYear(),
                    expense: data.type === 'expense' ? data.amount : 0,
                    income: data.type === 'income' ? data.amount : 0,
                },
                update: {
                    expense: {
                        increment: data.type === 'expense' ? data.amount : 0,
                    },
                    income: {
                        increment: data.type === 'income' ? data.amount : 0,
                    }

                }
            }),
            prisma.yearHistory.upsert({
                where: {
                    userId_month_year: {
                        userId: user.id,
                        month: data.date.getUTCMonth(),
                        year: data.date.getUTCFullYear(),
                    }
                },
                create: {
                    userId: user.id,
                    month: data.date.getUTCMonth(),
                    year: data.date.getUTCFullYear(),
                    expense: data.type === 'expense' ? data.amount : 0,
                    income: data.type === 'income' ? data.amount : 0,
                },
                update: {
                    expense: {
                        increment: data.type === 'expense' ? data.amount : 0,
                    },
                    income: {
                        increment: data.type === 'income' ? data.amount : 0,
                    }

                }
            })
        ])
    }

    return formattedData
}

interface ImportData2 {
    amount: number,
    description: string,
    expenseDate: { seconds: number }
}
