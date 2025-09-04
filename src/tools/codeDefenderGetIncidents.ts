import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CodeDefenderIncidentsInputSchema,
    CodeDefenderIncidentsParams,
    CodeDefenderGetIncidentsOutputSchema,
} from '../types/codeDefender';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CodeDefenderService } from '../services/codeDefenderService';

export function registerCodeDefenderGetIncidents(server: McpServer, codeDefenderService: CodeDefenderService) {
    server.registerTool(
        'human_code_defender_get_incidents',
        {
            description: `Retrieves comprehensive client-side security incidents from HUMAN Security's Code Defender API, providing critical insights into code integrity threats, supply chain attacks, and browser-based vulnerabilities. This essential security monitoring tool enables proactive defense against modern web application threats.

🎯 QUICK DECISION GUIDE:
├── Need incident overview? → Use default parameters (appId + tld only)
├── Need recent activity? → Add time range (from/to timestamps)
├── Need targeted analysis? → Use small "take": 5-10 for detailed review
├── Need specific incidents? → Use time filtering to focus on incident windows
├── Need pagination? → Use "skip" + "take" for large datasets
└── Need trend analysis? → Use broader time ranges with larger "take" values

❌ CRITICAL RULES:
• appId and tld are REQUIRED parameters (API enforced)
• Timestamps must be in milliseconds since epoch format
• Large "take" values may timeout (recommend ≤50 for performance)
• excludedStatuses parameter validation may be strict (test carefully)

✅ HIGH-VALUE PATTERNS:

1. RECENT INCIDENT DISCOVERY:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "take": 10}
   → Complete recent incident overview with manageable detail

2. TARGETED TIME ANALYSIS:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "from": 1749409759000, "to": 1749496159000, "take": 5}
   → Focused analysis of specific time window incidents

3. PAGINATION WORKFLOW:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "skip": 10, "take": 10}
   → Navigate large incident datasets efficiently

4. FOCUSED INVESTIGATION:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "from": recent_timestamp, "take": 3}
   → Deep dive into specific incident timeframe

⚠️ ENVIRONMENT NOTES:
• Incident categories include "Deviation", script modifications, DOM manipulation
• Risk levels: Low, Medium, High with detailed reasoning
• Action types: DOM manipulation, script loading, network activity
• Page type correlation available (checkout, login, products_and_search)

🔧 PARAMETER BEHAVIOR:
• "appId": Application targeting - must match exact app configuration
• "tld": Domain filtering - supports subdomain analysis  
• "from/to": Time scoping - millisecond precision for incident timeline
• "take": Result limiting - balance detail vs performance
• "skip": Pagination control - reliable offset-based navigation

📊 RESPONSE RICHNESS:
• Complete incident metadata: category, details, risk assessment
• Action logs: Specific attacker behaviors and techniques (DOM changes, script loads)
• Timeline analysis: First/last seen timestamps for incident progression
• Page type correlation: Understanding of attack target preferences
• Script attribution: Identification of affected/malicious scripts
• Risk scoring: Quantitative assessment for prioritization

🚀 OPTIMAL WORKFLOWS:

1. SOC MONITORING:
   - Start with recent incidents (no time filter) for current threat landscape
   - Use small take values (5-10) for detailed analysis of active threats
   - Monitor risk_level distribution for threat severity assessment

2. INCIDENT RESPONSE:
   - Use time filtering to focus on specific incident windows
   - Analyze action logs for detailed attack progression
   - Track script involvement for supply chain impact assessment

3. FORENSIC INVESTIGATION:
   - Use broad time ranges to understand attack evolution
   - Focus on specific incident categories for targeted analysis
   - Cross-reference with script inventory for complete attack attribution

4. COMPLIANCE REPORTING:
   - Regular incident summaries for security posture documentation
   - Risk level analysis for compliance risk assessment
   - Page type correlation for sensitive area protection validation

Response provides detailed incident intelligence optimized for security operations, incident response, compliance monitoring, and forensic investigation with actionable threat indicators and comprehensive attack attribution.`,
            inputSchema: CodeDefenderIncidentsInputSchema.shape as any,
            outputSchema: makeStructuredResponseSchema(CodeDefenderGetIncidentsOutputSchema).shape as any,
            annotations: {
                title: 'HUMAN Get Code Defender Incidents',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        (async (params: CodeDefenderIncidentsParams, extra: any) =>
            mcpToolHandler(async () => codeDefenderService.getCodeDefenderIncidents(params))) as any,
    );
}
