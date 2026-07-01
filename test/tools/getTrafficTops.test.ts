import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetTrafficTops } from '../../src/tools/getTrafficTops';

describe('registerCyberfraudGetTrafficTops', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getTrafficTops: sinon.stub().resolves('result') };
        registerCyberfraudGetTrafficTops(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_traffic_tops');
        expect(config).to.have.property('description');
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getTrafficTops.calledWith(params)).to.be.true;
    });
});
