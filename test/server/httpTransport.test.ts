import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import http from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from '../../src/server';
import { CyberfraudService } from '../../src/services/cyberfraudService';

const { expect } = chai;
chai.use(chaiAsPromised);

const MCP_ACCEPT = 'application/json, text/event-stream';

const MCP_INIT_REQUEST = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '0.0.1' },
    },
};

// The SDK responds with SSE format: lines beginning with "data:" contain the JSON payload.
// This helper normalises both SSE and plain JSON responses.
async function parseMcpResponse(res: Response): Promise<{ status: number; json: unknown }> {
    const text = await res.text();
    let json: unknown;
    const dataLine = text.split('\n').find((line) => line.startsWith('data:'));
    if (dataLine) {
        json = JSON.parse(dataLine.slice('data:'.length).trim());
    } else {
        json = JSON.parse(text);
    }
    return { status: res.status, json };
}

async function postMcp(port: number, body: unknown): Promise<{ status: number; json: unknown }> {
    const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: MCP_ACCEPT },
        body: JSON.stringify(body),
    });
    return parseMcpResponse(res);
}

async function getUrl(url: string): Promise<{ status: number; json: unknown }> {
    const res = await fetch(url);
    const json = await res.json();
    return { status: res.status, json };
}

async function requestMcp(port: number, method: string): Promise<{ status: number; json: unknown }> {
    const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
        method,
        headers: { Accept: MCP_ACCEPT },
    });
    const text = await res.text();
    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        json = text;
    }
    return { status: res.status, json };
}

function waitForPort(server: ReturnType<typeof createServer>): Promise<number> {
    return new Promise((resolve, reject) => {
        const deadline = setTimeout(() => reject(new Error('Server did not start in time')), 2000);
        const poll = setInterval(() => {
            const p = server.getPort();
            if (p !== undefined) {
                clearInterval(poll);
                clearTimeout(deadline);
                resolve(p);
            }
        }, 10);
    });
}

