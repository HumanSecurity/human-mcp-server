import { z } from 'zod';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../../utils/constants';

export const TrafficDataSourceEnum = z
    .enum(['web', 'mobile'])
    .describe(
        'Platform filter: ["web"], ["mobile"], or ["web","mobile"]. NOTE: Mobile traffic may be minimal/absent in some environments (observed 99.999% web dominance). Use both for complete coverage, individual for platform-specific analysis.',
    );
export const TrafficDataOvertimeEnum = z
    .enum(['legitimate', 'blocked', 'potentialBlock', 'whitelist', 'blacklist', 'goodKnownBots', 'captchaSolved'])
    .describe(
        'TIME-SERIES ANALYSIS: Returns intervals with ~20min timestamps for trend visualization. ❌ MUTUALLY EXCLUSIVE with "count" parameter. 🚨 CRITICAL: DO NOT combine with "tops" - causes misleading aggregation with all data front-loaded into first interval. ✅ BEST FOR: Attack timelines, trend charts, pattern detection. EXAMPLE: {"overtime": ["blocked"]} → Attack volume over time. COMBINE WITH: filters for focus, but NEVER with "tops".',
    );
export const TrafficDataTopsEnum = z
    .enum(['incidents', 'path'])
    .describe(
        '🔄 RESPONSE TRANSFORMER: Completely changes response structure from aggregates to detailed breakdowns. 🚨 CRITICAL: DO NOT combine with "overtime" - causes misleading aggregation where all historical data appears in first interval with zeros after. ⚠️ CRITICAL INSIGHTS: "incidents" reveals attack classification (Bot Behavior, Spoof, Bad Reputation, etc.), "path" shows URL-specific targeting. WITHOUT tops: Aggregate totals. WITH tops: Individual breakdowns per category. ✅ SAFE USAGE: Combine with "count" only.',
    );
export const TrafficDataTrafficEnum = z
    .enum(['blocked', 'blacklist', 'potentialBlock'])
    .describe(
        'SECURITY-ONLY FILTER: Shows EXCLUSIVELY blocked/suspicious traffic. COMPLEMENTS count/overtime metrics, does NOT replace them. ✅ USE CASE: Pure security analysis, threat-focused reporting. EXCLUDES: All legitimate traffic. COMBINE WITH: Any count/overtime metrics for security-centric view.',
    );
export const TrafficDataPageTypeEnum = z
    .enum([
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
    ])
    .describe(
        'PAGE TYPE FILTER: Focuses analysis on specific user journeys. ⚠️ SCOPE WARNING: Very restrictive (observed 87% data reduction). USE CASES: Login security analysis, checkout protection, API endpoint monitoring. COMBINE WITH: Security metrics for targeted threat analysis.',
    );
export const TrafficDataCountEnum = z
    .enum([
        'legitimate',
        'potentialBlock',
        'blocked',
        'whitelist',
        'blacklist',
        'goodKnownBots',
        'captchaSolved',
        'mobile',
        'web',
    ])
    .describe(
        'AGGREGATE ANALYSIS: Returns total counts across entire time range. ❌ MUTUALLY EXCLUSIVE with "overtime" parameter. ⚠️ LIMITATION: Will NOT return path breakdowns even with tops=["path"] - returns aggregate totals only. ✅ BEST FOR: Dashboards, KPIs, executive summaries. EXAMPLE: {"count": ["legitimate", "blocked"]} → Simple totals.',
    );

export const TrafficDataMetricsEnrichmentSchema = z
    .object({
        accountName: z
            .string()
            .optional()
            .describe(
                '🏢 ACCOUNT CONTEXT: Human-readable account name for dashboard labeling and report generation. 💡 USE CASES: Multi-tenant environments, executive reporting, audit trails. 📊 ENRICHMENT: Adds business context without affecting core metrics.',
            ),
        widgetTitle: z
            .string()
            .optional()
            .describe(
                '📊 DASHBOARD LABELING: Custom title for UI widgets and chart displays. 💡 USE CASES: Custom dashboards, executive summaries, operational monitoring. 🎯 EXAMPLES: "Login Security Overview", "Attack Timeline - Production".',
            ),
        uiContext: z
            .string()
            .optional()
            .describe(
                '🖥️ UI INTEGRATION: Context identifier for frontend integration and state management. 💡 USE CASES: Multi-dashboard applications, widget state tracking, user interface coordination. 📋 EXAMPLES: "main-dashboard", "security-ops-center", "executive-summary".',
            ),
    })
    .passthrough();

