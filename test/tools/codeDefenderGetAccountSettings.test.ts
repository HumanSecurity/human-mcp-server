import * as chai from 'chai';
import sinon from 'sinon';
import { registerCodeDefenderGetAccountSettings } from '../../src/tools/codeDefenderGetAccountSettings';

describe('registerCodeDefenderGetAccountSettings', () => {
    const { expect } = chai;
    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = { getCodeDefenderAccountSettings: sinon.stub().resolves('result') };
        registerCodeDefenderGetAccountSettings(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_code_defender_get_account_settings');
        expect(config).to.have.property('description');
        await handler({});
        expect(service.getCodeDefenderAccountSettings.calledOnce).to.be.true;
    });
});
