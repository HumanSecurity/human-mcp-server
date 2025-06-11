import { z } from 'zod';

export const CYBERFRAUD_TRAFFIC_TYPE_VALUES = ['paid', 'organic'] as const;
export const CYBERFRAUD_THREAT_TYPE_VALUES = ['account-takeover', 'scraping', 'transaction-abuse', 'other'] as const;
export const CYBERFRAUD_TRAFFIC_SOURCE_VALUES = ['web', 'mobile'] as const;

export const CyberfraudTrafficTypeEnum = z.enum(CYBERFRAUD_TRAFFIC_TYPE_VALUES);
export const CyberfraudThreatTypeEnum = z.enum(CYBERFRAUD_THREAT_TYPE_VALUES);
export const CyberfraudTrafficSourceEnum = z.enum(CYBERFRAUD_TRAFFIC_SOURCE_VALUES);

export const CyberfraudBaseInputSchema = z.object({
    startTime: z
        .string()
        .describe(
            '⏰ TIME RANGE START: ISO 8601 datetime string defining analysis period beginning. 🎯 FORMAT: "2024-01-15T10:00:00Z". ⚠️ CONSTRAINT: Must be within last 2 weeks (API enforced). 💡 STRATEGY: Use shorter windows (6-24 hours) for granular attack timelines, longer periods (1-3 days) for pattern analysis.',
        ),
    endTime: z
        .string()
        .describe(
            '🏁 TIME RANGE END: ISO 8601 datetime string defining analysis period conclusion. 🎯 FORMAT: "2024-01-15T16:00:00Z". ⚠️ CONSTRAINT: Must be after startTime and within API limits. 💡 STRATEGY: Use "now" for real-time monitoring, specific timestamps for historical incident analysis.',
        ),
    trafficTypes: z
        .array(CyberfraudTrafficTypeEnum)
        .optional()
        .default([...CYBERFRAUD_TRAFFIC_TYPE_VALUES])
        .describe(
            `🚦 TRAFFIC TYPE FILTER: ["paid"], ["organic"], or both. ⚠️ MODERATE IMPACT: "paid" often returns zero results (most attacks organic). 💡 USE CASE: Analyze attack vectors by traffic acquisition method. COMBINE WITH: threatTypes for targeted analysis.`,
        ),
    threatTypes: z
        .array(CyberfraudThreatTypeEnum)
        .optional()
        .default([...CYBERFRAUD_THREAT_TYPE_VALUES])
        .describe(
            `🎯 PRIMARY THREAT FILTER: Single values recommended for focused analysis. ⚠️ HIGH IMPACT: Can reduce results to zero if threat type inactive. 📊 THREAT TYPES: account-takeover (most common), scraping, transaction-abuse, other. 💡 STRATEGY: Start with defaults, then filter to single type for deep dive.`,
        ),
    trafficSources: z
        .array(CyberfraudTrafficSourceEnum)
        .optional()
        .default([...CYBERFRAUD_TRAFFIC_SOURCE_VALUES])
        .describe(
            `🌐 PLATFORM FILTER: ["web"], ["mobile"], or both. ⚠️ LOW IMPACT: Most environments web-dominated (mobile attacks often minimal). 💡 USE CASE: Platform-specific security analysis. COMBINE WITH: threatTypes for targeted investigation.`,
        ),
});

export const CyberfraudOvertimeInputSchema = CyberfraudBaseInputSchema;
export type CyberfraudOvertimeParams = z.infer<typeof CyberfraudOvertimeInputSchema>;

export const CyberfraudOverviewInputSchema = CyberfraudBaseInputSchema.extend({
    page: z
        .number()
        .int()
        .min(1)
        .optional()
        .default(1)
        .describe(
            '📄 PAGINATION CONTROL: Navigate large result sets efficiently. ✅ RELIABLE: Consistent pagination with stable totals. 💡 WORKFLOW: Start with page=1, use total count to estimate dataset size, increment for more results.',
        ),
    pageSize: z
        .number()
        .int()
        .min(1)
        .optional()
        .default(10)
        .describe(
            '📊 RESULT SIZE CONTROL: Balance detail vs performance. ⚠️ LIMIT: Maximum 50 (larger values cause errors). 💡 STRATEGY: Start small (5-10) for exploration, use larger (20-50) for comprehensive analysis.',
        ),
    clusterId: z
        .string()
        .optional()
        .describe(
            '🔍 CLUSTER-SPECIFIC LOOKUP: Target individual attack clusters for detailed analysis. ✅ WORKING: Returns complete cluster details including indicators, paths, and metadata. 💡 USE CASE: Deep-dive investigation of specific attack campaigns and incident response.',
        ),
});
export type CyberfraudOverviewParams = z.infer<typeof CyberfraudOverviewInputSchema>;