describe('HTTP transport', () => {
    let server: ReturnType<typeof createServer>;
    let port: number;

    before(async () => {
        sinon.stub(console, 'error');
        sinon.stub(process, 'env').value({
            MCP_TRANSPORT: 'http',
            PORT: '0',
            MCP_HTTP_HOST: '127.0.0.1',
            HUMAN_CYBERFRAUD_API_TOKEN: 'test-cf-token',
            HUMAN_CODE_DEFENDER_API_TOKEN: 'test-cd-token',
        });
        server = createServer();
        server.start();
        port = await waitForPort(server);
    });

    after(async () => {
        await server.stop();
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('GET /health returns 200 { status: "ok" }', async () => {
        const { status, json } = await getUrl(`http://127.0.0.1:${port}/health`);
        expect(status).to.equal(200);
        expect(json).to.deep.equal({ status: 'ok' });
    });

    it('POST /mcp with initialize returns a valid MCP response', async () => {
        const { status, json } = await postMcp(port, MCP_INIT_REQUEST);
        expect(status).to.be.oneOf([200, 202]);
        const response = json as Record<string, unknown>;
        expect(response).to.have.property('jsonrpc', '2.0');
        expect(response).to.have.property('id', 1);
        expect(response).to.have.property('result');
        const result = response.result as Record<string, unknown>;
        expect(result).to.have.property('serverInfo');
        const serverInfo = result.serverInfo as Record<string, unknown>;
        expect(serverInfo).to.have.property('name', 'HUMAN Security MCP Server');
    });

    it('POST /mcp tools/call returns a JSON-RPC response (not a crash)', async () => {
        sinon.stub(CyberfraudService.prototype, 'getAccountInfo').resolves({
            applicationName: 'test-app',
        } as never);

        const { status, json } = await postMcp(port, {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: { name: 'human_get_account_info', arguments: {} },
        });
        // Accepts 200/202 (success) or 400 (SDK rejects uninitialized call) — either way, no crash
        expect(status).to.be.oneOf([200, 202, 400]);
        const response = json as Record<string, unknown>;
        expect(response).to.have.property('jsonrpc', '2.0');
    });

    it('GET /mcp returns 405 with JSON-RPC error shape', async () => {
        const { status, json } = await requestMcp(port, 'GET');
        expect(status).to.equal(405);
        const response = json as Record<string, unknown>;
        expect(response).to.have.property('jsonrpc', '2.0');
        expect(response).to.have.property('error');
        const error = response.error as Record<string, unknown>;
        expect(error).to.have.property('code');
        expect(error).to.have.property('message');
        expect(response).to.have.property('id', null);
    });

    it('DELETE /mcp returns 405 with JSON-RPC error shape', async () => {
        const { status, json } = await requestMcp(port, 'DELETE');
        expect(status).to.equal(405);
        const response = json as Record<string, unknown>;
        expect(response).to.have.property('jsonrpc', '2.0');
        expect(response).to.have.property('error');
        expect(response).to.have.property('id', null);
    });

    it('POST /mcp with malformed JSON returns 400 with JSON-RPC error', async () => {
        const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: MCP_ACCEPT },
            body: '{ invalid json',
        });
        expect(res.status).to.equal(400);
        const json = (await res.json()) as Record<string, unknown>;
        expect(json).to.have.property('jsonrpc', '2.0');
        expect(json).to.have.property('error');
        expect(json).to.have.property('id', null);
    });

    it('two concurrent POST /mcp initialize requests return independent responses', async () => {
        const [a, b] = await Promise.all([
            postMcp(port, { ...MCP_INIT_REQUEST, id: 10 }),
            postMcp(port, { ...MCP_INIT_REQUEST, id: 11 }),
        ]);

        const ra = a.json as Record<string, unknown>;
        const rb = b.json as Record<string, unknown>;

        expect(ra).to.have.property('id', 10);
        expect(rb).to.have.property('id', 11);
        expect(ra).to.have.property('result');
        expect(rb).to.have.property('result');
    });

    it('GET /unknown-path returns 404', async () => {
        const res = await fetch(`http://127.0.0.1:${port}/not-a-real-path`);
        expect(res.status).to.equal(404);
    });

    it('POST /mcp with Content-Length exceeding 1 MB returns 413', (done) => {
        // fetch validates Content-Length matches body size, so use http.request directly
        const req = http.request(
            {
                host: '127.0.0.1',
                port,
                path: '/mcp',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: MCP_ACCEPT,
                    'Content-Length': String(2 * 1024 * 1024),
                },
            },
            (res) => {
                expect(res.statusCode).to.equal(413);
                let body = '';
                res.on('data', (chunk: string) => {
                    body += chunk;
                });
                res.on('end', () => {
                    const json = JSON.parse(body) as Record<string, unknown>;
                    expect(json).to.have.property('jsonrpc', '2.0');
                    expect(json).to.have.property('error');
                    done();
                });
            },
        );
        req.on('error', done);
        req.write('{}');
        req.end();
    });

    it('POST /mcp with actual body exceeding 1 MB returns 413', async () => {
        const bigBody = JSON.stringify({ data: 'x'.repeat(2 * 1024 * 1024) });
        const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: MCP_ACCEPT },
            body: bigBody,
        });
        expect(res.status).to.equal(413);
    });

    it('PUT /mcp returns 405 with JSON-RPC error shape', async () => {
        const { status, json } = await requestMcp(port, 'PUT');
        expect(status).to.equal(405);
        const response = json as Record<string, unknown>;
        expect(response).to.have.property('jsonrpc', '2.0');
        expect(response).to.have.property('error');
        expect(response).to.have.property('id', null);
    });

    it('concurrent requests do not bleed state across 5 rounds', async function () {
        this.timeout(10000);
        for (let i = 0; i < 5; i++) {
            const [a, b] = await Promise.all([
                postMcp(port, { ...MCP_INIT_REQUEST, id: 100 + i }),
                postMcp(port, { ...MCP_INIT_REQUEST, id: 200 + i }),
            ]);
            const ra = a.json as Record<string, unknown>;
            const rb = b.json as Record<string, unknown>;
            expect(ra).to.have.property('id', 100 + i);
            expect(rb).to.have.property('id', 200 + i);
        }
    });

    it('freshServer.close() is called after each request to prevent memory leak', async () => {
        const closeSpy = sinon.spy(McpServer.prototype, 'close');
        await postMcp(port, MCP_INIT_REQUEST);
        expect(closeSpy.callCount).to.be.at.least(1);
        closeSpy.restore();
    });
});

