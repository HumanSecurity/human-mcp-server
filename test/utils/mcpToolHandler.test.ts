import { expect } from 'chai';
import { mcpToolHandler } from '../../src/utils/mcpToolHandler';
import { z } from 'zod';

describe('mcpToolHandler', () => {
    const schema = z.object({ foo: z.string() });

    it('returns structured content on success', async () => {
        const fn = async () => ({ foo: 'bar' });
        const result = await mcpToolHandler<typeof schema>(fn);
        expect(result.isError).to.be.false;
        expect(result.structuredContent.data).to.deep.equal({ foo: 'bar' });
        expect(result.structuredContent.error).to.be.undefined;
        expect(result.content[0].type).to.equal('text');
    });

    it('returns structured content with error on failure', async () => {
        const fn = async () => {
            throw new Error('fail');
        };
        const result = await mcpToolHandler<typeof schema>(fn);
        expect(result.isError).to.be.true;
        expect(result.structuredContent.error).to.equal('fail');
        expect(result.structuredContent.data).to.be.undefined;
        expect(result.content[0].type).to.equal('text');
    });

    it('sets isError flag correctly', async () => {
        const ok = await mcpToolHandler<typeof schema>(async () => ({ foo: 'bar' }));
        const err = await mcpToolHandler<typeof schema>(async () => {
            throw new Error('fail');
        });
        expect(ok.isError).to.be.false;
        expect(err.isError).to.be.true;
    });

    it('returns Unknown error if thrown error is not an Error object', async () => {
        const fn = async () => {
            throw undefined;
        };
        const result = await mcpToolHandler<typeof schema>(fn);
        expect(result.isError).to.be.true;
        expect(result.structuredContent.error).to.equal('Unknown error');
        expect(result.structuredContent.data).to.be.undefined;
    });
});
