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
    TrafficDataInput,
    TrafficDataResponse,
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

function buildTrafficDataQuery(params: {
    from: number;
    to: number;
    appId?: string[];
    source?: string[];
    overtime?: string[];
    tops?: string[];
    traffic?: string[];
    pageType?: string[];
    count?: string[];
    withoutTotals?: boolean;
    metricsEnrichment?: any;
}) {
    const query = new URLSearchParams();
    query.append('from', params.from.toString());
    query.append('to', params.to.toString());
    const sources = params.source && params.source.length > 0 ? params.source : ['web', 'mobile'];
    sources.forEach((s) => query.append('source[]', s));
    if (params.appId) params.appId.forEach((id) => query.append('appId[]', id));
    const allOvertime = [
        'legitimate',
        'blocked',
        'potentialBlock',
        'whitelist',
        'blacklist',
        'goodKnownBots',
        'captchaSolved',
    ];
    const overtime = params.overtime && params.overtime.length > 0 ? params.overtime : allOvertime;
    overtime.forEach((o) => query.append('overtime[]', o));
    if (params.tops) params.tops.forEach((t) => query.append('tops[]', t));
    if (params.traffic) params.traffic.forEach((t) => query.append('traffic[]', t));
    if (params.pageType) params.pageType.forEach((p) => query.append('pageType[]', p));
    if (params.count) params.count.forEach((c) => query.append('count[]', c));
    if (params.withoutTotals) query.append('withoutTotals', 'true');
    if (params.metricsEnrichment) query.append('metricsEnrichment', JSON.stringify(params.metricsEnrichment));
    return `${API_BASE}/traffic-data?${query.toString()}`;
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
        const { startTime, endTime, ...rest } = params;
        const clamped = clampAttackReportingTimes(startTime, endTime);
        const from = Math.floor(new Date(clamped.startTime).getTime() / 1000);
        const to = Math.floor(new Date(clamped.endTime).getTime() / 1000);
        const url = buildTrafficDataQuery({ from, to, ...rest });
        const res = await this.http.request(url);
        return (await res.json()) as TrafficDataResponse;
    }
}
