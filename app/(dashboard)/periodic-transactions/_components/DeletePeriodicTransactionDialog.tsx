"use client"

import React from 'react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { DeletePeriodicTransaction } from '@/app/(dashboard)/periodic-transactions/_actions/deletePeriodicTransaction'

interface Props {
    open: boolean
    setOpen: (open: boolean) => void
    periodicTransactionId: string
}

function DeletePeriodicTransactionDialog({ open, setOpen, periodicTransactionId }: Props) {
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: DeletePeriodicTransaction,
        onSuccess: async () => {
            toast.success('Transazione periodica eliminata', { id: periodicTransactionId })
            await queryClient.invalidateQueries({ queryKey: ['periodic-transactions'] })
        },
        onError: () => {
            toast.error("Errore durante l'eliminazione", { id: periodicTransactionId })
        }
    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        La transazione periodica verrà eliminata e non verranno create ulteriori occorrenze future.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            toast.loading('Eliminazione in corso...', { id: periodicTransactionId })
                            deleteMutation.mutate(periodicTransactionId)
                        }}>
                        Elimina
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeletePeriodicTransactionDialog
