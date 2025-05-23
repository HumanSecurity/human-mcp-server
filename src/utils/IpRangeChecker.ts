import { IIpRangeChecker } from 'perimeterx-js-core';

// TODO: consider changing this class with js-core "IpRangeChecker"
export class IpRangeChecker implements IIpRangeChecker {
    isIpInRange(ip: string, range: string | string[]): boolean {
        // TODO implement
        throw new Error('not implemented');
    }
}
