import type { HttpClient } from '../utils/httpClient';
import { clampAttackReportingTimes } from '../utils/dateUtils';
import { HUMAN_API_BASE, HUMAN_TRAFFIC_API_BASE } from '../utils/constants';
import type {
    CyberfraudOvertimeParams,
    CyberfraudOverviewParams,
    CyberfraudAccountInfoInput,
    CyberfraudOvertimeResponse,
    CyberfraudOverviewResponse,
    CyberfraudAccountInfoResponse,
    CyberfraudCustomRulesResponse,
    TrafficDataInput,
    TrafficDataResponse,
    RawActivitiesInput,
} from '../types/cyberfraud';

const API_BASE = `${HUMAN_API_BASE}/cyberfraud`;
const TRAFFIC_DATA_BASE = HUMAN_TRAFFIC_API_BASE;

interface ApiEnvelope<T> {
    result: boolean;
    message?: string;
    content: T;
}

function buildAttackReportingUrl(endpoint: string, params: Record<string, any>) {
    const queryParams = new URLSearchParams();
    if (params.startTime) queryParams.append('from', Math.floor(Date.parse(params.startTime) / 1000).toString());
    if (params.endTime) queryParams.append('to', Math.floor(Date.parse(params.endTime) / 1000).toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.trafficTypes) for (const t of params.trafficTypes) queryParams.append('trafficTypes[]', t);
    if (params.threatTypes) for (const t of params.threatTypes) queryParams.append('treatTypes[]', t); // treatTypes is the correct parameter spelling
    if (params.trafficSources) for (const t of params.trafficSources) queryParams.append('trafficSources[]', t);
    return `${API_BASE}/attack-reporting${endpoint}?${queryParams.toString()}`;
}

function buildTrafficDataUrl(endpoint: string, from: number, to: number) {
    const query = new URLSearchParams();
    query.append('from', from.toString());
    query.append('to', to.toString());
    return `${TRAFFIC_DATA_BASE}${endpoint}?${query.toString()}`;
}

function buildBaseBody(params: TrafficDataInput) {
    const body: Record<string, unknown> = {
        trafficSource:
            params.trafficSource && params.trafficSource.length > 0 ? params.trafficSource : ['web', 'mobile'],
    };
    if (params.filters) {
        body.filters = params.filters;
    }
    if (params.searchQuery && params.searchQuery.length > 0) {
        body.searchQuery = params.searchQuery;
    }
    return body;
}

const MAX_INVESTIGATE_RANGE_MS = 4 * 60 * 60 * 1000; // 4 hours

function enforceInvestigateTimeRange(startTime: string, endTime: string): void {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diffMs = end - start;
    if (diffMs > MAX_INVESTIGATE_RANGE_MS) {
        throw new Error(
            `The investigation time range must not exceed 4 hours (raw activity queries are expensive). ` +
                `Provided range: ${Math.round(diffMs / 60000)} minutes. Please narrow the window to at most 240 minutes.`,
        );
    }
}

async function parseApiResponse<T>(res: { json: () => Promise<unknown> }): Promise<T> {
    const json = (await res.json()) as ApiEnvelope<T>;
    if (!json.result) {
        throw new Error(json.message || 'API request failed');
    }
    return json.content;
}

export class CyberfraudService {
    constructor(private http: HttpClient) {}

    async getAttackReportingOvertime(params: CyberfraudOvertimeParams): Promise<CyberfraudOvertimeResponse> {
        const { startTime, endTime, ...rest } = params;
        const clamped = clampAttackReportingTimes(startTime, endTime);
        const url = buildAttackReportingUrl('/overtime', { ...rest, ...clamped });
        const res = await this.http.request(url);
        return (await res.json()) as CyberfraudOvertimeResponse;
    }

    async getAttackReportingOverview(params: CyberfraudOverviewParams): Promise<CyberfraudOverviewResponse> {
        const { clusterId, startTime, endTime, ...rest } = params;
        const clamped = clampAttackReportingTimes(startTime, endTime);
        const endpoint = clusterId ? `/overview/${clusterId}` : '/overview';
        const url = buildAttackReportingUrl(endpoint, { ...rest, ...clamped });
        const res = await this.http.request(url);
        return (await res.json()) as CyberfraudOverviewResponse;
    }

    async getAccountInfo(params: CyberfraudAccountInfoInput): Promise<CyberfraudAccountInfoResponse> {
        let url = `${API_BASE}/account/${encodeURIComponent(params.accountId)}`;
        if (params.daysRange !== undefined) {
            url += `?daysRange=${encodeURIComponent(params.daysRange)}`;
        }
        const res = await this.http.request(url);
        return (await res.json()) as CyberfraudAccountInfoResponse;
    }

    async getCustomRules(): Promise<CyberfraudCustomRulesResponse> {
        const url = `${API_BASE}/custom-rules`;
        const res = await this.http.request(url);
        return (await res.json()) as CyberfraudCustomRulesResponse;
    }

