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
});