export const CyberfraudClusterIndicatorSchema = z
    .object({
        value: z
            .number()
            .optional()
            .describe(
                '📊 THREAT INTENSITY: Numeric score indicating indicator strength (0-1000+). Higher values = stronger threat signal. Use for risk prioritization and threshold-based alerting.',
            ),
        name: z
            .string()
            .optional()
            .describe(
                '🏷️ THREAT CATEGORY: Human-readable indicator type (e.g., "Bad Network Reputation", "Environment Spoofing", "Bot Behavior"). Critical for understanding attack methodology and defensive measures.',
            ),
    })
    .passthrough()
    .describe(
        '🚨 ATTACK INDICATORS: Individual threat signals detected within clusters. Each indicator represents a specific attack characteristic with quantified strength. Use for detailed forensic analysis and attack attribution.',
    );

export const CyberfraudClusterTopPathSchema = z
    .object({
        value: z
            .string()
            .optional()
            .describe(
                '🎯 TARGET URL: Specific endpoint or page path under attack (e.g., "/login", "/checkout"). Essential for identifying attack targets and implementing path-specific protections.',
            ),
        pathTotal: z
            .number()
            .optional()
            .describe(
                '📈 ATTACK VOLUME: Total number of malicious requests to this specific path. Use for impact assessment and resource allocation for defense.',
            ),
        percentage: z
            .number()
            .optional()
            .describe(
                '📊 ATTACK CONCENTRATION: Percentage of cluster traffic targeting this path (0-100). High percentages indicate focused attacks; distributed percentages suggest reconnaissance.',
            ),
    })
    .passthrough()
    .describe(
        '🎯 ATTACK TARGETING: URL-specific attack distribution within clusters. Shows which endpoints are most heavily targeted. Critical for implementing focused security controls and understanding attacker objectives.',
    );

export const CyberfraudClusterSchema = z
    .object({
        clusterId: z
            .string()
            .optional()
            .describe(
                '🔍 UNIQUE IDENTIFIER: Cluster tracking ID (format: TYPE-XXXXX, e.g., "ATO-8J8VG"). Use for cross-reference analysis, incident tracking, and detailed cluster investigation with clusterId parameter.',
            ),
        type: z
            .string()
            .optional()
            .describe(
                '⚔️ ATTACK CLASSIFICATION: Threat category (account-takeover, scraping, transaction-abuse, other). Primary field for threat type analysis and defensive strategy selection.',
            ),
        appId: z
            .string()
            .optional()
            .describe(
                '🏢 APPLICATION TARGET: Specific application under attack. Use for multi-app environments to understand attack distribution and implement app-specific defenses.',
            ),
        total: z
            .number()
            .optional()
            .describe(
                '📊 TOTAL VOLUME: Complete request count for this cluster (malicious + blocked). Key metric for understanding attack scale and capacity planning.',
            ),
        block: z
            .number()
            .optional()
            .describe(
                '🛡️ BLOCKED REQUESTS: Successfully blocked malicious requests. Primary security effectiveness metric. Compare with simulatedBlock for protection coverage analysis.',
            ),
        simulatedBlock: z
            .number()
            .optional()
            .describe(
                '🧪 SIMULATED BLOCKS: Requests that would be blocked in enforce mode. Critical for tuning security policies before full enforcement. High values indicate policy optimization opportunities.',
            ),
        totalPath: z
            .number()
            .optional()
            .describe(
                '🗂️ TARGETED ENDPOINTS: Number of unique paths/URLs attacked within cluster. High values suggest reconnaissance; low values indicate focused attacks.',
            ),
        signatures: z
            .number()
            .optional()
            .describe(
                '🔬 UNIQUE PATTERNS: Distinct attack signatures detected. Higher values indicate sophisticated, diverse attacks requiring advanced analysis.',
            ),
        startTimestamp: z
            .string()
            .optional()
            .describe(
                '⏰ ATTACK START: ISO timestamp when cluster first detected. Essential for incident timeline reconstruction and response time analysis.',
            ),
        endTimestamp: z
            .string()
            .optional()
            .describe(
                '🏁 ATTACK END: ISO timestamp when cluster last active. Use for attack duration analysis and determining if threats are ongoing.',
            ),
        requestsPerSecond: z
            .number()
            .optional()
            .describe(
                '⚡ ATTACK INTENSITY: Real-time request rate during peak activity. Critical for capacity planning and DDoS assessment. Values >100 indicate high-intensity attacks.',
            ),
        requestsPerMinute: z
            .number()
            .optional()
            .describe(
                '📈 SUSTAINED RATE: Average requests per minute over cluster lifespan. Use for understanding attack persistence and resource consumption.',
            ),
        capabilities: z
            .array(z.string())
            .optional()
            .describe(
                '🤖 BOT SOPHISTICATION: Technical capabilities observed (e.g., "js_exec", "ui_interaction", "cookie_handling"). Higher capability counts indicate advanced threats requiring sophisticated countermeasures.',
            ),
        indicators: z
            .array(CyberfraudClusterIndicatorSchema)
            .optional()
            .describe(
                '🚨 THREAT SIGNALS: Array of specific attack indicators with strength scores. Each indicator provides forensic detail for attribution and countermeasure selection.',
            ),
        topPaths: z
            .array(CyberfraudClusterTopPathSchema)
            .optional()
            .describe(
                '🎯 ATTACK TARGETS: Most heavily attacked URLs with volume and percentage breakdowns. Essential for implementing targeted protections and understanding attacker objectives.',
            ),
        domains: z
            .array(z.string())
            .optional()
            .describe(
                '🌐 CROSS-DOMAIN ACTIVITY: Domains involved in attack cluster. Multiple domains may indicate coordinated campaigns or infrastructure sharing.',
            ),
        requestsPerTimeUnit: z
            .number()
            .optional()
            .describe(
                '📊 NORMALIZED RATE: Request volume normalized to specified time unit. Use for consistent rate comparisons across different attack durations.',
            ),
        timeUnit: z
            .string()
            .optional()
            .describe(
                '⏱️ RATE CALCULATION BASIS: Time unit for rate calculations ("second", "minute", "hour"). Essential for understanding the context of rate-based metrics.',
            ),
        sophistication: z
            .string()
            .optional()
            .describe(
                '🎓 THREAT LEVEL: Overall sophistication assessment ("low", "medium", "high", "advanced"). Key field for threat prioritization and response strategy selection.',
            ),
    })
    .passthrough()
    .describe(
        '🕸️ ATTACK CLUSTER: Complete attack campaign analysis with volume, targeting, and sophistication metrics. Core data structure for threat intelligence, incident response, and security decision-making.',
    );

