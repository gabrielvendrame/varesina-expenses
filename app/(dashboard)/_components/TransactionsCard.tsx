"use client"

import React, { ReactNode, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query';
import { GetBalanceStatsResponseType } from '@/app/api/stats/balance/route';
import { UserSettings } from '@prisma/client';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { PencilIcon, TrashIcon, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CountUp from 'react-countup';
import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import UpdateTransactionDialog from '@/app/(dashboard)/_components/UpdateTransactionDialog';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';


interface Props {
    from: Date,
    to: Date,
    userSettings: UserSettings
}

function TransactionsCard({from, to, userSettings}: Props) {
    const historyQuery = useQuery<GetTransactionHistoryResponseType>({
        queryKey: ['overview', 'transactions', from, to],
        queryFn: () => fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json())
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    return (
        <div className="relative flex w-full">
            <SkeletonWrapper isLoading={historyQuery.isFetching}>
                <Card
                    className="w-full md:p-4 p-1">
                    <CardHeader className="text-start w-full">
                        <CardTitle
                            className="text-muted-foreground md:text-lg text-md text-start w-full justify-start">
                            Spese
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex md:h-[400px] h-[200px]">
                        <ScrollArea className="flex flex-col w-full">
                            {historyQuery?.data?.map((transaction) => (
                                <div key={transaction.id} className="flex w-full mb-4 mt-2 justify-between">
                                    <div className="flex w-full">
                                        <div
                                            className={cn("flex items-start justify-center me-2", transaction.type === "expense" ? "text-red-500" : "text-emerald-500")}>{transaction.type === "expense" ?
                                            <TrendingDown size={24}/> :
                                            <TrendingUp size={24}/>}</div>
                                        <div className="flex items-center flex-col text-sm justify-center me-4 font-bold" dangerouslySetInnerHTML={{__html: format(transaction.date, "LL MMM", {locale: it}).split(" ").map(e=> `<div>${e}</div>`).join("")}}></div>
                                        <div className="flex flex-col">
                                            <div>{formatter.format(transaction.amount)}</div>
                                            <div><small
                                                className="text-muted-foreground">{transaction.categoryIcon} {transaction.description} </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div>

                                    <UpdateTransactionDialog transaction={transaction} trigger={
                                            <Button variant={"ghost"}><PencilIcon fill={"white"} stroke={"white"}
                                                                                  className="h-4 w-4"></PencilIcon></Button>
                                        }></UpdateTransactionDialog>
                                    </div>

                                </div>))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </SkeletonWrapper>
        </div>
    )
}

export default TransactionsCard
