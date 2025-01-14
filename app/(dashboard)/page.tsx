import React from 'react'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CreateTransactionForm from '@/app/(dashboard)/_components/CreateTransactionForm';
import Overview from '@/app/(dashboard)/_components/Overview';
import History from '@/app/(dashboard)/_components/History';
import TransactionsCard from '@/app/(dashboard)/_components/TransactionsCard';


async function Page() {
    const user = await currentUser()
    if (!user) {
        redirect('/sign-in')
    }
    const userSettings = await prisma.userSettings.findUnique({
        where: {
            userId: user.id
        }
    });
    if (!userSettings) {
        redirect('/wizard')
    }


    return (
        <div className="h-full bg-background ">
            <div className="border-b bg-card flex justify-center">
                <div className="container flex flex-wrap items-center justify-between gap-6 py-0 pb-5 md:py-8 px-2 mb-4">
                    <p className="text-2xl md:text-3xl font-bold md:block hidden">
                        Ciao, {user.firstName}!
                    </p>
                    <CreateTransactionForm></CreateTransactionForm>
                </div>
            </div>
            <div className="px-2 flex items-center flex-col mt-4">
                <Overview userSettings={userSettings}></Overview>
                <History userSettings={userSettings}></History>
            </div>

</div>
)
}

export default Page
