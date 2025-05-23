import {
    CONTENT_TYPE_HEADER_NAME,
    HttpMethod,
    IFormData,
    IHeaders,
    IIncomingRequest,
    MultipartFormDataUtils,
} from 'perimeterx-js-core';
import { AsyncOrSync } from 'ts-essentials';
import { Headers } from './Headers';

// TODO: replace with your own type
type Req = unknown;

export class IncomingRequest implements IIncomingRequest<Req> {
    private readonly request: Req;
    readonly headers: IHeaders;

    constructor(event: Req) {
        this.request = event;
        this.headers = new Headers(this.request);
    }

    get body(): string | undefined {
        // TODO implement
        throw new Error('not implemented');
    }

    get method(): HttpMethod {
        // TODO implement
        throw new Error('not implemented');
    }

    get url(): string {
        // TODO implement
        throw new Error('not implemented');
    }

    get clientIP(): string | null {
        // TODO implement
        throw new Error('not implemented');
    }

    async formData(): Promise<IFormData> {
        // TODO: consider changing this
        return MultipartFormDataUtils.createFormDataWithoutFiles(
            await this.text(),
            this.headers.get(CONTENT_TYPE_HEADER_NAME),
        );
    }

    async formUrlEncoded(): Promise<URLSearchParams> {
        // TODO: consider changing this
        return new URLSearchParams(await this.text());
    }

    getUnderlyingRequest(): Req {
        return this.request;
    }

    async json(): Promise<any> {
        // TODO: consider changing this
        return JSON.parse(await this.text());
    }

    text(): AsyncOrSync<string> {
        // TODO implement
        throw new Error('not implemented');
    }
}
