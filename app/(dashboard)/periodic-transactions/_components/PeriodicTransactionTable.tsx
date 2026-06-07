"use client"

import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState } from '@tanstack/table-core'
import { flexRender, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import SkeletonWrapper from '@/components/SkeletonWrapper'
import { DataTableColumnHeader } from '@/components/datatable/ColumnHeader'
import { cn } from '@/lib/utils'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, TrashIcon } from 'lucide-react'
import { GetPeriodicTransactionsResponseType } from '@/app/api/periodic-transactions/route'
import DeletePeriodicTransactionDialog from './DeletePeriodicTransactionDialog'
import { GetFormatterForCurrency } from '@/lib/helpers'

type PeriodicTransactionRow = GetPeriodicTransactionsResponseType[0]

const emptyData: PeriodicTransactionRow[] = []

const DAY_NAMES = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']

function formatFrequency(intervalValue: number, intervalUnit: string, weekDay?: number | null): string {
    const unitMap: Record<string, [string, string]> = {
        days: ['giorno', 'giorni'],
        weeks: ['settimana', 'settimane'],
        months: ['mese', 'mesi'],
        years: ['anno', 'anni'],
    }
    const [sing, plur] = unitMap[intervalUnit] ?? ['?', '?']
    const unit = intervalValue === 1 ? sing : `${intervalValue} ${plur}`
    let label = `Ogni ${unit}`
    if (intervalUnit === 'weeks' && weekDay !== null && weekDay !== undefined) {
        label += ` (${DAY_NAMES[weekDay]})`
    }
    return label
}

function PeriodicTransactionTable() {
    const [sorting, setSorting] = useState<SortingState>([])

    const userSettings = useQuery({
        queryKey: ['userSettings'],
        queryFn: () => fetch('/api/user-settings').then(res => res.json())
    })
    const formatter = useMemo(
        () => GetFormatterForCurrency(userSettings.data?.currency || 'EUR'),
        [userSettings.data?.currency]
    )

    const query = useQuery<GetPeriodicTransactionsResponseType>({
        queryKey: ['periodic-transactions'],
        queryFn: () => fetch('/api/periodic-transactions').then(res => res.json())
    })

    const columns = useMemo<ColumnDef<PeriodicTransactionRow>[]>(() => [
        {
            accessorKey: 'type',
            header: ({column}) => <DataTableColumnHeader column={column} title="Tipo"/>,
            cell: ({row}) => (
                <div className={cn(
                    'capitalize rounded-lg text-center p-2',
                    row.original.type === 'income'
                        ? 'bg-emerald-400/10 text-emerald-500'
                        : 'bg-red-400/10 text-red-700'
                )}>
                    {row.original.type === 'income' ? 'Entrata' : 'Spesa'}
                </div>
            )
        },
        {
            accessorKey: 'amount',
            header: ({column}) => <DataTableColumnHeader column={column} title="Importo"/>,
            cell: ({row}) => (
                <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
                    {formatter.format(row.original.amount)}
                </p>
            )
        },
        {
            accessorKey: 'description',
            header: ({column}) => <DataTableColumnHeader column={column} title="Descrizione"/>,
            cell: ({row}) => <div>{row.original.description}</div>
        },
        {
            accessorKey: 'category',
            header: ({column}) => <DataTableColumnHeader column={column} title="Categoria"/>,
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <span>{row.original.categoryIcon}</span>
                    <span className="capitalize">{row.original.category}</span>
                </div>
            )
        },
        {
            id: 'frequency',
            header: 'Frequenza',
            cell: ({row}) => (
                <div className="text-sm text-muted-foreground">
                    {formatFrequency(row.original.intervalValue, row.original.intervalUnit, row.original.weekDay)}
                </div>
            )
        },
        {
            accessorKey: 'nextRunAt',
            header: 'Prossima esecuzione',
            cell: ({row}) => {
                const date = new Date(row.original.nextRunAt)
                return (
                    <div className="text-muted-foreground">
                        {date.toLocaleDateString('it-IT', {
                            timeZone: 'UTC',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </div>
                )
            }
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({row}) => <RowActions periodic={row.original}/>
        }
    ], [formatter])

    const table = useReactTable({
        data: query.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {sorting},
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="w-full">
            <SkeletonWrapper isLoading={query.isFetching}>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Nessuna transazione periodica.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </SkeletonWrapper>
        </div>
    )
}

export default PeriodicTransactionTable

function RowActions({periodic}: { periodic: PeriodicTransactionRow }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    return (
        <>
            <DeletePeriodicTransactionDialog
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
                periodicTransactionId={periodic.id}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Apri menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onSelect={() => setShowDeleteDialog(true)}
                    >
                        <TrashIcon className="h-4 w-4 text-muted-foreground"/>
                        Elimina
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
