import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CyberfraudOvertimeInputSchema,
    CyberfraudOvertimeParams,
    CyberfraudOvertimeOutputSchema,
} from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetAttackReportingOvertime(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_attack_reporting_overtime',
        {
            description: `Time-series attack metrics over a window; 5‑minute intervals.

Usage
- Required: startTime, endTime (ISO 8601; last 2 weeks).
- Optional: threatTypes, trafficTypes, trafficSources.

Notes
- Shorter windows yield finer granularity.
- Do not pass empty arrays.
- clusterId may be null for some threat types.`,
            inputSchema: CyberfraudOvertimeInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CyberfraudOvertimeOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Attack Reporting Overtime',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CyberfraudOvertimeParams) =>
            mcpToolHandler(async () => cyberfraudService.getAttackReportingOvertime(params)),
    );
}
