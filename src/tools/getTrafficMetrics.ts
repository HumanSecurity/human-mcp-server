import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { TrafficMetricsInputSchema, TrafficMetricsInput, TrafficMetricsOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetTrafficMetrics(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_traffic_metrics',
        {
            description: `Fetches aggregated traffic totals from HUMAN Security's Cyberfraud Traffic Dashboard API. Use this tool for KPIs, executive summaries, and high-level traffic health checks.

🎯 QUICK DECISION GUIDE:
├── Need totals and KPIs? → Use this tool
├── Need trends over time? → Use human_get_traffic_overtime
├── Need top values for a dimension? → Use human_get_traffic_tops
├── Need security-only totals? → Add filters.trafficTags: ["blocked", "potentialBlock"]
├── Need login-specific totals? → Add filters.pageType: ["login_attempt"]
└── Need multi-platform totals? → Set trafficSource: ["web", "mobile"]

❌ CRITICAL RULES:
• trafficSource is required (["web"], ["mobile"], or both)
• startTime/endTime must be valid ISO 8601 strings
• startTime cannot be after endTime or in the future
• Filters stack multiplicatively and can significantly reduce result scope
• app_id is derived from the API token — do not pass appIds

✅ HIGH-VALUE PATTERNS:

1. EXECUTIVE DASHBOARD:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web", "mobile"]}
   → Total, blocked, legitimate, and known bot counts

2. SECURITY KPIs:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web"], "filters": {"trafficTags": ["blocked", "blacklist", "potentialBlock"]}}
   → Threat-focused totals for the period

3. LOGIN SECURITY SUMMARY:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web"], "filters": {"pageType": ["login_attempt"]}}
   → Login journey traffic totals

⚠️ TECHNICAL INSIGHTS:
• Returns aggregated totals for the full requested time range
• content.results includes total, totalBlocked, legitimate, blocked, goodKnownBots, web, mobile, and more
• content.labels provides human-readable labels for metrics
• Best for single-number KPI reporting rather than charts

🚀 OPTIMAL WORKFLOWS:

1. EXECUTIVE REPORTING:
   - Query broad trafficSource coverage
   - Compare total vs totalBlocked vs legitimate
   - Use labels for presentation-ready output

2. SECURITY HEALTH CHECK:
   - Filter to blocked/potentialBlock/blacklist tags
   - Compare against unfiltered totals from a separate call
   - Focus on login or checkout pageType when relevant

Response provides aggregated traffic intelligence optimized for KPI dashboards, executive summaries, and quick health assessments.`,
            inputSchema: TrafficMetricsInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(TrafficMetricsOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Traffic Metrics',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: TrafficMetricsInput) => mcpToolHandler(async () => cyberfraudService.getTrafficMetrics(params)),
    );
}
