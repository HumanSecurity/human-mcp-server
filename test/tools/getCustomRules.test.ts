import * as chai from 'chai';
import sinon from 'sinon';
import { registerCyberfraudGetCustomRules } from '../../src/tools/getCustomRules';

describe('registerCyberfraudGetCustomRules', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getCustomRules: sinon.stub().resolves('result') };
        registerCyberfraudGetCustomRules(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_custom_rules');
        expect(config).to.have.property('description');
        // Simulate handler call
        await handler();
        expect(service.getCustomRules.calledOnce).to.be.true;
    });
});
