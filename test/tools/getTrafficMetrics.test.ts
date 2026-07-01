import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetTrafficMetrics } from '../../src/tools/getTrafficMetrics';

describe('registerCyberfraudGetTrafficMetrics', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getTrafficMetrics: sinon.stub().resolves('result') };
        registerCyberfraudGetTrafficMetrics(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_traffic_metrics');
        expect(config).to.have.property('description');
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getTrafficMetrics.calledWith(params)).to.be.true;
    });
});
