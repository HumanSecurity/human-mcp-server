import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetAttackReportingOverview } from '../../src/tools/getAttackReportingOverview';

describe('registerCyberfraudGetAttackReportingOverview', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getAttackReportingOverview: sinon.stub().resolves('result') };
        registerCyberfraudGetAttackReportingOverview(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_attack_reporting_overview');
        expect(config).to.have.property('description');
        // Simulate handler call
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getAttackReportingOverview.calledWith(params)).to.be.true;
    });
});
