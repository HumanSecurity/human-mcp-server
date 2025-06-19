import { z } from 'zod';

export const CodeDefenderBaseInputSchema = z.object({
    appId: z
        .array(z.string())
        .min(1, 'At least one appId is required.')
        .describe(
            '🆔 APPLICATION TARGETING: Array of application identifiers to monitor. 🎯 REQUIRED: The user must provide at least one valid app ID. This value should not be guessed or assumed. 💡 EXAMPLES: ["PX12345678"] for specific application analysis. 📊 SCOPE: Defines security monitoring boundaries.',
        ),
    tld: z
        .array(z.string())
        .min(1, 'At least one top-level domain is required.')
        .describe(
            '🌐 DOMAIN FILTERING: Array of top-level domains to analyze. 🎯 REQUIRED: The user must specify target domains for security monitoring. This value should not be guessed or assumed. 💡 EXAMPLES: ["example.com", "anotherexample.com"] for multi-domain analysis. 🔍 SCOPE: Controls domain-specific security assessment.',
        ),
    from: z
        .number()
        .optional()
        .describe(
            '⏰ TIME RANGE START: Start timestamp in milliseconds since epoch (Unix timestamp * 1000). 📅 FORMAT: JavaScript Date.getTime() format required. 💡 EXAMPLES: 1749409759000 for specific time windows. 🎯 FILTERING: Scope analysis to recent activity or incident timeframes.',
        ),
    to: z
        .number()
        .optional()
        .describe(
            '🏁 TIME RANGE END: End timestamp in milliseconds since epoch (Unix timestamp * 1000). 📅 FORMAT: JavaScript Date.getTime() format required. 💡 EXAMPLES: 1749496159000 for current time boundaries. 🎯 FILTERING: Define analysis window upper limit.',
        ),
    take: z
        .number()
        .optional()
        .describe(
            '📊 RESULT LIMIT: Maximum number of records to return per request. ⚠️ CONSTRAINT: Recommended maximum 50 for optimal performance. 💡 STRATEGY: Start with 5-10 for detailed analysis, use 20-50 for comprehensive review. 🔄 PAGINATION: Combine with skip for dataset navigation.',
        ),
    skip: z
        .number()
        .optional()
        .describe(
            '⏭️ PAGINATION OFFSET: Number of records to skip for pagination. 🔄 NAVIGATION: Enables systematic review of large datasets. 💡 PATTERN: Increment by take value for sequential pagination. 📊 WORKFLOW: Essential for comprehensive data analysis across multiple pages.',
        ),
});

export const CodeDefenderIncidentsInputSchema = CodeDefenderBaseInputSchema;
export type CodeDefenderIncidentsParams = z.infer<typeof CodeDefenderIncidentsInputSchema>;

export const CodeDefenderScriptInventoryInputSchema = CodeDefenderBaseInputSchema.extend({
    excludedStatuses: z
        .array(z.string())
        .optional()
        .describe(
            '🚫 STATUS EXCLUSION: Array of script statuses to exclude from inventory results. 💡 COMMON VALUES: ["inactive", "blocked", "under_review"] for active scripts only. 🎯 USE CASES: Filter out non-operational scripts for focused analysis. ⚠️ VALIDATION: Empty arrays may cause API errors.',
        ),
});
export type CodeDefenderScriptInventoryParams = z.infer<typeof CodeDefenderScriptInventoryInputSchema>;

export const CodeDefenderHeaderInventoryInputSchema = CodeDefenderBaseInputSchema.extend({
    excludedStatuses: z
        .array(z.string())
        .optional()
        .describe(
            '🚫 STATUS EXCLUSION: Array of header statuses to exclude from inventory results. 💡 COMMON VALUES: ["inactive", "misconfigured", "missing"] for active headers only. 🎯 USE CASES: Focus on properly configured security headers for compliance assessment. ⚠️ VALIDATION: Empty arrays may cause API errors.',
        ),
});
export type CodeDefenderHeaderInventoryParams = z.infer<typeof CodeDefenderHeaderInventoryInputSchema>;

