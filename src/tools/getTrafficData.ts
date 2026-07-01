import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { TrafficDataInputBaseSchema, TrafficDataInput, TrafficDataOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetTrafficData(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_traffic_data',
        {
            description: `Fetches traffic analytics from HUMAN Security's Cyberfraud Traffic Dashboard API. One tool call can request one or more views; the MCP decides which underlying endpoints to call and merges the results.

🎯 QUICK DECISION GUIDE:
├── Need trend charts / attack timeline? → overtime: true
├── Need high-level totals / KPIs? → metrics: true
├── Need attack types? → tops: ["incidentTypes"]
├── Need URL path breakdown? → tops: ["path"]
├── Need top blocked IP orgs? → tops: ["socketIpOrgName"]
├── Security focus only? → filters: { trafficTags: ["blocked", "potentialBlock"] }
└── Multi-platform analysis? → trafficSource: ["web", "mobile"]

✅ REQUEST MODES (combinable in one call):
• overtime: Per-minute time-series counts. Use seriesFields to break out by knownBot, customRule, or accessTokenName.
• metrics: Aggregated totals for the full time range (total, blocked, legitimate, goodKnownBots, etc.).
• tops: Top values for one or more fields, ranked by request count. Each field triggers a separate API call; results are merged keyed by field name.

🔧 FILTERS (optional, stack multiplicatively):
• filters.trafficTags: Security classification (blocked, legitimate, goodKnownBots, etc.)
• filters.pageType: User journey (login, checkout, carding_attempt, etc.)
• filters.browserFamily / osFamily / country: Device and geo filters

✅ HIGH-VALUE PATTERNS:

1. EXECUTIVE TRAFFIC SUMMARY:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "metrics": true}

2. ATTACK TIMELINE:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "overtime": true, "filters": {"trafficTags": ["blocked", "potentialBlock"]}}

3. ATTACK TYPE BREAKDOWN:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "tops": ["incidentTypes"]}

4. PATH ANALYSIS:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "tops": ["path"]}

5. FULL SECURITY INVESTIGATION (combined):
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "metrics": true, "overtime": true, "tops": ["incidentTypes", "socketIpOrgName"], "filters": {"trafficTags": ["blocked"]}}

⚠️ NOTES:
• At least one of overtime, metrics, or tops must be specified.
• trafficSource defaults to ["web", "mobile"] when omitted.
• app_id is derived from the API token — do not pass appIds.
• tops limit defaults to 10 (max 100). Use includeNulls to include null-valued rows.`,
            inputSchema: TrafficDataInputBaseSchema.shape,
            outputSchema: makeStructuredResponseSchema(TrafficDataOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Traffic Data',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: TrafficDataInput) => mcpToolHandler(async () => cyberfraudService.getTrafficData(params)),
    );
}
