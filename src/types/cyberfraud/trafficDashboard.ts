import { z } from 'zod';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../../utils/constants';

export const TrafficSourceEnum = z.enum(['web', 'mobile'], {
    description:
        '🌐 PLATFORM FILTER: ["web"], ["mobile"], or both. NOTE: Mobile traffic may be minimal in some environments. Use both for complete coverage, individual for platform-specific analysis.',
});

export const TrafficTagEnum = z.enum(
    [
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
        'abusable_rules',
        'precheckPresented',
        'captchaSolved',
        'redirected',
    ],
    {
        description:
            '🎯 TRAFFIC TAG FILTER: Security classification filter applied inside filters.trafficTags. COMBINE WITH: pageType and other filters for focused analysis.',
    },
);

export const PageTypeEnum = z.enum(
    [
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
    ],
    {
        description:
            '🎯 PAGE JOURNEY FILTER: Focuses analysis on specific user journeys. ⚠️ SCOPE WARNING: Can significantly reduce result scope. USE SPARINGLY for targeted analysis.',
    },
);

export const TrafficDashboardTopFieldEnum = z.enum(
    [
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
    ],
    {
        description:
            '🔍 TOP FIELD: Dimension to rank by request count. Use "incidentTypes" for attack taxonomy, "path" for endpoint targeting, "country" for geo analysis.',
    },
);

export const TrafficDashboardSeriesFieldEnum = z.enum(['accessTokenName', 'customRule', 'knownBot'], {
    description:
        '📈 SERIES BREAKDOWN: Optional overtime series dimension. Adds per-value counts alongside core traffic tags in each minute bucket.',
});

export const TrafficDashboardFiltersSchema = z
    .object({
        trafficTags: z.array(TrafficTagEnum).optional(),
        pageType: z.array(PageTypeEnum).optional(),
        browserFamily: z.array(z.string()).optional(),
        osFamily: z.array(z.string()).optional(),
        country: z.array(z.string()).optional(),
    })
    .passthrough()
    .optional()
    .describe(
        '🎯 FILTERS: Optional multi-dimensional filters. All filter fields stack multiplicatively and can reduce result scope significantly.',
    );

export const TrafficDashboardSearchQuerySchema = z
    .array(z.record(z.any()))
    .optional()
    .describe(
        '🔍 ADVANCED SEARCH: Optional field/operator expression array for advanced filtering. Use when standard filters are insufficient.',
    );

const trafficTimeRangeSchema = {
    startTime: z
        .string()
        .describe(
            `⏰ TIME RANGE START: ISO 8601 datetime string defining analysis period beginning. 🎯 FORMAT: "${DATE_FORMAT_EXAMPLE_START}". 💡 STRATEGY: Use shorter windows for granular timelines, longer periods for trend analysis.`,
        ),
    endTime: z
        .string()
        .describe(
            `🏁 TIME RANGE END: ISO 8601 datetime string defining analysis period conclusion. 🎯 FORMAT: "${DATE_FORMAT_EXAMPLE_END}". ⚠️ CONSTRAINT: Must be after startTime and cannot be in the future.`,
        ),
};

const trafficCommonBodySchema = {
    trafficSource: z
        .array(TrafficSourceEnum)
        .min(1)
        .describe(
            '🌐 TRAFFIC SOURCE: Required platform scope. Use ["web"], ["mobile"], or ["web","mobile"] for complete coverage.',
        ),
    filters: TrafficDashboardFiltersSchema,
    searchQuery: TrafficDashboardSearchQuerySchema,
};

export const TrafficOvertimeInputSchema = z.object({
    ...trafficTimeRangeSchema,
    ...trafficCommonBodySchema,
    seriesFields: z
        .array(TrafficDashboardSeriesFieldEnum)
        .optional()
        .describe(
            '📈 SERIES FIELDS: Optional breakdown dimensions for overtime charts. Options: accessTokenName, customRule, knownBot.',
        ),
});
export type TrafficOvertimeInput = z.infer<typeof TrafficOvertimeInputSchema>;

export const TrafficMetricsInputSchema = z.object({
    ...trafficTimeRangeSchema,
    ...trafficCommonBodySchema,
});
export type TrafficMetricsInput = z.infer<typeof TrafficMetricsInputSchema>;

export const TrafficTopsInputSchema = z.object({
    ...trafficTimeRangeSchema,
    ...trafficCommonBodySchema,
    field: TrafficDashboardTopFieldEnum.describe(
        '🔍 TOP FIELD: Required dimension to rank. Examples: "incidentTypes", "path", "country", "customRule".',
    ),
    limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('📊 RESULT SIZE CONTROL: Maximum top values to return. Default: 10. Maximum: 100.'),
    includeNulls: z
        .boolean()
        .optional()
        .describe('🔧 NULL HANDLING: Include rows where the selected field is null. Default: false.'),
});
export type TrafficTopsInput = z.infer<typeof TrafficTopsInputSchema>;

const TrafficDashboardResponseWrapperSchema = z
    .object({
        result: z.boolean().optional().describe('✅ API SUCCESS: Indicates successful operation completion.'),
        message: z.string().optional().describe('💬 STATUS MESSAGE: Human-readable response status.'),
        content: z.record(z.any()).optional().describe('📦 MAIN PAYLOAD: Primary data when result=true.'),
    })
    .passthrough();

export const TrafficOvertimeOutputSchema = TrafficDashboardResponseWrapperSchema.describe(
    '📈 OVERTIME RESPONSE: Minute-bucketed traffic counts over the requested time range, optionally broken out by seriesFields.',
);
export type TrafficOvertimeResponse = z.infer<typeof TrafficOvertimeOutputSchema>;

export const TrafficMetricsOutputSchema = TrafficDashboardResponseWrapperSchema.describe(
    '📊 METRICS RESPONSE: Aggregated traffic totals and labels for the requested time range.',
);
export type TrafficMetricsResponse = z.infer<typeof TrafficMetricsOutputSchema>;

export const TrafficTopsOutputSchema = TrafficDashboardResponseWrapperSchema.describe(
    '📋 TOPS RESPONSE: Ranked top values for the selected field, sorted by request count.',
);
export type TrafficTopsResponse = z.infer<typeof TrafficTopsOutputSchema>;