const CodeDefenderIncidentVulnerabilitySchema = z
    .object({
        package: z
            .string()
            .describe(
                '📦 VULNERABLE COMPONENT: Name of the affected software package or library. 🔍 ATTRIBUTION: Essential for vulnerability tracking and patch management. 🎯 SUPPLY CHAIN: Identify third-party dependencies with security issues.',
            )
            .optional(),
        version: z
            .string()
            .describe(
                '🔢 AFFECTED VERSION: Specific version number of the vulnerable package. 🎯 PATCHING: Critical for determining update requirements and compatibility. 📊 LIFECYCLE: Track version-specific vulnerability exposure.',
            )
            .optional(),
        ids: z
            .array(z.string())
            .describe(
                '🆔 CVE IDENTIFIERS: Common Vulnerabilities and Exposures database identifiers. 🔍 RESEARCH: Reference official vulnerability databases and security advisories. 🚨 SEVERITY: CVE IDs link to CVSS scores and exploit availability.',
            )
            .optional(),
        under_review: z
            .boolean()
            .describe(
                '👁️ REVIEW STATUS: Whether vulnerability is currently under security team analysis. 🔄 WORKFLOW: Track investigation progress and remediation planning. 📋 PRIORITIZATION: Active review indicates high-priority security issues.',
            )
            .optional(),
        risk_level: z
            .string()
            .describe(
                '🚨 VULNERABILITY SEVERITY: Risk assessment level (Critical, High, Medium, Low). 🎯 TRIAGE: Critical for security team resource allocation and response urgency. ⚠️ ESCALATION: High-risk vulnerabilities require immediate attention.',
            )
            .optional(),
    })
    .passthrough();

const CodeDefenderIncidentScriptSchema = z
    .object({
        users_affected_percentage: z
            .number()
            .describe(
                '👥 IMPACT SCOPE: Percentage of user base affected by this script incident. 🎯 SCALE: Higher percentages indicate widespread impact requiring urgent response. 📊 BUSINESS IMPACT: Quantify user experience and security exposure.',
            )
            .optional(),
        ack: z
            .boolean()
            .describe(
                '✅ ACKNOWLEDGMENT STATUS: Whether security team has acknowledged and reviewed this script incident. 🔄 WORKFLOW: Track incident response progress and team awareness. 📋 OPERATIONS: Essential for incident management accountability.',
            )
            .optional(),
        key: z
            .string()
            .describe(
                '🔑 SCRIPT IDENTIFIER: Unique cryptographic hash identifying the specific script involved. 🎯 CORRELATION: Link script across different incidents and time periods. 🔍 TRACKING: Essential for script lifecycle and security analysis.',
            )
            .optional(),
        id: z
            .string()
            .describe(
                '🆔 SCRIPT LOCATION: URL or identifier specifying the script resource location. 🌐 SOURCE: Identify hosting domain and third-party dependencies. 🔗 ATTRIBUTION: Map script to vendor or internal systems.',
            )
            .optional(),
        app_id: z
            .string()
            .describe(
                '🏢 APPLICATION CONTEXT: Application identifier where script incident occurred. 📊 SEGMENTATION: Group incidents by application for risk assessment. 🎯 SCOPE: Define security boundaries and responsibility.',
            )
            .optional(),
        host_domain: z
            .string()
            .describe(
                '🌐 HOSTING DOMAIN: Domain serving the script involved in the incident. 🔍 VENDOR ANALYSIS: Distinguish internal vs third-party script sources. 🎯 SUPPLY CHAIN: Critical for vendor risk assessment and attribution.',
            )
            .optional(),
        type: z
            .string()
            .describe(
                '📝 SCRIPT TYPE: Classification of script functionality (third_party, analytics, payment). 🎯 RISK PROFILING: Different types carry different security implications. 💡 POLICY: Apply type-specific security controls and monitoring.',
            )
            .optional(),
        vendor: z
            .string()
            .describe(
                '🏢 SCRIPT VENDOR: Organization or company providing the script resource. 📊 REPUTATION: Vendor reputation affects incident severity assessment. 🔍 SUPPLY CHAIN: Critical for third-party risk management and response coordination.',
            )
            .optional(),
        first_seen: z
            .string()
            .describe(
                '⏰ DISCOVERY TIMESTAMP: ISO 8601 timestamp when script was first detected in environment. 📅 BASELINE: Establish script introduction and deployment timeline. 🚨 NEW RISKS: Recent introduction may indicate unauthorized changes.',
            )
            .optional(),
        last_seen: z
            .string()
            .describe(
                '🕐 LATEST ACTIVITY: ISO 8601 timestamp of most recent script observation. ✅ ACTIVE STATUS: Recent activity confirms script is still present and active. 📈 PERSISTENCE: Monitor for ongoing or evolving threats.',
            )
            .optional(),
        risk: z
            .object({
                level: z
                    .string()
                    .describe(
                        '🚨 RISK SEVERITY: Assessment level (Critical, High, Medium, Low) for the script. 🎯 PRIORITIZATION: Critical for incident response triage and resource allocation. ⚠️ ESCALATION: High-risk scripts require immediate security attention.',
                    )
                    .optional(),
                reason: z
                    .string()
                    .describe(
                        '📋 RISK JUSTIFICATION: Detailed explanation of why the risk level was assigned. 🔍 ANALYSIS: Technical reasoning for risk assessment including specific threats. 💡 CONTEXT: Essential for understanding security implications and response planning.',
                    )
                    .optional(),
            })
            .passthrough()
            .describe(
                '🚨 COMPREHENSIVE RISK ANALYSIS: Complete risk assessment including severity level and detailed justification. 🎯 DECISION SUPPORT: Critical for security team prioritization and response planning. 📊 METRICS: Quantifiable risk data for reporting and trend analysis.',
            )
            .optional(),
        page_types: z
            .array(z.string())
            .describe(
                '📄 AFFECTED PAGES: Types of pages where the script incident was observed (checkout, login, products_and_search). 🚨 CRITICAL AREAS: Payment and authentication pages indicate high-risk incidents. 💳 COMPLIANCE: Essential for PCI DSS and regulatory impact assessment.',
            )
            .optional(),
    })
    .passthrough();

