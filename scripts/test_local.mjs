/**
 * End-to-end test script: spawns the MCP server and exercises the
 * human_get_traffic_data tool against localhost:3000.
 *
 * Usage:
 *   node scripts/test_local.mjs
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist/index.cjs');

const TOKEN = process.env.HUMAN_CYBERFRAUD_API_TOKEN;
if (!TOKEN) {
    console.error('Error: HUMAN_CYBERFRAUD_API_TOKEN env var is required.');
    console.error('  Usage: HUMAN_CYBERFRAUD_API_TOKEN=<token> node scripts/test_local.mjs');
    process.exit(1);
}
const TRAFFIC_BASE =
    process.env.HUMAN_TRAFFIC_API_BASE ?? 'http://localhost:3000/api/v1/botDefender/traffic';

// ── helpers ──────────────────────────────────────────────────────────────────

let _id = 1;
const nextId = () => _id++;

let PASS = 0, FAIL = 0;

function summarise(label, result) {
    const d = result?.result?.structuredContent?.data;
    const err = result?.result?.structuredContent?.error;
    const isError = result?.result?.isError;

    if (isError || err) {
        console.log(`  ❌  FAIL  ${label}`);
        console.log(`       error: ${err || JSON.stringify(result?.result)}`);
        FAIL++;
        return;
    }

    const parts = [];
    if (d?.metrics?.results) {
        const r = d.metrics.results;
        parts.push(`metrics: total=${r.total ?? '?'} blocked=${r.blocked ?? '?'} legitimate=${r.legitimate ?? '?'}`);
    }
    if (d?.overtime?.results) {
        parts.push(`overtime: ${d.overtime.results.length} intervals, first=${d.overtime.results[0]?.timestamp}`);
    }
    if (d?.tops) {
        for (const [field, rows] of Object.entries(d.tops)) {
            parts.push(`tops.${field}: top="${rows[0]?.value}" (${rows[0]?.count}), ${rows.length} rows`);
        }
    }
    console.log(`  ✅  PASS  ${label}`);
    for (const p of parts) console.log(`       ${p}`);
    PASS++;
}

function send(proc, msg) {
    proc.stdin.write(JSON.stringify(msg) + '\n');
}

async function runTests() {
    const proc = spawn('node', [distPath], {
        env: {
            ...process.env,
            HUMAN_CYBERFRAUD_API_TOKEN: TOKEN,
            HUMAN_TRAFFIC_API_BASE: TRAFFIC_BASE,
        },
        stdio: ['pipe', 'pipe', 'inherit'],
    });

    const pending = [];
    const queue = [];
    let buf = '';

    proc.stdout.on('data', (chunk) => {
        buf += chunk.toString();
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
            if (!line.trim()) continue;
            let parsed;
            try { parsed = JSON.parse(line); } catch { continue; }
            if (pending.length > 0) pending.shift()(parsed);
            else queue.push(parsed);
        }
    });

    const waitForResponse = () =>
        new Promise((resolve) => {
            if (queue.length > 0) { resolve(queue.shift()); return; }
            pending.push(resolve);
        });

    const call = async (label, args) => {
        send(proc, { jsonrpc: '2.0', id: nextId(), method: 'tools/call',
            params: { name: 'human_get_traffic_data', arguments: args } });
        const res = await waitForResponse();
        summarise(label, res);
        return res;
    };

    // ── Initialize ────────────────────────────────────────────────────────────
    send(proc, { jsonrpc: '2.0', id: nextId(), method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {},
            clientInfo: { name: 'test-script', version: '0.0.1' } } });
    await waitForResponse();
    send(proc, { jsonrpc: '2.0', method: 'notifications/initialized', params: {} });

    const now = Math.floor(Date.now() / 1000);
    const t = (offsetSec) => new Date((now + offsetSec) * 1000).toISOString();

    console.log('\n══════════════════════════════════════════════');
    console.log('  BASIC MODES');
    console.log('══════════════════════════════════════════════');

    await call('metrics only — last 1h', {
        startTime: t(-3600), endTime: t(0), metrics: true });

    await call('overtime only — last 30min', {
        startTime: t(-1800), endTime: t(0), overtime: true });

    await call('tops/incidentTypes only — last 3h', {
        startTime: t(-10800), endTime: t(0), tops: ['incidentTypes'] });

    await call('tops/path only — last 3h, limit 5', {
        startTime: t(-10800), endTime: t(0), tops: ['path'], limit: 5 });

    console.log('\n══════════════════════════════════════════════');
    console.log('  FILTERS');
    console.log('══════════════════════════════════════════════');

    await call('metrics — blocked traffic only (trafficTags filter)', {
        startTime: t(-3600), endTime: t(0), metrics: true,
        filters: { trafficTags: ['blocked', 'potentialBlock'] } });

    await call('metrics — login pages only (pageType filter)', {
        startTime: t(-3600), endTime: t(0), metrics: true,
        filters: { pageType: ['login', 'login_attempt'] } });

    await call('overtime — goodKnownBots only', {
        startTime: t(-3600), endTime: t(0), overtime: true,
        filters: { trafficTags: ['goodKnownBots'] } });

    await call('tops/country — blocked traffic only', {
        startTime: t(-10800), endTime: t(0), tops: ['country'],
        filters: { trafficTags: ['blocked'] }, limit: 10 });

    await call('tops/socketIpOrgName — blocked+blacklist, limit 5', {
        startTime: t(-10800), endTime: t(0), tops: ['socketIpOrgName'],
        filters: { trafficTags: ['blocked', 'blacklist', 'potentialBlock'] }, limit: 5 });

    await call('tops/knownBot — goodKnownBots only, limit 10', {
        startTime: t(-10800), endTime: t(0), tops: ['knownBot'],
        filters: { trafficTags: ['goodKnownBots'] }, limit: 10 });

    console.log('\n══════════════════════════════════════════════');
    console.log('  PLATFORM');
    console.log('══════════════════════════════════════════════');

    await call('metrics — web only', {
        startTime: t(-3600), endTime: t(0), metrics: true,
        trafficSource: ['web'] });

    await call('metrics — mobile only', {
        startTime: t(-3600), endTime: t(0), metrics: true,
        trafficSource: ['mobile'] });

    console.log('\n══════════════════════════════════════════════');
    console.log('  OVERTIME seriesFields');
    console.log('══════════════════════════════════════════════');

    await call('overtime — split by knownBot', {
        startTime: t(-3600), endTime: t(0), overtime: true,
        filters: { trafficTags: ['goodKnownBots'] },
        seriesFields: ['knownBot'] });

    await call('overtime — split by customRule', {
        startTime: t(-3600), endTime: t(0), overtime: true,
        seriesFields: ['customRule'] });

    console.log('\n══════════════════════════════════════════════');
    console.log('  COMBINED CALLS (multiple modes in one)');
    console.log('══════════════════════════════════════════════');

    await call('metrics + tops/incidentTypes (executive security summary)', {
        startTime: t(-10800), endTime: t(0),
        metrics: true,
        tops: ['incidentTypes'] });

    await call('overtime + metrics (dashboard: KPIs + chart)', {
        startTime: t(-3600), endTime: t(0),
        overtime: true, metrics: true });

    await call('metrics + tops/path + tops/country (full breakdown)', {
        startTime: t(-10800), endTime: t(0),
        metrics: true,
        tops: ['path', 'country'],
        filters: { trafficTags: ['blocked'] }, limit: 5 });

    await call('overtime + tops/socketIpOrgName — blocked focus', {
        startTime: t(-3600), endTime: t(0),
        overtime: true,
        tops: ['socketIpOrgName'],
        filters: { trafficTags: ['blocked', 'potentialBlock'] }, limit: 5 });

    await call('metrics + overtime + tops/incidentTypes + tops/knownBot (full dashboard)', {
        startTime: t(-10800), endTime: t(0),
        metrics: true, overtime: true,
        tops: ['incidentTypes', 'knownBot'],
        trafficSource: ['web', 'mobile'] });

    console.log('\n══════════════════════════════════════════════');
    console.log('  TIME RANGES');
    console.log('══════════════════════════════════════════════');

    await call('metrics — last 15 minutes', {
        startTime: t(-900), endTime: t(0), metrics: true });

    await call('metrics — last 6 hours', {
        startTime: t(-21600), endTime: t(0), metrics: true });

    await call('overtime — last 2 hours', {
        startTime: t(-7200), endTime: t(0), overtime: true });

    console.log('\n══════════════════════════════════════════════');
    console.log('  TOPS FIELDS COVERAGE');
    console.log('══════════════════════════════════════════════');

    await call('tops/domain', {
        startTime: t(-10800), endTime: t(0), tops: ['domain'], limit: 5 });

    await call('tops/uaServer (user agent)', {
        startTime: t(-10800), endTime: t(0), tops: ['uaServer'], limit: 5 });

    await call('tops/customRule', {
        startTime: t(-10800), endTime: t(0), tops: ['customRule'], limit: 5 });

    proc.kill();

    console.log('\n══════════════════════════════════════════════');
    console.log(`  RESULTS: ${PASS} passed, ${FAIL} failed`);
    console.log('══════════════════════════════════════════════\n');
}

runTests().catch((err) => { console.error('Test failed:', err); process.exit(1); });
