import { z } from 'zod';

export const CyberfraudCustomRuleSchema = z
    .object({
        ruleId: z
            .string()
            .optional()
            .describe(
                '🔍 UNIQUE IDENTIFIER: UUID-format rule identifier for tracking and management. Essential for rule lifecycle operations, conflict resolution, and audit trails. Use for cross-referencing with logs and configuration changes.',
            ),
        priority: z
            .number()
            .optional()
            .describe(
                '📊 EXECUTION ORDER: Zero-based priority ranking (0 = highest priority). Critical for rule conflict resolution and performance optimization. Lower numbers execute first. Use for understanding rule precedence and policy hierarchy.',
            ),
        name: z
            .string()
            .optional()
            .describe(
                '🏷️ RULE IDENTIFIER: Human-readable rule name for management and documentation. Essential for understanding rule purpose and organizational categorization. Use for policy documentation and team communication.',
            ),
        description: z
            .string()
            .optional()
            .describe(
                '📝 RULE DOCUMENTATION: Detailed explanation of rule purpose, business justification, and context. Critical for compliance auditing, knowledge transfer, and policy maintenance. May be empty for legacy rules.',
            ),
        conditions: z
            .record(z.any())
            .optional()
            .describe(
                '🎯 MATCHING LOGIC: Complex conditional structure defining when rule applies. Contains operator-based logic ($and, $or, $eq, $in, $re) with conditionType specifications (socketIps, userAgent, path, domain, socketIpASN). Critical for understanding rule scope and impact analysis.',
            ),
        actions: z
            .array(z.string())
            .optional()
            .describe(
                '⚡ RULE ACTIONS: Array of enforcement actions when conditions match. Common values: "allow" (whitelist), "blockWithChallenge" (security challenge), "block" (hard block). Empty arrays indicate disabled rules. Essential for understanding security posture and policy effectiveness.',
            ),
        status: z
            .enum(['active', 'paused'])
            .optional()
            .describe(
                '🔄 OPERATIONAL STATE: Current rule execution status. "active" = rule enforcing, "paused" = rule disabled but preserved. Critical for understanding active security policies and troubleshooting protection gaps.',
            ),
    })
    .passthrough()
    .describe(
        '📋 SECURITY RULE: Complete custom security rule definition with matching conditions, enforcement actions, and operational metadata. Core structure for policy management, compliance auditing, and security posture analysis.',
    );

export const CyberfraudCustomRulesOutputSchema = z
    .object({
        result: z
            .boolean()
            .optional()
            .describe(
                '✅ API SUCCESS: Indicates successful rule inventory retrieval. False values require checking message field for authentication or authorization issues.',
            ),
        message: z
            .string()
            .optional()
            .describe(
                '💬 STATUS MESSAGE: Human-readable API response status. Critical for troubleshooting access issues, API errors, and understanding system constraints.',
            ),
        content: z
            .array(CyberfraudCustomRuleSchema)
            .optional()
            .describe(
                '📚 RULES INVENTORY: Complete array of custom security rules ordered by priority (index 0 = highest priority). Contains all configured rules regardless of status. Essential for policy analysis, rule optimization, and compliance documentation.',
            ),
    })
    .passthrough()
    .describe(
        '📦 CUSTOM RULES API RESPONSE: Complete custom security rules inventory with priority-ordered rule array. Check result field first, then analyze content for policy management, security posture assessment, and compliance auditing.',
    );
export type CyberfraudCustomRulesResponse = z.infer<typeof CyberfraudCustomRulesOutputSchema>;
