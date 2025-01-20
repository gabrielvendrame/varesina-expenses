import { z } from 'zod';

export const CreateTransactionSchema = z.object({
    amount: z.coerce.number().positive().multipleOf(0.01),
    description: z.string().optional(),
    date: z.coerce.date(),
    category: z.string().min(1, "La categoria è obbligatoria"),
    type: z.union([z.literal('expense'), z.literal('income')]),
});

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = CreateTransactionSchema.extend({})

export type UpdateTransactionSchemaType = z.infer<typeof UpdateTransactionSchema>;
