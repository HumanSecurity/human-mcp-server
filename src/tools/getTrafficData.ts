import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { TrafficDataInputSchema, TrafficDataInput, TrafficDataOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';

export function registerCyberfraudGetTrafficData(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_traffic_data',
        {
            description: `Fetches comprehensive traffic analytics from HUMAN Security's Cyberfraud API. This powerful tool provides detailed insights into web and mobile traffic patterns, security metrics, and user behavior across your applications.

🎯 QUICK DECISION GUIDE:
├── Need high-level totals without granular breakdowns? → Use "count" 
├── Need trends/charts? → Use "overtime"
├── Need attack types? → Add "tops": ["incidents"] 
├── Need URL path information? → Add "tops": ["path"]
├── Security focus only? → Add "traffic": ["blocked"]
└── Multi-platform analysis? → Include "source": ["web", "mobile"]

❌ CRITICAL RULES:
• NEVER combine "count" + "overtime" (mutually exclusive)
• NEVER combine "overtime" + "tops" (creates misleading aggregation, see AGGREGATION WARNING below)
• "tops" completely transforms response structure
• "count" returns only high-level totals, no granularity
• Filters stack multiplicatively (can reduce data 87%+)

🚨 AGGREGATION WARNING - IMPORTANT API BEHAVIOR:
When combining "overtime" + "tops" parameters, the API exhibits unexpected aggregation:
• First interval: Contains ALL historical data aggregated (total counts)
• Subsequent intervals: All show 0 counts (creating false impression of no recent activity)
• Result: Appears as time-series but is actually front-loaded aggregate data

CORRECT USAGE:
• Path analysis: Use "tops": ["path"] for path breakdowns (no "count")
• Time-series: Use "overtime" without "tops" 
• Attack types: Use "count" + "tops": ["incidents"] for totals

✅ HIGH-VALUE PATTERNS:

1. EXECUTIVE DASHBOARD:
   {"count": ["legitimate", "blocked"]}
   → Simple traffic health metrics without breakdowns

2. PATH ANALYSIS:
   {"tops": ["path"]}
   → Most trafficked endpoints with accurate totals

3. ATTACK TYPE ANALYSIS:
   {"tops": ["incidents"]}  
   → Attack type breakdown with accurate totals

4. SECURITY TIMELINE:
   {"overtime": ["blocked"]}
   → Pure attack volume trends over time

5. FOCUSED ANALYSIS:
   {"count": ["blocked"], "pageType": ["login"], "source": ["web"]}
   → Login-specific web security

⚠️ ENVIRONMENT NOTES:
• Mobile traffic may be minimal/absent in some environments
• Page type filters dramatically reduce scope 
• Incident classification reveals valuable attack taxonomy
• Time-series uses ~20-minute intervals

🔧 PARAMETER BEHAVIOR:
• "count": Aggregate totals across time range, should be used only when only total numbers are needed as the response will not include more granular breakdowns
• "overtime": Time-series with intervals (do NOT combine with "tops")
• "tops": Transforms aggregates to breakdowns (use with "count" only)
• "traffic": Security-only filter (excludes legitimate)
• "pageType": Journey-specific filter (very restrictive)
• "source": Platform filter (web/mobile)

Response provides structured data optimized for security dashboards, threat analysis, and executive reporting with quantifiable metrics and actionable intelligence.`,
            inputSchema: TrafficDataInputSchema.shape,
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
