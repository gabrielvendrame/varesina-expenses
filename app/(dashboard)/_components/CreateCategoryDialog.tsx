"use client"
import React, { useCallback, useState } from 'react'
import { TransactionType } from '@/lib/types';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema/categories';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleOff, Loader2, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data, { Skin } from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { CreateCategory } from '@/app/(dashboard)/_actions/categories';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Category } from '@prisma/client';
import { useTheme } from 'next-themes';
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from '@/components/ui/responsive-popover';

interface Props {
    type: TransactionType,
    successCallback: (category: Category) => void
}

function CreateCategoryDialog({type, successCallback}: Props) {
    const [open, setOpen] = useState(false)
    const theme = useTheme()
    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type
        }
    })

    const queryClient = useQueryClient();

    const {mutate, isPending} = useMutation({
        mutationFn: CreateCategory,
        onSuccess: async (data: Category) => {
            form.reset({
                name: "",
                icon: "",
                type
            })
            toast.success("Categoria creata", {id: "create-category"})

            successCallback(data);

            await queryClient.invalidateQueries({
                queryKey: ['categories']
            })

            setOpen((prev) => !prev)
        },
        onError: (e) => {
            toast.error(e.message, {id: "create-category"})
        }
    })

    const onSubmit = useCallback((values: CreateCategorySchemaType) => {
        toast.loading("Creazione categoria...", {id: "create-category"})
        mutate(values)
    }, [mutate])


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"ghost"}
                        className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"><PlusSquare
                    className="mr-2 h-4 w-4"/>Crea nuovo
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crea nuova categoria di <span
                        className={cn("m-1", type === "income" ? "text-emerald-500" : "text-red-500")}>{type === "income" ? "entrata" : "spesa"}</span></DialogTitle>
                    <DialogDescription>
                        Le categorie sono usate per organizzare le tue transazioni
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder={"Categoria"} {...field}/>
                                    </FormControl>
                                    <FormDescription>
                                        Categoria che descrive la transazione
                                    </FormDescription>
                                </FormItem>
                            )}
                        ></FormField>
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Icona</FormLabel>
                                    <FormControl>
                                        <ResponsivePopover>
                                            <ResponsivePopoverTrigger asChild>
                                                <Button variant={"outline"}
                                                        className="h-[100px] w-full">{form.watch("icon") ? (
                                                        <div className="flex flex-col items-center gap-2"><span
                                                            className="text-5xl" role="img">{field.value}</span><p
                                                            className="text-xs text-muted-foreground">Cambia</p></div>
                                                    ) :
                                                    (<div className="flex flex-col items-center gap-2"><CircleOff
                                                            className="h-[48px] w-[48px]"/><p
                                                            className="text-xs text-muted-foreground">Clicca per
                                                            selezionare</p></div>
                                                    )}</Button>
                                            </ResponsivePopoverTrigger>
                                            <ResponsivePopoverContent className="w-full">
                                                <Picker theme={theme.resolvedTheme} data={data} locale={"it"}
                                                        onEmojiSelect={(emoji: { native: string }) => {
                                                            field.onChange(emoji.native)
                                                        }}></Picker>
                                            </ResponsivePopoverContent>
                                        </ResponsivePopover>
                                    </FormControl>
                                    <FormDescription>
                                        Questa è l&#39;icona che verrà usata per rappresentare la categoria
                                    </FormDescription>
                                </FormItem>
                            )}
                        ></FormField>
                    </form>
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="me-0" variant={"secondary"} onClick={() => form.reset()}>Annulla</Button>
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

export default CreateCategoryDialog
