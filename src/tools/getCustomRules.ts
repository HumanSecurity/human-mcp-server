import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { mcpToolHandler } from '../utils/mcpToolHandler';
import { CyberfraudCustomRulesOutputSchema } from '../types/cyberfraud';
import { makeStructuredResponseSchema } from '../utils/makeStructuredResponseSchema';
import type { CyberfraudService } from '../services/cyberfraudService';

export function registerCyberfraudGetCustomRules(server: McpServer, cyberfraudService: CyberfraudService) {
    server.registerTool(
        'human_get_custom_rules',
        {
            description: `Return all custom security rules from Cyberfraud, ordered by priority.

Usage
- No input parameters.
- Includes active and paused rules; empty actions means disabled.
- Use priority (0 = highest) to resolve conflicts.

Notes
- Conditions may use logical operators ($and, $or, $eq, $in, $re).
- Action types define enforcement (e.g., allow, blockWithChallenge, block).`,
            inputSchema: {},
            outputSchema: makeStructuredResponseSchema(CyberfraudCustomRulesOutputSchema).shape,
            annotations: {
                title: 'HUMAN Get Custom Rules',
                readOnlyHint: true,
                openWorldHint: true,
            },
        },
        async () => mcpToolHandler(async () => cyberfraudService.getCustomRules()),
    );
}
