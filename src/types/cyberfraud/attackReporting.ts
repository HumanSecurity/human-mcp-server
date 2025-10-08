import { z } from 'zod';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../../utils/constants';

export const CYBERFRAUD_TRAFFIC_TYPE_VALUES = ['paid', 'organic'] as const;
export const CYBERFRAUD_THREAT_TYPE_VALUES = ['account-takeover', 'scraping', 'transaction-abuse', 'other'] as const;
export const CYBERFRAUD_TRAFFIC_SOURCE_VALUES = ['web', 'mobile'] as const;

export const CyberfraudTrafficTypeEnum = z.enum(CYBERFRAUD_TRAFFIC_TYPE_VALUES);
export const CyberfraudThreatTypeEnum = z.enum(CYBERFRAUD_THREAT_TYPE_VALUES);
export const CyberfraudTrafficSourceEnum = z.enum(CYBERFRAUD_TRAFFIC_SOURCE_VALUES);

export const CyberfraudBaseInputSchema = z.object({
    startTime: z.string().describe(`ISO 8601 start time. Must be within last 2 weeks.`),
    endTime: z.string().describe(`ISO 8601 end time. After startTime; within API limits.`),
    trafficTypes: z
        .array(CyberfraudTrafficTypeEnum)
        .optional()
        .default([...CYBERFRAUD_TRAFFIC_TYPE_VALUES])
        .describe(`Traffic type filter: ["paid"], ["organic"], or both.`),
    threatTypes: z
        .array(CyberfraudThreatTypeEnum)
        .optional()
        .default([...CYBERFRAUD_THREAT_TYPE_VALUES])
        .describe(`Threat filter. Recommend single value for focus.`),
    trafficSources: z
        .array(CyberfraudTrafficSourceEnum)
        .optional()
        .default([...CYBERFRAUD_TRAFFIC_SOURCE_VALUES])
        .describe(`Platform filter: ["web"], ["mobile"], or both.`),
});

export const CyberfraudOvertimeInputSchema = CyberfraudBaseInputSchema;
export type CyberfraudOvertimeParams = z.infer<typeof CyberfraudOvertimeInputSchema>;

export const CyberfraudOverviewInputSchema = CyberfraudBaseInputSchema.extend({
    page: z.number().int().min(1).optional().default(1).describe('Page number (>=1).'),
    pageSize: z.number().int().min(1).optional().default(10).describe('Page size (<=50).'),
    clusterId: z.string().optional().describe('Return a single cluster by ID; ignores pagination.'),
});
export type CyberfraudOverviewParams = z.infer<typeof CyberfraudOverviewInputSchema>;

export const CyberfraudClusterIndicatorSchema = z
    .object({
        value: z.number().optional().describe('Indicator strength score.'),
        name: z.string().optional().describe('Indicator type.'),
    })
    .passthrough()
    .describe('Attack indicator.');

export const CyberfraudClusterTopPathSchema = z
    .object({
        value: z.string().optional().describe('Target URL or path.'),
        pathTotal: z.number().optional().describe('Total malicious requests to this path.'),
        percentage: z.number().optional().describe('Percent of cluster traffic to this path.'),
    })
    .passthrough()
    .describe('URL-specific attack distribution within a cluster.');