export const TrafficDataInputSchema = z.object({
    startTime: z
        .string()
        .describe(
            `⏰ TIME RANGE START: ISO 8601 datetime string defining analysis period beginning. 🎯 FORMAT: "${DATE_FORMAT_EXAMPLE_START}". ⚠️ CONSTRAINT: Must be within API limits for data retention. 💡 STRATEGY: Use shorter windows for real-time monitoring, longer periods for trend analysis and pattern detection.`,
        ),
    endTime: z
        .string()
        .describe(
            `🏁 TIME RANGE END: ISO 8601 datetime string defining analysis period conclusion. 🎯 FORMAT: "${DATE_FORMAT_EXAMPLE_END}". ⚠️ CONSTRAINT: Must be after startTime. 💡 STRATEGY: Use current time for live dashboards, specific timestamps for historical analysis and incident investigation.`,
        ),
    source: z
        .array(TrafficDataSourceEnum)
        .optional()
        .describe(
            '🌐 PLATFORM FILTER: ["web"], ["mobile"], or both. NOTE: Mobile traffic often minimal (<0.001% observed). Use for platform-specific security analysis or complete coverage.',
        ),
    overtime: z
        .array(TrafficDataOvertimeEnum)
        .optional()
        .describe(
            '📈 TIME-SERIES DATA: Returns ~20min interval data for trends. ❌ CANNOT combine with "count". 🚨 CRITICAL: DO NOT combine with "tops" - causes misleading aggregation with all data front-loaded into first interval. ✅ PERFECT FOR: Attack timelines, trend analysis, pattern detection. EXAMPLES: {"overtime": ["blocked"]} → Attack volume timeline.',
        ),
    tops: z
        .array(TrafficDataTopsEnum)
        .optional()
        .describe(
            '🔄 BREAKDOWN TRANSFORMER: Changes from totals to detailed categorization. 🚨 CRITICAL: DO NOT combine with "overtime" - causes misleading front-loaded aggregation. ⚠️ INSIGHTS: "incidents" reveals attack types (Bot Behavior, Spoof, Bad Reputation), "path" shows URL targeting. ✅ SAFE USAGE: Combine with "count" only for accurate breakdowns.',
        ),
    traffic: z
        .array(TrafficDataTrafficEnum)
        .optional()
        .describe(
            '🚨 SECURITY-ONLY FILTER: Shows ONLY threats/blocks. Excludes all legitimate traffic. PERFECT FOR: Pure security analysis, threat hunting, incident investigation. COMBINES WITH: any count/overtime metrics.',
        ),
    pageType: z
        .array(TrafficDataPageTypeEnum)
        .optional()
        .describe(
            '🎯 PAGE JOURNEY FILTER: Focus on specific user flows. ⚠️ MAJOR SCOPE REDUCTION: Can eliminate 87%+ of data. BEST FOR: Login security, checkout protection, API monitoring. USE SPARINGLY for targeted analysis.',
        ),
    count: z
        .array(TrafficDataCountEnum)
        .optional()
        .describe(
            '📊 AGGREGATE TOTALS: Returns summary counts across time range. ❌ CANNOT combine with "overtime". ✅ PERFECT FOR: Executive dashboards, KPI reporting, quick health checks. EXAMPLES: {"count": ["legitimate", "blocked"]} → Traffic health summary.',
        ),
    withoutTotals: z
        .boolean()
        .optional()
        .describe(
            'Excludes summary totals from response. Use when only breakdown data is needed to reduce response size.',
        ),
    metricsEnrichment: TrafficDataMetricsEnrichmentSchema.optional().describe(
        '🏷️ CONTEXTUAL METADATA: Enrichment object for dashboard integration and reporting context. ⚠️ NO IMPACT: Does not affect core data or query performance. 💡 USE CASES: Multi-tenant dashboards, executive reporting, UI state management. 📊 BENEFITS: Enhanced labeling, audit trails, and business context for analysis.',
    ),
});
export type TrafficDataInput = z.infer<typeof TrafficDataInputSchema>;

const TrafficDataIntervalSchema = z
    .object({
        timestamp: z
            .number()
            .optional()
            .describe(
                '⏱️ INTERVAL TIMESTAMP: Timestamp for the ~20-minute interval (milliseconds since epoch). Essential for time-series visualization and trend analysis.',
            ),
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
