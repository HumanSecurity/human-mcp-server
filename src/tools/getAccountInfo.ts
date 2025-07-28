import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CyberfraudAccountInfoInputSchema,
    CyberfraudAccountInfoInput,
    CyberfraudAccountInfoOutputSchema,
} from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';

export function registerCyberfraudGetAccountInfo(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_account_info',
        {
            description: `Retrieves comprehensive account intelligence and security profile from HUMAN Security's Cyberfraud API. This critical investigation tool provides deep insights into individual account behavior, threat exposure, and risk factors for targeted security analysis and incident response.

🎯 QUICK DECISION GUIDE:
├── Need account verification? → Use accountId only for basic existence check
├── Need threat assessment? → Focus on is_under_attack and active_incidents fields
├── Need incident response? → Analyze risk_score and attack_type for prioritization
├── Need forensic analysis? → Examine first_seen, last_seen timeline correlation
├── Need behavioral analysis? → Review aggregative_data for trigger patterns
└── Need compliance audit? → Document incident_creation timestamps and risk scores

❌ CRITICAL RULES:
• Response structure depends entirely on account existence (exists field)
• Non-existent accounts return minimal data (account_id + exists=false only)
• daysRange parameter has no observable impact on response structure
• is_under_attack=true requires immediate security attention
• Empty active_incidents array indicates no current threats

✅ HIGH-VALUE PATTERNS:

1. ACCOUNT VERIFICATION:
   {"accountId": "123456789"} → Complete security profile or minimal not-found response
   
2. THREAT ASSESSMENT:
   Focus on: is_under_attack + active_incidents[].risk_score for immediate prioritization
   
3. INCIDENT RESPONSE:
   active_incidents[].attack_type="ato" + risk_score=1 → Account takeover requiring urgent attention
   
4. FORENSIC INVESTIGATION:
   Compare first_seen vs registration_date for suspicious account creation patterns
   
5. BEHAVIORAL ANALYSIS:
   aggregative_data.trigger_categories=["network","device"] → Multi-vector attack pattern

⚠️ PARAMETER BEHAVIOR:
• accountId: HIGH IMPACT - Determines complete response structure and availability
• daysRange: MINIMAL IMPACT - Accepted but does not change observable response content
• Performance: No observable impact regardless of daysRange value

🚀 OPTIMAL WORKFLOWS:

1. INCIDENT RESPONSE:
   - Start with accountId-only call for rapid threat assessment
   - Check exists + is_under_attack for immediate escalation decisions
   - Analyze active_incidents array for specific threat details and prioritization
   - Use risk_score thresholds for SLA and response workflow routing

2. FORENSIC INVESTIGATION:
   - Compare account creation (registration_date) with first system interaction (first_seen)
   - Analyze incident_creation timestamps for attack timeline reconstruction
   - Cross-reference trigger_categories for comprehensive attack vector analysis
   - Correlate with broader security intelligence for campaign attribution

3. COMPLIANCE AUDIT:
   - Document all incident timestamps and risk assessments
   - Track manual vs automated incident creation (is_manually_created)
   - Generate security posture reports from aggregative behavioral data
   - Maintain audit trails for security response and investigation processes

Key Features:
• Complete account lifecycle tracking with registration and activity timestamps
• Real-time attack status monitoring and threat exposure assessment
• Active incident tracking with detailed risk scoring and categorization  
• Historical behavioral analysis with configurable time ranges
• Account verification and existence validation
• Sensitive transaction pattern analysis and fraud detection

Response provides detailed account intelligence optimized for incident response, fraud investigation, customer support, and compliance auditing with actionable threat indicators and comprehensive security assessment.`,
            inputSchema: CyberfraudAccountInfoInputSchema.shape as any,
            outputSchema: makeStructuredResponseSchema(CyberfraudAccountInfoOutputSchema).shape as any,
            annotations: {
                title: 'HUMAN Get Account Info',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        (async (params: CyberfraudAccountInfoInput, extra: any) =>
            mcpToolHandler(async () => cyberfraudService.getAccountInfo(params))) as any,
    );
}
