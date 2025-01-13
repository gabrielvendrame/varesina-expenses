"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';
import { DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { createContext, useContext } from 'react';

const ResponsivePopoverContext = createContext({
    isDesktop: false
});

export const ResponsivePopover = ({
                                      children,
                                      open,
                                      modal,
                                      onOpenChange,
                                  }: {
    children: React.ReactNode;
    open?: boolean;
    modal?: boolean;
    onOpenChange?: (open: boolean) => void;
}) => {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    return <ResponsivePopoverContext.Provider value={{isDesktop}}><>{isDesktop ? (
        <PopoverPrimitive.Root modal={modal} open={open} onOpenChange={onOpenChange}>
            {children}
        </PopoverPrimitive.Root>
    ) : (
        <DialogPrimitive.Root open={open} modal={modal} onOpenChange={onOpenChange}>
            {children}
        </DialogPrimitive.Root>)}</>
    </ResponsivePopoverContext.Provider>
};

export const ResponsivePopoverTrigger = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({children, ...props}, ref) => {
    const {isDesktop} = useContext(ResponsivePopoverContext);

    return isDesktop ? (
        <PopoverPrimitive.Trigger asChild ref={ref} {...props}>
            {children}
        </PopoverPrimitive.Trigger>

    ) : (
        <DialogPrimitive.Trigger asChild ref={ref} {...props}>
            {children}
        </DialogPrimitive.Trigger>
    );
});
ResponsivePopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

export const ResponsivePopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({className, align = "center", sideOffset = 4, ...props}, ref) => {
    const {isDesktop} = useContext(ResponsivePopoverContext);

    return isDesktop ? (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    className
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    ) : (
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                </DialogHeader>
                {props.children}
                <DialogPrimitive.Close
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4"/>
                    <span className="sr-only">Chiudi</span>
                </DialogPrimitive.Close>
            </DialogContent>
        </DialogPortal>

    );
});
ResponsivePopoverContent.displayName = PopoverPrimitive.Content.displayName;
