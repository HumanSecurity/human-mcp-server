import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CodeDefenderService } from '../services/codeDefenderService';
import { CodeDefenderGetAccountSettingsOutputSchema } from '../types/codeDefender';

export function registerCodeDefenderGetAccountSettings(server: McpServer, codeDefenderService: CodeDefenderService) {
    server.registerTool(
        'human_code_defender_get_account_settings',
        {
            description: `Retrieves Code Defender account settings to help you choose valid application IDs (appId) and domains (tld) for subsequent tools.

🎯 PRIMARY USE:
├── Discover your available applications → copy app_id → use as appId
├── Discover associated host domains → copy domain → use as tld
├── Review sensor status and versions per app
├── Understand alerts routing per app/domain

❌ INPUTS: None (returns full account context)

✅ NEXT STEPS:
1) Use returned app_id(s) and domain(s) with:
   - human_code_defender_get_incidents
   - human_pci_get_script_inventory
   - human_pci_get_header_inventory

🔐 AUTH: Authorization: Bearer <token>
📡 Endpoint: /v1/code-defender/account-settings`,
            inputSchema: {},
            outputSchema: makeStructuredResponseSchema(CodeDefenderGetAccountSettingsOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Code Defender Account Settings',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async () => mcpToolHandler(async () => codeDefenderService.getCodeDefenderAccountSettings()),
    );
}
