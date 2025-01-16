"use client"

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Transaction } from '@prisma/client';

interface Props {
    trigger: ReactNode
    transaction: Transaction
}

import React from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    CreateTransactionSchema,
    CreateTransactionSchemaType,
    UpdateTransactionSchema,
    UpdateTransactionSchemaType
} from '@/schema/transacton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CategoryPicker from '@/app/(dashboard)/_components/CategoryPicker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Trash } from 'lucide-react';
import { it } from "date-fns/locale"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateTransaction } from '@/app/(dashboard)/_actions/transactions';
import { DateToUTCDate } from '@/lib/helpers';
import { Textarea } from '@/components/ui/textarea';
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from '@/components/ui/responsive-popover';
import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route';
import { TransactionType } from '@/lib/types';
import { UpdateTransaction } from '@/app/(dashboard)/transactions/_actions/updateTransaction';
import DeleteTransactionDialog from '@/app/(dashboard)/transactions/_components/DeleteTransactionDialog';

function UpdateTransactionDialog({trigger, transaction}: Props) {
    const [open, setOpen] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const form = useForm<UpdateTransactionSchemaType>({
        resolver: zodResolver(UpdateTransactionSchema),
        defaultValues: {
            type: transaction.type as unknown as TransactionType,
            description: transaction.description as unknown as string,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date
        }
    })

    const handleCategoryChange = useCallback((value: string) => {
        form.setValue("category", value)
    }, [form])

    const queryClient = useQueryClient()


    const {mutate, isPending} = useMutation({
        mutationFn: (formData: UpdateTransactionSchemaType) => UpdateTransaction(transaction.id, transaction.amount, formData),
        onSuccess: async () => {
            toast.success("Transazione aggiornata con successo", {id: "update-transaction"})
            // form.reset({
            //     description: "",
            //     amount: 0,
            //     date: new Date(),
            //     category: undefined
            // })


            await queryClient.invalidateQueries({
                queryKey: ['overview']
            })

            setOpen((prev) => !prev)
        },
        onError: (e) => {
            toast.error(e.message, {id: "update-transaction"})
        }
    })

    useEffect(() => {
        if(!showDeleteDialog) {
            setOpen(false)
        }
    }, [showDeleteDialog]);

    const onSubmit = useCallback((values: UpdateTransactionSchemaType) => {
        toast.loading("Aggiornamento transazione...", {id: "update-transaction"})
        mutate({...values, date: DateToUTCDate(values.date)})
    }, [mutate])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent onOpenAutoFocus={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Aggiorna <span
                        className={cn("m-1", transaction.type === "income" ? "text-emerald-500" : "text-red-500")}>{transaction.type === "income" ? "entrata" : "spesa"}</span></DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Importo</FormLabel>
                                    <FormControl>
                                        <Input type={"number"} {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        ></FormField>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Descrizione</FormLabel>
                                    <FormControl>
                                        <Textarea  {...field}/>
                                    </FormControl>
                                    <FormDescription>
                                        Descrizione della transazione (opzionale)
                                    </FormDescription>
                                </FormItem>
                            )}
                        ></FormField>

                        <div className="flex items-center justify-between gap-2">
                            <FormField
                                control={form.control}
                                name="category"
                                render={() => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Categoria</FormLabel>
                                        <FormControl>
                                            <CategoryPicker defaultValue={transaction.category}
                                                            onChange={handleCategoryChange}
                                            ></CategoryPicker>
                                        </FormControl>
                                        <FormDescription>
                                            <small>Scegli o crea una categoria</small>
                                        </FormDescription>
                                    </FormItem>
                                )}
                            ></FormField>
                            <FormField
                                control={form.control}
                                name="date"
                                render={({field}) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data transazione</FormLabel>
                                        <ResponsivePopover>
                                            <ResponsivePopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn(
                                                        "max-w-[200px] w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}>{field.value ? (
                                                        format(field.value, "PPP", {locale: it})
                                                    ) : (
                                                        <span>Seleziona una data</span>
                                                    )} <CalendarIcon
                                                        className="ml-auto h-4 w-4 opacity-50"></CalendarIcon> </Button>
                                                </FormControl>
                                            </ResponsivePopoverTrigger>
                                            <ResponsivePopoverContent className="w-auto p-0">
                                                <Calendar locale={it} mode="single" initialFocus selected={field.value}
                                                          onSelect={value => {
                                                              if (!value) return
                                                              field.onChange(value)
                                                          }}/>
                                            </ResponsivePopoverContent>
                                        </ResponsivePopover>
                                        <FormDescription>
                                            <small>Scegli una data</small>
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            ></FormField>
                        </div>

                    </form>
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="md:me-2 me-0" variant={"secondary"}
                                onClick={() => form.reset()}>Annulla</Button>
                    </DialogClose>
                    <div className="flex md:mb-0 md:mt-0 mb-4 mt-4">
                        <Button className="w-full me-2" onClick={form.handleSubmit(onSubmit)}
                                disabled={isPending}>
                            {!isPending && "Aggiorna"}
                            {isPending && <Loader2 className="animate-spin"/>}
                        </Button>
                        <Button className="" variant={"destructive"} type={'button'} onClick={()=> setShowDeleteDialog(true)}
                                disabled={isPending}>
                            {!isPending && <Trash size={20}/>}
                            {isPending && <Loader2 className="animate-spin"/>}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
            <DeleteTransactionDialog open={showDeleteDialog} setOpen={setShowDeleteDialog}
                                     transactionId={transaction.id}/>
        </Dialog>
    )
}

export default UpdateTransactionDialog
