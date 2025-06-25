export function clampAttackReportingTimes(
    startTime: string,
    endTime: string,
    now: Date = new Date(),
): { startTime: string; endTime: string } {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const nowIso = now.toISOString();
    const twoWeeksAgoIso = twoWeeksAgo.toISOString();

    let start = new Date(startTime);
    let end = new Date(endTime);

    if (isNaN(start.getTime()))
        throw new Error(
            `Invalid startTime. Please provide a valid ISO string between ${twoWeeksAgoIso} and ${nowIso}.`,
        );
    if (isNaN(end.getTime()))
        throw new Error(`Invalid endTime. Please provide a valid ISO string between ${twoWeeksAgoIso} and ${nowIso}.`);

    // startTime in the future
    if (start > now) throw new Error(`startTime cannot be in the future. Valid range: ${twoWeeksAgoIso} to ${nowIso}.`);
    // endTime in the future
    if (end > now) end = new Date(now);

    // Clamp to two weeks ago
    if (start < twoWeeksAgo) start = new Date(twoWeeksAgo);
    if (end < twoWeeksAgo)
        throw new Error(`endTime cannot be older than 2 weeks ago. Valid range: ${twoWeeksAgoIso} to ${nowIso}.`);

    // startTime after endTime
    if (start > end) throw new Error(`startTime cannot be after endTime. Valid range: ${twoWeeksAgoIso} to ${nowIso}.`);

    return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
    };
}
