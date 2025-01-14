"use client"

import React, { ReactNode, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query';
import { GetBalanceStatsResponseType } from '@/app/api/stats/balance/route';
import { UserSettings } from '@prisma/client';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import CountUp from 'react-countup';


interface Props {
    from: Date,
    to: Date,
    userSettings: UserSettings
}

function StatsCards({from, to, userSettings}: Props) {
    const statsQuery = useQuery<GetBalanceStatsResponseType>({
        queryKey: ['overview', 'stats', from, to],
        queryFn: () => fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json())
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    const income = statsQuery.data?.income || 0
    const expense = statsQuery.data?.expense || 0
    const balance = income - expense

    return (
        <div className="relative flex w-full gap-2">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatCard
                    formatter={formatter}
                    value={income}
                    title={"Entrate"}
                    icon={
                        <TrendingUp
                            className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10"></TrendingUp>
                    }
                ></StatCard>
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatCard
                    formatter={formatter}
                    value={expense}
                    title={"Spese"}
                    icon={
                        <TrendingDown
                            className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10"></TrendingDown>
                    }
                ></StatCard>
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatCard
                    formatter={formatter}
                    value={balance}
                    title={"Delta"}
                    icon={
                        <Wallet
                            className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10"></Wallet>
                    }
                ></StatCard>
            </SkeletonWrapper>
        </div>
    )
}

export default StatsCards

function StatCard({formatter, value, title, icon}: {
    formatter: Intl.NumberFormat,
    icon: ReactNode,
    title: string,
    value: number
}) {
    const formatFn = useCallback((value: number) => {
        return formatter.format(value)
    }, [formatter])

    return (
        <Card className="md:h-24 h-fit w-full items-center gap-2 md:p-4 p-1 md:flex-row flex-col flex">
            {icon}
            <div className="flex flex-col md:items-start items-center gap-0">
                <p className="md:flex hidden text-muted-foreground md:text-left text-center md:text-xs">{title}</p>
                <CountUp
                    preserveValue
                    redraw={false}
                    end={value}
                    decimals={2}
                    formattingFn={formatFn}
                    className="md:text-2xl text-md"
                ></CountUp>
            </div>
        </Card>
    )
}
