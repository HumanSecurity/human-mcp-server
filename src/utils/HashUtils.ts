import { IHashUtils, Algorithm } from 'perimeterx-js-core';
import { AsyncOrSync } from 'ts-essentials';

// TODO: consider changing this class with js-core "HashUtils"
export class HashUtils implements IHashUtils {
    hashString(string: string, algo: Algorithm): AsyncOrSync<string> {
        // TODO implement
        throw new Error('not implemented');
    }
}
