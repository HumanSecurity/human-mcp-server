import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { InvestigateBlockBaseSchema, InvestigateBlockOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import type { InvestigateBlockInput } from '../types/cyberfraud';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerInvestigateBlock(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_investigate_block',
        {
            description: `Investigates why a specific Block ID or IP address is being blocked by HUMAN Security.
Fetches matching raw activity records, total count, and aggregated traffic metrics for the given time window.

⚠️ TIME RANGE CONSTRAINT: Raw activity queries are expensive. The time window MUST be at most 4 hours.
Use short windows like the last 30, 60, or 240 minutes. If the user does not specify, default to the last 1 hour.

🎯 WHEN TO USE THIS TOOL:
• User provides a Block ID / Reference ID and wants to understand why it was blocked
• User provides an IP address and wants to understand what traffic came from it and why it was blocked
• User wants to drill into a specific incident at the request level

🔍 KEY RESPONSE FIELDS FOR BLOCK ANALYSIS (in activities[]):
• filterOriginReason — the specific reason the request was filtered/blocked
• ruleName — which rule triggered the block
• displayScore — risk score (0–100); higher = more suspicious
• incidentTypes — detected threat signals — valid values: "Bot Behavior", "Automation Tool", "Spoof", "Behavioral Anomalies", "UI Anomaly", "Bad Reputation", "Volumetric Rule", "Volumetric Anomaly", "Missing Sensor Data", "Cloud Service", "Anonymizing Service", "Denylisted Service", "Custom Denylist", "Captcha Solving Attack"
• trafficTags — traffic classification (e.g. "Blocked Requests", "Simulated Block")
• blockReference — the Block ID associated with this request

📊 RESPONSE STRUCTURE:
• count: total number of matching records in the time window
• activities: up to 20 sample records with all available fields
• metrics: aggregated totals (blocked, legitimate, total, etc.) for the matching traffic

✅ USAGE PATTERNS:

1. INVESTIGATE BY BLOCK ID:
   {"blockReference": "b5e0-b1d1-a54de", "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

2. INVESTIGATE BY IP:
   {"socketIp": "203.0.113.10", "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

3. INVESTIGATE IP WITH CIDR:
   {"socketIp": "203.0.113.0/24", "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

4. INVESTIGATE BOTH (returns OR match):
   {"blockReference": "b5e0-b1d1-a54de", "socketIp": "203.0.113.10", "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}"}

5. NARROW TO BLOCKED TRAFFIC ONLY:
   {"socketIp": "203.0.113.10", "startTime": "${DATE_FORMAT_EXAMPLE_START}", "endTime": "${DATE_FORMAT_EXAMPLE_END}", "filters": {"trafficTags": ["blocked", "potentialBlock"]}}

⚠️ NOTES:
• Provide at least one of blockReference or socketIp.
• trafficSource defaults to ["web", "mobile"] when omitted.
• For broader traffic analysis without a specific Block ID or IP, use human_get_traffic_data instead.`,
            inputSchema: InvestigateBlockBaseSchema.shape,
            outputSchema: makeStructuredResponseSchema(InvestigateBlockOutputSchema).shape,
            annotations: {
                title: 'HUMAN Investigate Block',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: InvestigateBlockInput) => mcpToolHandler(async () => cyberfraudService.investigateBlock(params)),
    );
}