    async getTrafficData(params: TrafficDataInput): Promise<TrafficDataResponse> {
        const { startTime, endTime, overtime, metrics, tops, seriesFields, limit, includeNulls } = params;
        const clamped = clampAttackReportingTimes(startTime, endTime);
        const from = Math.floor(new Date(clamped.startTime).getTime() / 1000);
        const to = Math.floor(new Date(clamped.endTime).getTime() / 1000);

        type RequestTask = { kind: 'overtime' } | { kind: 'metrics' } | { kind: 'tops'; field: string };

        const tasks: RequestTask[] = [];
        if (overtime) tasks.push({ kind: 'overtime' });
        if (metrics) tasks.push({ kind: 'metrics' });
        if (tops) {
            for (const field of tops) {
                tasks.push({ kind: 'tops', field });
            }
        }

        const results = await Promise.all(
            tasks.map(async (task) => {
                if (task.kind === 'overtime') {
                    const body = { ...buildBaseBody(params) };
                    if (seriesFields && seriesFields.length > 0) {
                        body.seriesFields = seriesFields;
                    }
                    const url = buildTrafficDataUrl('/overtime', from, to);
                    const res = await this.http.request(url, { method: 'POST', body });
                    const content = await parseApiResponse<NonNullable<TrafficDataResponse['overtime']>>(res);
                    return { kind: 'overtime' as const, content };
                }

                if (task.kind === 'metrics') {
                    const body = buildBaseBody(params);
                    const url = buildTrafficDataUrl('/metrics', from, to);
                    const res = await this.http.request(url, { method: 'POST', body });
                    const content = await parseApiResponse<NonNullable<TrafficDataResponse['metrics']>>(res);
                    return { kind: 'metrics' as const, content };
                }

                const body: Record<string, unknown> = { ...buildBaseBody(params) };
                if (limit !== undefined) body.limit = limit;
                if (includeNulls !== undefined) body.includeNulls = includeNulls;

                const url = buildTrafficDataUrl(`/tops/${task.field}`, from, to);
                const res = await this.http.request(url, { method: 'POST', body });
                const content = await parseApiResponse<{ results: Array<{ value: string; count: number }> }>(res);
                return { kind: 'tops' as const, field: task.field, content };
            }),
        );

        const response: TrafficDataResponse = {};

        for (const result of results) {
            if (result.kind === 'overtime') {
                response.overtime = result.content;
            } else if (result.kind === 'metrics') {
                response.metrics = result.content;
            } else {
                if (!response.tops) response.tops = {};
                response.tops[result.field] = result.content.results;
            }
        }

        return response;
    }

    async getRawActivities(
        params: Pick<RawActivitiesInput, 'startTime' | 'endTime' | 'trafficSource' | 'filters' | 'searchQuery'> & {
            limit?: number;
            offset?: number;
        },
    ): Promise<Record<string, unknown>[]> {
        const clamped = clampAttackReportingTimes(params.startTime, params.endTime);
        const from = Math.floor(new Date(clamped.startTime).getTime() / 1000);
        const to = Math.floor(new Date(clamped.endTime).getTime() / 1000);
        const url = buildTrafficDataUrl('/activities', from, to);
        const body: Record<string, unknown> = {
            trafficSource:
                params.trafficSource && params.trafficSource.length > 0 ? params.trafficSource : ['web', 'mobile'],
        };
        if (params.filters) body.filters = params.filters;
        body.searchQuery = params.searchQuery;
        if (params.limit !== undefined) body.limit = params.limit;
        if (params.offset !== undefined) body.offset = params.offset;
        const res = await this.http.request(url, { method: 'POST', body });
        const content = await parseApiResponse<{ results: Record<string, unknown>[] }>(res);
        return content.results;
    }

    async getRawActivitiesCount(
        params: Pick<RawActivitiesInput, 'startTime' | 'endTime' | 'trafficSource' | 'filters' | 'searchQuery'>,
    ): Promise<number> {
        const clamped = clampAttackReportingTimes(params.startTime, params.endTime);
        const from = Math.floor(new Date(clamped.startTime).getTime() / 1000);
        const to = Math.floor(new Date(clamped.endTime).getTime() / 1000);
        const url = buildTrafficDataUrl('/activities/count', from, to);
        const body: Record<string, unknown> = {
            trafficSource:
                params.trafficSource && params.trafficSource.length > 0 ? params.trafficSource : ['web', 'mobile'],
        };
        if (params.filters) body.filters = params.filters;
        body.searchQuery = params.searchQuery;
        const res = await this.http.request(url, { method: 'POST', body });
        const content = await parseApiResponse<{ total: number }>(res);
        return content.total;
    }

    async fetchRawActivities(
        params: RawActivitiesInput,
    ): Promise<{ count: number; activities: Record<string, unknown>[] }> {
        const clamped = clampAttackReportingTimes(params.startTime, params.endTime);
        enforceInvestigateTimeRange(clamped.startTime, clamped.endTime);

        const baseParams = {
            startTime: clamped.startTime,
            endTime: clamped.endTime,
            trafficSource: params.trafficSource,
            filters: params.filters,
            searchQuery: params.searchQuery,
        };

        const [activities, count] = await Promise.all([
            this.getRawActivities({ ...baseParams, limit: params.limit ?? 20, offset: params.offset ?? 0 }),
            this.getRawActivitiesCount(baseParams),
        ]);

        return { count, activities };
    }
}
