import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetTrafficOvertime } from '../../src/tools/getTrafficOvertime';

describe('registerCyberfraudGetTrafficOvertime', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getTrafficOvertime: sinon.stub().resolves('result') };
        registerCyberfraudGetTrafficOvertime(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_traffic_overtime');
        expect(config).to.have.property('description');
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getTrafficOvertime.calledWith(params)).to.be.true;
    });
});
