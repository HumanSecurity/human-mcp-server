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
            description: `List observed HTTP security headers with configuration and status.

Usage
- Required: appId[], tld[].
- Optional: from/to (ms epoch), excludedStatuses[], skip/take.

Notes
- Header datasets are smaller than scripts; use modest take values.`,
            inputSchema: CodeDefenderHeaderInventoryInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CodeDefenderGetHeaderInventoryOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Code Defender Header Inventory',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CodeDefenderHeaderInventoryParams) =>
            mcpToolHandler(async () => codeDefenderService.getCodeDefenderHeaderInventory(params)),
    );
}
