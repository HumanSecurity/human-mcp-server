import { z } from 'zod';

export const CyberfraudAccountInfoInputSchema = z.object({
    accountId: z
        .string()
        .min(1, 'accountId is required')
        .describe(
            '🔍 ACCOUNT LOOKUP: Unique account identifier for investigation and analysis. 🎯 REQUIRED: The user must provide a valid account ID. This value should not be guessed or assumed. ✅ RETURNS: Complete security profile if account exists, minimal response if not found. 💡 USE CASES: Incident response, fraud investigation, customer support, compliance auditing. 🚨 CRITICAL: Response structure depends entirely on account existence - use exists field to determine data availability.',
        ),
    daysRange: z
        .number()
        .optional()
        .describe(
            '⏰ ANALYSIS TIMEFRAME: Number of days for historical behavioral analysis. 🎯 RANGE: 1-365+ days (API accepts larger values). ⚠️ IMPACT: MINIMAL - Parameter accepted but does not observably change response structure or content. 💡 CONTEXT: May control backend aggregation logic invisible to API response. 🔧 RECOMMENDATION: Use default (omit parameter) unless specific backend behavior required. ✅ PERFORMANCE: No observable impact on response time regardless of value.',
        ),
});
export type CyberfraudAccountInfoInput = z.infer<typeof CyberfraudAccountInfoInputSchema>;

const CyberfraudActiveIncidentSchema = z
    .object({
        attack_type: z
            .string()
            .optional()
            .describe(
                '🛡️ THREAT CLASSIFICATION: Type of security attack detected. 📊 COMMON VALUES: "ato" (Account Takeover), "scraping", "fraud". 💡 USE FOR: Incident categorization, threat intelligence correlation, response workflow selection. 🎯 CRITICAL: Primary indicator for incident response prioritization.',
            ),
        event_type: z
            .string()
            .optional()
            .describe(
                '🔢 INCIDENT SCOPE: Attack event classification pattern. 📊 VALUES: "single" (isolated incident), "cluster" (coordinated attack). 💡 USE FOR: Campaign detection, resource allocation, response strategy selection. ⚠️ CORRELATION: Cluster events indicate sophisticated attack campaigns.',
            ),
        risk_score: z
            .number()
            .optional()
            .describe(
                '⚡ THREAT INTENSITY: Numeric risk assessment score for incident severity. 📊 RANGE: 0-1 (higher = more severe). 💡 USE FOR: Incident triage, alert prioritization, SLA determination. 🚨 THRESHOLD: Scores of 1 typically require immediate investigation.',
            ),
        is_manually_created: z
            .boolean()
            .optional()
            .describe(
                '👤 CREATION SOURCE: Indicates if incident was manually created by security team vs auto-detected. ✅ TRUE: Manual security analyst creation. ❌ FALSE: Automated system detection. 💡 USE FOR: Audit trails, detection system validation, investigation workflow routing.',
            ),
        incident_creation: z
            .string()
            .optional()
            .describe(
                '⏰ DETECTION TIMESTAMP: ISO 8601 timestamp when incident was first detected/created. 📊 FORMAT: "2025-06-02T20:39:46.212Z". 💡 USE FOR: Timeline analysis, SLA tracking, incident correlation, forensic investigation timing.',
            ),
        additional: z
            .unknown()
            .optional()
            .describe(
                '📋 EXTENDED DATA: Additional incident metadata and context information. 💡 USE FOR: Deep forensic analysis, custom integrations, comprehensive incident documentation. ⚠️ STRUCTURE: Variable format depending on incident type.',
            ),
    })
    .passthrough()
    .describe(
        '🚨 ACTIVE SECURITY INCIDENT: Current threat event requiring attention. Contains complete incident metadata including classification, timing, and risk assessment for immediate response coordination.',
    );

