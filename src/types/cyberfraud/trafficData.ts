import { z } from 'zod';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../../utils/constants';

// =============================================================================
// Search Query
// =============================================================================

export const SearchQueryFieldItemSchema = z.object({
    type: z.literal('field'),
    key: z.string().describe('Field key to filter on (e.g. socketIp, blockReference, displayScore, domain, path).'),
    operator: z
        .enum(['=', '!=', '>', '<', '>=', '<=', 'contains', 'exists', 'notExists'])
        .describe(
            'Comparison operator. Use exists/notExists to check presence. Numeric operators for displayScore/httpStatusCode.',
        ),
    value: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Value to compare. Omit for exists/notExists operators.'),
    caseSensitive: z
        .boolean()
        .optional()
        .describe('When true, comparison is case-sensitive. Defaults to case-insensitive.'),
});

export const SearchQueryOperatorItemSchema = z.object({
    type: z.literal('operator'),
    operator: z.enum(['AND', 'OR', 'NOT', '(', ')']),
});

export const SearchQueryItemSchema = z.discriminatedUnion('type', [
    SearchQueryFieldItemSchema,
    SearchQueryOperatorItemSchema,
]);

export type SearchQueryItem = z.infer<typeof SearchQueryItemSchema>;

export const SearchQuerySchema = z
    .array(SearchQueryItemSchema)
    .min(1)
    .optional()
    .describe(
        'Optional structured search query for field-level filtering with boolean logic. ' +
            'Each item is either a field expression ({type:"field", key, operator, value}) or a logical connector ({type:"operator", operator:"AND"|"OR"|"NOT"|"("|")"}). ' +
            'Available field keys and their operators:\n' +
            '- socketIp (IP/CIDR): =, !=\n' +
            '- blockReference (Block ID): =, exists, notExists\n' +
            '- displayScore (risk score 0-100): =, !=, >, <, >=, <=\n' +
            '- incidentTypes: =, !=, exists, notExists — valid values: "UI Anomaly", "Denylisted Service", "Custom Denylist", "Cloud Service", "Anonymizing Service", "Bot Behavior", "Spoof", "Behavioral Anomalies", "Automation Tool", "Bad Reputation", "Volumetric Rule", "Missing Sensor Data", "Volumetric Anomaly", "Captcha Solving Attack"\n' +
            '- knownBot (Known Bot / IP Classification): =, !=, exists, notExists — example values: "Googlebot", "Bing Bot", "DuckDuckGo Bot", "GPTBot", "ClaudeBot", "PerplexityBot", "Facebook Crawler", "Twitterbot", "Pingdom", "Datadog - Synthetics", "UptimeRobot", "Semrush Bot", "Ahrefs" (many more exist — use exists/notExists for a broad match)\n' +
            '- filterOriginReason, vid, accessTokenName: =, !=, exists, notExists\n' +
            '- domain, path, uaServer, socketIpOrgName, userEmail, headerReferer: =, !=, contains, exists, notExists\n' +
            '- httpMethod: =, != — values: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS\n' +
            '- httpStatusCode: =, !=, >, <, >=, <=\n' +
            '- graphqlOperationName, graphqlOperationType: =, !=, exists, notExists — graphqlOperationType values: query, mutation, subscription\n' +
            '- customRule: =, !=, contains, exists, notExists\n' +
            '- customParam1–customParam10: =, !=, contains, exists, notExists',
    );

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
    searchQuery: SearchQuerySchema,
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

// =============================================================================
// Investigate Block
// =============================================================================

export const InvestigateBlockBaseSchema = z.object({
    blockReference: z
        .string()
        .optional()
        .describe('Block ID / Reference ID to investigate (e.g. "b5e0-b1d1-a54de"). Provide this OR socketIp.'),
    socketIp: z
        .string()
        .optional()
        .describe(
            'IP address or CIDR range to investigate (e.g. "203.0.113.10" or "203.0.113.0/24"). Provide this OR blockReference.',
        ),
    startTime: z
        .string()
        .describe(
            `Start of the investigation window in ISO 8601 format. Must be within 4 hours of endTime. e.g. "${DATE_FORMAT_EXAMPLE_START}".`,
        ),
    endTime: z
        .string()
        .describe(
            `End of the investigation window in ISO 8601 format. Must be within 4 hours of startTime. e.g. "${DATE_FORMAT_EXAMPLE_END}".`,
        ),
    trafficSource: z
        .array(TrafficDataSourceEnum)
        .optional()
        .describe('Platform filter: ["web"], ["mobile"], or both. Defaults to ["web", "mobile"].'),
    filters: TrafficDataFiltersSchema.describe('Optional additional filters to narrow the investigation scope.'),
});

export const InvestigateBlockInputSchema = InvestigateBlockBaseSchema.refine(
    (data) => data.blockReference !== undefined || data.socketIp !== undefined,
    { message: 'At least one of blockReference or socketIp must be provided.' },
);

export type InvestigateBlockInput = z.infer<typeof InvestigateBlockInputSchema>;

const RawActivitySchema = z
    .object({
        timestamp: z.string().nullish(),
        appId: z.string().nullish(),
        appName: z.string().nullish(),
        trafficTags: z.string().nullish(),
        reqTag: z.string().nullish(),
        ruleName: z.string().nullish(),
        filterOriginReason: z.string().nullish(),
        blockReference: z.string().nullish(),
        socketIp: z.string().nullish(),
        trafficSource: z.string().nullish(),
        displayScore: z.number().nullish(),
        incidentTypes: z.array(z.unknown()).nullish(),
        vid: z.string().nullish(),
        userEmail: z.string().nullish(),
        osFamily: z.string().nullish(),
        browserDisplay: z.string().nullish(),
        country: z.string().nullish(),
        socketIpOrgName: z.string().nullish(),
        uaServer: z.string().nullish(),
        knownBot: z.string().nullish(),
        httpMethod: z.string().nullish(),
        httpStatusCode: z.string().nullish(),
        domain: z.string().nullish(),
        path: z.string().nullish(),
        headerReferer: z.string().nullish(),
        filterId: z.string().nullish(),
        accessTokenName: z.string().nullish(),
        graphqlOperationName: z.string().nullish(),
        graphqlOperationType: z.string().nullish(),
    })
    .passthrough();

export const InvestigateBlockOutputSchema = z.object({
    count: z.number().describe('Total number of matching activity records in the requested time window.'),
    activities: z
        .array(RawActivitySchema)
        .describe(
            'Sample of up to 20 matching raw activity records. Key fields for block analysis: ' +
                'filterOriginReason (why it was filtered), ruleName (which rule triggered), ' +
                'displayScore (risk score 0-100), incidentTypes (detected threats), trafficTags (traffic classification).',
        ),
    metrics: z
        .object({
            results: z.record(z.string(), z.number()),
            labels: z.record(z.string(), z.string()).optional(),
        })
        .passthrough()
        .optional()
        .describe('Aggregated traffic metrics for the matching traffic (total, blocked, legitimate, etc.).'),
});