export const CyberfraudClusterSchema = z
    .object({
        clusterId: z.string().optional().describe('Cluster ID (e.g., ATO-XXXXX).'),
        type: z.string().optional().describe('Threat category (e.g., account-takeover, scraping).'),
        appId: z.string().optional().describe('Application ID under attack.'),
        total: z.number().optional().describe('Total requests in this cluster.'),
        block: z.number().optional().describe('Blocked requests.'),
        simulatedBlock: z.number().optional().describe('Requests that would be blocked in enforce mode.'),
        totalPath: z.number().optional().describe('Number of unique targeted paths.'),
        signatures: z.number().optional().describe('Distinct attack signatures.'),
        startTimestamp: z.string().optional().describe('Cluster start time (ISO 8601).'),
        endTimestamp: z.string().optional().describe('Cluster end time (ISO 8601).'),
        requestsPerSecond: z.number().optional().describe('Requests per second.'),
        requestsPerMinute: z.number().optional().describe('Requests per minute.'),
        capabilities: z.array(z.string()).optional().describe('Observed bot capabilities.'),
        indicators: z.array(CyberfraudClusterIndicatorSchema).optional().describe('Attack indicators with strength.'),
        topPaths: z.array(CyberfraudClusterTopPathSchema).optional().describe('Top targeted URLs.'),
        domains: z.array(z.string()).optional().describe('Domains seen in this cluster.'),
        requestsPerTimeUnit: z.number().optional().describe('Requests per time unit.'),
        timeUnit: z.string().optional().describe('Time unit (second/minute/hour).'),
        sophistication: z.string().optional().describe('Threat sophistication level.'),
    })
    .passthrough()
    .describe('Attack cluster with volume, targeting, and sophistication.');

export const CyberfraudOverviewContentSchema = z
    .object({
        clusters: z.array(CyberfraudClusterSchema).optional().describe('Array of clusters.'),
        total: z.number().optional().describe('Total cluster count.'),
    })
    .passthrough()
    .describe('Overview response container.');

export const CyberfraudOverviewOutputSchema = z
    .object({
        result: z.boolean().optional().describe('Whether the request succeeded.'),
        message: z.string().optional().describe('Status message.'),
        content: CyberfraudOverviewContentSchema.optional().describe('Cluster data (when result=true).'),
    })
    .passthrough()
    .describe('Overview API response.');

export type CyberfraudClusterIndicator = z.infer<typeof CyberfraudClusterIndicatorSchema>;
export type CyberfraudClusterTopPath = z.infer<typeof CyberfraudClusterTopPathSchema>;
export type CyberfraudCluster = z.infer<typeof CyberfraudClusterSchema>;
export type CyberfraudOverviewContent = z.infer<typeof CyberfraudOverviewContentSchema>;
export type CyberfraudOverviewResponse = z.infer<typeof CyberfraudOverviewOutputSchema>;

export const CyberfraudOvertimeClusterSchema = z
    .object({
        type: z.string().optional().describe('Attack type for the interval.'),
        clusterId: z.string().nullable().optional().describe('Cluster ID active this interval (nullable).'),
        block: z.number().optional().describe('Blocked requests this interval.'),
        simulatedBlock: z.number().optional().describe('Simulated blocks this interval.'),
    })
    .passthrough()
    .describe('Cluster metrics for a 5-minute interval.');

export const CyberfraudOvertimeResultSchema = z
    .object({
        timestamp: z.string().optional().describe('Interval start time (ISO 8601).'),
        clusters: z.array(CyberfraudOvertimeClusterSchema).optional().describe('Clusters active during interval.'),
        legitimateRequests: z.number().optional().describe('Legitimate user requests during interval.'),
        legitimateCustomRules: z.number().optional().describe('Requests allowed by custom rules this interval.'),
        legitimateBots: z.number().optional().describe('Legitimate bot traffic this interval.'),
    })
    .passthrough()
    .describe('Metrics for a single 5-minute interval.');

export const CyberfraudOvertimeOutputSchema = z
    .object({
        result: z.boolean().optional().describe('Whether the request succeeded.'),
        message: z.string().optional().describe('Status message.'),
        content: z
            .object({
                results: z
                    .array(CyberfraudOvertimeResultSchema)
                    .optional()
                    .describe('Array of 5-minute interval data points.'),
                dataLags: z.array(z.unknown()).optional().describe('Data lag information (if any).'),
            })
            .passthrough()
            .optional()
            .describe('Time-series attack/traffic data (5-minute granularity).'),
    })
    .passthrough()
    .describe('Overtime API response.');

export type CyberfraudOvertimeResponse = z.infer<typeof CyberfraudOvertimeOutputSchema>;
