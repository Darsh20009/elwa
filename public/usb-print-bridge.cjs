#!/usr/bin/env node
'use strict';
// Elwa USB bridge: outbound HTTPS only, OS driver through CUPS, no listening port.
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { createHash } = require('node:crypto');
const readline = require('node:readline/promises');

const home = path.join(os.homedir(), '.config', 'elwa-print-bridge');
const configFile = path.join(home, 'config.json');
const journalFile = path.join(home, 'pending-result.json');
const hash = value => createHash('sha256').update(value).digest('hex');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function validateConfig(input) {
  const server = new URL(input.server);
  if (server.protocol !== 'https:' || server.username || server.password || server.pathname !== '/' || server.search || server.hash) {
    throw new Error('Use the HTTPS origin of your Elwa website, without a path or credentials.');
  }
  if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,79}$/.test(input.printer || '')) throw new Error('Invalid CUPS queue name.');
  if (!path.isAbsolute(input.chrome || '') || /[\r\n\0]/.test(input.chrome)) throw new Error('Provide the absolute local Chrome/Chromium executable path.');
  if (input.token && !/^[a-f0-9]{64}$/.test(input.token)) throw new Error('Invalid stored bridge credential.');
  return { server: server.origin, printer: input.printer, chrome: input.chrome, token: input.token };
}
function validateJob(job) {
  if (!job || !/^[a-f0-9]{24}$/.test(job.id) || !/^[a-f0-9]{64}$/.test(job.claimToken) ||
      ![58, 80].includes(job.paperWidth) || typeof job.html !== 'string' ||
      Buffer.byteLength(job.html) > 2_000_000 || !job.html.startsWith('<!doctype html>') ||
      !job.html.includes("default-src 'none'") || /<script\b|<iframe\b|<object\b|<embed\b/i.test(job.html)) {
    throw new Error('Invalid receipt job.');
  }
  return job;
}
function command(executable, args, timeout = 15_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { shell: false, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, LC_ALL: 'C', LANG: 'C' } });
    let stdout = '', bytes = 0, stopped = false;
    const timer = setTimeout(() => { stopped = true; child.kill('SIGKILL'); }, timeout);
    child.stdout.on('data', b => { bytes += b.length; if (bytes < 100_000) stdout += b; else child.kill('SIGKILL'); });
    // Deliberately discard stderr: driver messages may include sensitive filenames/content.
    child.stderr.on('data', () => {});
    child.on('error', () => { clearTimeout(timer); reject(new Error('Local driver/executable unavailable')); });
    child.on('close', code => {
      clearTimeout(timer);
      if (stopped || code !== 0 || bytes > 100_000) reject(new Error('Local print command failed or timed out'));
      else resolve(stdout);
    });
  });
}
async function secureWrite(file, data) {
  await fs.mkdir(home, { recursive: true, mode: 0o700 });
  await fs.chmod(home, 0o700);
  const temporary = file + '.tmp';
  const handle = await fs.open(temporary, 'w', 0o600);
  try { await handle.writeFile(JSON.stringify(data)); await handle.sync(); } finally { await handle.close(); }
  await fs.rename(temporary, file);
  await fs.chmod(file, 0o600);
}
async function request(config, endpoint, body) {
  const response = await fetch(config.server + '/api/receipt-print' + endpoint, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15_000),
    headers: { 'content-type': 'application/json', ...(config.token ? { authorization: `Bearer ${config.token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Bridge request rejected (HTTP ${response.status}); check connection or pairing.`);
  const text = await response.text();
  if (Buffer.byteLength(text) > 2_100_000) throw new Error('Server response too large');
  return JSON.parse(text);
}
async function driverReady(config, execute = command) {
  if (!['linux', 'darwin'].includes(process.platform)) throw new Error('This adapter requires macOS or Linux CUPS. Windows is not supported by this adapter.');
  const state = await execute('/usr/bin/lpstat', ['-p', config.printer]);
  if (/disabled|offline|not found/i.test(state)) throw new Error('Printer queue unavailable');
  const accepting = await execute('/usr/bin/lpstat', ['-a', config.printer]);
  if (/not accepting/i.test(accepting)) throw new Error('Printer queue is not accepting jobs');
}
async function processJob(job, config, dependencies = {}) {
  const execute = dependencies.command || command;
  const save = dependencies.save || (data => secureWrite(journalFile, data));
  const makeTemp = dependencies.makeTemp || (() => fs.mkdtemp(path.join(os.tmpdir(), 'elwa-receipt-')));
  const identity = hash(config.token);
  const result = { id: job.id, identity, claimToken: job.claimToken, status: 'unknown', errorCode: 'BRIDGE_INTERRUPTED' };
  let directory;
  let attemptingSpool = false;
  try {
    validateJob(job);
    await save(result); // Persist before doing any work, for conservative recovery.
    await driverReady(config, execute);
    directory = await makeTemp();
    await fs.chmod(directory, 0o700);
    const html = path.join(directory, 'receipt.html');
    const pdf = path.join(directory, 'receipt.pdf');
    await fs.writeFile(html, job.html, { mode: 0o600 });
    await execute(config.chrome, [
      '--headless', '--disable-gpu', '--disable-extensions', '--disable-background-networking',
      '--disable-sync', '--no-first-run', '--no-default-browser-check', '--no-pdf-header-footer',
      `--user-data-dir=${path.join(directory, 'chrome')}`, `--print-to-pdf=${pdf}`, `file://${html}`,
    ], 45_000);
    const pdfInfo = await fs.stat(pdf);
    if (!pdfInfo.size || pdfInfo.size > 20_000_000) throw new Error('Invalid rendered receipt');
    // From here any error is uncertain. Never automatically execute lp twice.
    attemptingSpool = true;
    await save({ ...result, errorCode: 'SPOOL_UNCERTAIN' });
    const output = await execute('/usr/bin/lp', ['-d', config.printer, '-n', '1',
      '-t', `Elwa-${job.id}`, '-o', 'fit-to-page', pdf], 15_000);
    const spoolId = /request id is ([A-Za-z0-9_.-]+)/.exec(output)?.[1];
    if (!spoolId) throw new Error('No spool acknowledgement');
    const accepted = { ...result, status: 'spooled', errorCode: undefined, spoolId };
    await save(accepted);
    return accepted;
  } catch {
    const failed = { ...result, status: attemptingSpool ? 'unknown' : 'failed',
      errorCode: attemptingSpool ? 'SPOOL_UNCERTAIN' : 'RENDER_FAILED' };
    await save(failed);
    return failed;
  } finally {
    if (directory) await fs.rm(directory, { recursive: true, force: true }).catch(() => {});
  }
}
async function flushJournal(config) {
  let result;
  try { result = JSON.parse(await fs.readFile(journalFile, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return; throw new Error('Recovery journal unreadable; stop and inspect the printer.'); }
  if (result.identity !== hash(config.token)) {
    // Re-pairing retires previous claims server-side; preserve no old credentials.
    await fs.unlink(journalFile);
    return;
  }
  const { identity, id, ...body } = result;
  await request(config, `/agent/jobs/${id}/result`, body);
  await fs.unlink(journalFile);
  console.log(`Job ${id}: ${body.status}. Physical printing is NOT confirmed.`);
}
async function pair(args) {
  if (args.length !== 3) throw new Error('Usage: node usb-print-bridge.cjs pair https://your-site CUPS_QUEUE /absolute/path/to/chrome');
  const config = validateConfig({ server: args[0], printer: args[1], chrome: args[2] });
  await driverReady(config);
  await fs.access(config.chrome);
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  let code;
  try { code = (await terminal.question('Enter the 5-minute pairing code from manager printer settings: ')).trim().toUpperCase(); }
  finally { terminal.close(); }
  if (!/^[A-F0-9]{16}$/.test(code)) throw new Error('Invalid pairing code format');
  const answer = await request(config, '/agent/pair', { code });
  await secureWrite(configFile, validateConfig({ ...config, token: answer.token }));
  console.log('Paired. Credential saved with owner-only permissions. Set the CUPS paper size to match the website.');
}
async function run() {
  const config = validateConfig(JSON.parse(await fs.readFile(configFile, 'utf8')));
  if (!config.token) throw new Error('Pair the bridge first.');
  await fs.mkdir(home, { recursive: true, mode: 0o700 });
  // One local process, with safe stale-lock recovery after reboot.
  const lockFile = path.join(home, 'bridge.pid');
  try {
    const pid = Number(await fs.readFile(lockFile, 'utf8'));
    try { process.kill(pid, 0); throw new Error('Bridge already running'); }
    catch (e) { if (e.code !== 'ESRCH') throw e; }
    await fs.unlink(lockFile);
  } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const lock = await fs.open(lockFile, 'wx', 0o600);
  await lock.writeFile(String(process.pid));
  await lock.close();
  let stopped = false;
  process.once('SIGTERM', () => { stopped = true; });
  process.once('SIGINT', () => { stopped = true; });
  console.log('USB bridge running. No inbound ports. Keep the computer awake.');
  try {
    while (!stopped) {
      try {
        await flushJournal(config);
        const { job } = await request(config, '/agent/poll', {});
        if (job) { await processJob(validateJob(job), config); await flushJournal(config); }
      } catch {
        console.error('Bridge paused: check HTTPS connectivity, pairing, and the local printer. No automatic print resubmission.');
      }
      if (!stopped) await delay(3000);
    }
  } finally { await fs.unlink(lockFile).catch(() => {}); }
}
if (require.main === module) {
  const [action, ...args] = process.argv.slice(2);
  const work = action === 'pair' ? pair(args) : action === 'run' ? run() : Promise.reject(new Error('Use pair or run. Read /docs/usb-print-bridge.md on your Elwa site.'));
  work.catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { validateConfig, validateJob, processJob, driverReady };
