import type { HttpClient } from '../utils/httpClient';
import { clampAttackReportingTimes } from '../utils/dateUtils';
import { HUMAN_API_BASE } from '../utils/constants';
import type {
    CyberfraudOvertimeParams,
    CyberfraudOverviewParams,
    CyberfraudAccountInfoInput,
    CyberfraudOvertimeResponse,
    CyberfraudOverviewResponse,
    CyberfraudAccountInfoResponse,
    CyberfraudCustomRulesResponse,
    TrafficOvertimeInput,
    TrafficOvertimeResponse,
    TrafficMetricsInput,
    TrafficMetricsResponse,
    TrafficTopsInput,
    TrafficTopsResponse,
} from '../types/cyberfraud';

const API_BASE = `${HUMAN_API_BASE}/cyberfraud`;

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

function buildTrafficDashboardUrl(endpoint: string, from: number, to: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('from', from.toString());
    queryParams.append('to', to.toString());
    return `${API_BASE}/traffic${endpoint}?${queryParams.toString()}`;
}

function buildTrafficTimeRange(startTime: string, endTime: string) {
    const clamped = clampAttackReportingTimes(startTime, endTime);
    return {
        from: Math.floor(new Date(clamped.startTime).getTime() / 1000),
        to: Math.floor(new Date(clamped.endTime).getTime() / 1000),
    };
}

function buildTrafficDashboardBody(params: {
    trafficSource: string[];
    filters?: Record<string, unknown>;
    searchQuery?: Record<string, unknown>[];
    seriesFields?: string[];
    limit?: number;
    includeNulls?: boolean;
}) {
    const body: Record<string, unknown> = {
        trafficSource: params.trafficSource,
    };

    if (params.filters) body.filters = params.filters;
    if (params.searchQuery) body.searchQuery = params.searchQuery;
    if (params.seriesFields) body.seriesFields = params.seriesFields;
    if (params.limit !== undefined) body.limit = params.limit;
    if (params.includeNulls !== undefined) body.includeNulls = params.includeNulls;

    return body;
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

    async getTrafficOvertime(params: TrafficOvertimeInput): Promise<TrafficOvertimeResponse> {
        const { startTime, endTime, trafficSource, filters, searchQuery, seriesFields } = params;
        const { from, to } = buildTrafficTimeRange(startTime, endTime);
        const url = buildTrafficDashboardUrl('/overtime', from, to);
        const body = buildTrafficDashboardBody({ trafficSource, filters, searchQuery, seriesFields });
        const res = await this.http.request(url, { method: 'POST', body });
        return (await res.json()) as TrafficOvertimeResponse;
    }

    async getTrafficMetrics(params: TrafficMetricsInput): Promise<TrafficMetricsResponse> {
        const { startTime, endTime, trafficSource, filters, searchQuery } = params;
        const { from, to } = buildTrafficTimeRange(startTime, endTime);
        const url = buildTrafficDashboardUrl('/metrics', from, to);
        const body = buildTrafficDashboardBody({ trafficSource, filters, searchQuery });
        const res = await this.http.request(url, { method: 'POST', body });
        return (await res.json()) as TrafficMetricsResponse;
    }

    async getTrafficTops(params: TrafficTopsInput): Promise<TrafficTopsResponse> {
        const { startTime, endTime, field, trafficSource, filters, searchQuery, limit, includeNulls } = params;
        const { from, to } = buildTrafficTimeRange(startTime, endTime);
        const url = buildTrafficDashboardUrl(`/tops/${encodeURIComponent(field)}`, from, to);
        const body = buildTrafficDashboardBody({
            trafficSource,
            filters,
            searchQuery,
            limit,
            includeNulls,
        });
        const res = await this.http.request(url, { method: 'POST', body });
        return (await res.json()) as TrafficTopsResponse;
    }
}
