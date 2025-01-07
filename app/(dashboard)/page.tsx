import React from 'react'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import CreateTransactionDialog from '@/app/(dashboard)/_components/CreateTransactionDialog';
import Overview from '@/app/(dashboard)/_components/Overview';
import History from '@/app/(dashboard)/_components/History';

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
                <div className="container flex flex-wrap items-center justify-between gap-6 py-4 pb-5 md:py-8 px-2">
                    <p className="text-2xl md:text-3xl font-bold">
                        Ciao, {user.firstName}!
                    </p>
                    <div className="flex items-center justify-around md:justify-start w-full gap-3">
                        <CreateTransactionDialog trigger={
                            <Button variant={"outline"}
                                    className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white">Nuova
                                entrata</Button>
                        }
                                                 type={"income"}>
                        </CreateTransactionDialog>
                        <CreateTransactionDialog trigger={
                            <Button variant={"outline"}
                                    className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white">Nuova
                                spesa</Button>}
                                                 type={"expense"}>
                        </CreateTransactionDialog>
                    </div>
                </div>
            </div>
            <div className="px-2 flex items-center flex-col">
                <Overview userSettings={userSettings}></Overview>
                <History userSettings={userSettings}></History>
            </div>

        </div>
    )
}

export default Page
