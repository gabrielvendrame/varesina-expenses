"use client"

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, Loader2, PlusSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from '@/components/ui/responsive-popover'
import CategoryPicker from '@/app/(dashboard)/_components/CategoryPicker'
import { CreatePeriodicTransaction } from '@/app/(dashboard)/periodic-transactions/_actions/createPeriodicTransaction'
import { CreatePeriodicTransactionSchema, CreatePeriodicTransactionSchemaType } from '@/schema/periodicTransaction'

const WEEK_DAYS = [
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mer', value: 3 },
    { label: 'Gio', value: 4 },
    { label: 'Ven', value: 5 },
    { label: 'Sab', value: 6 },
    { label: 'Dom', value: 0 },
]

const EMPTY_DEFAULTS: Partial<CreatePeriodicTransactionSchemaType> = {
    amount: '' as unknown as number,
    description: '',
    category: '',
    intervalValue: 1,
    intervalUnit: 'months',
    weekDay: null,
    startDate: new Date(),
}

function CreatePeriodicTransactionDialog() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<CreatePeriodicTransactionSchemaType>({
        resolver: zodResolver(CreatePeriodicTransactionSchema),
        defaultValues: EMPTY_DEFAULTS,
    })

    const intervalUnit = form.watch('intervalUnit')
    const watchType = form.watch('type')
    const watchWeekDay = form.watch('weekDay')

    const handleCategoryChange = useCallback((value: string) => {
        form.setValue('category', value)
    }, [form])

    const { mutate, isPending } = useMutation({
        mutationFn: CreatePeriodicTransaction,
        onSuccess: async () => {
            toast.success('Transazione periodica creata', { id: 'create-periodic' })
            form.reset(EMPTY_DEFAULTS)
            await queryClient.invalidateQueries({ queryKey: ['periodic-transactions'] })
            setOpen(false)
        },
        onError: (e) => {
            toast.error(e.message, { id: 'create-periodic' })
        }
    })

    const onSubmit = useCallback((values: CreatePeriodicTransactionSchemaType) => {
        toast.loading('Creazione in corso...', { id: 'create-periodic' })
        mutate(values)
    }, [mutate])

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!o) form.reset(EMPTY_DEFAULTS)
            setOpen(o)
        }}>
            <DialogTrigger asChild>
                <Button>
                    <PlusSquare className="mr-2 h-4 w-4"/>
                    Nuova periodica
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Nuova transazione periodica</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField control={form.control} name="amount" render={({field}) => (
                            <FormItem>
                                <FormLabel>Importo</FormLabel>
                                <FormControl>
                                    <Input inputMode="decimal" type="number" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="description" render={({field}) => (
                            <FormItem>
                                <FormLabel>Descrizione</FormLabel>
                                <FormControl>
                                    <Textarea defaultValue="" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}/>

                        <div className="flex items-start justify-between gap-4">
                            <FormField control={form.control} name="category" render={() => (
                                <FormItem className="flex flex-col flex-1">
                                    <FormLabel>Categoria</FormLabel>
                                    <FormControl>
                                        <CategoryPicker onChange={handleCategoryChange}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="startDate" render={({field}) => (
                                <FormItem className="flex flex-col flex-1">
                                    <FormLabel>Data inizio</FormLabel>
                                    <ResponsivePopover>
                                        <ResponsivePopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}>
                                                    {field.value
                                                        ? format(field.value, 'PPP', {locale: it})
                                                        : <span>Seleziona data</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                </Button>
                                            </FormControl>
                                        </ResponsivePopoverTrigger>
                                        <ResponsivePopoverContent className="w-auto p-0">
                                            <Calendar locale={it} mode="single" initialFocus
                                                      selected={field.value}
                                                      onSelect={(v) => {
                                                          if (v) field.onChange(v)
                                                      }}/>
                                        </ResponsivePopoverContent>
                                    </ResponsivePopover>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium leading-none">Ripetizione</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground shrink-0">Ripeti ogni</span>
                                <FormField control={form.control} name="intervalValue" render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                className="w-20"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="intervalUnit" render={({field}) => (
                                    <FormItem className="flex-1">
                                        <Select value={field.value} onValueChange={(v) => {
                                            field.onChange(v)
                                            if (v !== 'weeks') form.setValue('weekDay', null)
                                        }}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="days">Giorni</SelectItem>
                                                <SelectItem value="weeks">Settimane</SelectItem>
                                                <SelectItem value="months">Mesi</SelectItem>
                                                <SelectItem value="years">Anni</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}/>
                            </div>
                        </div>

                        {intervalUnit === 'weeks' && (
                            <FormField control={form.control} name="weekDay" render={() => (
                                <FormItem>
                                    <FormLabel>Giorno della settimana</FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {WEEK_DAYS.map((day) => (
                                            <Button
                                                key={day.value}
                                                type="button"
                                                size="sm"
                                                variant={watchWeekDay === day.value ? 'default' : 'outline'}
                                                onClick={() => form.setValue('weekDay', day.value, {shouldValidate: true})}
                                            >
                                                {day.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        )}

                        <FormField control={form.control} name="type" render={({field}) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "flex-1 border-rose-500",
                                            watchType === 'expense' && "bg-rose-950 text-white hover:bg-rose-700 hover:text-white"
                                        )}
                                        onClick={() => field.onChange('expense')}
                                        disabled={isPending}
                                    >
                                        Spesa
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "flex-1 border-emerald-500",
                                            watchType === 'income' && "bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
                                        )}
                                        onClick={() => field.onChange('income')}
                                        disabled={isPending}
                                    >
                                        Entrata
                                    </Button>
                                </div>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin"/> : 'Salva'}
                        </Button>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreatePeriodicTransactionDialog
