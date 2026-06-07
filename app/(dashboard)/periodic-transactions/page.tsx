"use client"

import React from 'react'
import PeriodicTransactionTable from '@/app/(dashboard)/periodic-transactions/_components/PeriodicTransactionTable'
import CreatePeriodicTransactionDialog from '@/app/(dashboard)/periodic-transactions/_components/CreatePeriodicTransactionDialog'

function PeriodicTransactionsPage() {
    return (
        <>
            <div className="border-b bg-card flex items-center justify-center flex-col">
                <div className="container flex flex-wrap items-center justify-between gap-6 py-8 px-2">
                    <div>
                        <p className="text-xl md:text-3xl font-bold">Transazioni periodiche</p>
                        <p className="text-sm text-muted-foreground">Gestisci le tue spese ed entrate ricorrenti</p>
                    </div>
                    <CreatePeriodicTransactionDialog/>
                </div>
            </div>
            <div className="container mx-auto py-8 px-2">
                <PeriodicTransactionTable/>
            </div>
        </>
    )
}

export default PeriodicTransactionsPage
