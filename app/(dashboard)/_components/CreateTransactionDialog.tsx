"use client"

import { ReactNode, useCallback } from 'react';
import { TransactionType } from '@/lib/types';

interface Props {
    trigger: ReactNode
    type: TransactionType
}

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { CalendarIcon } from 'lucide-react';
import { it } from "date-fns/locale"

function CreateTransactionDialog({trigger, type}: Props) {
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

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crea nuova <span
                        className={cn("m-1", type === "income" ? "text-emerald-500" : "text-red-500")}>{type === "income" ? "entrata" : "spesa"}</span></DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Descrizione</FormLabel>
                                    <FormControl>
                                        <Input defaultValue={""} {...field}/>
                                    </FormControl>
                                    <FormDescription>
                                        Descrizione della transazione (opzionale)
                                    </FormDescription>
                                </FormItem>
                            )}
                        ></FormField>
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Importo</FormLabel>
                                    <FormControl>
                                        <Input defaultValue={0} type={"number"} {...field}/>
                                    </FormControl>
                                    <FormDescription>
                                        Importo
                                    </FormDescription>
                                </FormItem>
                            )}
                        ></FormField>
                        <div className="flex items-center justify-between gap-2">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                        <FormControl>
                                            <CategoryPicker onChange={handleCategoryChange}
                                                            type={type}></CategoryPicker>
                                        </FormControl>
                                        <FormDescription>
                                            Seleziona una categoria
                                        </FormDescription>
                                    </FormItem>
                                )}
                            ></FormField>
                            <FormField
                                control={form.control}
                                name="date"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Data transazione</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn(
                                                        "w-[200px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}>{field.value ? (
                                                        format(field.value, "PPP", {locale: it})
                                                    ) : (
                                                        <span>Seleziona una data</span>
                                                    )}<CalendarIcon className="ml-auto h-4 w-4 opacity-50"></CalendarIcon>  </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar locale={it} mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Seleziona una data per la transazione
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            ></FormField>
                        </div>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTransactionDialog
