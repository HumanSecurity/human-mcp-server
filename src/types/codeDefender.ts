import { z } from 'zod';

export const CodeDefenderBaseInputSchema = z.object({
    appId: z
        .array(z.string())
        .min(1, 'At least one appId is required.')
        .describe('Application IDs to query. At least one required.'),
    tld: z
        .array(z.string())
        .min(1, 'At least one top-level domain is required.')
        .describe('Top-level domains to query. At least one required.'),
    from: z.number().optional().describe('Start time (ms since epoch). Optional.'),
    to: z.number().optional().describe('End time (ms since epoch). Optional.'),
    take: z.number().optional().describe('Max records to return. ≤50 recommended.'),
    skip: z.number().optional().describe('Records to skip (pagination).'),
});

export const CodeDefenderIncidentsInputSchema = CodeDefenderBaseInputSchema;
export type CodeDefenderIncidentsParams = z.infer<typeof CodeDefenderIncidentsInputSchema>;

export const CodeDefenderScriptInventoryInputSchema = CodeDefenderBaseInputSchema.extend({
    excludedStatuses: z.array(z.string()).optional().describe('Exclude items with these statuses. Optional.'),
});
export type CodeDefenderScriptInventoryParams = z.infer<typeof CodeDefenderScriptInventoryInputSchema>;

export const CodeDefenderHeaderInventoryInputSchema = CodeDefenderBaseInputSchema.extend({
    excludedStatuses: z.array(z.string()).optional().describe('Exclude items with these statuses. Optional.'),
});
export type CodeDefenderHeaderInventoryParams = z.infer<typeof CodeDefenderHeaderInventoryInputSchema>;

const CodeDefenderIncidentVulnerabilitySchema = z
    .object({
        package: z.string().describe('Package name of vulnerable component.').optional(),
        version: z.string().describe('Affected version.').optional(),
        ids: z.array(z.string()).describe('CVE identifiers.').optional(),
        under_review: z.boolean().describe('Under review flag.').optional(),
        risk_level: z.string().describe('Risk level (Critical/High/Medium/Low).').optional(),
    })
    .passthrough();

const CodeDefenderIncidentScriptSchema = z
    .object({
        users_affected_percentage: z.number().describe('Percent of users affected.').optional(),
        ack: z.boolean().describe('Acknowledged by security team.').optional(),
        key: z.string().describe('Script hash key.').optional(),
        id: z.string().describe('Script URL or identifier.').optional(),
        app_id: z.string().describe('Application ID.').optional(),
        host_domain: z.string().describe('Hosting domain.').optional(),
        type: z.string().describe('Script type (e.g., third_party, analytics, payment).').optional(),
        vendor: z.string().describe('Script vendor.').optional(),
        first_seen: z.string().describe('First seen (ISO 8601).').optional(),
        last_seen: z.string().describe('Last seen (ISO 8601).').optional(),
        risk: z
            .object({
                level: z.string().describe('Risk level (Critical/High/Medium/Low).').optional(),
                reason: z.string().describe('Risk justification.').optional(),
            })
            .passthrough()
            .describe('Risk object with level and reason.')
            .optional(),
        page_types: z.array(z.string()).describe('Page types affected (e.g., checkout, login).').optional(),
    })
    .passthrough();

const CodeDefenderIncidentActionArgsSchema = z
    .object({
        'Storage Key': z.string().optional().describe('Browser storage key.'),
        'Element ID': z.string().optional().describe('DOM element id.'),
        'Element Name': z.string().optional().describe('DOM element name.'),
        'Element tags': z.string().optional().describe('Tag types involved.'),
        'Target URL Host': z.string().optional().describe('Target URL host.'),
        'Inserted Element Tag': z.string().optional().describe('Inserted element tag.'),
        'Removed Element Tag': z.string().optional().describe('Removed element tag.'),
        'Element Tag': z.string().optional().describe('Element tag.'),
    })
    .passthrough();

const CodeDefenderIncidentActionSchema = z
    .object({
        type: z.string().describe('Action category (DOM, Network, Storage).').optional(),
        subtype: z.string().describe('Action subtype (e.g., Script load, Link change).').optional(),
        last_seen: z.string().describe('Last seen (ISO 8601).').optional(),
        action_args: CodeDefenderIncidentActionArgsSchema.describe('Action details and targets.').optional(),
    })
    .passthrough();

const CodeDefenderIncidentAdditionalDataSchema = z
    .object({
        vulnerabilities: z
            .array(CodeDefenderIncidentVulnerabilitySchema)
            .describe('List of related vulnerabilities.')
            .optional(),
    })
    .passthrough();

const CodeDefenderIncidentPageTypesPerSchema = z
    .object({
        checkout: z.number().describe('Percent on checkout pages.').optional(),
        login: z.number().describe('Percent on login pages.').optional(),
        products_and_search: z.number().describe('Percent on product/search pages.').optional(),
    })
    .passthrough();

