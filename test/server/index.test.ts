import * as chai from 'chai';
import sinon from 'sinon';
import { createServer } from '../../src/server';

describe('createServer', () => {
    const { expect } = chai;
    let envStub: sinon.SinonStub;
    let consoleErrorStub: sinon.SinonStub;

    beforeEach(() => {
        envStub = sinon.stub(process, 'env').value({});
        consoleErrorStub = sinon.stub(console, 'error');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('creates both services when both tokens are provided', () => {
        envStub.value({
            HUMAN_CYBERFRAUD_API_TOKEN: 'cyberfraud-token',
            HUMAN_CODE_DEFENDER_API_TOKEN: 'code-defender-token',
        });

        const server = createServer();
        expect(server).to.have.property('start');
        expect(typeof server.start).to.equal('function');
        expect(consoleErrorStub.calledWith('Cyberfraud service initialized')).to.be.true;
        expect(consoleErrorStub.calledWith('Code Defender service initialized')).to.be.true;
    });

    it('creates only cyberfraud service when only cyberfraud token is provided', () => {
        envStub.value({
            HUMAN_CYBERFRAUD_API_TOKEN: 'cyberfraud-token',
        });

        const server = createServer();
        expect(server).to.have.property('start');
        expect(typeof server.start).to.equal('function');
        expect(consoleErrorStub.calledWith('Cyberfraud service initialized')).to.be.true;
        expect(consoleErrorStub.calledWith('Code Defender service initialized')).to.be.false;
    });

    it('creates only code defender service when only code defender token is provided', () => {
        envStub.value({
            HUMAN_CODE_DEFENDER_API_TOKEN: 'code-defender-token',
        });

        const server = createServer();
        expect(server).to.have.property('start');
        expect(typeof server.start).to.equal('function');
        expect(consoleErrorStub.calledWith('Cyberfraud service initialized')).to.be.false;
        expect(consoleErrorStub.calledWith('Code Defender service initialized')).to.be.true;
    });

    it('warns when no tokens are provided', () => {
        envStub.value({});

        const server = createServer();
        expect(server).to.have.property('start');
        expect(typeof server.start).to.equal('function');
        expect(consoleErrorStub.calledWith('Warning: No API tokens found. No services will be available.')).to.be.true;
    });
});
