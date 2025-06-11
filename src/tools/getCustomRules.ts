import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { CyberfraudCustomRulesOutputSchema } from '../types/cyberfraud';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';

export function registerCyberfraudGetCustomRules(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_custom_rules',
        {
            description: `Retrieves and manages the complete inventory of custom security rules configured in HUMAN Security's Cyberfraud API. This essential configuration management tool provides comprehensive visibility into your custom mitigation logic and security policies.

🎯 QUICK DECISION GUIDE:
├── Need rule overview? → Use for complete policy inventory
├── Need priority analysis? → Focus on priority field (0 = highest)
├── Need active policies? → Filter by status: "active" vs "paused"
├── Need security gaps? → Analyze condition coverage and action types
├── Need compliance audit? → Review descriptions and rule documentation
└── Need conflict resolution? → Check priority hierarchy and overlapping conditions

❌ CRITICAL RULES:
• No input parameters required - returns complete rule inventory
• Rules ordered by priority (index 0 = highest priority rule)
• Empty actions array indicates disabled/misconfigured rules
• Status "paused" means rule preserved but not enforcing

✅ HIGH-VALUE PATTERNS:

1. POLICY INVENTORY ANALYSIS:
   → Complete rule catalog with priority-based execution order
   
2. SECURITY POSTURE ASSESSMENT:
   → Action distribution analysis (allow/block/challenge ratios)
   
3. RULE OPTIMIZATION:
   → Priority conflict identification and performance tuning
   
4. COMPLIANCE AUDITING:
   → Rule documentation and business justification review
   
5. OPERATIONAL MONITORING:
   → Active vs paused rule ratios and configuration health

⚠️ CONFIGURATION INSIGHTS:
• Rule execution follows strict priority order (0-N)
• Complex conditions use operator logic ($and, $or, $eq, $in, $re)
• Action types determine security posture (allow, blockWithChallenge, block)
• Status management enables safe rule testing and rollback

🔧 CONDITION ANALYSIS:
• "socketIps": IP address and CIDR range matching
• "userAgent": Browser/bot identification via regex patterns  
• "path": URL endpoint protection and access control
• "domain": Cross-domain policy enforcement
• "socketIpASN": ISP/hosting provider based filtering

📊 RESPONSE ANALYSIS:
• Complete rule metadata including UUID tracking identifiers
• Priority hierarchy for conflict resolution and performance optimization
• Conditional logic for understanding rule scope and impact
• Action configuration for security effectiveness assessment
• Status monitoring for operational health and policy gaps

🚀 OPTIMAL WORKFLOWS:

1. SECURITY AUDIT:
   - Analyze complete rule inventory for coverage gaps
   - Review rule documentation for compliance requirements
   - Identify unused or redundant rules for optimization

2. POLICY OPTIMIZATION:
   - Examine priority hierarchy for execution efficiency
   - Analyze condition complexity for maintenance burden
   - Review action distribution for balanced security posture

3. COMPLIANCE REPORTING:
   - Document rule business justifications and descriptions
   - Track rule lifecycle and change management
   - Validate security control effectiveness and coverage

4. OPERATIONAL MONITORING:
   - Monitor active vs paused rule ratios
   - Identify configuration drift and policy violations
   - Track rule conflicts and performance impact

Response provides complete custom security rule inventory optimized for policy management, compliance auditing, security posture assessment, and operational monitoring with detailed rule metadata and configuration analysis.`,
            inputSchema: {},
            outputSchema: makeStructuredResponseSchema(CyberfraudCustomRulesOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Custom Rules',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async () => mcpToolHandler(async () => cyberfraudService.getCustomRules()),
    );
}
