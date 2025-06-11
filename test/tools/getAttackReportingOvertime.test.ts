import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetAttackReportingOvertime } from '../../src/tools/getAttackReportingOvertime';

describe('registerCyberfraudGetAttackReportingOvertime', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getAttackReportingOvertime: sinon.stub().resolves('result') };
        registerCyberfraudGetAttackReportingOvertime(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_attack_reporting_overtime');
        expect(config).to.have.property('description');
        // Simulate handler call
        const params = { foo: 'bar' };
        // mcpToolHandler returns an object, so we can just check that service method is called
        await handler(params);
        expect(service.getAttackReportingOvertime.calledWith(params)).to.be.true;
    });
});
