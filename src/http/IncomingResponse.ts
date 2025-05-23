import {
    IFormData,
    IIncomingResponse,
    MultipartFormDataUtils,
    ReadonlyHeaders,
    toReadonlyHeaders,
} from 'perimeterx-js-core';
import { AsyncOrSync } from 'ts-essentials';

// TODO: replace with your own type
type HTTPResponse = unknown;
type Body = unknown;

export class IncomingResponse implements IIncomingResponse {
    private response: HTTPResponse;

    constructor(response: HTTPResponse) {
        this.response = response;
    }

    get headers(): ReadonlyHeaders {
        // TODO implement
        throw new Error('not implemented');
    }

    get body(): Body {
        // TODO implement
        throw new Error('not implemented');
    }

    get status(): number {
        // TODO implement
        throw new Error('not implemented');
    }

    async formData(): Promise<IFormData> {
        // TODO implement
        throw new Error('not implemented');
        // return MultipartFormDataUtils.createFormDataWithoutFiles(
        //     await this.text(),
        //     this.response.headers.get("content-type")
        // );
    }

    async formUrlEncoded(): Promise<URLSearchParams> {
        // TODO: consider changing this
        return new URLSearchParams(await this.text());
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
