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

    it('getTrafficOvertime calls httpClient with POST and returns parsed response', async () => {
        const fakeResponse = { result: true, content: { results: [] } };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const now = new Date();
        const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = {
            startTime,
            endTime,
            trafficSource: ['web', 'mobile'],
            filters: { trafficTags: ['blocked'] },
            seriesFields: ['knownBot'],
        };
        const result = await service.getTrafficOvertime(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        const [url, options] = httpClient.request.firstCall.args;
        expect(url).to.include('/cyberfraud/traffic/overtime?');
        expect(url).to.include('from=');
        expect(url).to.include('to=');
        expect(options.method).to.equal('POST');
        expect(options.body).to.deep.equal({
            trafficSource: ['web', 'mobile'],
            filters: { trafficTags: ['blocked'] },
            seriesFields: ['knownBot'],
        });
        expect(result).to.equal(fakeResponse);
    });

    it('getTrafficMetrics calls httpClient with POST and returns parsed response', async () => {
        const fakeResponse = { result: true, content: { results: { total: 100 } } };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const now = new Date();
        const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = {
            startTime,
            endTime,
            trafficSource: ['web'],
        };
        const result = await service.getTrafficMetrics(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        const [url, options] = httpClient.request.firstCall.args;
        expect(url).to.include('/cyberfraud/traffic/metrics?');
        expect(options.method).to.equal('POST');
        expect(options.body).to.deep.equal({ trafficSource: ['web'] });
        expect(result).to.equal(fakeResponse);
    });

    it('getTrafficTops calls httpClient with POST and encoded field in URL', async () => {
        const fakeResponse = { result: true, content: { results: [{ value: 'US', count: 10 }] } };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const now = new Date();
        const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = {
            startTime,
            endTime,
            field: 'country',
            trafficSource: ['web', 'mobile'],
            limit: 5,
            includeNulls: true,
        };
        const result = await service.getTrafficTops(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        const [url, options] = httpClient.request.firstCall.args;
        expect(url).to.include('/cyberfraud/traffic/tops/country?');
        expect(options.method).to.equal('POST');
        expect(options.body).to.deep.equal({
            trafficSource: ['web', 'mobile'],
            limit: 5,
            includeNulls: true,
        });
        expect(result).to.equal(fakeResponse);
    });

    it('getTrafficOvertime propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        const now = new Date();
        const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const endTime = now.toISOString();
        const params = { startTime, endTime, trafficSource: ['web'] };
        await expect(service.getTrafficOvertime(params as any)).to.be.rejectedWith('network fail');
    });
});
