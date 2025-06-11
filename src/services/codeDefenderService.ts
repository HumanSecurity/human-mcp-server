import type {
    CodeDefenderIncidentsParams,
    CodeDefenderScriptInventoryParams,
    CodeDefenderHeaderInventoryParams,
    CodeDefenderGetIncidentsResponse,
    CodeDefenderGetScriptInventoryResponse,
    CodeDefenderGetHeaderInventoryResponse,
} from '../types/codeDefender';
import { HUMAN_API_BASE } from '../utils/constants';
import type { HttpClient } from '../utils/httpClient';

const API_BASE = `${HUMAN_API_BASE}/code-defender`;

function buildQueryUrl(base: string, params: Record<string, string | number | string[] | undefined>) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            value.forEach((v) => query.append(key, v));
        } else if (value !== undefined) {
            query.append(key, value.toString());
        }
    }
    return `${base}?${query.toString()}`;
}

export class CodeDefenderService {
    constructor(private http: HttpClient) {}

    async getCodeDefenderIncidents(params: CodeDefenderIncidentsParams): Promise<CodeDefenderGetIncidentsResponse> {
        const url = buildQueryUrl(`${API_BASE}/defense/incidents`, params as Record<string, any>);
        const res = await this.http.request(url);
        return (await res.json()) as CodeDefenderGetIncidentsResponse;
    }

    async getCodeDefenderScriptInventory(
        params: CodeDefenderScriptInventoryParams,
    ): Promise<CodeDefenderGetScriptInventoryResponse> {
        const url = buildQueryUrl(`${API_BASE}/pci/inventory/scripts`, params as Record<string, any>);
        const res = await this.http.request(url);
        return (await res.json()) as CodeDefenderGetScriptInventoryResponse;
    }

    async getCodeDefenderHeaderInventory(
        params: CodeDefenderHeaderInventoryParams,
    ): Promise<CodeDefenderGetHeaderInventoryResponse> {
        const url = buildQueryUrl(`${API_BASE}/pci/inventory/headers`, params as Record<string, any>);
        const res = await this.http.request(url);
        return (await res.json()) as CodeDefenderGetHeaderInventoryResponse;
    }
}
