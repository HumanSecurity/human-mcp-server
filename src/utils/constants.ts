import packageJson from '../../package.json' with { type: 'json' };

export const HUMAN_API_HOST = process.env.HUMAN_API_HOST || 'api.humansecurity.com';
export const HUMAN_API_VERSION = process.env.HUMAN_API_VERSION || 'v1';
export const HUMAN_API_BASE = `https://${HUMAN_API_HOST}/${HUMAN_API_VERSION}`;
export const HTTP_TIMEOUT_MS = process.env.HTTP_TIMEOUT_MS ? parseInt(process.env.HTTP_TIMEOUT_MS, 10) : 30000;
export const MCP_VERSION_HEADER = 'x-px-mcp-version';
export const MCP_VERSION = packageJson.version;
