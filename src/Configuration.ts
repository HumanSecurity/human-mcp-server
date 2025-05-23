import { ConfigurationParams, StaticConfigurationBase } from 'perimeterx-js-core';
import { Req, Res } from './types/Types';

export class Config extends StaticConfigurationBase<Req, Res> {
    constructor(params: ConfigurationParams<Req, Res>) {
        super(params);
    }
    protected getModuleVersion(): string {
        // TODO: implement
        throw new Error('Not implemented');
        return 'ENFORCER_NAME 0.1.0';
    }
}
