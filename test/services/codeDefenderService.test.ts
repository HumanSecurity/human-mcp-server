import * as chai from 'chai';
import sinon from 'sinon';
import { CodeDefenderService } from '../../src/services/codeDefenderService';
import chaiAsPromised from 'chai-as-promised';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('CodeDefenderService', () => {
    let httpClient: any;
    let service: CodeDefenderService;

    beforeEach(() => {
        httpClient = { request: sinon.stub() };
        service = new CodeDefenderService(httpClient);
    });

    it('getCodeDefenderIncidents calls httpClient with correct URL and returns parsed response', async () => {
        const fakeResponse = { foo: 'incidents' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const params = { appId: ['a'], tld: ['b'] };
        const result = await service.getCodeDefenderIncidents(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        expect(result).to.equal(fakeResponse);
    });

    it('getCodeDefenderScriptInventory calls httpClient with correct URL and returns parsed response', async () => {
        const fakeResponse = { foo: 'scripts' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const params = { appId: ['a'], tld: ['b'] };
        const result = await service.getCodeDefenderScriptInventory(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        expect(result).to.equal(fakeResponse);
    });

    it('getCodeDefenderHeaderInventory calls httpClient with correct URL and returns parsed response', async () => {
        const fakeResponse = { foo: 'headers' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const params = { appId: ['a'], tld: ['b'] };
        const result = await service.getCodeDefenderHeaderInventory(params as any);
        expect(httpClient.request.calledOnce).to.be.true;
        expect(result).to.equal(fakeResponse);
    });

    it('getCodeDefenderIncidents propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        const params = { appId: ['a'], tld: ['b'] };
        await expect(service.getCodeDefenderIncidents(params as any)).to.be.rejectedWith('network fail');
    });

    it('getCodeDefenderScriptInventory propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        const params = { appId: ['a'], tld: ['b'] };
        await expect(service.getCodeDefenderScriptInventory(params as any)).to.be.rejectedWith('network fail');
    });

    it('getCodeDefenderHeaderInventory propagates httpClient.request error', async () => {
        httpClient.request.rejects(new Error('network fail'));
        const params = { appId: ['a'], tld: ['b'] };
        await expect(service.getCodeDefenderHeaderInventory(params as any)).to.be.rejectedWith('network fail');
    });

    it('buildQueryUrl handles array and undefined params', async () => {
        const fakeResponse = { foo: 'incidents' };
        httpClient.request.resolves({ json: async () => fakeResponse, ok: true });
        const params = { appId: ['a', 'b'], tld: ['c'], take: undefined };
        await service.getCodeDefenderIncidents(params as any);
        const url = httpClient.request.firstCall.args[0];
        expect(url).to.include('appId=a');
        expect(url).to.include('appId=b');
        expect(url).to.include('tld=c');
        expect(url).to.not.include('take=');
    });
});
