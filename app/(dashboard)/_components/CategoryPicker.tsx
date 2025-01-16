"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import CreateCategoryDialog from '@/app/(dashboard)/_components/CreateCategoryDialog';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from '@/components/ui/responsive-popover';

interface Props {
    defaultValue?: string
    onChange: (value: string) => void
}

function CategoryPicker({defaultValue, onChange}: Props) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string | null>(null)

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: () => fetch(`/api/categories`).then(res => res.json())
    })

    useEffect(() => {
        if (!value) return
        onChange(value)
    }, [value, onChange])

    useEffect(() => {
        if (!defaultValue) return
        setValue(defaultValue)
    }, [defaultValue])

    const selectedCategory = categoriesQuery.data?.find((category: Category) => category.name === value)

    const successCallback = useCallback((category: Category) => {
        setValue(category.name)
        setOpen(prev => !prev)
    }, [setValue, setOpen])

    return (
        <ResponsivePopover open={open} onOpenChange={setOpen}>
            <ResponsivePopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    role="combobox"
                    aria-expanded={open}
                    className="w-full max-w-[200px] justify-between"
                >
                    {selectedCategory ? (
                        <CategoryRow category={selectedCategory}/>
                    ) : ("Categoria")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </ResponsivePopoverTrigger>
            <ResponsivePopoverContent className="w-[200px] p-0">
                <Command
                    onSubmit={(e => e.preventDefault())}>
                    <CommandInput placeholder="Cerca categoria..."></CommandInput>
                    <CreateCategoryDialog successCallback={successCallback}></CreateCategoryDialog>
                    <CommandEmpty>
                        <p>Nessuna categoria trovata</p>
                        <p className="text-xs text-muted-foreground">Aggiungi nuove categorie</p>
                    </CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {
                                categoriesQuery.data?.map((category: Category) => (
                                    <CommandItem
                                        key={category.name}
                                        onSelect={() => {
                                            setValue(category.name)
                                            setOpen(prev => !prev)
                                        }}
                                    >
                                        <CategoryRow category={category}/>
                                        <Check className={cn(
                                            "mr-2 w-4 opacity-0 h-4",
                                            value === category.name && "opacity-100"
                                        )}/>
                                    </CommandItem>
                                ))
                            }
                        </CommandList>
                    </CommandGroup>
                </Command>
            </ResponsivePopoverContent>
        </ResponsivePopover>
    )
}

export default CategoryPicker

function CategoryRow({category}: { category: Category }) {
    return (
        <div className="flex items-center gap-2">
            <span role="img">{category.icon}</span>
            <span>{category.name}</span>
        </div>
    )
}
