import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CodeDefenderIncidentsInputSchema,
    CodeDefenderIncidentsParams,
    CodeDefenderGetIncidentsOutputSchema,
} from '../types/codeDefender';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CodeDefenderService } from '../services/codeDefenderService';

export function registerCodeDefenderGetIncidents(server: McpServer, codeDefenderService: CodeDefenderService) {
    server.registerTool(
        'human_code_defender_get_incidents',
        {
            description: `List Code Defender incidents with category, actions, risk, and timing.

Usage
- Required: appId[], tld[].
- Optional: from/to (ms epoch), skip/take.

Notes
- Keep take ≤ 50 for performance.`,
            inputSchema: CodeDefenderIncidentsInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CodeDefenderGetIncidentsOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Code Defender Incidents',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CodeDefenderIncidentsParams) =>
            mcpToolHandler(async () => codeDefenderService.getCodeDefenderIncidents(params)),
    );
}