const CodeDefenderIncidentActionArgsSchema = z
    .object({
        'Storage Key': z
            .string()
            .optional()
            .describe(
                '🗄️ STORAGE IDENTIFIER: Browser storage key used in the malicious action. 🔍 DATA ACCESS: Indicates potential data exfiltration or manipulation attempts. 🚨 PRIVACY: Storage access may involve sensitive user information.',
            ),
        'Element ID': z
            .string()
            .optional()
            .describe(
                '🆔 DOM ELEMENT ID: Specific HTML element identifier targeted by the attack. 🎯 TARGETING: Reveals attacker focus on specific page components. 🔍 FORENSICS: Essential for understanding attack methodology and impact.',
            ),
        'Element Name': z
            .string()
            .optional()
            .describe(
                '📝 ELEMENT NAME: HTML element name attribute involved in the malicious action. 🎯 FORM TARGETING: Often indicates attacks on form fields and user inputs. 💳 SENSITIVE DATA: Name attributes may reveal payment or authentication targets.',
            ),
        'Element tags': z
            .string()
            .optional()
            .describe(
                '🏷️ HTML TAGS: HTML tag types manipulated during the attack (SCRIPT, IFRAME, FORM). 🔍 TECHNIQUE: Different tags indicate different attack methodologies. 🚨 IMPACT: Script tags indicate code injection, iframes suggest content manipulation.',
            ),
        'Target URL Host': z
            .string()
            .optional()
            .describe(
                '🌐 DESTINATION DOMAIN: External domain targeted by the malicious action. 🔗 DATA FLOW: Indicates where data may be exfiltrated or resources loaded from. 🚨 ATTRIBUTION: External domains help identify attack infrastructure.',
            ),
        'Inserted Element Tag': z
            .string()
            .optional()
            .describe(
                '➕ INJECTED CONTENT: HTML tag type inserted into the DOM by the attack. 🚨 CODE INJECTION: Script tags indicate malicious code injection. 🔍 TECHNIQUE: Reveals specific attack methodology and payload delivery.',
            ),
        'Removed Element Tag': z
            .string()
            .optional()
            .describe(
                '➖ DELETED CONTENT: HTML tag type removed from the DOM during the attack. 🎯 EVASION: Removal may indicate attempts to hide attack traces. 🔍 IMPACT: Deleted security elements may disable protection mechanisms.',
            ),
        'Element Tag': z
            .string()
            .optional()
            .describe(
                '🏷️ AFFECTED ELEMENT: HTML tag type involved in the DOM manipulation action. 🎯 TARGETING: Specific elements targeted reveal attack intent and methodology. 🔍 ANALYSIS: Essential for understanding attack scope and technical approach.',
            ),
    })
    .passthrough();

