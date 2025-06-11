import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import fetch, { Response } from 'node-fetch';
import { HTTP_TIMEOUT_MS, MCP_VERSION_HEADER } from './constants';
import packageJson from '../../package.json' with { type: 'json' };

export class HttpClient {
    private httpsAgent: HttpsAgent;
    private httpAgent: HttpAgent;

    constructor(
        private apiToken?: string,
        private fetchImpl = fetch,
    ) {
        const agentOptions = {
            timeout: HTTP_TIMEOUT_MS,
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo' as const,
        };

        this.httpsAgent = new HttpsAgent(agentOptions);
        this.httpAgent = new HttpAgent(agentOptions);
    }

    async request(
        url: string,
        options: {
            method?: string;
            headers?: Record<string, string>;
            body?: any;
        } = {},
    ): Promise<Response> {
        const headers: Record<string, string> = {
            ...options.headers,
        };
        if (this.apiToken) {
            headers['Authorization'] = `Bearer ${this.apiToken}`;
        }
        headers[MCP_VERSION_HEADER] = packageJson.version;
        const res = await this.fetchImpl(url, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            agent: url.startsWith('https://') ? this.httpsAgent : this.httpAgent,
        });
        if (!res.ok) throw new Error(`API error: ${res.status}: ${await res.text()}`);
        return res;
    }
}
