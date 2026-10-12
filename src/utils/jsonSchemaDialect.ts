import type { Transport } from '@modelcontextprotocol/sdk/shared/transport';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types';

interface ToolDefinition {
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
}

function withoutDialect(schema: Record<string, unknown>): Record<string, unknown> {
    if (!('$schema' in schema)) {
        return schema;
    }
    const { $schema: _dialect, ...rest } = schema;
    return rest;
}

function stripToolListDialect(message: JSONRPCMessage): JSONRPCMessage {
    const result = (message as { result?: { tools?: ToolDefinition[] } }).result;
    if (!result || !Array.isArray(result.tools)) {
        return message;
    }

    const tools = result.tools.map((tool) => {
        const stripped = { ...tool };
        if (stripped.inputSchema) {
            stripped.inputSchema = withoutDialect(stripped.inputSchema);
        }
        if (stripped.outputSchema) {
            stripped.outputSchema = withoutDialect(stripped.outputSchema);
        }
        return stripped;
    });

    return { ...message, result: { ...result, tools } } as JSONRPCMessage;
}

export function stripToolSchemaDialect<T extends Transport>(transport: T): T {
    const send = transport.send.bind(transport);
    transport.send = (message, options) => send(stripToolListDialect(message), options);
    return transport;
}