const CodeDefenderIncidentActionSchema = z
    .object({
        type: z
            .string()
            .describe(
                '⚡ ACTION CATEGORY: Primary classification of malicious activity (DOM, Network, Storage). 🎯 TECHNIQUE: Indicates attack vector and methodology used. 🔍 ANALYSIS: Group actions by type to understand attack patterns and progression.',
            )
            .optional(),
        subtype: z
            .string()
            .describe(
                '🔧 SPECIFIC TECHNIQUE: Detailed sub-classification of the malicious action (Script load, Link change, Data access). 🎯 GRANULAR ANALYSIS: Precise attack technique for forensic investigation. 💡 COUNTERMEASURES: Specific techniques guide targeted security controls.',
            )
            .optional(),
        last_seen: z
            .string()
            .describe(
                '🕐 LATEST OCCURRENCE: ISO 8601 timestamp of most recent action observation. ⚠️ ACTIVE THREAT: Recent timestamps indicate ongoing attack activity. 📈 PERSISTENCE: Monitor action frequency and evolution over time.',
            )
            .optional(),
        action_args: CodeDefenderIncidentActionArgsSchema.describe(
            '📋 ACTION DETAILS: Specific parameters and targets of the malicious action. 🔍 FORENSICS: Critical technical details for attack reconstruction and impact assessment. 🎯 TARGETING: Reveals specific elements, domains, and data targeted by attackers.',
        ).optional(),
    })
    .passthrough();

const CodeDefenderIncidentAdditionalDataSchema = z
    .object({
        vulnerabilities: z
            .array(CodeDefenderIncidentVulnerabilitySchema)
            .describe(
                '🚨 VULNERABILITY CATALOG: Comprehensive list of security vulnerabilities associated with the incident. 🔍 CVE TRACKING: Links to Common Vulnerabilities and Exposures database for detailed research. 🎯 PATCHING: Critical for remediation planning and vulnerability management workflows.',
            )
            .optional(),
    })
    .passthrough();

const CodeDefenderIncidentPageTypesPerSchema = z
    .object({
        checkout: z
            .number()
            .describe(
                '💳 PAYMENT PAGE IMPACT: Percentage of incident occurrence on checkout/payment pages. 🚨 CRITICAL RISK: High percentages indicate targeted attacks on financial transactions. 📊 PCI COMPLIANCE: Essential metric for payment card industry security assessment.',
            )
            .optional(),
        login: z
            .number()
            .describe(
                '🔐 AUTHENTICATION IMPACT: Percentage of incident occurrence on login/authentication pages. 🎯 CREDENTIAL RISK: High percentages suggest account takeover attempts. 🚨 PRIORITY: Authentication attacks require immediate security response.',
            )
            .optional(),
        products_and_search: z
            .number()
            .describe(
                '🛍️ BROWSING IMPACT: Percentage of incident occurrence on product and search pages. 📊 SCOPE: Indicates breadth of attack across general site functionality. 💡 PATTERN: May reveal reconnaissance or data harvesting activities.',
            )
            .optional(),
    })
    .passthrough();

