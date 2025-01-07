"use client"
import React from 'react'
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { DeleteTransaction } from '@/app/(dashboard)/transactions/_actions/deleteTransaction';

interface Props {
    open: boolean,
    setOpen: (open: boolean) => void,
    transactionId: string
}

function DeleteTransactionDialog({open, setOpen, transactionId}: Props) {

    const queryClient = useQueryClient();

    const deleteMutationn = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: async ()=>{
            toast.success("Transazione eliminata", {id: transactionId})
            await queryClient.invalidateQueries({
                queryKey: ['transactions']
            })
        },
        onError: ()=>{
            toast.error("Errore durante l'eliminazione della transazione", {id: transactionId})
        }
    })


    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Se sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>La operazione non può essere annullata</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Chiudi</AlertDialogCancel>
                    <AlertDialogAction
                    onClick={()=>{
                        toast.loading("Eliminazione in corso", {id: transactionId})
                        deleteMutationn.mutate(transactionId)
                    }}>
                        Daje de cestino
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteTransactionDialog
