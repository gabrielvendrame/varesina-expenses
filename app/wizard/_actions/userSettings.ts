"use server"

import { UpdateUserCurrencySchema } from '@/schema/usetSettings';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function UpdateUserCurrency(currency: string) {
    const parsedBody = UpdateUserCurrencySchema.safeParse({currency})
    if (!parsedBody.success) {
        throw parsedBody.error
    }

    const user = await currentUser();
    if (!user) {
        redirect('/sign-in')
    }

    return prisma.userSettings.update({
        where: {
            userId: user.id
        },
        data: {currency}
    });
}
