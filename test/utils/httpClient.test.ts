import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { HttpClient } from '../../src/utils/httpClient';
import { HTTP_TIMEOUT_MS, MCP_VERSION_HEADER } from '../../src/utils/constants';
import packageJson from '../../package.json' with { type: 'json' };

chai.use(chaiAsPromised);
const { expect } = chai;

// Minimal Response mock for testing
class MockResponse {
    constructor(
        public body: any,
        public init: { status: number },
    ) {}
    get ok() {
        return this.init.status >= 200 && this.init.status < 300;
    }
    get status() {
        return this.init.status;
    }
    async json() {
        return JSON.parse(this.body);
    }
    async text() {
        return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }
}

describe('HttpClient', () => {
    let fetchStub: sinon.SinonStub;
    const url = 'https://api.example.com/data';
    const apiToken = 'test-token';
    let client: HttpClient;

    beforeEach(() => {
        fetchStub = sinon.stub();
        client = new HttpClient(apiToken, fetchStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('sends GET request and returns response', async () => {
        fetchStub.resolves(new MockResponse(JSON.stringify({ ok: true }), { status: 200 }));
        const res = await client.request(url);
        expect(fetchStub.calledOnce).to.be.true;
        expect(res.ok).to.be.true;
    });

    it('sends POST request with body', async () => {
        fetchStub.resolves(new MockResponse('{}', { status: 200 }));
        await client.request(url, { method: 'POST', body: { foo: 'bar' } });
        const args = fetchStub.firstCall.args[1];
        expect(args.method).to.equal('POST');
        expect(args.body).to.equal(JSON.stringify({ foo: 'bar' }));
    });

    it('adds Authorization header if apiToken is set', async () => {
        fetchStub.resolves(new MockResponse('{}', { status: 200 }));
        await client.request(url);
        const headers = fetchStub.firstCall.args[1].headers;
        expect(headers.Authorization).to.equal(`Bearer ${apiToken}`);
    });

    it('throws on non-2xx response', async () => {
        fetchStub.resolves(new MockResponse('fail', { status: 400 }));
        await expect(client.request(url)).to.be.rejectedWith('API error: 400: fail');
    });

    it('uses HttpsAgent for https URLs', async () => {
        fetchStub.resolves(new MockResponse('{}', { status: 200 }));
        await client.request('https://secure.com');
        const agent = fetchStub.firstCall.args[1].agent;
        expect(agent).to.have.property('options');
        expect(agent.options.timeout).to.equal(HTTP_TIMEOUT_MS);
    });

    it('uses HttpAgent for http URLs', async () => {
        fetchStub.resolves(new MockResponse('{}', { status: 200 }));
        await client.request('http://insecure.com');
        const agent = fetchStub.firstCall.args[1].agent;
        expect(agent).to.have.property('options');
        expect(agent.options.timeout).to.equal(HTTP_TIMEOUT_MS);
    });

    it('sets x-px-mcp-version header with correct version', async () => {
        fetchStub.resolves(new MockResponse('{}', { status: 200 }));
        await client.request(url);
        const headers = fetchStub.firstCall.args[1].headers;
        expect(headers[MCP_VERSION_HEADER]).to.equal(packageJson.version);
    });
});
