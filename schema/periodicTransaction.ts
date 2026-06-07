import { z } from 'zod'

export const IntervalUnitValues = ['days', 'weeks', 'months', 'years'] as const

export const CreatePeriodicTransactionSchema = z.object({
    amount: z.coerce.number().positive().multipleOf(0.01),
    description: z.string().optional(),
    category: z.string().min(1, 'La categoria è obbligatoria'),
    type: z.union([z.literal('expense'), z.literal('income')]),
    intervalValue: z.coerce.number().int().positive().min(1),
    intervalUnit: z.enum(IntervalUnitValues),
    weekDay: z.coerce.number().int().min(0).max(6).optional().nullable(),
    startDate: z.coerce.date(),
}).refine(
    (data) => data.intervalUnit !== 'weeks' || (data.weekDay !== undefined && data.weekDay !== null),
    { message: 'Seleziona il giorno della settimana', path: ['weekDay'] }
)

export type CreatePeriodicTransactionSchemaType = z.infer<typeof CreatePeriodicTransactionSchema>
