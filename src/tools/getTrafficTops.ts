import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { TrafficTopsInputSchema, TrafficTopsInput, TrafficTopsOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetTrafficTops(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_traffic_tops',
        {
            description: `Fetches ranked top values for a selected traffic dimension from HUMAN Security's Cyberfraud Traffic Dashboard API. Use this tool for breakdowns by path, country, incident type, IP org, and more.

🎯 QUICK DECISION GUIDE:
├── Need attack type breakdown? → field: "incidentTypes"
├── Need most targeted paths? → field: "path"
├── Need geo distribution? → field: "country"
├── Need top blocked IP orgs? → field: "socketIpOrgName" with blocked filters
├── Need custom rule usage? → field: "customRule"
└── Need high-level totals only? → Use human_get_traffic_metrics instead

❌ CRITICAL RULES:
• field is required — choose one supported dimension
• trafficSource is required (["web"], ["mobile"], or both)
• startTime/endTime must be valid ISO 8601 strings
• limit defaults to 10 and must be between 1 and 100
• app_id is derived from the API token — do not pass appIds

✅ HIGH-VALUE PATTERNS:

1. ATTACK TYPE BREAKDOWN:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web", "mobile"], "field": "incidentTypes", "filters": {"trafficTags": ["blocked"]}}
   → Top incident types for blocked traffic

2. PATH ANALYSIS:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web"], "field": "path", "limit": 20}
   → Most trafficked endpoints

3. TOP BLOCKED IP ORGS:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "trafficSource": ["web", "mobile"], "field": "socketIpOrgName", "filters": {"trafficTags": ["blocked", "blacklist", "potentialBlock"]}, "limit": 10}
   → Top organizations behind blocked traffic

⚠️ TECHNICAL INSIGHTS:
• Returns content.results as [{ value, count }, ...] sorted by count descending
• includeNulls controls whether null field values appear in results
• Supported fields include socketIp, domain, path, country, customRule, knownBot, utmSource, and more
• Combine filters to focus on security-relevant subsets

🚀 OPTIMAL WORKFLOWS:

1. THREAT HUNTING:
   - Start with field: "incidentTypes" on blocked traffic
   - Follow up with field: "path" or "socketIpOrgName" for deeper context

2. TARGET ANALYSIS:
   - Use field: "path" for endpoint targeting
   - Add pageType filters for journey-specific investigations

Response provides ranked breakdown intelligence optimized for threat analysis, endpoint targeting review, and investigative reporting.`,
            inputSchema: TrafficTopsInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(TrafficTopsOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Traffic Tops',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: TrafficTopsInput) => mcpToolHandler(async () => cyberfraudService.getTrafficTops(params)),
    );
}
