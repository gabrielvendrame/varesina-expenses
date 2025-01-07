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
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, TrashIcon } from 'lucide-react';
import DeleteTransactionDialog from '@/app/(dashboard)/transactions/_components/DeleteTransactionDialog';

interface Props {
    from: Date;
    to: Date;
}

type TransactionHistoryRow = GetTransactionHistoryResponseType[0]

const emptyData: any[] = []

export const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
        accessorKey: "amount",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Importo"/>
        ),
        cell: ({row}) => (
            <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">{row.original.formatterAmount}</p>
        )
    },
    {
        accessorKey: "type",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Tipo"/>
        ),
        cell: ({row}) => (
            <div className={cn(
                "capitalize rounded-lg text-center p-2",
                row.original.type === "income" ? "bg-emerald-400/10 text-emerald-500" : "bg-red-400/10 text-red-700"
            )}>{row.original.type === "income" ? "Entrata" : "Spesa"}</div>
        )
    },
    {
        accessorKey: "description",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Descrizione"/>
        ),
        cell: ({row}) => (
            <div className="capitalize">{row.original.description}</div>
        )
    },
    {
        accessorKey: "category",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Categoria"/>
        ),
        cell: ({row}) => (
            <div className="flex gap-2 capitalize">
                {row.original.categoryIcon}
                <div className="capitalize">{row.original.category}</div>
            </div>
        )
    },
    {
        accessorKey: "date",
        header: "Data",
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
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({row}) => <RowActions transaction={row.original}/>
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


function RowActions({transaction}: { transaction: TransactionHistoryRow }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    return (
        <>
            <DeleteTransactionDialog open={showDeleteDialog} setOpen={setShowDeleteDialog}
                                     transactionId={transaction.id}/>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onSelect={() => {
                            setShowDeleteDialog(prev => !prev)
                        }}>
                        <TrashIcon className="h-4 w-4 text-muted-foreground"></TrashIcon>
                        Elimina
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