export const CyberfraudOverviewContentSchema = z
    .object({
        clusters: z
            .array(CyberfraudClusterSchema)
            .optional()
            .describe(
                '📋 CLUSTER ARRAY: Complete list of attack clusters with full metadata. Empty array indicates no attacks detected in timeframe/filters. Use length for quick threat count assessment.',
            ),
        total: z
            .number()
            .optional()
            .describe(
                '🔢 TOTAL CLUSTERS: Complete count of clusters matching query criteria across all pages. Essential for pagination planning and threat volume assessment. Value of 0 indicates clean timeframe.',
            ),
    })
    .passthrough()
    .describe(
        '📊 OVERVIEW RESPONSE: Primary container for cluster intelligence data. Contains paginated cluster array and total count for comprehensive attack landscape analysis.',
    );

export const CyberfraudOverviewOutputSchema = z
    .object({
        result: z
            .boolean()
            .optional()
            .describe(
                '✅ API SUCCESS: Indicates successful API call completion. False values require checking message field for error details and potential parameter adjustment.',
            ),
        message: z
            .string()
            .optional()
            .describe(
                '💬 STATUS MESSAGE: Human-readable API response status. Critical for error handling, debugging parameter issues, and understanding API constraints.',
            ),
        content: CyberfraudOverviewContentSchema.optional().describe(
            '📊 CLUSTER INTELLIGENCE: Main attack data payload when result=true. Contains comprehensive cluster analysis and metadata. Null when API errors occur.',
        ),
    })
    .passthrough()
    .describe(
        '📦 OVERVIEW API RESPONSE: Complete attack reporting overview response wrapper. Check result field first, then parse content for threat intelligence. Essential for error handling and data validation.',
    );

export type CyberfraudClusterIndicator = z.infer<typeof CyberfraudClusterIndicatorSchema>;
export type CyberfraudClusterTopPath = z.infer<typeof CyberfraudClusterTopPathSchema>;
export type CyberfraudCluster = z.infer<typeof CyberfraudClusterSchema>;
export type CyberfraudOverviewContent = z.infer<typeof CyberfraudOverviewContentSchema>;
export type CyberfraudOverviewResponse = z.infer<typeof CyberfraudOverviewOutputSchema>;

