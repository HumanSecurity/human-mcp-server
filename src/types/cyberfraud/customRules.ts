import { z } from 'zod';

export const CyberfraudCustomRuleSchema = z
    .object({
        ruleId: z.string().optional().describe('Rule UUID.'),
        priority: z.number().optional().describe('Priority (0 = highest).'),
        name: z.string().optional().describe('Rule name.'),
        description: z.string().optional().describe('Rule description (optional).'),
        conditions: z.record(z.any()).optional().describe('Condition logic object (e.g., $and, $or, $eq, $in, $re).'),
        actions: z.array(z.string()).optional().describe('Actions to apply (e.g., allow, blockWithChallenge, block).'),
        status: z.enum(['active', 'paused']).optional().describe('Rule status: active or paused.'),
    })
    .passthrough()
    .describe('Custom rule definition.');

export const CyberfraudCustomRulesOutputSchema = z
    .object({
        result: z.boolean().optional().describe('Whether the request succeeded.'),
        message: z.string().optional().describe('Status message.'),
        content: z
            .array(CyberfraudCustomRuleSchema)
            .optional()
            .describe('Array of rules ordered by priority (0 highest).'),
    })
    .passthrough()
    .describe('Custom rules API response.');
export type CyberfraudCustomRulesResponse = z.infer<typeof CyberfraudCustomRulesOutputSchema>;
