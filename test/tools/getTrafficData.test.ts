import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetTrafficData } from '../../src/tools/getTrafficData';

describe('registerCyberfraudGetTrafficData', () => {
    const { expect } = chai;

    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getTrafficData: sinon.stub().resolves({ metrics: { results: { total: 100 } } }) };
        registerCyberfraudGetTrafficData(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_traffic_data');
        expect(config).to.have.property('description');
        const params = {
            startTime: '2025-06-23T10:00:00Z',
            endTime: '2025-06-23T16:00:00Z',
            metrics: true,
        };
        await handler(params);
        expect(service.getTrafficData.calledWith(params)).to.be.true;
    });
});
