import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CyberfraudOverviewInputSchema,
    CyberfraudOverviewParams,
    CyberfraudOverviewOutputSchema,
} from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetAttackReportingOverview(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_attack_reporting_overview',
        {
            description: `Retrieves comprehensive attack cluster intelligence from HUMAN Security's Cyberfraud API, providing detailed analysis of detected threats and their characteristics. This essential threat intelligence tool delivers deep insights into attack patterns, impact, and attribution for informed security decision-making.

🎯 QUICK DECISION GUIDE:
├── Need cluster discovery? → Use defaults first (no filters)
├── Need specific attack type? → Use single "threatTypes": ["account-takeover"]
├── Need detailed cluster analysis? → Use small "pageSize": 5-10 first
├── Need specific cluster details? → Use "clusterId" for targeted analysis
├── Need traffic source analysis? → Filter "trafficSources": ["web"] or ["mobile"]
└── Need pagination? → Use "page" + "pageSize" for large datasets

❌ CRITICAL RULES:
• Time range MUST be within last 2 weeks (API enforced)
• NEVER use empty arrays for filter parameters (causes errors)
• pageSize limit: ≤50 (larger values cause errors)
• clusterId returns single cluster (ignores pagination parameters)

✅ HIGH-VALUE PATTERNS:
• "startTime" and "endTime" should be in ISO 8601 format, e.g. "${DATE_FORMAT_EXAMPLE_END}".

1. BROAD DISCOVERY (START HERE):
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "pageSize": 10}
   → Complete threat landscape overview

2. FOCUSED THREAT ANALYSIS:
   {"threatTypes": ["account-takeover"], "pageSize": 20}
   → Deep dive into specific attack category

3. CLUSTER DEEP-DIVE:
   {"clusterId": "ATO-8J8VG", "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}
   → Complete details for specific attack cluster

4. TIME-WINDOWED ANALYSIS:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "pageSize": 5}
   → Recent attack activity focus

5. PAGINATION WORKFLOW:
   {"page": 2, "pageSize": 10}
   → Navigate large result sets efficiently

⚠️ ENVIRONMENT NOTES:
• threatTypes filtering can return zero results (not all threat types may be active)
• trafficTypes=["paid"] often returns empty (most attacks are organic)
• Mobile attacks may be minimal compared to web attacks
• Time validation errors provide exact valid date ranges

🔧 PARAMETER BEHAVIOR:
• "threatTypes": HIGH IMPACT filter - can reduce results to zero
• "trafficTypes": MODERATE IMPACT - paid traffic often minimal
• "trafficSources": LOW IMPACT - most environments web-dominated
• "pageSize": PERFORMANCE control - start small, scale up
• "page": NAVIGATION - reliable pagination with consistent totals
• "clusterId": PRECISION targeting - returns single cluster with full details

📊 RESPONSE RICHNESS:
• Complete attack metadata: timestamps, volume, sophistication scores
• Threat indicators: 9 types (Bad Network Reputation, Environment Spoofing, etc.)
• Attack paths: Top targeted URLs with percentage breakdowns
• Domain correlation: Cross-domain attack attribution
• Bot capabilities: Technical sophistication (js_exec, ui_interaction, etc.)

🚀 OPTIMAL WORKFLOW:
1. START BROAD: Use defaults to discover active threat types
2. FILTER DOWN: Choose single threat type for detailed analysis
3. CLUSTER FOCUS: Use clusterId for deep-dive analysis of specific attacks
4. PAGINATE: Use page/pageSize to explore large datasets efficiently

Response provides detailed cluster intelligence optimized for incident response, threat hunting, and security analysis with actionable threat indicators and comprehensive attack attribution.`,
            inputSchema: CyberfraudOverviewInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CyberfraudOverviewOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Attack Reporting Overview',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CyberfraudOverviewParams) =>
            mcpToolHandler(async () => cyberfraudService.getAttackReportingOverview(params)),
    );
}
