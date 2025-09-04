import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CodeDefenderHeaderInventoryInputSchema,
    CodeDefenderHeaderInventoryParams,
    CodeDefenderGetHeaderInventoryOutputSchema,
} from '../types/codeDefender';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CodeDefenderService } from '../services/codeDefenderService';

export function registerCodeDefenderGetHeaderInventory(server: McpServer, codeDefenderService: CodeDefenderService) {
    server.registerTool(
        'human_pci_get_header_inventory',
        {
            description: `Provides comprehensive HTTP security header analysis and monitoring for payment pages and sensitive web applications through HUMAN Security's Code Defender API. This essential security posture and compliance tool enables detailed security header assessment, PCI DSS compliance validation, and web application security optimization.

🎯 QUICK DECISION GUIDE:
├── Need header overview? → Use default parameters (appId + tld only)
├── Need recent changes? → Add time range (from/to timestamps)
├── Need active headers only? → Add "excludedStatuses": ["inactive"]
├── Need security posture? → Focus on missing headers and misconfigurations
├── Need compliance check? → Review PCI DSS validation and policy enforcement
└── Need change tracking? → Use time filtering for header modification analysis

❌ CRITICAL RULES:
• appId and tld are REQUIRED parameters (API enforced)
• Timestamps must be in milliseconds since epoch format
• excludedStatuses array format must be properly validated
• Header inventories typically smaller than script inventories (6-20 headers common)

✅ HIGH-VALUE PATTERNS:

1. COMPLETE SECURITY POSTURE AUDIT:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "take": 20}
   → Full security header inventory with compliance status

2. ACTIVE HEADERS MONITORING:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "excludedStatuses": ["inactive"], "take": 15}
   → Currently enforced security headers for protection assessment

3. CONFIGURATION CHANGE TRACKING:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "from": 1749409759000, "to": 1749496159000}
   → Header modifications and policy updates in timeframe

4. COMPLIANCE VALIDATION:
   {"appId": ["PX12345678"], "tld": ["domain.com"], "take": 10}
   → PCI DSS and OWASP compliance assessment

⚠️ ENVIRONMENT NOTES:
• Header types: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, security directives
• Status tracking: active, inactive, misconfigured, missing
• Policy validation: OWASP recommendations and PCI DSS requirements
• Configuration analysis: effectiveness assessment and vulnerability identification

🔧 PARAMETER BEHAVIOR:
• "appId": Application targeting - must match payment page configuration
• "tld": Domain filtering - supports multi-domain security monitoring
• "from/to": Time scoping - track header changes and policy updates
• "excludedStatuses": Status filtering - focus on active security controls
• "take/skip": Pagination - typically smaller datasets than scripts

📊 RESPONSE RICHNESS:
• Complete header metadata: types, values, configurations, validation status
• PCI DSS compliance assessment with detailed requirement mapping
• Security effectiveness analysis with vulnerability exposure ratings
• Policy validation: OWASP alignment and industry best practice compliance
• Change detection: modification tracking and configuration drift monitoring
• Risk assessment: missing header identification and misconfiguration analysis

🚀 OPTIMAL WORKFLOWS:

1. SECURITY POSTURE ASSESSMENT:
   - Start with complete header inventory for baseline establishment
   - Identify missing critical headers (CSP, HSTS, X-Frame-Options)
   - Analyze header configurations for effectiveness and vulnerabilities
   - Prioritize remediation based on risk levels and compliance requirements

2. PCI DSS COMPLIANCE VALIDATION:
   - Review payment page security headers for PCI DSS requirements
   - Validate header policies against industry standards
   - Document compliance status and exception management
   - Track remediation progress for audit trail

3. SECURITY MONITORING:
   - Use time filtering to monitor header configuration changes
   - Detect unauthorized modifications or policy drift
   - Assess impact of header changes on security posture
   - Cross-reference with incident data for attack correlation

4. OPERATIONAL GOVERNANCE:
   - Regular header reviews for security policy enforcement
   - Configuration management and change approval processes
   - Security team training on header best practices
   - Executive reporting with quantifiable security metrics

Response provides detailed security header intelligence optimized for PCI DSS compliance, security posture assessment, and operational governance with comprehensive policy validation and configuration analysis.`,
            inputSchema: CodeDefenderHeaderInventoryInputSchema.shape as any,
            outputSchema: makeStructuredResponseSchema(CodeDefenderGetHeaderInventoryOutputSchema).shape as any,
            annotations: {
                title: 'HUMAN Get Code Defender Header Inventory',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        (async (params: CodeDefenderHeaderInventoryParams, extra: any) =>
            mcpToolHandler(async () => codeDefenderService.getCodeDefenderHeaderInventory(params))) as any,
    );
}
