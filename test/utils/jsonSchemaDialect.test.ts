import { expect } from 'chai';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types';
import { z } from 'zod';
import { stripToolSchemaDialect } from '../../src/utils/jsonSchemaDialect';

const DRAFT_07 = 'http://json-schema.org/draft-07/schema#';

function createFakeTransport(sent: JSONRPCMessage[]): Transport {
    return {
        start: async () => {},
        close: async () => {},
        send: async (message: JSONRPCMessage) => {
            sent.push(message);
        },
    } as Transport;
}

function collectDialects(value: unknown, found: unknown[] = []): unknown[] {
    if (Array.isArray(value)) {
        value.forEach((entry) => collectDialects(entry, found));
    } else if (value !== null && typeof value === 'object') {
        for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
            if (key === '$schema') found.push(nested);
            collectDialects(nested, found);
        }
    }
    return found;
}

async function waitFor(sent: JSONRPCMessage[], id: number): Promise<any> {
    const deadline = Date.now() + 500;
    while (Date.now() < deadline) {
        const message = sent.find((m) => (m as any).id === id);
        if (message) return message;
        await new Promise((resolve) => setImmediate(resolve));
    }
    throw new Error(`timed out waiting for response to request ${id}`);
}

async function listTools(server: McpServer): Promise<Record<string, any>[]> {
    const sent: JSONRPCMessage[] = [];
    const transport = createFakeTransport(sent);
    await server.connect(stripToolSchemaDialect(transport));

    transport.onmessage!({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } },
    } as JSONRPCMessage);
    await waitFor(sent, 1);
    transport.onmessage!({ jsonrpc: '2.0', method: 'notifications/initialized' } as JSONRPCMessage);

    transport.onmessage!({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} } as JSONRPCMessage);
    const response = await waitFor(sent, 2);
    if (response.error) {
        throw new Error(`tools/list failed: ${JSON.stringify(response.error)}`);
    }
    return response.result.tools;
}

function createServerWithTool(): McpServer {
    const server = new McpServer({ name: 'test', version: '0.0.0' }, { capabilities: { tools: {} } });
    server.registerTool(
        'example',
        {
            description: 'example tool',
            inputSchema: { id: z.string() },
            outputSchema: z.object({ data: z.object({ nested: z.array(z.object({ v: z.string() })) }) }).shape,
        },
        async () => ({ content: [], structuredContent: { data: { nested: [] } } }),
    );
    return server;
}

describe('stripToolSchemaDialect', () => {
    it('removes the dialect declaration from tool schemas', async () => {
        const tools = await listTools(createServerWithTool());
        expect(tools).to.have.lengthOf(1);
        expect(tools[0].inputSchema).to.not.have.property('$schema');
        expect(tools[0].outputSchema).to.not.have.property('$schema');
    });

    it('leaves no dialect declaration at any nesting depth', async () => {
        const tools = await listTools(createServerWithTool());
        expect(collectDialects(tools)).to.be.empty;
    });

    it('preserves the rest of the schema', async () => {
        const tools = await listTools(createServerWithTool());
        expect(tools[0].name).to.equal('example');
        expect(tools[0].description).to.equal('example tool');
        expect(tools[0].inputSchema.type).to.equal('object');
        expect(tools[0].inputSchema.properties).to.have.property('id');
        expect(tools[0].inputSchema.required).to.deep.equal(['id']);
        expect(tools[0].outputSchema.properties.data.properties.nested.type).to.equal('array');
        expect(tools[0].outputSchema.properties.data.properties.nested.items.properties).to.have.property('v');
    });

    it('keeps a property that is itself named $schema', async () => {
        const server = new McpServer({ name: 'test', version: '0.0.0' }, { capabilities: { tools: {} } });
        server.registerTool(
            'dialect-shaped-input',
            { description: 'tool declaring a $schema field', inputSchema: { $schema: z.string() } },
            async () => ({ content: [] }),
        );

        const tools = await listTools(server);
        expect(tools[0].inputSchema).to.not.have.property('$schema');
        expect(tools[0].inputSchema.properties).to.have.property('$schema');
        expect(tools[0].inputSchema.required).to.deep.equal(['$schema']);
    });

    it('is a no-op for schemas that declare no dialect', async () => {
        const sent: JSONRPCMessage[] = [];
        const transport = createFakeTransport(sent);
        await createServerWithTool().connect(stripToolSchemaDialect(transport));

        const message = {
            jsonrpc: '2.0',
            id: 9,
            result: {
                tools: [
                    { name: 'already-dialect-free', inputSchema: { type: 'object' }, outputSchema: { type: 'object' } },
                    { name: 'no-schemas-at-all' },
                ],
            },
        } as unknown as JSONRPCMessage;
        await transport.send(message);

        expect(sent[0]).to.deep.equal(message);
    });

    it('leaves messages without a tool list untouched', async () => {
        const sent: JSONRPCMessage[] = [];
        const transport = createFakeTransport(sent);
        await createServerWithTool().connect(stripToolSchemaDialect(transport));

        const message = {
            jsonrpc: '2.0',
            id: 7,
            result: { structuredContent: { data: { $schema: DRAFT_07 } } },
        } as unknown as JSONRPCMessage;
        await transport.send(message);

        expect(sent[0]).to.deep.equal(message);
    });
});
