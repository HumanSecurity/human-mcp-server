import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CodeDefenderScriptInventoryInputSchema,
    CodeDefenderScriptInventoryParams,
    CodeDefenderGetScriptInventoryOutputSchema,
} from '../types/codeDefender';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CodeDefenderService } from '../services/codeDefenderService';

export function registerCodeDefenderGetScriptInventory(server: McpServer, codeDefenderService: CodeDefenderService) {
    server.registerTool(
        'human_pci_get_script_inventory',
        {
            description: `Provides comprehensive visibility into all JavaScript resources and third-party scripts running on your payment pages and sensitive web applications through HUMAN Security's Code Defender API. This critical compliance and security tool enables complete supply chain risk management and PCI DSS compliance monitoring.

🎯 QUICK DECISION GUIDE:
├── Need script overview? → Use default parameters (appId + tld only)
├── Need recent changes? → Add time range (from/to timestamps)
├── Need active scripts only? → Add "excludedStatuses": ["inactive"]
├── Need risk assessment? → Focus on risk levels and vendor classifications
├── Need compliance audit? → Review PCI DSS status and vendor details
└── Need pagination? → Use "skip" + "take" for large inventories

❌ CRITICAL RULES:
• appId and tld are REQUIRED parameters (API enforced)
• Timestamps must be in milliseconds since epoch format
• excludedStatuses array format must be properly validated
• Large "take" values may impact performance (recommend ≤50)

✅ HIGH-VALUE PATTERNS:

1. COMPLETE INVENTORY AUDIT:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "take": 20}
   → Full script inventory with risk assessments and vendor details

2. ACTIVE SCRIPTS ONLY:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "excludedStatuses": ["inactive"], "take": 15}
   → Currently active scripts for security monitoring

3. RECENT SCRIPT CHANGES:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "from": 1749409759000, "to": 1749496159000}
   → Scripts discovered or modified in specific timeframe

4. PAGINATION WORKFLOW:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "skip": 20, "take": 20}
   → Navigate large script inventories efficiently

⚠️ ENVIRONMENT NOTES:
• Script inventory includes third-party vendors (Google, TikTok, Riskified, Attentive)
• Risk levels: Low, Medium, High with detailed vulnerability assessments
• Vendor classifications: analytics, payment processing, advertising, security
• Status tracking: active, inactive, blocked, under review

🔧 PARAMETER BEHAVIOR:
• "appId": Application targeting - must match payment page configuration
• "tld": Domain filtering - supports multi-domain script monitoring
• "from/to": Time scoping - track script discovery and changes over time
• "excludedStatuses": Status filtering - focus on relevant script states
• "take/skip": Pagination - manage large script inventories efficiently

📊 RESPONSE RICHNESS:
• Complete script metadata: URLs, vendors, types, risk assessments
• PCI DSS compliance status with detailed validation results
• Risk scoring with vulnerability exposure and threat analysis
• Timeline tracking: first/last seen timestamps for change detection
• Vendor intelligence: publisher identification and reputation scoring
• Security classification: script behavior and data access patterns

🚀 OPTIMAL WORKFLOWS:

1. PCI DSS COMPLIANCE AUDIT:
   - Start with complete inventory to establish baseline
   - Focus on payment page scripts and high-risk vendors
   - Review compliance status and exception management
   - Document risk acceptances and remediation plans

2. SUPPLY CHAIN RISK ASSESSMENT:
   - Analyze vendor classifications and risk levels
   - Track third-party script changes and updates
   - Monitor new script introductions and modifications
   - Assess cumulative risk from multiple vendors

3. SECURITY MONITORING:
   - Use time filtering to track recent script changes
   - Monitor risk level distributions for security posture
   - Identify unauthorized or suspicious script additions
   - Cross-reference with incident data for attribution

4. OPERATIONAL GOVERNANCE:
   - Regular inventory reviews for script lifecycle management
   - Vendor onboarding and security assessment processes
   - Exception tracking and risk acceptance documentation
   - Executive reporting with quantifiable security metrics

Response provides detailed script intelligence optimized for PCI DSS compliance, supply chain security management, and operational governance with comprehensive risk assessment and vendor attribution.`,
            inputSchema: CodeDefenderScriptInventoryInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CodeDefenderGetScriptInventoryOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Code Defender Script Inventory',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CodeDefenderScriptInventoryParams) =>
            mcpToolHandler(async () => codeDefenderService.getCodeDefenderScriptInventory(params)),
    );
}
