import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CyberfraudOverviewInputSchema,
    CyberfraudOverviewParams,
    CyberfraudOverviewOutputSchema,
} from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetAttackReportingOverview(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_attack_reporting_overview',
        {
            description: `List attack clusters over a time range; optionally filter and paginate.

Usage
- Required: startTime, endTime (ISO 8601).
- Optional: threatTypes, trafficTypes, trafficSources, page, pageSize, clusterId.
- clusterId returns a single cluster and ignores pagination.

Notes
- Time must be within the last 2 weeks.
- Do not pass empty arrays.
- Max pageSize is 50.`,
            inputSchema: CyberfraudOverviewInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CyberfraudOverviewOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Attack Reporting Overview',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CyberfraudOverviewParams) =>
            mcpToolHandler(async () => cyberfraudService.getAttackReportingOverview(params)),
    );
}