const CodeDefenderIncidentDataSchema = z
    .object({
        category: z
            .string()
            .describe(
                '🏷️ INCIDENT CLASSIFICATION: Type of security incident detected (e.g., "Deviation", "Script Modification", "DOM Manipulation"). 🎯 KEY FOR: Threat categorization and response prioritization. 📊 ANALYSIS: Group by category to identify attack patterns.',
            )
            .optional(),
        incident: z
            .string()
            .describe(
                '📋 INCIDENT DESCRIPTION: Human-readable description of the security event. 🔍 CONTAINS: Specific behavior detected (e.g., "New script", "Baseline deviation"). 💡 USE FOR: Incident investigation and documentation.',
            )
            .optional(),
        details: z
            .string()
            .describe(
                '📝 DETAILED EXPLANATION: Technical details about the incident and its implications. 🎯 CRITICAL FOR: Understanding attack methodology and impact assessment. 🚨 FOCUS ON: Risk assessment and remediation planning.',
            )
            .optional(),
        initiator: z
            .string()
            .describe(
                '🔗 ATTACK SOURCE: Script or component that initiated the security incident. 💡 VALUES: Script URLs, "unknown_script", or specific components. 🕵️ INVESTIGATION: Track attack attribution and source analysis.',
            )
            .optional(),
        first_seen: z
            .string()
            .describe(
                '⏰ DETECTION TIMESTAMP: ISO 8601 timestamp when incident was first detected. 📅 TIMELINE: Essential for incident timeline reconstruction. 🎯 USE FOR: Attack progression analysis and forensic investigation.',
            )
            .optional(),
        last_seen: z
            .string()
            .describe(
                '🕐 LATEST ACTIVITY: ISO 8601 timestamp of most recent incident activity. ⚠️ ONGOING THREAT: Recent timestamps indicate active incidents requiring immediate attention. 📈 TRENDING: Monitor for escalation patterns.',
            )
            .optional(),
        host_domain: z
            .string()
            .describe(
                '🌐 TARGET DOMAIN: Domain where the security incident was detected. 🎯 SCOPE: Determine attack target and impact area. 🔍 CROSS-REFERENCE: Correlate with other domain-specific incidents.',
            )
            .optional(),
        app_id: z
            .string()
            .describe(
                '🆔 APPLICATION IDENTIFIER: Unique identifier for the monitored application. 🎯 TARGETING: Essential for application-specific security analysis. 📊 GROUPING: Aggregate incidents by application for risk assessment.',
            )
            .optional(),
        page_types: z
            .array(z.string())
            .describe(
                '📄 AFFECTED PAGES: Types of pages where incidents were detected (checkout, login, products_and_search). 🚨 HIGH RISK: login/checkout incidents require immediate attention. 💳 PCI COMPLIANCE: Critical for payment page security.',
            )
            .optional(),
        page_types_per: CodeDefenderIncidentPageTypesPerSchema.describe(
            '📊 PAGE DISTRIBUTION: Percentage breakdown of incident occurrence across page types. 🎯 TARGETING ANALYSIS: Reveals attacker preferences and high-value targets. 💡 PRIORITIZATION: Higher percentages indicate focused attack campaigns.',
        ).optional(),
        ack_updated_at: z
            .string()
            .describe(
                '✅ ACKNOWLEDGMENT STATUS: Timestamp when incident was last acknowledged by security team. 🔄 WORKFLOW: Track incident response and resolution progress. 📋 COMPLIANCE: Essential for audit trail and incident management.',
            )
            .optional(),
        additional_data: CodeDefenderIncidentAdditionalDataSchema.describe(
            '🔍 EXTENDED METADATA: Additional technical details including vulnerability information. 💡 ENRICHMENT: CVE data, exploit details, and advanced threat intelligence. 🎯 INVESTIGATION: Deep dive analysis for complex incidents.',
        ).optional(),
        script: CodeDefenderIncidentScriptSchema.describe(
            '📜 AFFECTED SCRIPT: Detailed information about scripts involved in the incident. 🔗 ATTRIBUTION: Script metadata, vendor info, and risk assessment. 🎯 SUPPLY CHAIN: Critical for third-party script security analysis.',
        ).optional(),
        actions: z
            .array(CodeDefenderIncidentActionSchema)
            .describe(
                '⚡ ATTACK ACTIONS: Specific malicious activities performed during the incident. 🎯 BEHAVIOR ANALYSIS: DOM manipulation, script loading, network requests. 🕵️ FORENSICS: Detailed action logs for attack reconstruction.',
            )
            .optional(),
        risk_level: z
            .string()
            .describe(
                '🚨 THREAT SEVERITY: Risk level assessment (Low, Medium, High). 🎯 PRIORITIZATION: Critical for incident response triage and resource allocation. ⚠️ ESCALATION: High risk incidents require immediate security team attention.',
            )
            .optional(),
        under_review: z
            .boolean()
            .describe(
                '👁️ REVIEW STATUS: Whether incident is currently under security team review. 🔄 WORKFLOW: Track investigation progress and team assignments. 📋 OPERATIONS: Essential for incident management and resolution tracking.',
            )
            .optional(),
    })
    .passthrough();

const CodeDefenderIncidentPagingSchema = z
    .object({
        previous: z
            .string()
            .describe(
                '⬅️ PREVIOUS PAGE URL: API endpoint for retrieving the previous page of incident results. 🔄 NAVIGATION: Enable backward pagination through large incident datasets. 💡 WORKFLOW: Essential for comprehensive incident review and analysis.',
            )
            .optional(),
        current: z
            .string()
            .describe(
                '📍 CURRENT PAGE URL: API endpoint representing the current page of incident results. 🔗 REFERENCE: Bookmark current position in pagination sequence. 📊 STATE: Track progress through incident dataset review.',
            )
            .optional(),
        next: z
            .string()
            .describe(
                '➡️ NEXT PAGE URL: API endpoint for retrieving the next page of incident results. 🔄 NAVIGATION: Enable forward pagination through large incident datasets. 🎯 EFFICIENCY: Continue incident analysis without manual parameter construction.',
            )
            .optional(),
        count: z
            .number()
            .describe(
                '📊 TOTAL INCIDENTS: Complete count of incidents matching the query criteria. 🎯 SCALE: Understand the full scope of security incidents in the environment. 📈 TRENDS: Track incident volume changes over time for security metrics.',
            )
            .optional(),
    })
    .passthrough();

