import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { TrafficDataInputSchema, TrafficDataInput, TrafficDataOutputSchema } from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';
import { DATE_FORMAT_EXAMPLE_END, DATE_FORMAT_EXAMPLE_START } from '../utils/constants';

export function registerCyberfraudGetTrafficData(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_traffic_data',
        {
            description: `Traffic analytics summary, trends, and breakdowns.

Usage
- Required: startTime, endTime (ISO 8601).
- Choose one: count (totals) OR overtime (time series).
- tops adds breakdowns (use with count only: incidents or path).
- Optional filters: source, traffic, pageType; metricsEnrichment adds labels only.

Notes
- Do not combine overtime with tops.
- Filters stack and can greatly reduce results.
- Intervals are ~20 minutes for overtime.`,
            inputSchema: TrafficDataInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(TrafficDataOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Traffic Data',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: TrafficDataInput) => mcpToolHandler(async () => cyberfraudService.getTrafficData(params)),
    );
}
