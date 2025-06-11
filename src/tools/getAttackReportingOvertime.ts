import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CyberfraudOvertimeInputSchema,
    CyberfraudOvertimeParams,
    CyberfraudOvertimeOutputSchema,
} from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';

export function registerCyberfraudGetAttackReportingOvertime(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_attack_reporting_overtime',
        {
            description: `Fetches comprehensive time-series attack reporting data from HUMAN Security's Cyberfraud API, providing granular insights into attack patterns and security events over time. This powerful analytics tool enables deep temporal analysis of threats and mitigation effectiveness.

🎯 QUICK DECISION GUIDE:
├── Need attack timeline? → Use 6-24 hour windows for focus
├── Need pattern analysis? → Use longer periods (1-3 days)
├── Need legitimate baseline? → Overtime provides context traffic
├── Need cluster tracking? → Follow clusterId evolution over time
├── Need volume analysis? → Focus on block/simulatedBlock counts
└── Need SOC monitoring? → Combine with real-time data feeds

❌ CRITICAL RULES:
• Time range MUST be within last 2 weeks (API enforced)
• NEVER use empty arrays for filter parameters (causes errors)
• Shorter time windows = more granular analysis (5-minute intervals)
• Filter combinations can return zero results (not an error)

✅ HIGH-VALUE PATTERNS:

1. ATTACK TIMELINE ANALYSIS:
   {"startTime": "6_hours_ago", "endTime": "now"}
   → Recent attack progression with 5-min intervals

2. PATTERN DETECTION:
   {"startTime": "24_hours_ago", "endTime": "now", "threatTypes": ["account-takeover"]}
   → Single threat type evolution over time

3. VOLUME CORRELATION:
   {"startTime": "12_hours_ago", "endTime": "now", "trafficSources": ["web"]}
   → Platform-specific attack intensity tracking

4. BASELINE COMPARISON:
   {"startTime": "today", "endTime": "now"}
   → Attack volume vs legitimate traffic ratio

5. CLUSTER EVOLUTION:
   {"startTime": "recent", "endTime": "now"}
   → Track how attack clusters develop and persist

⚠️ ENVIRONMENT NOTES:
• Returns 5-minute interval timestamps for granular analysis
• Includes legitimate traffic for attack-to-normal ratio calculations
• clusterId may be null for certain attack types (e.g., "other", "custom-rule")
• Different response structure than overview tool - optimized for time-series

🔧 PARAMETER BEHAVIOR:
• "startTime/endTime": 5-minute interval granularity - shorter windows = more detail
• "threatTypes": Can filter timeline to specific attack categories
• "trafficSources": Platform-specific temporal analysis
• "trafficTypes": Organic vs paid attack timeline comparison

📈 RESPONSE STRUCTURE:
• Time-bucketed data: Each interval contains attack counts and cluster info
• Legitimate context: Baseline traffic for anomaly detection
• Cluster tracking: Follow specific attack campaigns over time
• Volume metrics: block/simulatedBlock counts per interval
• Bot classification: legitimateBots for false positive assessment

🚀 OPTIMAL WORKFLOWS:

1. INCIDENT TIMELINE RECONSTRUCTION:
   - Start with broad time window to identify incident start
   - Narrow to specific attack timeframe for detailed analysis
   - Use threatTypes to focus on relevant attack categories

2. SOC MONITORING:
   - Use recent time windows (last 2-6 hours) for real-time view
   - Monitor legitimateRequests vs blocked ratio for health
   - Track cluster persistence for campaign identification

3. TREND ANALYSIS:
   - Use longer windows (1-3 days) for pattern identification
   - Compare different time periods for baseline establishment
   - Analyze peak attack times for capacity planning

4. FORENSIC INVESTIGATION:
   - Identify attack start/end times with precise granularity
   - Track attack evolution and adaptation over time
   - Correlate with external events or system changes

Response provides time-series attack intelligence optimized for temporal analysis, incident response, and security operations center monitoring with quantifiable attack progression metrics.`,
            inputSchema: CyberfraudOvertimeInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CyberfraudOvertimeOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Attack Reporting Overtime',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CyberfraudOvertimeParams) =>
            mcpToolHandler(async () => cyberfraudService.getAttackReportingOvertime(params)),
    );
}
