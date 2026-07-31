import process from 'process';
import http from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { StreamableHTTPServerTransportOptions } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerTools } from '../tools';
import { HttpClient } from '../utils/httpClient';
import { CyberfraudService } from '../services/cyberfraudService';
import { CodeDefenderService } from '../services/codeDefenderService';
import { MCP_VERSION } from '../utils/constants';

type Services = {
    cyberfraudService?: CyberfraudService;
    codeDefenderService?: CodeDefenderService;
};

const BODY_SIZE_LIMIT = 1024 * 1024; // 1 MB

async function readBody(req: http.IncomingMessage): Promise<{ body: string; tooLarge: boolean }> {
    const chunks: Buffer[] = [];
    let size = 0;

    for await (const chunk of req) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
        size += buf.length;
        if (size > BODY_SIZE_LIMIT) {
            return { body: '', tooLarge: true };
        }
        chunks.push(buf);
    }

    return { body: Buffer.concat(chunks).toString('utf8'), tooLarge: false };
}

function jsonRpcError(res: http.ServerResponse, statusCode: number, code: number, message: string): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }));
}

function startHttpServer(services: Services): http.Server {
    const port = Number.parseInt(process.env.PORT ?? '8080', 10);
    const host = process.env.MCP_HTTP_HOST ?? '127.0.0.1';
    const allowedHosts = process.env.MCP_HTTP_ALLOWED_HOSTS
        ? process.env.MCP_HTTP_ALLOWED_HOSTS.split(',')
              .map((h) => h.trim())
              .filter(Boolean)
        : ['127.0.0.1'];
    const allowedOrigins = process.env.MCP_HTTP_ALLOWED_ORIGINS
        ? process.env.MCP_HTTP_ALLOWED_ORIGINS.split(',')
              .map((o) => o.trim())
              .filter(Boolean)
        : undefined;

    if (host === '0.0.0.0' && !process.env.MCP_HTTP_ALLOWED_HOSTS) {
        console.error(
            'Warning: MCP_HTTP_HOST=0.0.0.0 but MCP_HTTP_ALLOWED_HOSTS is not set. ' +
                'DNS rebinding protection is limited. Set MCP_HTTP_ALLOWED_HOSTS to the expected Host header value.',
        );
    }

    const httpServer = http.createServer(async (req, res) => {
        const url = req.url ?? '/';
        const method = req.method ?? 'GET';

        if (url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
            return;
        }

        if (url !== '/mcp') {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
            return;
        }

        if (method === 'GET' || method === 'DELETE') {
            jsonRpcError(res, 405, -32000, 'Method not allowed');
            return;
        }

        if (method !== 'POST') {
            jsonRpcError(res, 405, -32000, 'Method not allowed');
            return;
        }

        // Quick pre-check via Content-Length before reading the body
        const contentLength = req.headers['content-length'];
        if (contentLength && Number.parseInt(contentLength, 10) > BODY_SIZE_LIMIT) {
            jsonRpcError(res, 413, -32600, 'Request body too large');
            return;
        }

        let body: string;
        let tooLarge: boolean;
        try {
            ({ body, tooLarge } = await readBody(req));
        } catch {
            jsonRpcError(res, 500, -32603, 'Internal error reading request body');
            return;
        }

        if (tooLarge) {
            jsonRpcError(res, 413, -32600, 'Request body too large');
            return;
        }

        let parsedBody: unknown;
        try {
            parsedBody = JSON.parse(body);
        } catch {
            jsonRpcError(res, 400, -32700, 'Parse error');
            return;
        }

        // Fresh McpServer + transport per request — stateless isolation so concurrent callers never share state
        const freshServer = new McpServer(
            { name: 'HUMAN Security MCP Server', version: MCP_VERSION },
            { capabilities: { tools: {} } },
        );
        registerTools(freshServer, services);

        const transportOptions: StreamableHTTPServerTransportOptions = {
            sessionIdGenerator: undefined,
            enableDnsRebindingProtection: true,
            allowedHosts,
            allowedOrigins,
        };
        const transport = new StreamableHTTPServerTransport(transportOptions);

        try {
            await freshServer.connect(transport);
            await transport.handleRequest(req, res, parsedBody);
        } catch (err) {
            console.error('Error handling MCP request:', err);
            if (!res.headersSent) {
                jsonRpcError(res, 500, -32603, 'Internal error');
            }
        } finally {
            // Defer close until after the response is fully flushed so SSE streams are not truncated.
            // The close frees SDK-allocated Maps/Sets/AjvJsonSchemaValidator (~2 KB/request).
            res.once('finish', () => {
                freshServer.close().catch((err) => console.error('Error closing MCP server instance:', err));
            });
        }
    });

    httpServer.listen(port, host, () => {
        const addr = httpServer.address();
        const actualPort = typeof addr === 'object' && addr ? addr.port : port;
        // HTTP/1.1 Host headers include the port for non-default ports (e.g. "127.0.0.1:8080").
        // Ensure both bare-host and host:port are accepted so fetch/curl requests pass validation.
        const entriesToAdd = allowedHosts
            .filter((h) => !h.includes(':'))
            .map((h) => `${h}:${actualPort}`)
            .filter((h) => !allowedHosts.includes(h));
        allowedHosts.push(...entriesToAdd);
        console.error(`MCP HTTP server listening on ${host}:${actualPort}`);
    });

    const shutdown = () => {
        httpServer.close(() => {
            console.error('MCP HTTP server shut down.');
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    return httpServer;
}

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

    const services: Services = {};

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

    let activeHttpServer: http.Server | undefined;

    return {
        start: () => {
            const mcpTransport = process.env.MCP_TRANSPORT ?? 'stdio';

            if (mcpTransport === 'http') {
                activeHttpServer = startHttpServer(services);
            } else if (mcpTransport === 'stdio') {
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
            } else {
                console.error(`Unknown MCP_TRANSPORT value: "${mcpTransport}". Expected "stdio" or "http".`);
                process.exit(1);
            }
        },

        stop: (): Promise<void> =>
            new Promise((resolve) => {
                if (activeHttpServer) {
                    activeHttpServer.close(() => resolve());
                    activeHttpServer.closeAllConnections();
                    activeHttpServer = undefined;
                } else {
                    resolve();
                }
            }),

        getPort: (): number | undefined => {
            const addr = activeHttpServer?.address();
            return typeof addr === 'object' && addr ? addr.port : undefined;
        },
    };
}
