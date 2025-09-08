import process from 'process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from '../tools';
import { HttpClient } from '../utils/httpClient';
import { CyberfraudService } from '../services/cyberfraudService';
import { CodeDefenderService } from '../services/codeDefenderService';
import { MCP_VERSION } from '../utils/constants';

export function createServer() {
    const server = new McpServer(
        {
            name: 'HUMAN Security MCP Server',
            version: MCP_VERSION,
        },
        {
            capabilities: {
                tools: {},
            },
        },
    );

    // Conditionally create services based on available tokens
    const cyberfraudToken = process.env.HUMAN_CYBERFRAUD_API_TOKEN;
    const codeDefenderToken = process.env.HUMAN_CODE_DEFENDER_API_TOKEN;

    const services: {
        cyberfraudService?: CyberfraudService;
        codeDefenderService?: CodeDefenderService;
    } = {};

    if (cyberfraudToken) {
        const cyberfraudHttpClient = new HttpClient(cyberfraudToken);
        services.cyberfraudService = new CyberfraudService(cyberfraudHttpClient);
        console.error('Cyberfraud service initialized');
    }

    if (codeDefenderToken) {
        const codeDefenderHttpClient = new HttpClient(codeDefenderToken);
        services.codeDefenderService = new CodeDefenderService(codeDefenderHttpClient);
        console.error('Code Defender service initialized');
    }

    if (!cyberfraudToken && !codeDefenderToken) {
        console.error('Warning: No API tokens found. No services will be available.');
    }

    registerTools(server, services);

    return {
        start: () => {
            const transport = new StdioServerTransport();
            server.connect(transport).then(() => {
                console.error('MCP server started...');
            });

            const shutdown = () => {
                server.close().then(() => {
                    console.error('MCP server shut down.');
                });
            };

            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
        },
    };
}
