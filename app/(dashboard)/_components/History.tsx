"use client"

import React, { useCallback, useMemo, useState } from 'react'
import { UserSettings } from '@prisma/client';
import { Period, Timeframe } from '@/lib/types';
import { GetFormatterForCurrency } from '@/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HistoryPeriodSelector from '@/app/(dashboard)/_components/HistoryPeriodSelector';
import { useQuery } from '@tanstack/react-query';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';

interface Props {
    userSettings: UserSettings
}

function History({userSettings}: Props) {
    const [timeframe, setTimeframe] = useState<Timeframe>("year")
    const [period, setPeriod] = useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])


    const historyDataQuery = useQuery({
        queryKey: ["overview", "history", timeframe, period],
        queryFn: () => fetch(`/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`).then(res => res.json())
    })


    const dataAvailable = historyDataQuery?.data?.length > 0;

    return (
        <div className="container mt-8">
            <h2 className="text-xl md:text-3xl font-bold">Storico</h2>
            <Card className="col-span-12 md:mt-12 mt-3 w-full">
                <CardHeader className="gap-2">
                    <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
                        <HistoryPeriodSelector
                            period={period}
                            setPeriod={setPeriod}
                            timeframe={timeframe}
                            setTimeframe={setTimeframe}
                        />
                        <div className="md:flex h-10 gap-2 hidden">
                            <Badge variant={'outline'}
                                   className="flex items-center gap-2 text-sm">
                                <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                                Entrate
                            </Badge>
                            <Badge variant={'outline'}
                                   className="flex items-center gap-2 text-sm">
                                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                                Uscite
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <SkeletonWrapper isLoading={historyDataQuery.isFetching} fullWidth={false}>
                        {dataAvailable && <ResponsiveContainer width={"100%"} height={300}>
                            <AreaChart className="ms-[-30px]" height={300} data={historyDataQuery.data} barCategoryGap={5}>
                                <defs>
                                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={"0.8"}></stop>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={"0"}></stop>
                                    </linearGradient>
                                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={"0.8"}></stop>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={"0"}></stop>
                                    </linearGradient>
                                </defs>
                                {/*<CartesianGrid strokeDasharray="5 5" strokeOpacity={"0.2"} vertical={false}/>*/}

                                {/*<Bar dataKey={"income"} label={"Entrate"} fill="url(#incomeBar)" radius={4}*/}
                                {/*     className="cursor-pointer"/>*/}
                                {/*<Bar dataKey={"expense"} label={"Uscite"} fill="url(#expenseBar)" radius={4}*/}
                                {/*     className="cursor-pointer"/>*/}
                                <Tooltip cursor={{opacity: 0.1}} content={props => (
                                    <CustomTooltip formatter={formatter} {...props}/>
                                )}/>
                                <CartesianGrid strokeOpacity={"0.1"} strokeDasharray="3 3"/>
                                <XAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}
                                       padding={{left: 5, right: 5}} dataKey={data => {
                                    const {year, month, day} = data;
                                    const date = new Date(year, month, day || 1);
                                    if (timeframe === "year") {
                                        return date.toLocaleString('default', {month: 'long'})
                                    }
                                    return date.toLocaleDateString('default', {day: '2-digit'})
                                }}/>
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                <Area type="monotone" dataKey="income" stroke={"#10b981"} label={"Entrate"}
                                      fillOpacity={1}
                                      fill="url(#incomeBar)" className="cursor-pointer"/>
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" label={"Uscite"}
                                      fillOpacity={1}
                                      fill="url(#expenseBar)" className="cursor-pointer"/>
                            </AreaChart>
                        </ResponsiveContainer>}
                        {!dataAvailable && (
                            <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                                Nessun dato per il periodo selezionato
                                <p className="text-sm text-muted-foreground">Prova a selezionare un periodo diverso</p>
                            </Card>
                        )}
                    </SkeletonWrapper>
                </CardContent>
            </Card>
        </div>
    )
}

export default History


function CustomTooltip({active, payload, label, formatter}: any) {
    if (!active || !payload || payload.length == 0) return null
    const data = payload[0].payload;
    const {expense, income} = data

    return <div className="min-w-[300px] rounded border bg-background p-4">
        <TooltipRow formatter={formatter} label="Spese" value={expense} bgColor="bg-red-500"
                    textColor="text-red-500"></TooltipRow>
        <TooltipRow formatter={formatter} label="Entrate" value={income} bgColor="bg-emerald-500"
                    textColor="text-emerald-500"></TooltipRow>
        <TooltipRow formatter={formatter} label="Delta" value={income - expense} bgColor="bg-gray-100"
                    textColor="text-foreground"></TooltipRow>
    </div>
}

function TooltipRow({label, value, bgColor, textColor, formatter}: {
    label: string,
    value: number,
    bgColor: string,
    textColor: string,
    formatter: Intl.NumberFormat
}) {

    const formattingFn = useCallback((value: number) => {
        return formatter.format(value)
    }, [formatter],)

    return <div className="flex items-center gap-2">
        <div className={cn("h-4 w-4 rounded-full", bgColor)}></div>
        <div className="flex w-full justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className={cn("text-sm font-bold", textColor)}>
                <CountUp
                    duration={0.5}
                    preserveValue
                    end={value}
                    decimals={0}
                    formattingFn={formattingFn}
                    className="text-sm"
                ></CountUp>
            </div>
        </div>
    </div>
}
