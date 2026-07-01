import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { TrafficOvertimeInputSchema, TrafficOvertimeInput, TrafficOvertimeOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetTrafficOvertime(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_traffic_overtime',
        {
            description: `Fetches minute-bucketed traffic overtime data from HUMAN Security's Cyberfraud Traffic Dashboard API. Use this tool for trend charts, attack timelines, and time-series security analysis.

🎯 QUICK DECISION GUIDE:
├── Need trend charts over time? → Use this tool
├── Need high-level totals only? → Use human_get_traffic_metrics
├── Need top values for a dimension? → Use human_get_traffic_tops
├── Need attack type breakdown over time? → Add seriesFields: ["knownBot"] or filters.trafficTags
├── Need login-focused timeline? → Add filters.pageType: ["login_attempt"]
└── Need multi-platform view? → Set trafficSource: ["web", "mobile"]

❌ CRITICAL RULES:
• trafficSource is required (["web"], ["mobile"], or both)
• startTime/endTime must be valid ISO 8601 strings
• startTime cannot be after endTime or in the future
• Filters stack multiplicatively and can significantly reduce result scope
• app_id is derived from the API token — do not pass appIds

✅ HIGH-VALUE PATTERNS:

1. SECURITY TIMELINE:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web", "mobile"], "filters": {"trafficTags": ["blocked", "potentialBlock"]}}
   → Blocked traffic volume over time

2. KNOWN BOT BREAKDOWN:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web"], "filters": {"trafficTags": ["goodKnownBots"]}, "seriesFields": ["knownBot"]}
   → Known bot traffic split by bot name over time

3. LOGIN ATTEMPT MONITORING:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web"], "filters": {"pageType": ["login_attempt"], "trafficTags": ["blocked"]}}
   → Login attack timeline

⚠️ TECHNICAL INSIGHTS:
• Returns one row per minute with traffic tag counts
• seriesFields adds extra per-value columns in each minute bucket
• Response uses { result, message, content.results[] } envelope
• Longer time ranges produce more minute buckets

🚀 OPTIMAL WORKFLOWS:

1. INCIDENT TIMELINE:
   - Start with a focused 6-24 hour window
   - Filter to blocked/potentialBlock trafficTags
   - Expand window if more context is needed

2. BOT TRAFFIC ANALYSIS:
   - Filter to goodKnownBots
   - Add seriesFields: ["knownBot"]
   - Compare bot families over time

Response provides minute-level traffic intelligence optimized for dashboards, SOC monitoring, and executive trend reporting.`,
            inputSchema: TrafficOvertimeInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(TrafficOvertimeOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Traffic Overtime',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: TrafficOvertimeInput) =>
            mcpToolHandler(async () => cyberfraudService.getTrafficOvertime(params)),
    );
}
