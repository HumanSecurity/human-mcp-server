import { z } from 'zod';

export type StructuredContent<TSchema extends z.ZodTypeAny> = z.infer<
    ReturnType<typeof makeStructuredResponseSchema<TSchema>>
>;

export function makeStructuredResponseSchema<TSchema extends z.ZodTypeAny>(dataSchema: TSchema) {
    return z
        .object({
            error: z.string().optional(),
            data: dataSchema.optional(),
        })
        .passthrough();
}
