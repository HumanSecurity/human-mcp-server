import { z } from 'zod';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../../utils/constants';

export const TrafficDataSourceEnum = z.enum(['web', 'mobile']);

export const TrafficDataTrafficTagsEnum = z.enum([
    'legitimate',
    'blocked',
    'potentialBlock',
    'goodKnownBots',
    'whitelist',
    'blacklist',
    'compromisedLogin',
    'failedLogin',
    'successfulLogin',
    'successfulCompromised',
    'legitimateCompromised',
    'blockedCompromised',
    'captchaSolved',
]);

export const TrafficDataPageTypeEnum = z.enum([
    'login',
    'login_attempt',
    'checkout',
    'carding_attempt',
    'purchase',
    'purchase_request',
    'productsAndSearch',
    'research',
    'resource',
    'apiCall',
    'mobileUserAgents',
]);

export const TrafficDataSeriesFieldsEnum = z.enum(['accessTokenName', 'customRule', 'knownBot']);

export const TrafficDataTopsFieldEnum = z.enum([
    'socketIp',
    'domain',
    'headerReferer',
    'incidentTypes',
    'socketIpOrgName',
    'path',
    'knownBot',
    'uaServer',
    'providerCloud',
    'providerProxy',
    'providerVpn',
    'providerClassification',
    'country',
    'customRule',
    'accessTokenName',
    'customParam1',
    'customParam2',
    'customParam3',
    'customParam4',
    'customParam5',
    'customParam6',
    'customParam7',
    'customParam8',
    'customParam9',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    'utmTerm',
    'graphqlOperationName',
]);

export const TrafficDataFiltersSchema = z
    .object({
        trafficTags: z.array(TrafficDataTrafficTagsEnum).optional(),
        pageType: z.array(TrafficDataPageTypeEnum).optional(),
        browserFamily: z.array(z.string()).optional(),
        osFamily: z.array(z.string()).optional(),
        country: z.array(z.string()).optional(),
    })
    .optional();

export const TrafficDataInputBaseSchema = z.object({
    startTime: z
        .string()
        .describe(`Start of the analysis time range in ISO 8601 format, e.g. "${DATE_FORMAT_EXAMPLE_START}".`),
    endTime: z
        .string()
        .describe(`End of the analysis time range in ISO 8601 format, e.g. "${DATE_FORMAT_EXAMPLE_END}".`),
    trafficSource: z
        .array(TrafficDataSourceEnum)
        .optional()
        .describe('Platform filter: ["web"], ["mobile"], or both. Defaults to ["web", "mobile"].'),
    filters: TrafficDataFiltersSchema.describe(
        'Optional filters for trafficTags, pageType, browserFamily, osFamily, and country.',
    ),
    overtime: z.boolean().optional().describe('Fetch per-minute time-series traffic counts over the requested range.'),
    seriesFields: z
        .array(TrafficDataSeriesFieldsEnum)
        .optional()
        .describe('Break out additional overtime series per value. Only applies when overtime is true.'),
    metrics: z.boolean().optional().describe('Fetch aggregated traffic totals for the time range.'),
    tops: z
        .array(TrafficDataTopsFieldEnum)
        .optional()
        .describe('Fetch top values for one or more fields, sorted by request count.'),
    limit: z.number().min(1).max(100).optional().describe('Max tops results per field (1-100). Defaults to 10.'),
    includeNulls: z.boolean().optional().describe('Include rows where the tops field is null. Defaults to false.'),
});

export const TrafficDataInputSchema = TrafficDataInputBaseSchema.refine(
    (data) => data.overtime === true || data.metrics === true || (data.tops !== undefined && data.tops.length > 0),
    { message: 'At least one of overtime, metrics, or tops must be specified.' },
);

export type TrafficDataInput = z.infer<typeof TrafficDataInputSchema>;

const TrafficDataOvertimeResultSchema = z
    .object({
        timestamp: z.string(),
    })
    .passthrough();

const TrafficDataTopsResultSchema = z.object({
    value: z.string(),
    count: z.number(),
});

export const TrafficDataOutputSchema = z
    .object({
        overtime: z
            .object({
                results: z.array(TrafficDataOvertimeResultSchema),
            })
            .passthrough()
            .optional(),
        metrics: z
            .object({
                results: z.record(z.string(), z.number()),
                labels: z.record(z.string(), z.string()).optional(),
            })
            .passthrough()
            .optional(),
        tops: z.record(z.string(), z.array(TrafficDataTopsResultSchema)).optional(),
    })
    .passthrough();

export type TrafficDataResponse = z.infer<typeof TrafficDataOutputSchema>;
