import packageJson from '../../package.json' with { type: 'json' };

export const DATE_FORMAT_EXAMPLE_START = '2025-06-23T10:00:00Z';
export const DATE_FORMAT_EXAMPLE_END = '2025-06-23T16:00:00Z';
export const HUMAN_API_HOST = process.env.HUMAN_API_HOST || 'api.humansecurity.com';
export const HUMAN_API_VERSION = process.env.HUMAN_API_VERSION || 'v1';
const isLocalhost = HUMAN_API_HOST.startsWith('localhost') || HUMAN_API_HOST.startsWith('127.0.0.1');
export const HUMAN_API_BASE = `${isLocalhost ? 'http' : 'https'}://${HUMAN_API_HOST}/${HUMAN_API_VERSION}`;

// Override the full traffic-data base URL (e.g. for local pxPortal testing).
// Default: <HUMAN_API_BASE>/cyberfraud/traffic-data (production gateway path)
// Local:   http://localhost:3000/api/v1/botDefender/traffic
export const HUMAN_TRAFFIC_API_BASE = process.env.HUMAN_TRAFFIC_API_BASE ?? `${HUMAN_API_BASE}/cyberfraud/traffic-data`;
export const HTTP_TIMEOUT_MS = process.env.HTTP_TIMEOUT_MS ? parseInt(process.env.HTTP_TIMEOUT_MS, 10) : 30000;
export const MCP_VERSION_HEADER = 'x-px-mcp-version';
export const MCP_VERSION = packageJson.version;
