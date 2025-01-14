"use client"

import React, { useMemo } from 'react'
import { UserSettings } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { TransactionType } from '@/lib/types';
import { GetCategoriesStatsResponseType } from '@/app/api/stats/categories/route';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface Props {
    from: Date,
    to: Date,
    userSettings: UserSettings
}

function CategoryStats({userSettings, from, to}: Props) {

    const statsQuery = useQuery({
        queryKey: ['overview', 'stats', 'categories', from, to],
        queryFn: () => fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json())
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    return (
        <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard
                    formatter={formatter}
                    type={"income"}
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard
                    formatter={formatter}
                    type={"expense"}
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>
        </div>
    )
}

export default CategoryStats

function CategoriesCard({
                            data,
                            type,
                            formatter
                        }: {
    type: TransactionType,
    formatter: Intl.NumberFormat,
    data: GetCategoriesStatsResponseType
}) {
    const filteredData = data.filter(el => el.type === type)
    const total = filteredData.reduce((acc, el) => acc + (el._sum?.amount || 0), 0)

    return (
        <Card className="md:h-80 w-full col-span-6">
            <CardHeader>
                <CardTitle
                    className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col md:text-lg text-md">
                    {type === "income" ? "Entrate" : "Spese"}
                </CardTitle>
            </CardHeader>
            <div className="flex item-center justify-between gap-2">
                {filteredData.length === 0 && (
                    <div className="flex h-60 w-full flex-col items-center justify-center">Nessun dato per il periodo
                        selezionato</div>
                )}
            </div>
            {filteredData.length > 0 && (
                <ScrollArea className="h-40 w-full px-4">
                    <div className="flex w-full flex-col gap-4 p-4">
                        {filteredData.map((el) => {
                            const amount = el._sum?.amount || 0
                            const percentage = (amount * 100) / (total || amount)

                            return (
                                <div key={el.category} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center text-gray-400">
                                            {el.categoryIcon} <span className="text-sm md:text-lg ms-2">{el.category}</span>
                                            <span
                                                className="ml-2 text-xs text-muted-foreground">({percentage.toFixed(0)}%)</span>
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            {formatter.format(amount)}
                                        </span>
                                    </div>

                                    <Progress
                                        value={percentage}
                                        indicator={
                                        type === "income" ? "bg-emerald-500" : "bg-red-500"
                                        }
                                    ></Progress>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            )}
        </Card>
    )
}


