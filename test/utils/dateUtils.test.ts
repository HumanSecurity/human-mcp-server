import { expect } from 'chai';
import { clampAttackReportingTimes } from '../../src/utils/dateUtils';

describe('clampAttackReportingTimes', () => {
    const now = new Date('2024-06-15T12:00:00.000Z');
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    it('clamps startTime and endTime to within two weeks', () => {
        const start = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
        const end = now.toISOString();
        const result = clampAttackReportingTimes(start, end, now);
        expect(result.startTime).to.equal(twoWeeksAgo.toISOString());
        expect(result.endTime).to.equal(now.toISOString());
    });

    it('throws on invalid startTime', () => {
        expect(() => clampAttackReportingTimes('invalid', now.toISOString(), now)).to.throw('Invalid startTime');
    });

    it('throws on invalid endTime', () => {
        expect(() => clampAttackReportingTimes(now.toISOString(), 'invalid', now)).to.throw('Invalid endTime');
    });

    it('throws if startTime is after endTime', () => {
        const end = new Date(now.getTime() - 1000).toISOString();
        const start = now.toISOString();
        expect(() => clampAttackReportingTimes(start, end, now)).to.throw('startTime cannot be after endTime');
    });

    it('throws if startTime is in the future', () => {
        const future = new Date(now.getTime() + 1000).toISOString();
        expect(() => clampAttackReportingTimes(future, future, now)).to.throw('startTime cannot be in the future');
    });

    it('throws if endTime is in the future', () => {
        const end = new Date(now.getTime() + 1000).toISOString();
        const result = clampAttackReportingTimes(twoWeeksAgo.toISOString(), end, now);
        expect(result.endTime).to.equal(now.toISOString());
    });

    it('throws if endTime is older than two weeks ago', () => {
        const end = new Date(twoWeeksAgo.getTime() - 1000).toISOString();
        expect(() => clampAttackReportingTimes(twoWeeksAgo.toISOString(), end, now)).to.throw(
            'endTime cannot be older than 2 weeks ago',
        );
    });
});
