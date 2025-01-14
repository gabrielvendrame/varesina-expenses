"use client"

import React, { ReactNode, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query';
import { GetBalanceStatsResponseType } from '@/app/api/stats/balance/route';
import { UserSettings } from '@prisma/client';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { TrashIcon, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import CountUp from 'react-countup';
import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';


interface Props {
    from: Date,
    to: Date,
    userSettings: UserSettings
}

function TransactionsCard({from, to, userSettings}: Props) {
    const historyQuery = useQuery<GetTransactionHistoryResponseType>({
        queryKey: ['transactions', 'history', from, to],
        queryFn: () => fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json())
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    return (
        <div className="relative flex w-full gap-2">
            <SkeletonWrapper isLoading={historyQuery.isFetching}>
                <Card className="md:h-24 h-fit w-full items-center gap-2 md:p-4 p-1 md:flex-row flex-col flex">
                    <CardHeader className="text-start w-full">
                        <CardTitle
                            className="text-muted-foreground md:text-lg text-md text-start w-full justify-start">
                            Spese
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex flex-col h-[200px] w-full">
                        {historyQuery?.data?.map((transaction) => (
                            <div key={transaction.id} className="flex w-full mb-4 mt-2 justify-between">
                                <div className="flex w-full">
                                    <div
                                        className={cn("flex items-start justify-center me-2", transaction.type === "expense" ? "text-red-500" : "text-emerald-500")}>{transaction.type === "expense" ?
                                        <TrendingDown size={24}/> :
                                        <TrendingUp size={24}/>}</div>
                                    <div className="flex flex-col">
                                        <div>{formatter.format(transaction.amount)}</div>
                                        <div><small className="text-muted-foreground">{transaction.description}</small>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {/*<Button variant={"ghost"}><TrashIcon fill={"red"} stroke={"red"} className="h-4 w-4"></TrashIcon></Button>*/}
                                </div>

                            </div>))}
                    </ScrollArea>
                </Card>
            </SkeletonWrapper>
        </div>
    )
}

export default TransactionsCard
