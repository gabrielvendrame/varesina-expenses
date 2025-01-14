"use client"

import React, { useCallback } from 'react'
import { CreateTransactionSchema, CreateTransactionSchemaType } from '@/schema/transacton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTransaction } from '@/app/(dashboard)/_actions/transactions';
import { toast } from 'sonner';
import { DateToUTCDate } from '@/lib/helpers';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CategoryPicker from '@/app/(dashboard)/_components/CategoryPicker';
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from '@/components/ui/responsive-popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

function CreateTransactionForm() {

    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
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
                type: undefined,
                description: "",
                amount: undefined,
                date: new Date(),
                category: undefined
            })


            await queryClient.invalidateQueries({
                queryKey: ['overview']
            })

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
        <Form {...form}>
            <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="amount"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Importo</FormLabel>
                            <FormControl>
                                <Input inputMode={"decimal"} type={"number"} {...field}/>
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
                        </FormItem>
                    )}
                ></FormField>

                <div className="flex items-center justify-between gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={() => (
                            <FormItem className="flex flex-col flex-1">
                                <FormLabel>Categoria</FormLabel>
                                <FormControl>
                                    <CategoryPicker onChange={handleCategoryChange}></CategoryPicker>
                                </FormControl>
                            </FormItem>
                        )}
                    ></FormField>
                    <FormField
                        control={form.control}
                        name="date"
                        render={({field}) => (
                            <FormItem className="flex flex-col flex-1">
                                <FormLabel>Data transazione</FormLabel>
                                <ResponsivePopover>
                                    <ResponsivePopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn(
                                                "max-w-[220px] w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}>{field.value ? (
                                                format(field.value, "PPP", {locale: it})
                                            ) : (
                                                <span>Seleziona una data</span>
                                            )}<CalendarIcon
                                                className="ml-auto h-4 ms-2 w-4 opacity-50"></CalendarIcon> </Button>
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
                                <FormMessage/>
                            </FormItem>
                        )}
                    ></FormField>
                </div>

                <FormField
                    control={form.control}
                    name="type"
                    render={({field}) => (
                        <FormItem>
                            <div className="flex items-center justify-around md:justify-start w-full gap-3 mt-5">
                                <Button variant={"outline"} onClick={() => field.onChange("income")}
                                        className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white">Nuova
                                    entrata</Button>
                                <Button variant={"outline"} onClick={() => field.onChange("expense")}
                                        className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white">Nuova
                                    spesa</Button>
                            </div>
                        </FormItem>
                    )}
                ></FormField>


            </form>
        </Form>
    )
}

export default CreateTransactionForm
