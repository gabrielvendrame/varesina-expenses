"use client"

import { ReactNode, useCallback, useState } from 'react';
import { TransactionType } from '@/lib/types';

interface Props {
    trigger: ReactNode
    type: TransactionType
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
import { CreateTransactionSchema, CreateTransactionSchemaType } from '@/schema/transacton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CategoryPicker from '@/app/(dashboard)/_components/CategoryPicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
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

function CreateTransactionDialog({trigger, type}: Props) {
    const [open, setOpen] = useState(false)

    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            type,
            date: new Date()
        }
    })

    const handleCategoryChange = useCallback((value: string) => {
        form.setValue("category", value)
    }, [form])

    const queryClient = useQueryClient()


    const {mutate, isPending} = useMutation({
        mutationFn: CreateTransaction,
        onSuccess: async () => {
            toast.success("Transazione creata con successo", {id: "create-transaction"})
            form.reset({
                type,
                description: "",
                amount: 0,
                date: new Date(),
                category: undefined
            })


            await queryClient.invalidateQueries({
                queryKey: ['overview']
            })

            setOpen((prev) => !prev)
        },
        onError: (e) => {
            toast.error(e.message, {id: "create-category"})
        }
    })

    const onSubmit = useCallback((values: CreateTransactionSchemaType) => {
        toast.loading("Creazione transazione...", {id: "create-transaction"})
        mutate({...values, date: DateToUTCDate(values.date)})
    }, [mutate])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>Crea nuova <span
                        className={cn("m-1", type === "income" ? "text-emerald-500" : "text-red-500")}>{type === "income" ? "entrata" : "spesa"}</span></DialogTitle>
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
                                        <Textarea defaultValue={""} {...field}/>
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
                                            <CategoryPicker onChange={handleCategoryChange}
                                                            type={type}></CategoryPicker>
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
                                                    )}<CalendarIcon
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
                        <Button className="md:me-2 me-0" variant={"secondary"} onClick={() => form.reset()}>Annulla</Button>
                    </DialogClose>
                    <Button className="md:mb-0 md:mt-0 mb-4 mt-4" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                        {!isPending && "Crea"}
                        {isPending && <Loader2 className="animate-spin"/>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTransactionDialog
