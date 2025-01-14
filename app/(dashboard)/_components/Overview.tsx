"use client"

import React, { useState } from 'react'
import { UserSettings } from '@prisma/client';
import { differenceInDays, startOfMonth } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { toast } from 'sonner';
import StatsCards from '@/app/(dashboard)/_components/StatsCards';
import CategoryStats from '@/app/(dashboard)/_components/CategoryStats';
import TransactionsCard from '@/app/(dashboard)/_components/TransactionsCard';

function Overview({userSettings}: { userSettings: UserSettings }) {
    const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })
    return (
        <>
            <div className="container flex flex-wrap justify-between items-center gap-2 py-6">
                <h2 className="text-xl md:text-3xl font-bold">Riepilogo</h2>
                <div className="flex items-center gap-3">
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
                                return;
                            }
                            setDateRange({from, to})
                        })}
                    ></DateRangePicker>
                </div>
            </div>
            <div className="container flex w-full flex-col gap-2">
                <StatsCards
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                ></StatsCards>
                <TransactionsCard userSettings={userSettings}
                                  from={dateRange.from}
                                  to={dateRange.to}
                ></TransactionsCard>
                <CategoryStats
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />

            </div>

        </>
    )
}

export default Overview
