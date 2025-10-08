import { z } from 'zod';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../../utils/constants';

export const TrafficDataSourceEnum = z.enum(['web', 'mobile'], {
    description: 'Platform filter: ["web"], ["mobile"], or both. Mobile is often minimal.',
});
export const TrafficDataOvertimeEnum = z.enum(
    ['legitimate', 'blocked', 'potentialBlock', 'whitelist', 'blacklist', 'goodKnownBots', 'captchaSolved'],
    {
        description: 'Time-series metrics (~20 min). Do not combine with "count" or "tops".',
    },
);
export const TrafficDataTopsEnum = z.enum(['incidents', 'path'], {
    description: 'Adds breakdowns. Use with "count" only. incidents=types, path=URLs.',
});
export const TrafficDataTrafficEnum = z.enum(['blocked', 'blacklist', 'potentialBlock'], {
    description: 'Security-only filter (excludes legitimate). Use with count/overtime.',
});
export const TrafficDataPageTypeEnum = z.enum(
    [
        'login',
        'login_attempt',
        'checkout',
        'purchase',
        'purchase_request',
        'productsAndSearch',
        'research',
        'apiCall',
        'resource',
        'mobileUserAgents',
    ],
    { description: 'Page/journey filter. Very restrictive; for targeted flows.' },
);
export const TrafficDataCountEnum = z.enum(
    [
        'legitimate',
        'potentialBlock',
        'blocked',
        'whitelist',
        'blacklist',
        'goodKnownBots',
        'captchaSolved',
        'mobile',
        'web',
    ],
    { description: 'Aggregate totals across time range. Mutually exclusive with "overtime".' },
);

export const TrafficDataMetricsEnrichmentSchema = z
    .object({
        accountName: z.string().optional().describe('Optional display name. No impact on metrics.'),
        widgetTitle: z.string().optional().describe('Optional widget title.'),
        uiContext: z.string().optional().describe('Optional UI context identifier.'),
    })
    .passthrough();

export const TrafficDataInputSchema = z.object({
    startTime: z.string().describe(`ISO 8601 start time.`),
    endTime: z.string().describe(`ISO 8601 end time (after startTime).`),
    source: z
        .array(TrafficDataSourceEnum)
        .optional()
        .describe('Platform filter: ["web"], ["mobile"], or both. Mobile is often minimal.'),
    overtime: z
        .array(TrafficDataOvertimeEnum)
        .optional()
        .describe('Time-series data (~20 min). Do not combine with "count" or "tops".'),
    tops: z.array(TrafficDataTopsEnum).optional().describe('Adds breakdowns. Use with "count" only.'),
    traffic: z.array(TrafficDataTrafficEnum).optional().describe('Security-only filter (excludes legitimate).'),
    pageType: z.array(TrafficDataPageTypeEnum).optional().describe('Page/journey filter. Very restrictive.'),
    count: z
        .array(TrafficDataCountEnum)
        .optional()
        .describe('Aggregate totals across time range. Mutually exclusive with "overtime".'),
    withoutTotals: z.boolean().optional().describe('Exclude summary totals from response.'),
    metricsEnrichment: TrafficDataMetricsEnrichmentSchema.optional().describe(
        'Optional labeling metadata. No impact on metrics.',
    ),
});
export type TrafficDataInput = z.infer<typeof TrafficDataInputSchema>;

const TrafficDataIntervalSchema = z
    .object({
        timestamp: z.number().optional().describe('Interval timestamp (ms since epoch).'),
        count: z.number().optional().describe('Count for this interval.'),
    })
    .passthrough();

const TrafficDataSeriesOvertimeSchema = z
    .object({
        value: z.string().optional().describe('Label or value for this series.'),
        intervals: z.array(TrafficDataIntervalSchema).optional().describe('List of intervals for this series.'),
    })
    .passthrough();

const TrafficDataSeriesCountSchema = z
    .object({
        value: z.string().optional().describe('Label or value for this series.'),
        count: z.number().optional().describe('Count for this series.'),
    })
    .passthrough();

const TrafficDataTotalsSchema = z
    .object({
        total: z.number().optional().describe('Total count.'),
        totalBlocked: z.number().optional().describe('Total blocked count.'),
    })
    .passthrough();

const TrafficDataContentSchema = z
    .object({
        legitimate: z.array(TrafficDataSeriesOvertimeSchema).optional(),
        blocked: z.array(TrafficDataSeriesOvertimeSchema).optional(),
        blacklist: z.array(TrafficDataSeriesOvertimeSchema).optional(),
        goodKnownBots: z.array(TrafficDataSeriesOvertimeSchema).optional(),
        potentialBlock: z.array(TrafficDataSeriesOvertimeSchema).optional(),
        whitelist: z.array(TrafficDataSeriesOvertimeSchema).optional(),
        captchaSolved: z.array(TrafficDataSeriesOvertimeSchema).optional(),
        incidents: z.array(TrafficDataSeriesCountSchema).optional(),
        path: z.array(TrafficDataSeriesCountSchema).optional(),
        mobile: z.array(TrafficDataSeriesCountSchema).optional(),
        web: z.array(TrafficDataSeriesCountSchema).optional(),
        totals: TrafficDataTotalsSchema.optional(),
        dataLags: z.array(z.unknown()).optional(),
    })
    .passthrough()
    .optional()
    .describe('Main content data, keyed by metric type.');

export const TrafficDataOutputSchema = z
    .object({
        result: z.boolean().optional().describe('Whether the request was successful.'),
        message: z.string().optional().describe('Response message.'),
        content: TrafficDataContentSchema,
    })
    .passthrough();
export type TrafficDataResponse = z.infer<typeof TrafficDataOutputSchema>;
