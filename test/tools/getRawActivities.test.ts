import * as chai from 'chai';
import sinon from 'sinon';
import { registerGetRawActivities } from '../../src/tools/getRawActivities';

describe('registerGetRawActivities', () => {
    const { expect } = chai;

    it('registers tool and handler calls service', async () => {
        const server = { registerTool: sinon.stub() };
        const service = {
            fetchRawActivities: sinon.stub().resolves({
                count: 5,
                activities: [{ timestamp: '2026-07-02T10:00:00Z', socketIp: '203.0.113.10' }],
            }),
        };
        registerGetRawActivities(server as any, service as any);
        expect(server.registerTool.calledOnce).to.be.true;
        const [name, config, handler] = server.registerTool.firstCall.args;
        expect(name).to.equal('human_get_raw_activities');
        expect(config).to.have.property('description');
        expect(config.description).to.include('blocked');

        const params = {
            searchQuery: [{ type: 'field', key: 'socketIp', operator: '=', value: '203.0.113.10' }],
            startTime: '2026-07-02T10:00:00Z',
            endTime: '2026-07-02T10:30:00Z',
        };
        await handler(params);
        expect(service.fetchRawActivities.calledWith(params)).to.be.true;
    });

    it('registers with readOnlyHint and openWorldHint annotations', () => {
        const server = { registerTool: sinon.stub() };
        const service = { fetchRawActivities: sinon.stub() };
        registerGetRawActivities(server as any, service as any);
        const [, config] = server.registerTool.firstCall.args;
        expect(config.annotations.readOnlyHint).to.be.true;
        expect(config.annotations.openWorldHint).to.be.true;
    });
});