describe('HTTP transport — invalid MCP_TRANSPORT', () => {
    it('calls process.exit(1) when MCP_TRANSPORT is an unknown value', () => {
        const exitStub = sinon.stub(process, 'exit');
        sinon.stub(console, 'error');
        sinon.stub(process, 'env').value({ MCP_TRANSPORT: 'invalid-transport' });

        const s = createServer();
        s.start();

        expect(exitStub.calledOnceWith(1)).to.be.true;
        sinon.restore();
    });
});

describe('HTTP transport — allowedHosts port-suffix', () => {
    let altServer: ReturnType<typeof createServer>;
    let altPort: number;

    before(async () => {
        sinon.stub(console, 'error');
        sinon.stub(process, 'env').value({
            MCP_TRANSPORT: 'http',
            PORT: '0',
            MCP_HTTP_HOST: '127.0.0.1',
            MCP_HTTP_ALLOWED_HOSTS: 'myapp.internal',
        });
        altServer = createServer();
        altServer.start();
        altPort = await waitForPort(altServer);
    });

    after(async () => {
        await altServer.stop();
        sinon.restore();
    });

    it('accepts POST /mcp when Host header includes port suffix for a user-specified allowed host', (done) => {
        // fetch cannot override the Host header (Fetch spec forbids it); use http.request directly
        const body = JSON.stringify(MCP_INIT_REQUEST);
        const req = http.request(
            {
                host: '127.0.0.1',
                port: altPort,
                path: '/mcp',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: MCP_ACCEPT,
                    Host: `myapp.internal:${altPort}`,
                    'Content-Length': Buffer.byteLength(body),
                },
            },
            (res) => {
                // SDK's DNS-rebinding check returns 403 when Host is not in allowedHosts
                expect(res.statusCode).to.not.equal(403);
                res.resume(); // drain to allow connection reuse
                done();
            },
        );
        req.on('error', done);
        req.write(body);
        req.end();
    });
});

describe('stdio transport', () => {
    afterEach(() => sinon.restore());

    it('connects McpServer with StdioServerTransport when MCP_TRANSPORT is stdio', () => {
        sinon.stub(console, 'error');
        sinon.stub(process, 'env').value({ MCP_TRANSPORT: 'stdio' });
        const connectStub = sinon.stub(McpServer.prototype, 'connect').resolves();
        createServer().start();
        expect(connectStub.called).to.be.true;
        expect(connectStub.firstCall.args[0]).to.be.instanceOf(StdioServerTransport);
    });

    it('connects McpServer with StdioServerTransport when MCP_TRANSPORT is not set', () => {
        sinon.stub(console, 'error');
        sinon.stub(process, 'env').value({});
        const connectStub = sinon.stub(McpServer.prototype, 'connect').resolves();
        createServer().start();
        expect(connectStub.called).to.be.true;
        expect(connectStub.firstCall.args[0]).to.be.instanceOf(StdioServerTransport);
    });

    it('getPort() returns undefined when HTTP server has not been started', async () => {
        sinon.stub(console, 'error');
        sinon.stub(process, 'env').value({ MCP_TRANSPORT: 'stdio' });
        sinon.stub(McpServer.prototype, 'connect').resolves();
        const s = createServer();
        s.start();
        expect(s.getPort()).to.be.undefined;
        await s.stop(); // covers stop() else branch (no active HTTP server)
    });
});
