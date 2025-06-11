import { z } from 'zod';
import { StructuredContent } from './makeStructuredResponseSchema';

export async function mcpToolHandler<TSchema extends z.ZodTypeAny>(
    fn: () => Promise<z.infer<TSchema>>,
): Promise<{
    isError: boolean;
    content: { type: 'text'; text: string }[];
    structuredContent: StructuredContent<TSchema>;
}> {
    let isError = false;
    let structuredContent: StructuredContent<TSchema> | undefined;
    try {
        const data = await fn();
        structuredContent = { data, error: undefined };
    } catch (error: any) {
        isError = true;
        structuredContent = {
            error: error?.message || 'Unknown error',
            data: undefined,
        };
    }
    return {
        isError,
        content: [{ type: 'text', text: JSON.stringify(structuredContent, null, 2) }],
        structuredContent,
    };
}
