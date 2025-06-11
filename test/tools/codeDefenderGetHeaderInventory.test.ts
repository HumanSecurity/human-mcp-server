import * as chai from 'chai';
import sinon from 'sinon';
import { registerCodeDefenderGetHeaderInventory } from '../../src/tools/codeDefenderGetHeaderInventory';

describe('registerCodeDefenderGetHeaderInventory', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getCodeDefenderHeaderInventory: sinon.stub().resolves('result') };
        registerCodeDefenderGetHeaderInventory(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_pci_get_header_inventory');
        expect(config).to.have.property('description');
        // Simulate handler call
        const params = { foo: 'bar' };
        await handler(params);
        expect(service.getCodeDefenderHeaderInventory.calledWith(params)).to.be.true;
    });
});
