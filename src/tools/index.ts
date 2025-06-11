import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { registerCyberfraudGetAttackReportingOvertime } from './getAttackReportingOvertime';
import { registerCyberfraudGetAttackReportingOverview } from './getAttackReportingOverview';
import { registerCyberfraudGetCustomRules } from './getCustomRules';
import { registerCyberfraudGetAccountInfo } from './getAccountInfo';
import { registerCodeDefenderGetIncidents } from './codeDefenderGetIncidents';
import { registerCodeDefenderGetScriptInventory } from './codeDefenderGetScriptInventory';
import { registerCodeDefenderGetHeaderInventory } from './codeDefenderGetHeaderInventory';
import type { CyberfraudService } from '../services/cyberfraudService';
import type { CodeDefenderService } from '../services/codeDefenderService';
import { registerCyberfraudGetTrafficData } from './getTrafficData';

export function registerTools(
    server: McpServer,
    services: {
        cyberfraudService?: CyberfraudService;
        codeDefenderService?: CodeDefenderService;
    },
) {
    // Register Cyberfraud tools if service is available
    if (services.cyberfraudService) {
        registerCyberfraudGetAttackReportingOvertime(server, services.cyberfraudService);
        registerCyberfraudGetAttackReportingOverview(server, services.cyberfraudService);
        registerCyberfraudGetCustomRules(server, services.cyberfraudService);
        registerCyberfraudGetAccountInfo(server, services.cyberfraudService);
        registerCyberfraudGetTrafficData(server, services.cyberfraudService);
    }

    // Register Code Defender tools if service is available
    if (services.codeDefenderService) {
        registerCodeDefenderGetIncidents(server, services.codeDefenderService);
        registerCodeDefenderGetScriptInventory(server, services.codeDefenderService);
        registerCodeDefenderGetHeaderInventory(server, services.codeDefenderService);
    }
}