const CyberfraudAggregativeDataSchema = z
    .object({
        trigger_categories: z
            .array(z.string())
            .optional()
            .describe(
                '🎯 BEHAVIORAL INDICATORS: Categories of security triggers detected for this account. 📊 COMMON VALUES: ["network", "device", "behavioral", "transaction"]. 💡 USE FOR: Pattern analysis, root cause investigation, security control effectiveness assessment. 🔍 INTERPRETATION: Multiple categories indicate sophisticated attack patterns.',
            ),
        sensitive_transactions: z
            .array(z.string())
            .optional()
            .describe(
                '💳 HIGH-RISK OPERATIONS: Sensitive transaction types attempted by this account. 📊 EXAMPLES: ["payment", "password_change", "profile_update"]. 💡 USE FOR: Fraud investigation, transaction risk assessment, compliance reporting. 🚨 CRITICAL: Presence indicates account involved in sensitive operations during attack.',
            ),
    })
    .passthrough()
    .describe(
        '📈 BEHAVIORAL ANALYSIS: Aggregated security intelligence about account activity patterns, triggers, and high-risk operations for comprehensive threat assessment.',
    );

export const CyberfraudAccountInfoOutputSchema = z
    .object({
        account_id: z
            .string()
            .optional()
            .describe(
                '🏷️ ACCOUNT REFERENCE: The queried account identifier, returned for verification. 💡 USE FOR: Request confirmation, audit logging, multi-account analysis correlation. ✅ ALWAYS PRESENT: Returned in all responses regardless of account existence.',
            ),
        exists: z
            .boolean()
            .optional()
            .describe(
                '✅ ACCOUNT EXISTENCE: Critical boolean indicating if account was found in system. 🚨 RESPONSE GATE: Determines availability of all other fields. TRUE = complete profile available, FALSE = only account_id returned. 💡 USE FOR: Validation workflow routing, error handling, data availability checks.',
            ),
        is_under_attack: z
            .boolean()
            .optional()
            .describe(
                '🚨 THREAT STATUS: Real-time indicator of active security threats against this account. TRUE = active incidents detected, FALSE = no current threats. 💡 USE FOR: Immediate alert generation, incident response triggering, security dashboard status. ⚠️ AVAILABILITY: Only present when exists=true.',
            ),
        first_seen: z
            .string()
            .optional()
            .describe(
                '⏰ ACCOUNT DISCOVERY: ISO 8601 timestamp of first system interaction. 📊 FORMAT: "2024-11-27T12:30:42.074Z". 💡 USE FOR: Account age analysis, lifecycle tracking, suspicious timing detection. 🔍 ANALYSIS: Recent first_seen with attacks may indicate throwaway accounts.',
            ),
        last_seen: z
            .string()
            .optional()
            .describe(
                '🕐 RECENT ACTIVITY: ISO 8601 timestamp of most recent account activity. 📊 FORMAT: "2025-06-02T20:53:41.159Z". 💡 USE FOR: Activity recency assessment, dormant account detection, incident timeline correlation. ⚠️ FRESHNESS: Critical for determining if account actively compromised.',
            ),
        email: z
            .string()
            .optional()
            .describe(
                '📧 ACCOUNT EMAIL: Email address associated with account (when available). 💡 USE FOR: Account verification, communication workflows, cross-account correlation. ⚠️ AVAILABILITY: May be null for privacy/security reasons or unverified accounts.',
            ),
        registration_date: z
            .string()
            .optional()
            .describe(
                '📅 ACCOUNT CREATION: ISO 8601 timestamp of account registration date. 💡 USE FOR: Account maturity analysis, suspicious creation pattern detection, lifecycle management. 🔍 CORRELATION: Compare with first_seen for validation timing analysis.',
            ),
        active_incidents: z
            .array(CyberfraudActiveIncidentSchema)
            .optional()
            .describe(
                '🚨 CURRENT THREATS: Array of ongoing security incidents requiring immediate attention. 📊 STRUCTURE: Each incident contains classification, risk scoring, and timeline data. 💡 USE FOR: Incident response coordination, threat prioritization, security operations. ⚠️ URGENCY: Non-empty array requires immediate security review.',
            ),
        aggregative_data: CyberfraudAggregativeDataSchema.optional().describe(
            '📊 SECURITY INTELLIGENCE: Comprehensive behavioral analysis and risk indicators for strategic security assessment. Contains trigger patterns and sensitive operation history for informed decision-making.',
        ),
    })
    .passthrough()
    .describe(
        '🔍 ACCOUNT SECURITY PROFILE: Complete intelligence package containing account verification, threat status, incident details, and behavioral analysis. Response structure varies significantly based on account existence - use exists field to determine data availability and processing workflow.',
    );
export type CyberfraudAccountInfoResponse = z.infer<typeof CyberfraudAccountInfoOutputSchema>;