export const CodeDefenderGetIncidentsOutputSchema = z
    .object({
        paging: CodeDefenderIncidentPagingSchema.describe(
            '🔄 PAGINATION CONTROL: Navigation metadata for managing large incident datasets. 📊 SCALE: Essential for processing hundreds of incidents efficiently. 🎯 WORKFLOW: Enables systematic incident review and analysis.',
        ).optional(),
        data: z
            .array(CodeDefenderIncidentDataSchema)
            .describe(
                '🚨 INCIDENT CATALOG: Array of detailed security incidents with comprehensive metadata. 🔍 FORENSICS: Complete incident details for investigation and response. 🎯 PRIORITIZATION: Risk levels and impact data for security team triage.',
            )
            .optional(),
    })
    .passthrough();

export type CodeDefenderGetIncidentsResponse = z.infer<typeof CodeDefenderGetIncidentsOutputSchema>;

const CodeDefenderScriptInventoryRiskSchema = z
    .record(z.string(), z.string())
    .describe(
        '🚨 COMPREHENSIVE RISK MAPPING: Key-value pairs of risk assessment levels and detailed justification reasons. 🎯 DECISION SUPPORT: Risk levels (High/Medium/Low) paired with technical explanations for security team prioritization. 📊 AUDIT TRAIL: Documented reasoning for risk assessments enables compliance reporting and security review processes.',
    );

const CodeDefenderScriptInventoryDataSchema = z
    .object({
        key: z
            .string()
            .describe(
                '🔑 UNIQUE IDENTIFIER: Cryptographic hash key uniquely identifying the script. 🎯 TRACKING: Essential for script lifecycle management and change detection. 🔍 CORRELATION: Use for cross-referencing with incident data.',
            )
            .optional(),
        script_url: z
            .string()
            .describe(
                '🌐 SCRIPT LOCATION: Complete URL where the JavaScript resource is hosted. 🔍 SOURCE ANALYSIS: Identify third-party domains and CDN usage. ⚠️ SUPPLY CHAIN: Critical for vendor risk assessment.',
            )
            .optional(),
        app_id: z
            .string()
            .describe(
                '🆔 APPLICATION CONTEXT: Identifier linking script to specific monitored application. 📊 SEGMENTATION: Group scripts by application for risk assessment. 🎯 SCOPE: Define security boundaries and responsibility.',
            )
            .optional(),
        host_domain: z
            .string()
            .describe(
                '🏠 HOSTING DOMAIN: Domain serving the JavaScript resource. 🔍 VENDOR IDENTIFICATION: Distinguish first-party vs third-party scripts. 🌐 ATTRIBUTION: Map scripts to their respective vendors.',
            )
            .optional(),
        type: z
            .string()
            .describe(
                '📝 SCRIPT CLASSIFICATION: Functional category (e.g., "third_party", "first_party", "analytics"). 🎯 RISK GROUPING: Different types have different risk profiles. 💡 POLICY: Apply type-specific security policies.',
            )
            .optional(),
        vendor: z
            .string()
            .describe(
                '🏢 VENDOR IDENTIFICATION: Organization or company providing the script (Google, TikTok, Riskified). 📊 SUPPLY CHAIN: Critical for third-party risk management. 🔍 REPUTATION: Vendor reputation affects risk scoring.',
            )
            .optional(),
        first_seen: z
            .string()
            .describe(
                '⏰ DISCOVERY TIMESTAMP: ISO 8601 timestamp when script was first detected. 📅 BASELINE: Establish script introduction timeline. 🚨 NEW THREATS: Recent first_seen indicates new script additions.',
            )
            .optional(),
        last_seen: z
            .string()
            .describe(
                '🕐 LATEST ACTIVITY: ISO 8601 timestamp of most recent script observation. ✅ ACTIVE STATUS: Recent timestamps confirm script is still active. 📈 MONITORING: Track script usage patterns.',
            )
            .optional(),
        risk: CodeDefenderScriptInventoryRiskSchema.describe(
            '🚨 RISK ASSESSMENT: Comprehensive risk analysis including level and detailed reasoning. 🎯 PRIORITIZATION: Critical for security team focus and remediation planning. 💡 DECISION SUPPORT: Risk levels guide policy enforcement.',
        ).optional(),
        status: z
            .string()
            .describe(
                '📊 OPERATIONAL STATUS: Current state of the script (active, inactive, blocked, under_review). 🔄 LIFECYCLE: Track script management and policy enforcement. ⚠️ SECURITY POSTURE: Status changes affect risk exposure.',
            )
            .optional(),
        status_category: z
            .string()
            .describe(
                '🏷️ STATUS GROUPING: Higher-level categorization of script status for reporting. 📈 METRICS: Aggregate status categories for security dashboard. 🎯 OPERATIONS: Simplified view for management reporting.',
            )
            .optional(),
    })
    .passthrough();