const CodeDefenderIncidentDataSchema = z
    .object({
        category: z.string().describe('Incident category (e.g., Deviation, Script Modification).').optional(),
        incident: z.string().describe('Incident description.').optional(),
        details: z.string().describe('Incident details.').optional(),
        initiator: z.string().describe('Incident initiator (e.g., script URL).').optional(),
        first_seen: z.string().describe('First seen (ISO 8601).').optional(),
        last_seen: z.string().describe('Last seen (ISO 8601).').optional(),
        host_domain: z.string().describe('Domain where incident was detected.').optional(),
        app_id: z.string().describe('Application ID.').optional(),
        page_types: z.array(z.string()).describe('Page types where incident occurred.').optional(),
        page_types_per: CodeDefenderIncidentPageTypesPerSchema.describe('Percentage by page type.').optional(),
        ack_updated_at: z.string().describe('Ack updated timestamp.').optional(),
        additional_data: CodeDefenderIncidentAdditionalDataSchema.describe('Additional metadata.').optional(),
        script: CodeDefenderIncidentScriptSchema.describe('Script details.').optional(),
        actions: z.array(CodeDefenderIncidentActionSchema).describe('List of actions observed.').optional(),
        risk_level: z.string().describe('Risk level (Low/Medium/High).').optional(),
        under_review: z.boolean().describe('Under review flag.').optional(),
    })
    .passthrough();

const CodeDefenderIncidentPagingSchema = z
    .object({
        previous: z.string().describe('Previous page URL.').optional(),
        current: z.string().describe('Current page URL.').optional(),
        next: z.string().describe('Next page URL.').optional(),
        count: z.number().describe('Total incident count.').optional(),
    })
    .passthrough();

export const CodeDefenderGetIncidentsOutputSchema = z
    .object({
        paging: CodeDefenderIncidentPagingSchema.describe('Pagination metadata.').optional(),
        data: z.array(CodeDefenderIncidentDataSchema).describe('Incident array.').optional(),
    })
    .passthrough();

export type CodeDefenderGetIncidentsResponse = z.infer<typeof CodeDefenderGetIncidentsOutputSchema>;

const CodeDefenderScriptInventoryRiskSchema = z
    .record(z.string(), z.string())
    .describe('Risk mapping (level -> reason).');

const CodeDefenderScriptInventoryDataSchema = z
    .object({
        key: z.string().describe('Script hash key.').optional(),
        script_url: z.string().describe('Script URL.').optional(),
        app_id: z.string().describe('Application ID.').optional(),
        host_domain: z.string().describe('Hosting domain.').optional(),
        type: z.string().describe('Script type (e.g., third_party, first_party, analytics).').optional(),
        vendor: z.string().describe('Script vendor.').optional(),
        first_seen: z.string().describe('First seen (ISO 8601).').optional(),
        last_seen: z.string().describe('Last seen (ISO 8601).').optional(),
        risk: CodeDefenderScriptInventoryRiskSchema.describe('Risk mapping.').optional(),
        status: z.string().describe('Operational status (active, inactive, blocked, under_review).').optional(),
        status_category: z.string().describe('Status category.').optional(),
    })
    .passthrough();

const CodeDefenderScriptInventoryPagingSchema = z
    .object({
        previous: z.string().describe('Previous page URL.').optional(),
        current: z.string().describe('Current page URL.').optional(),
        next: z.string().describe('Next page URL.').optional(),
        count: z.number().describe('Total script count.').optional(),
    })
    .passthrough();

export const CodeDefenderGetScriptInventoryOutputSchema = z
    .object({
        paging: CodeDefenderScriptInventoryPagingSchema.describe('Pagination metadata.').optional(),
        data: z.array(CodeDefenderScriptInventoryDataSchema).describe('Script inventory array.').optional(),
    })
    .passthrough();

export type CodeDefenderGetScriptInventoryResponse = z.infer<typeof CodeDefenderGetScriptInventoryOutputSchema>;

const CodeDefenderHeaderInventoryDataSchema = z
    .object({
        app_id: z.string().describe('Application ID.').optional(),
        host_domain: z.string().describe('Target domain.').optional(),
        page: z.string().describe('Page or endpoint.').optional(),
        page_key: z.string().describe('Page key.').optional(),
        name: z.string().describe('Header name (e.g., CSP, HSTS, X-Frame-Options).').optional(),
        unreviewed_values: z.array(z.string()).describe('Unreviewed values.').optional(),
        first_seen: z.string().describe('First seen (ISO 8601).').optional(),
        last_seen: z.string().describe('Last seen (ISO 8601).').optional(),
        status: z.string().describe('Status (active, inactive, misconfigured, missing).').optional(),
        status_category: z.string().describe('Status category.').optional(),
    })
    .passthrough();

const CodeDefenderHeaderInventoryPagingSchema = z
    .object({
        previous: z.string().describe('Previous page URL.').optional(),
        current: z.string().describe('Current page URL.').optional(),
        next: z.string().describe('Next page URL.').optional(),
        count: z.number().describe('Total header count.').optional(),
    })
    .passthrough();

export const CodeDefenderGetHeaderInventoryOutputSchema = z
    .object({
        paging: CodeDefenderHeaderInventoryPagingSchema.describe('Pagination metadata.').optional(),
        data: z.array(CodeDefenderHeaderInventoryDataSchema).describe('Header inventory array.').optional(),
    })
    .passthrough();

export type CodeDefenderGetHeaderInventoryResponse = z.infer<typeof CodeDefenderGetHeaderInventoryOutputSchema>;
