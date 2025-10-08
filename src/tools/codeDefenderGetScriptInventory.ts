import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CodeDefenderScriptInventoryInputSchema,
    CodeDefenderScriptInventoryParams,
    CodeDefenderGetScriptInventoryOutputSchema,
} from '../types/codeDefender';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CodeDefenderService } from '../services/codeDefenderService';

export function registerCodeDefenderGetScriptInventory(server: McpServer, codeDefenderService: CodeDefenderService) {
    server.registerTool(
        'human_pci_get_script_inventory',
        {
            description: `List JavaScript resources observed by Code Defender, with risk and vendor data.

Usage
- Required: appId[], tld[].
- Optional: from/to (ms epoch), excludedStatuses[], skip/take.

Notes
- Large take values may impact performance (≤50 recommended).`,
            inputSchema: CodeDefenderScriptInventoryInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CodeDefenderGetScriptInventoryOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Code Defender Script Inventory',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CodeDefenderScriptInventoryParams) =>
            mcpToolHandler(async () => codeDefenderService.getCodeDefenderScriptInventory(params)),
    );
}