const CodeDefenderScriptInventoryPagingSchema = z
    .object({
        previous: z
            .string()
            .describe(
                '⬅️ PREVIOUS PAGE URL: API endpoint for retrieving the previous page of script inventory results. 🔄 NAVIGATION: Navigate backward through large script datasets for comprehensive review. 📋 AUDIT: Essential for complete script inventory assessment.',
            )
            .optional(),
        current: z
            .string()
            .describe(
                '📍 CURRENT PAGE URL: API endpoint representing the current page of script inventory results. 🔗 BOOKMARK: Reference current position in script review process. 📊 PROGRESS: Track advancement through script inventory analysis.',
            )
            .optional(),
        next: z
            .string()
            .describe(
                '➡️ NEXT PAGE URL: API endpoint for retrieving the next page of script inventory results. 🔄 NAVIGATION: Continue forward through script datasets without manual pagination. 🎯 EFFICIENCY: Streamlined script inventory review workflow.',
            )
            .optional(),
        count: z
            .number()
            .describe(
                '📊 TOTAL SCRIPTS: Complete count of scripts matching the inventory query criteria. 🎯 SCOPE: Understand full scale of script deployment across applications. 📈 TRENDS: Monitor script inventory growth and changes over time for governance.',
            )
            .optional(),
    })
    .passthrough();

export const CodeDefenderGetScriptInventoryOutputSchema = z
    .object({
        paging: CodeDefenderScriptInventoryPagingSchema.describe(
            '🔄 PAGINATION CONTROL: Navigation metadata for managing large script inventory datasets. 📊 SCALE: Essential for processing dozens of scripts across applications efficiently. 🎯 GOVERNANCE: Enables systematic script review and compliance assessment.',
        ).optional(),
        data: z
            .array(CodeDefenderScriptInventoryDataSchema)
            .describe(
                '📜 SCRIPT CATALOG: Array of JavaScript resources with comprehensive risk and vendor analysis. 🔍 SUPPLY CHAIN: Complete script metadata for third-party risk management. 🎯 COMPLIANCE: PCI DSS validation and security posture assessment data.',
            )
            .optional(),
    })
    .passthrough();

export type CodeDefenderGetScriptInventoryResponse = z.infer<typeof CodeDefenderGetScriptInventoryOutputSchema>;

