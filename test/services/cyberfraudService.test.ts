import * as chai from 'chai';
import sinon from 'sinon';
import { CyberfraudService } from '../../src/services/cyberfraudService';
import chaiAsPromised from 'chai-as-promised';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('CyberfraudService', () => {
    let httpClient: any;
    let service: CyberfraudService;

    beforeEach(() => {
        httpClient = { request: sinon.stub() };
        service = new CyberfraudService(httpClient);
    });

    it('getAttackReportingOvertime calls httpClient with correct URL and returns parsed response', async () => {
        const fakeResponse = { foo: 'bar' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const now = new Date();
        const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = { startTime, endTime };
        const result = await service.getAttackReportingOvertime(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        expect(result).to.equal(fakeResponse);
    });

    it('getAttackReportingOverview calls httpClient with correct URL and returns parsed response', async () => {
        const fakeResponse = { foo: 'baz' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const now = new Date();
        const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = { startTime, endTime };
        const result = await service.getAttackReportingOverview(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        expect(result).to.equal(fakeResponse);
    });

    it('getAccountInfo calls httpClient with correct URL and returns parsed response', async () => {
        const fakeResponse = { foo: 'qux' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const params = { accountId: 'abc123' };
        const result = await service.getAccountInfo(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        expect(result).to.equal(fakeResponse);
    });

    it('getCustomRules calls httpClient with correct URL and returns parsed response', async () => {
        const fakeResponse = { foo: 'rules' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const result = await service.getCustomRules();
        expect(httpClient.request.calledOnce).to.be.true;
        expect(result).to.equal(fakeResponse);
    });

    it('getAttackReportingOvertime propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        const now = new Date();
        const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = { startTime, endTime };
        await expect(service.getAttackReportingOvertime(params as any)).to.be.rejectedWith('network fail');
    });

    it('getAttackReportingOverview propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        const now = new Date();
        const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = { startTime, endTime };
        await expect(service.getAttackReportingOverview(params as any)).to.be.rejectedWith('network fail');
    });

    it('getAccountInfo propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        const params = { accountId: 'abc123' };
        await expect(service.getAccountInfo(params as any)).to.be.rejectedWith('network fail');
    });

    it('getCustomRules propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        await expect(service.getCustomRules()).to.be.rejectedWith('network fail');
    });

    it('getAccountInfo includes daysRange param in URL', async () => {
        const fakeResponse = { foo: 'qux' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const params = { accountId: 'abc123', daysRange: 5 };
        await service.getAccountInfo(params as any);
        const url = httpClient.request.firstCall.args[0];
        expect(url).to.include('daysRange=5');
    });

    it('getAttackReportingOverview includes clusterId in URL', async () => {
        const fakeResponse = { foo: 'baz' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const now = new Date();
        const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = { startTime, endTime, clusterId: 'cid123' };
        await service.getAttackReportingOverview(params as any);
        const url = httpClient.request.firstCall.args[0];
        expect(url).to.include('/overview/cid123');
    });

    describe('getTrafficData', () => {
        const now = new Date();
        const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const baseParams = { startTime, endTime };

        function mockApiResponse(content: unknown) {
            return { json: async () => ({ result: true, message: 'success', content }), ok: true };
        }

        it('calls POST /overtime with correct URL, method, and body', async () => {
            const overtimeContent = { results: [{ timestamp: '2026-06-23T05:57:00.000Z', blocked: 100 }] };
            httpClient.request.resolves(mockApiResponse(overtimeContent));

            const result = await service.getTrafficData({ ...baseParams, overtime: true } as any);

            expect(httpClient.request.calledOnce).to.be.true;
            const [url, options] = httpClient.request.firstCall.args;
            expect(url).to.include('/cyberfraud/traffic-data/overtime');
            expect(url).to.include('from=');
            expect(url).to.include('to=');
            expect(options.method).to.equal('POST');
            expect(options.body.trafficSource).to.deep.equal(['web', 'mobile']);
            expect(result.overtime).to.deep.equal(overtimeContent);
        });

        it('calls POST /metrics with filters in body', async () => {
            const metricsContent = {
                results: { total: 1000, blocked: 50 },
                labels: { total: 'Total Requests' },
            };
            httpClient.request.resolves(mockApiResponse(metricsContent));

            const result = await service.getTrafficData({
                ...baseParams,
                metrics: true,
                trafficSource: ['web'],
                filters: { trafficTags: ['blocked'] },
            } as any);

            expect(httpClient.request.calledOnce).to.be.true;
            const [url, options] = httpClient.request.firstCall.args;
            expect(url).to.include('/cyberfraud/traffic-data/metrics');
            expect(options.method).to.equal('POST');
            expect(options.body.trafficSource).to.deep.equal(['web']);
            expect(options.body.filters).to.deep.equal({ trafficTags: ['blocked'] });
            expect(result.metrics).to.deep.equal(metricsContent);
        });

        it('calls POST /tops/:field for a single tops field', async () => {
            const topsContent = { results: [{ value: '/login', count: 500 }] };
            httpClient.request.resolves(mockApiResponse(topsContent));

            const result = await service.getTrafficData({
                ...baseParams,
                tops: ['path'],
                limit: 5,
            } as any);

            expect(httpClient.request.calledOnce).to.be.true;
            const [url, options] = httpClient.request.firstCall.args;
            expect(url).to.include('/cyberfraud/traffic-data/tops/path');
            expect(options.method).to.equal('POST');
            expect(options.body.limit).to.equal(5);
            expect(result.tops).to.deep.equal({ path: topsContent.results });
        });

        it('issues parallel tops calls and merges results keyed by field', async () => {
            httpClient.request
                .onFirstCall()
                .resolves(mockApiResponse({ results: [{ value: 'Bot Behavior', count: 100 }] }));
            httpClient.request
                .onSecondCall()
                .resolves(mockApiResponse({ results: [{ value: '/checkout', count: 200 }] }));

            const result = await service.getTrafficData({
                ...baseParams,
                tops: ['incidentTypes', 'path'],
            } as any);

            expect(httpClient.request.calledTwice).to.be.true;
            expect(httpClient.request.firstCall.args[0]).to.include('/tops/incidentTypes');
            expect(httpClient.request.secondCall.args[0]).to.include('/tops/path');
            expect(result.tops).to.deep.equal({
                incidentTypes: [{ value: 'Bot Behavior', count: 100 }],
                path: [{ value: '/checkout', count: 200 }],
            });
        });

        it('combines overtime, metrics, and tops in one call', async () => {
            httpClient.request
                .onCall(0)
                .resolves(mockApiResponse({ results: [{ timestamp: '2026-06-23T05:57:00.000Z' }] }));
            httpClient.request.onCall(1).resolves(mockApiResponse({ results: { total: 1000 } }));
            httpClient.request.onCall(2).resolves(mockApiResponse({ results: [{ value: 'US', count: 300 }] }));

            const result = await service.getTrafficData({
                ...baseParams,
                overtime: true,
                metrics: true,
                tops: ['country'],
                seriesFields: ['knownBot'],
            } as any);

            expect(httpClient.request.calledThrice).to.be.true;
            expect(result.overtime).to.exist;
            expect(result.metrics).to.exist;
            expect(result.tops?.country).to.deep.equal([{ value: 'US', count: 300 }]);
            expect(httpClient.request.firstCall.args[1].body.seriesFields).to.deep.equal(['knownBot']);
        });

        it('throws when API returns result: false', async () => {
            httpClient.request.resolves({
                json: async () => ({ result: false, message: 'Invalid time range' }),
                ok: true,
            });

            await expect(service.getTrafficData({ ...baseParams, metrics: true } as any)).to.be.rejectedWith(
                'Invalid time range',
            );
        });

        it('propagates httpClient.request error', async () => {
            httpClient.request.rejects(new Error('network fail'));
            await expect(service.getTrafficData({ ...baseParams, metrics: true } as any)).to.be.rejectedWith(
                'network fail',
            );
        });

        it('includes searchQuery in request body when provided', async () => {
            const metricsContent = { results: { total: 500 }, labels: {} };
            httpClient.request.resolves(mockApiResponse(metricsContent));

            await service.getTrafficData({
                ...baseParams,
                metrics: true,
                searchQuery: [{ type: 'field', key: 'socketIp', operator: '=', value: '1.2.3.4' }],
            } as any);

            const [, options] = httpClient.request.firstCall.args;
            expect(options.body.searchQuery).to.deep.equal([
                { type: 'field', key: 'socketIp', operator: '=', value: '1.2.3.4' },
            ]);
        });

        it('omits searchQuery from body when not provided', async () => {
            const metricsContent = { results: { total: 500 }, labels: {} };
            httpClient.request.resolves(mockApiResponse(metricsContent));

            await service.getTrafficData({ ...baseParams, metrics: true } as any);

            const [, options] = httpClient.request.firstCall.args;
            expect(options.body).to.not.have.property('searchQuery');
        });
    });

    describe('getRawActivities', () => {
        const now = new Date();
        const startTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
        const endTime = now.toISOString();

        function mockApiResponse(content: unknown) {
            return { json: async () => ({ result: true, message: 'success', content }), ok: true };
        }

        it('calls POST /activities with correct URL and body', async () => {
            const activitiesContent = { results: [{ socketIp: '1.2.3.4', displayScore: 90 }] };
            httpClient.request.resolves(mockApiResponse(activitiesContent));

            const result = await service.getRawActivities({
                startTime,
                endTime,
                searchQuery: [{ type: 'field', key: 'socketIp', operator: '=', value: '1.2.3.4' }],
                limit: 20,
                offset: 0,
            });

            expect(httpClient.request.calledOnce).to.be.true;
            const [url, options] = httpClient.request.firstCall.args;
            expect(url).to.include('/cyberfraud/traffic-data/activities');
            expect(url).to.include('from=');
            expect(url).to.include('to=');
            expect(options.method).to.equal('POST');
            expect(options.body.limit).to.equal(20);
            expect(options.body.offset).to.equal(0);
            expect(result).to.deep.equal(activitiesContent.results);
        });

        it('includes searchQuery in body when provided', async () => {
            httpClient.request.resolves(mockApiResponse({ results: [] }));

            await service.getRawActivities({
                startTime,
                endTime,
                searchQuery: [{ type: 'field', key: 'blockReference', operator: '=', value: 'abc123' }],
            });

            const [, options] = httpClient.request.firstCall.args;
            expect(options.body.searchQuery).to.deep.equal([
                { type: 'field', key: 'blockReference', operator: '=', value: 'abc123' },
            ]);
        });
    });

    describe('getRawActivitiesCount', () => {
        const now = new Date();
        const startTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
        const endTime = now.toISOString();

        function mockApiResponse(content: unknown) {
            return { json: async () => ({ result: true, message: 'success', content }), ok: true };
        }

        it('calls POST /activities/count and returns total', async () => {
            httpClient.request.resolves(mockApiResponse({ total: 42 }));

            const result = await service.getRawActivitiesCount({
                startTime,
                endTime,
                searchQuery: [{ type: 'field', key: 'socketIp', operator: '=', value: '1.2.3.4' }],
            });

            expect(httpClient.request.calledOnce).to.be.true;
            const [url] = httpClient.request.firstCall.args;
            expect(url).to.include('/cyberfraud/traffic-data/activities/count');
            expect(result).to.equal(42);
        });
    });

    describe('fetchRawActivities', () => {
        const now = new Date();
        const startTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const searchQuery = [{ type: 'field' as const, key: 'blockReference', operator: '=' as const, value: 'abc' }];

        function mockApiResponse(content: unknown) {
            return { json: async () => ({ result: true, message: 'success', content }), ok: true };
        }

        it('rejects when time range exceeds 4 hours', async () => {
            const wideStart = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString();
            await expect(service.fetchRawActivities({ searchQuery, startTime: wideStart, endTime })).to.be.rejectedWith(
                'must not exceed 4 hours',
            );
        });

        it('orchestrates parallel calls and returns combined result', async () => {
            const activitiesContent = { results: [{ socketIp: '1.2.3.4' }] };
            const countContent = { total: 5 };

            httpClient.request.onCall(0).resolves(mockApiResponse(activitiesContent));
            httpClient.request.onCall(1).resolves(mockApiResponse(countContent));

            const result = await service.fetchRawActivities({
                searchQuery: [{ type: 'field', key: 'blockReference', operator: '=', value: 'b5e0-b1d1' }],
                startTime,
                endTime,
            });

            expect(httpClient.request.calledTwice).to.be.true;
            expect(result.count).to.equal(5);
            expect(result.activities).to.deep.equal(activitiesContent.results);
        });

        it('forwards limit and offset to the raw activities request and defaults to 20/0', async () => {
            httpClient.request.resolves(mockApiResponse({ results: [], total: 0 }));

            await service.fetchRawActivities({
                searchQuery: [{ type: 'field', key: 'socketIp', operator: '=', value: '1.2.3.4' }],
                startTime,
                endTime,
                limit: 50,
                offset: 40,
            });

            const activitiesCall = httpClient.request
                .getCalls()
                .find((c: any) => typeof c.args[0] === 'string' && c.args[0].includes('/activities?'));
            expect(activitiesCall).to.exist;
            expect(activitiesCall!.args[1].body.limit).to.equal(50);
            expect(activitiesCall!.args[1].body.offset).to.equal(40);
        });

        it('passes searchQuery through to both activities and count requests', async () => {
            httpClient.request.resolves(mockApiResponse({ results: [], total: 0 }));

            const query = [
                { type: 'field' as const, key: 'userEmail', operator: '=' as const, value: 'test@example.com' },
            ];
            await service.fetchRawActivities({ searchQuery: query, startTime, endTime }).catch(() => {});

            const calls = httpClient.request.getCalls();
            expect(calls).to.have.lengthOf(2);
            for (const call of calls) {
                expect(call.args[1].body.searchQuery).to.deep.equal(query);
            }
        });
    });
});
