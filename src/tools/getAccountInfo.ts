import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
    CyberfraudAccountInfoInputSchema,
    CyberfraudAccountInfoInput,
    CyberfraudAccountInfoOutputSchema,
} from '../types/cyberfraud';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';

export function registerCyberfraudGetAccountInfo(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_account_info',
        {
            description: `Return a security profile for a specific account.

Usage
- Required: accountId.
- Optional: daysRange (historical window; limited effect on response).

Key fields
- exists: whether the account is known.
- is_under_attack: active threat status.
- active_incidents: current incidents with risk details.
- first_seen/last_seen: activity timeline.
- aggregative_data: trigger categories and sensitive operations.`,
            inputSchema: CyberfraudAccountInfoInputSchema.shape,
            outputSchema: makeStructuredResponseSchema(CyberfraudAccountInfoOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Account Info',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async (params: CyberfraudAccountInfoInput) =>
            mcpToolHandler(async () => cyberfraudService.getAccountInfo(params)),
    );
}
