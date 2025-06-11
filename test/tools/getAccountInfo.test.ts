import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetAccountInfo } from '../../src/tools/getAccountInfo';

describe('registerCyberfraudGetAccountInfo', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getAccountInfo: sinon.stub().resolves('result') };
        registerCyberfraudGetAccountInfo(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_account_info');
        expect(config).to.have.property('description');
        // Simulate handler call
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getAccountInfo.calledWith(params)).to.be.true;
    });
});
