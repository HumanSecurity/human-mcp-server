import { ICipherUtils, Pbkdf2DecryptOptions } from 'perimeterx-js-core';
import { AsyncOrSync } from 'ts-essentials';

// TODO: consider changing this class with js-core "CipherUtils"
export class CipherUtils implements ICipherUtils {
    pbkdf2Decrypt(
        secret: string,
        encryptedString: string,
        iterations: number,
        salt: string,
        options?: Pbkdf2DecryptOptions,
    ): AsyncOrSync<string> {
        // TODO implement
        throw new Error('not implemented');
    }
}
