import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { RawActivitiesInputBaseSchema, RawActivitiesOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import type { RawActivitiesInput } from '../types/cyberfraud';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerGetRawActivities(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_raw_activities',
        {
            description: `Fetches raw activity records (individual request logs) and total count from HUMAN Security for a given search criteria and time window.

Use this tool to drill into specific traffic at the request level — whether investigating a Block ID, an IP, a user email, a domain, or any other supported field.

⚠️ TIME RANGE CONSTRAINT: Raw activity queries are expensive. The time window MUST be at most 4 hours.
Use short windows like the last 30, 60, or 240 minutes. If the user does not specify, default to the last 1 hour.

🎯 WHEN TO USE THIS TOOL:
• User wants to investigate a specific Block ID / Reference ID
• User wants to investigate traffic from a specific IP or CIDR
• User wants to find raw activity records for a user email, domain, path, VID, or any other field
• User wants to drill into specific incidents at the request level
• User asks for raw request logs matching a condition

📋 SEARCH QUERY (required, same syntax as human_get_traffic_data):
Use searchQuery for field-level filtering with boolean logic.
Field expression: { type: "field", key: "<fieldKey>", operator: "<op>", value: "<val>" }
Logical operator: { type: "operator", operator: "AND" | "OR" | "NOT" | "(" | ")" }

Supported field keys include: blockReference, socketIp, userEmail, domain, path, displayScore, vid, uaServer, knownBot,
incidentTypes, filterOriginReason, httpMethod, httpStatusCode, customRule,
accessTokenName, headerReferer, graphqlOperationName, graphqlOperationType,
customParam1–customParam10, socketIpOrgName, agent, and more.

🔍 KEY RESPONSE FIELDS FOR ANALYSIS (in activities[]):
• filterOriginReason — the specific reason the request was filtered/blocked
• ruleName — which rule triggered the block
• displayScore — risk score (0–100); higher = more suspicious
• incidentTypes — detected threat signals: "Bot Behavior", "Automation Tool", "Spoof", "Behavioral Anomalies", "UI Anomaly", "Bad Reputation", "Volumetric Rule", "Volumetric Anomaly", "Missing Sensor Data", "Cloud Service", "Anonymizing Service", "Denylisted Service", "Custom Denylist", "Captcha Solving Attack"
• trafficTags — traffic classification (e.g. "Blocked Requests", "Simulated Block")
• blockReference — the Block ID associated with this request
• socketIp, domain, path, userEmail, vid, httpMethod, httpStatusCode, country, browserDisplay, osFamily

📊 RESPONSE STRUCTURE:
• count: total number of matching records in the time window (always the full total, regardless of limit/offset)
• activities: matching records, newest first — up to 'limit' (default 20, max 100) starting at 'offset'

📄 PAGINATION:
• limit: how many raw records to return (1-100, default 20).
• offset: how many to skip (records are sorted newest-first). Use count + offset to page through results.

✅ USAGE PATTERNS:

1. INVESTIGATE BY BLOCK ID:
   {"searchQuery": [{"type": "field", "key": "blockReference", "operator": "=", "value": "b5e0-b1d1-a54de"}], "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

2. INVESTIGATE BY IP:
   {"searchQuery": [{"type": "field", "key": "socketIp", "operator": "=", "value": "203.0.113.10"}], "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

3. INVESTIGATE BY USER EMAIL:
   {"searchQuery": [{"type": "field", "key": "userEmail", "operator": "=", "value": "user@example.com"}], "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

4. INVESTIGATE BY DOMAIN + HIGH RISK:
   {"searchQuery": [{"type": "field", "key": "domain", "operator": "contains", "value": "example.com"}, {"type": "operator", "operator": "AND"}, {"type": "field", "key": "displayScore", "operator": ">=", "value": 80}], "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

5. INVESTIGATE BY VID:
   {"searchQuery": [{"type": "field", "key": "vid", "operator": "=", "value": "abc-123-def"}], "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

6. IP WITH AUTOMATION INCIDENT:
   {"searchQuery": [{"type": "field", "key": "socketIp", "operator": "=", "value": "203.0.113.10"}, {"type": "operator", "operator": "AND"}, {"type": "field", "key": "incidentTypes", "operator": "=", "value": "Automation Tool"}], "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

7. NARROW TO BLOCKED TRAFFIC ONLY (via filters):
   {"searchQuery": [{"type": "field", "key": "socketIp", "operator": "=", "value": "203.0.113.10"}], "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "filters": {"trafficTags": ["blocked", "potentialBlock"]}}

⚠️ NOTES:
• searchQuery is required and must contain at least one expression.
• trafficSource defaults to ["web", "mobile"] when omitted.
• Use limit/offset to page through more than the default 20 records when count is large.
• For broader traffic analytics (overtime, metrics, tops) without raw records, use human_get_traffic_data instead.`,
            inputSchema: RawActivitiesInputBaseSchema.shape,
            outputSchema: makeStructuredResponseSchema(RawActivitiesOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Raw Activities',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: RawActivitiesInput) => mcpToolHandler(async () => cyberfraudService.fetchRawActivities(params)),
    );
}
