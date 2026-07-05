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
├── Multi-platform analysis? → trafficSource: ["web", "mobile"]
└── Need raw request-level records? → use human_get_raw_activities instead

✅ REQUEST MODES (combinable in one call):
• overtime: Per-minute time-series counts. Use seriesFields to break out by knownBot, customRule, or accessTokenName.
• metrics: Aggregated totals for the full time range (total, blocked, legitimate, goodKnownBots, etc.).
• tops: Top values for one or more fields, ranked by request count. Each field triggers a separate API call; results are merged keyed by field name.

🔧 FILTERS (optional, stack multiplicatively):
• filters.trafficTags: Security classification (blocked, legitimate, goodKnownBots, etc.)
• filters.pageType: User journey (login, checkout, carding_attempt, etc.)
• filters.browserFamily / osFamily / country: Device and geo filters

🔍 SEARCH QUERY (optional, for field-level filtering with boolean logic):
Use searchQuery to filter by any specific field value. Items are either field expressions or logical operators.
Field expression: { type: "field", key: "<fieldKey>", operator: "<op>", value: "<val>" }
Logical operator: { type: "operator", operator: "AND" | "OR" | "NOT" | "(" | ")" }

Available field keys and their operators:
• socketIp (IP/CIDR): =, !=
• blockReference (Block ID): =, exists, notExists
• displayScore (risk score 0-100): =, !=, >, <, >=, <=
• incidentTypes: =, !=, exists, notExists
  Valid values: "UI Anomaly", "Bot Behavior", "Automation Tool", "Spoof", "Behavioral Anomalies",
  "Bad Reputation", "Volumetric Rule", "Volumetric Anomaly", "Missing Sensor Data",
  "Cloud Service", "Anonymizing Service", "Denylisted Service", "Custom Denylist", "Captcha Solving Attack"
• knownBot: =, !=, exists, notExists
  Example values: "Googlebot", "Bing Bot", "GPTBot", "ClaudeBot", "PerplexityBot",
  "Facebook Crawler", "Twitterbot", "Pingdom", "Datadog - Synthetics", "Semrush Bot", "Ahrefs"
  (150+ bots total — use exists/notExists for broad match)
• domain, path, uaServer, socketIpOrgName, userEmail, headerReferer: =, !=, contains, exists, notExists
• filterOriginReason, vid, accessTokenName: =, !=, exists, notExists
• httpStatusCode: =, !=, >, <, >=, <=
• httpMethod: =, != — values: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
• graphqlOperationType: =, !=, exists, notExists — values: query, mutation, subscription
• graphqlOperationName: =, !=, exists, notExists
• customRule: =, !=, contains, exists, notExists
• customParam1–customParam10: =, !=, contains, exists, notExists

Example — traffic from a CIDR with high risk score:
   "searchQuery": [
     { "type": "field", "key": "socketIp", "operator": "=", "value": "203.0.113.0/24" },
     { "type": "operator", "operator": "AND" },
     { "type": "field", "key": "displayScore", "operator": ">=", "value": 80 }
   ]

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

6. SEARCH QUERY — TOP IPs FROM A SPECIFIC CIDR:
   {"startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "tops": ["socketIp"], "searchQuery": [{"type": "field", "key": "socketIp", "operator": "=", "value": "203.0.113.0/24"}]}

⚠️ NOTES:
• At least one of overtime, metrics, or tops must be specified.
• trafficSource defaults to ["web", "mobile"] when omitted.
• app_id is derived from the API token — do not pass appIds.
• tops limit defaults to 10 (max 100). Use includeNulls to include null-valued rows.
• searchQuery and filters are additive — both are applied when provided.`,
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
