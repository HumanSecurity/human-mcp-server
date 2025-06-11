import * as chai from 'chai';
import sinon from 'sinon';
import { registerCodeDefenderGetScriptInventory } from '../../src/tools/codeDefenderGetScriptInventory';

describe('registerCodeDefenderGetScriptInventory', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getCodeDefenderScriptInventory: sinon.stub().resolves('result') };
        registerCodeDefenderGetScriptInventory(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_pci_get_script_inventory');
        expect(config).to.have.property('description');
        // Simulate handler call
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getCodeDefenderScriptInventory.calledWith(params)).to.be.true;
    });
});
