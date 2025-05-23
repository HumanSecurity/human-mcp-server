import { IHeaders } from 'perimeterx-js-core';
import { Req } from '../types/Types';

export class Headers implements IHeaders {
    private readonly request: Req;
    constructor(request: Req) {
        this.request = request;
    }
    append(name: string, value: string): void {
        // TODO implement
        throw new Error('not implemented');
    }

    delete(name: string): void {
        // TODO implement
        throw new Error('not implemented');
    }

    forEach(callbackfn: (value: string, key: string, parent: IHeaders) => void, thisArg?: any): void {
        // TODO implement
        throw new Error('not implemented');
    }

    get(name: string): string | null {
        // TODO implement
        throw new Error('not implemented');
    }

    has(name: string): boolean {
        // TODO implement
        throw new Error('not implemented');
    }

    set(name: string, value: string): void {
        // TODO implement
        throw new Error('not implemented');
    }
}
