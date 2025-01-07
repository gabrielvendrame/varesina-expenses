"use client"
import React, { useState } from 'react'
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { differenceInDays, startOfMonth } from 'date-fns';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { toast } from 'sonner';
import TransactionTable from '@/app/(dashboard)/transactions/_components/TransactionTable';

function TransactionsPage() {
    const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date()
    })
    return (
        <>
            <div className="border-b bd-card">
                <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
                    <div>
                        <p className="text-3xl font-bold">Storico transazioni</p>
                    </div>
                    <DateRangePicker
                        locale={"it-IT"}
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        showCompare={false}
                        onUpdate={(values => {
                            const {from, to} = values.range
                            if (!from || !to) return
                            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                toast.error(`Il range massimo è di ${MAX_DATE_RANGE_DAYS} giorni`)
                            }
                        })}
                    ></DateRangePicker>
                </div>
            </div>
            <div className="container">
                <TransactionTable from={dateRange.from} to={dateRange.to}></TransactionTable>
            </div>
        </>

    )
}

export default TransactionsPage
