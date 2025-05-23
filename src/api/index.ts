import { ConfigurationParams } from 'perimeterx-js-core';
import { Req, Res } from '../types/Types';

/**
 * This method is the top level API used in the enforcer
 * @param config
 */
export const handler = (config: ConfigurationParams<Req, Res>): ((request: Req) => Res) => {
    // TODO: implement this method
    throw new Error('Not implemented');
};
