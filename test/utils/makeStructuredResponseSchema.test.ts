import { expect } from 'chai';
import { z } from 'zod';
import { makeStructuredResponseSchema } from '../../src/utils/makeStructuredResponseSchema';

describe('makeStructuredResponseSchema', () => {
    it('returns schema with correct shape', () => {
        const dataSchema = z.object({ foo: z.string() });
        const schema = makeStructuredResponseSchema(dataSchema);
        const parsed = schema.parse({ data: { foo: 'bar' } });
        expect(parsed.data).to.deep.equal({ foo: 'bar' });
        expect(parsed.error).to.be.undefined;
    });

    it('allows error only', () => {
        const dataSchema = z.object({ foo: z.string() });
        const schema = makeStructuredResponseSchema(dataSchema);
        const parsed = schema.parse({ error: 'fail' });
        expect(parsed.error).to.equal('fail');
        expect(parsed.data).to.be.undefined;
    });

    it('infers types as expected', () => {
        const dataSchema = z.object({ foo: z.string() });
        type T = z.infer<ReturnType<typeof makeStructuredResponseSchema<typeof dataSchema>>>;
        const value: T = { data: { foo: 'bar' } };
        expect(value.data!.foo).to.equal('bar');
    });
});
