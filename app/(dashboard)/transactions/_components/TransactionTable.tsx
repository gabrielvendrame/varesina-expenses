"use client"
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { DateToUTCDate } from '@/lib/helpers';
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState } from '@tanstack/table-core';
import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route';
import { flexRender, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { DataTableColumnHeader } from '@/components/datatable/ColumnHeader';
import { cn } from '@/lib/utils';

interface Props {
    from: Date;
    to: Date;
}

type TransactionHistoryRow = GetTransactionHistoryResponseType[0]

const emptyData: any[] = []

export const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
        accessorKey: "category",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Category"/>
        ),
        cell: ({row}) => (
            <div className="flex gap-2 capitalize">
                {row.original.categoryIcon}
                <div className="capitalize">{row.original.category}</div>
            </div>
        )
    },
    {
        accessorKey: "description",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Description"/>
        ),
        cell: ({row}) => (
            <div className="capitalize">{row.original.description}</div>
        )
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({row}) => {
            const date = new Date(row.original.date)
            const formattedDate = date.toLocaleDateString("default", {
                timeZone: "UTC",
                month: "2-digit",
                day: "2-digit",
                year: "numeric"
            })
            return <div className="text-muted-foreground">{formattedDate}</div>
        }
    },{
        accessorKey: "type",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Tipo"/>
        ),
        cell: ({row}) => (
            <div className={cn(
                "capitalize rounded-lg text-center p-2",
                row.original.type === "income" ? "bg-emerald-400/10 text-emerald-500" : "bg-red-400/10 text-red-700"
            )}>{row.original.type}</div>
        )
    },
    {
        accessorKey: "amount",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Importo"/>
        ),
        cell: ({row}) => (
            <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">{row.original.formatterAmount}</p>
        )
    },
]

function TransactionTable({from, to}: Props) {
    const [sorting, setSorting] = useState<SortingState>([])
    const history = useQuery<GetTransactionHistoryResponseType>({
        queryKey: ['transactions', 'history', from, to],
        queryFn: () => fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json())
    })

    const table = useReactTable({
        data: history.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="w-full">
            {/*<div className="flex flex-wrap items-center justify-between gap-2 py-4"></div>*/}
            <SkeletonWrapper isLoading={history.isFetching}>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
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
                                        No results.
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

export default TransactionTable
