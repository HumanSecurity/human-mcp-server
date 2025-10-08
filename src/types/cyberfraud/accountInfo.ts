import { z } from 'zod';

export const CyberfraudAccountInfoInputSchema = z.object({
    accountId: z.string().min(1, 'accountId is required').describe('Account identifier to query. Required.'),
    daysRange: z.number().optional().describe('Optional lookback window in days.'),
});
export type CyberfraudAccountInfoInput = z.infer<typeof CyberfraudAccountInfoInputSchema>;

const CyberfraudActiveIncidentSchema = z
    .object({
        attack_type: z.string().optional().describe('Attack type (e.g., "ato", "scraping", "fraud").'),
        event_type: z.string().optional().describe('Event scope ("single" or "cluster").'),
        risk_score: z.number().optional().describe('Risk score (0-1).'),
        is_manually_created: z.boolean().optional().describe('Manually created by analyst.'),
        incident_creation: z.string().optional().describe('Creation time (ISO 8601).'),
        additional: z.unknown().optional().describe('Additional metadata.'),
    })
    .passthrough()
    .describe('Active security incident.');

const CyberfraudAggregativeDataSchema = z
    .object({
        trigger_categories: z.array(z.string()).optional().describe('Trigger categories (e.g., network, device).'),
        sensitive_transactions: z.array(z.string()).optional().describe('Sensitive transaction types (e.g., payment).'),
    })
    .passthrough()
    .describe('Aggregated behavioral data.');

export const CyberfraudAccountInfoOutputSchema = z
    .object({
        account_id: z.string().optional().describe('Queried account ID.'),
        exists: z.boolean().optional().describe('Whether the account exists.'),
        is_under_attack: z.boolean().optional().describe('Whether active threats are present.'),
        first_seen: z.string().optional().describe('First seen (ISO 8601).'),
        last_seen: z.string().optional().describe('Last seen (ISO 8601).'),
        email: z.string().optional().describe('Email address (if available).'),
        registration_date: z.string().optional().describe('Registration date (ISO 8601).'),
        active_incidents: z.array(CyberfraudActiveIncidentSchema).optional().describe('Array of active incidents.'),
        aggregative_data: CyberfraudAggregativeDataSchema.optional().describe('Aggregated behavioral/security data.'),
    })
    .passthrough()
    .describe('Account security profile.');
export type CyberfraudAccountInfoResponse = z.infer<typeof CyberfraudAccountInfoOutputSchema>;