export const CyberfraudOvertimeClusterSchema = z
    .object({
        type: z
            .string()
            .optional()
            .describe(
                '⚔️ ATTACK TYPE: Threat classification for this time interval (account-takeover, scraping, transaction-abuse, other). Use for tracking threat type evolution over time.',
            ),
        clusterId: z
            .string()
            .nullable()
            .optional()
            .describe(
                '🔍 CLUSTER REFERENCE: Attack cluster identifier active during this interval. Null for certain attack types ("other", "custom-rule"). Use for connecting time-series data to detailed cluster analysis.',
            ),
        block: z
            .number()
            .optional()
            .describe(
                '🛡️ BLOCKED VOLUME: Requests blocked during this 5-minute interval. Primary security effectiveness metric for real-time monitoring and alerting.',
            ),
        simulatedBlock: z
            .number()
            .optional()
            .describe(
                '🧪 SIMULATED BLOCKS: Requests that would be blocked in enforce mode during interval. Critical for policy tuning and measuring potential protection improvements.',
            ),
    })
    .passthrough()
    .describe(
        '⏰ TIME-INTERVAL CLUSTER: Attack activity snapshot for specific 5-minute window. Shows cluster-specific threat volume and blocking effectiveness over time.',
    );

export const CyberfraudOvertimeResultSchema = z
    .object({
        timestamp: z
            .string()
            .optional()
            .describe(
                '⏱️ INTERVAL TIMESTAMP: ISO datetime marking 5-minute interval start. Essential for time-series visualization, trend analysis, and incident timeline correlation.',
            ),
        clusters: z
            .array(CyberfraudOvertimeClusterSchema)
            .optional()
            .describe(
                '📊 ACTIVE CLUSTERS: All attack clusters active during this time interval with volume metrics. Empty array indicates no attacks during interval. Use for attack intensity tracking.',
            ),
        legitimateRequests: z
            .number()
            .optional()
            .describe(
                '✅ NORMAL TRAFFIC: Legitimate user requests during interval. Essential baseline for calculating attack-to-normal ratios and understanding traffic context.',
            ),
        legitimateCustomRules: z
            .number()
            .optional()
            .describe(
                '📝 CUSTOM RULE ALLOW: Requests allowed by custom security rules during interval. Use for measuring custom rule effectiveness and policy impact analysis.',
            ),
        legitimateBots: z
            .number()
            .optional()
            .describe(
                '🤖 GOOD BOTS: Legitimate automated traffic (search engines, monitoring tools) during interval. Important for false positive analysis and baseline establishment.',
            ),
    })
    .passthrough()
    .describe(
        '📈 TIME-SERIES DATA POINT: Complete traffic and threat metrics for single 5-minute interval. Combines attack data with legitimate traffic baselines for comprehensive temporal analysis.',
    );

export const CyberfraudOvertimeOutputSchema = z
    .object({
        result: z
            .boolean()
            .optional()
            .describe(
                '✅ API SUCCESS: Indicates successful API call completion. False values require checking message field for error details and potential parameter adjustment.',
            ),
        message: z
            .string()
            .optional()
            .describe(
                '💬 STATUS MESSAGE: Human-readable API response status. Critical for error handling, debugging parameter issues, and understanding API constraints.',
            ),
        content: z
            .object({
                results: z
                    .array(CyberfraudOvertimeResultSchema)
                    .optional()
                    .describe(
                        '📊 TIME-SERIES ARRAY: Chronologically ordered 5-minute interval data points. Each element represents complete traffic metrics for that interval. Use for trend visualization and temporal analysis.',
                    ),
                dataLags: z
                    .array(z.unknown())
                    .optional()
                    .describe(
                        '⏱️ DATA FRESHNESS: Information about potential delays in data availability. Usually empty array. Non-empty values indicate recent data may be incomplete.',
                    ),
            })
            .passthrough()
            .optional()
            .describe(
                '📈 OVERTIME CONTENT: Time-series attack and traffic data with 5-minute granularity. Essential for trend analysis, incident timeline reconstruction, and real-time monitoring dashboards.',
            ),
    })
    .passthrough()
    .describe(
        '📦 OVERTIME API RESPONSE: Complete time-series attack reporting response wrapper. Check result field first, then parse content.results for temporal threat intelligence. Optimized for time-based analysis and monitoring.',
    );

export type CyberfraudOvertimeResponse = z.infer<typeof CyberfraudOvertimeOutputSchema>;
