import React from 'react'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import CreateTransactionDialog from '@/app/(dashboard)/_components/CreateTransactionDialog';
import Overview from '@/app/(dashboard)/_components/Overview';

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
        <div className="h-full bg-background">
            <div className="border-b bg-card">
                <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
                    <p className="text-3xl font-bold">
                        Ciao, {user.firstName}!
                    </p>
                    <div className="flex items-center gap-3">
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
            <Overview userSettings={userSettings}></Overview>
        </div>
    )
}

export default Page
