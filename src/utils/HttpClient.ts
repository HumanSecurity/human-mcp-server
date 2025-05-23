import { HttpSendOptions, IHttpClient, IIncomingResponse, IOutgoingRequest } from 'perimeterx-js-core';

export class HttpClient implements IHttpClient {
    send(request: IOutgoingRequest, options?: HttpSendOptions): Promise<IIncomingResponse> {
        // TODO implement
        throw new Error('not implemented');
    }
}
