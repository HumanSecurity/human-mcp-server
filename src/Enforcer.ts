import {
    EnforcerBase,
    IConfiguration,
    IContext,
    IMinimalResponse,
    IOutgoingResponse,
    TokenVersion,
} from 'perimeterx-js-core';
import { CipherUtils } from './utils/CipherUtils';
import { Base64Utils } from './utils/Base64Utils';
import { HmacUtils } from './utils/HmacUtils';
import { HashUtils } from './utils/HashUtils';
import { IpRangeChecker } from './utils/IpRangeChecker';
import { HttpClient } from './utils/HttpClient';
import { Context } from './Context';
import { Req, Res } from './types/Types';
import { IncomingRequest } from './http/IncomingRequest';

export class Enforcer extends EnforcerBase<TokenVersion.V3, Req, Res, [Req], [Req, Res]> {
    // TODO: if you changed the `preserveContext` logic, you should also change it here
    private context: IContext<Req, Res> = undefined;

    constructor(config: IConfiguration<Req, Res>) {
        super(config, {
            // TODO: consider changing default fields here if necessary
            tokenVersion: TokenVersion.V3,
            cipherUtils: new CipherUtils(),
            base64Utils: new Base64Utils(),
            hmacUtils: new HmacUtils(),
            hashUtils: new HashUtils(),
            ipRangeChecker: new IpRangeChecker(),
            httpClient: new HttpClient(),
        });
    }

    protected async convertToRes(response: IMinimalResponse): Promise<Res> {
        // TODO implement
        throw new Error('not implemented');
    }

    protected constructContext(request: Req): IContext<Req, Res> {
        return new Context(this.config, new IncomingRequest(request));
    }

    protected async convertToOutgoingResponse(req: Req, res: Res): Promise<IOutgoingResponse<Res>> {
        // TODO implement
        throw new Error('not implemented');
    }

    protected preserveContext(context: IContext<Req, Res>, req: Req): void {
        // TODO:
        //  this logic forces the enforcer to re-initialized every request
        //  consider optimize the logic if the environment allows that
        this.context = context;
    }

    protected retrieveContext(req: Req, res: Res): IContext<Req, Res> | null {
        // TODO: if you changed the `preserveContext` logic, you should also change it here
        return this.context || null;
    }
}
