import { IHmacUtils, Algorithm } from 'perimeterx-js-core';

// TODO: consider changing this class with js-core "HmacUtils"
export class HmacUtils implements IHmacUtils {
    createHmac(algo: Algorithm, payload: string, secret: string): string {
        // TODO implement
        throw new Error('not implemented');
    }
}