const CodeDefenderHeaderInventoryDataSchema = z
    .object({
        app_id: z
            .string()
            .describe(
                '🆔 APPLICATION CONTEXT: Identifier linking header to specific monitored application. 📊 SEGMENTATION: Group headers by application for security assessment. 🎯 SCOPE: Define security policy boundaries.',
            )
            .optional(),
        host_domain: z
            .string()
            .describe(
                '🌐 TARGET DOMAIN: Domain where the security header is implemented. 🔍 COVERAGE: Assess header deployment across domain infrastructure. 🎯 POLICY SCOPE: Domain-specific security requirements.',
            )
            .optional(),
        page: z
            .string()
            .describe(
                '📄 PAGE LOCATION: Specific page or endpoint where header was observed. 💳 PCI FOCUS: Payment pages require enhanced header security. 🔍 GRANULAR ANALYSIS: Page-level header configuration assessment.',
            )
            .optional(),
        page_key: z
            .string()
            .describe(
                '🔑 PAGE IDENTIFIER: Unique key identifying the specific page or URL pattern. 🎯 TRACKING: Essential for page-specific header management. 📊 AGGREGATION: Group similar pages for policy analysis.',
            )
            .optional(),
        name: z
            .string()
            .describe(
                '🏷️ HEADER TYPE: Security header name (Content-Security-Policy, X-Frame-Options, HSTS). 🚨 PROTECTION: Each header provides specific security controls. 📋 COMPLIANCE: Map to PCI DSS and OWASP requirements.',
            )
            .optional(),
        unreviewed_values: z
            .array(z.string())
            .describe(
                '⚠️ PENDING REVIEW: Header values that require security team review and approval. 🔄 WORKFLOW: Track configuration changes awaiting validation. 🎯 RISK MANAGEMENT: Unreviewed changes may introduce vulnerabilities.',
            )
            .optional(),
        first_seen: z
            .string()
            .describe(
                '⏰ DETECTION TIMESTAMP: ISO 8601 timestamp when header configuration was first observed. 📅 BASELINE: Establish header deployment timeline. 🚨 NEW POLICIES: Recent first_seen indicates configuration changes.',
            )
            .optional(),
        last_seen: z
            .string()
            .describe(
                '🕐 LATEST OBSERVATION: ISO 8601 timestamp of most recent header detection. ✅ ACTIVE STATUS: Recent timestamps confirm header is still deployed. 📈 MONITORING: Track header policy persistence.',
            )
            .optional(),
        status: z
            .string()
            .describe(
                '📊 CONFIGURATION STATUS: Current state of the security header (active, inactive, misconfigured, missing). 🔄 POLICY ENFORCEMENT: Track security control implementation. ⚠️ GAPS: Inactive/missing headers indicate security vulnerabilities.',
            )
            .optional(),
        status_category: z
            .string()
            .describe(
                '🏷️ STATUS GROUPING: Higher-level categorization of header status for reporting and analysis. 📈 METRICS: Aggregate status categories for security dashboard and compliance tracking. 🎯 OPERATIONS: Simplified view for management oversight.',
            )
            .optional(),
    })
    .passthrough();

const CodeDefenderHeaderInventoryPagingSchema = z
    .object({
        previous: z
            .string()
            .describe(
                '⬅️ PREVIOUS PAGE URL: API endpoint for retrieving the previous page of header inventory results. 🔄 NAVIGATION: Navigate backward through header configuration datasets for comprehensive security review. 📋 COMPLIANCE: Essential for complete security header audit.',
            )
            .optional(),
        current: z
            .string()
            .describe(
                '📍 CURRENT PAGE URL: API endpoint representing the current page of header inventory results. 🔗 BOOKMARK: Reference current position in security header review process. 📊 PROGRESS: Track advancement through header configuration analysis.',
            )
            .optional(),
        next: z
            .string()
            .describe(
                '➡️ NEXT PAGE URL: API endpoint for retrieving the next page of header inventory results. 🔄 NAVIGATION: Continue forward through header datasets without manual pagination. 🎯 EFFICIENCY: Streamlined security header assessment workflow.',
            )
            .optional(),
        count: z
            .number()
            .describe(
                '📊 TOTAL HEADERS: Complete count of security headers matching the inventory query criteria. 🎯 COVERAGE: Understand full scope of security header deployment. 📈 POSTURE: Monitor header configuration changes over time for security compliance.',
            )
            .optional(),
    })
    .passthrough();

export const CodeDefenderGetHeaderInventoryOutputSchema = z
    .object({
        paging: CodeDefenderHeaderInventoryPagingSchema.describe(
            '🔄 PAGINATION CONTROL: Navigation metadata for managing security header inventory datasets. 📊 COVERAGE: Essential for comprehensive header configuration review across domains. 🎯 COMPLIANCE: Enables systematic security posture and policy assessment.',
        ).optional(),
        data: z
            .array(CodeDefenderHeaderInventoryDataSchema)
            .describe(
                '🛡️ HEADER CATALOG: Array of HTTP security headers with comprehensive configuration and compliance analysis. 🔍 POSTURE: Complete header metadata for security policy assessment. 🎯 COMPLIANCE: PCI DSS and OWASP validation with configuration status tracking.',
            )
            .optional(),
    })
    .passthrough();

export type CodeDefenderGetHeaderInventoryResponse = z.infer<typeof CodeDefenderGetHeaderInventoryOutputSchema>;
