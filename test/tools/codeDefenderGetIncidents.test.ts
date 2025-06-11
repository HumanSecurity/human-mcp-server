import * as chai from 'chai';
import sinon from 'sinon';
import { registerCodeDefenderGetIncidents } from '../../src/tools/codeDefenderGetIncidents';

describe('registerCodeDefenderGetIncidents', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getCodeDefenderIncidents: sinon.stub().resolves('result') };
        registerCodeDefenderGetIncidents(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_code_defender_get_incidents');
        expect(config).to.have.property('description');
        // Simulate handler call
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getCodeDefenderIncidents.calledWith(params)).to.be.true;
    });
});
