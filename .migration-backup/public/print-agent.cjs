#!/usr/bin/env node
'use strict';

const net = require('node:net');

const DEFAULT_PORT = 9100;
const DEFAULT_POLL_MS = 1500;
const MAX_JOB_BYTES = 1_500_000;

function isPrivateIPv4(value) {
  if (typeof value !== 'string') return false;
  const octets = value.split('.').map(part => /^\d{1,3}$/.test(part) ? Number(part) : NaN);
  if (octets.length !== 4 || octets.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = octets;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function parseArgs(argv = process.argv.slice(2), env = process.env) {
  const options = {
    server: env.QIROX_SERVER,
    key: env.QIROX_KEY,
    ip: env.PRINTER_IP,
    port: Number(env.PRINTER_PORT || DEFAULT_PORT),
    pollMs: Number(env.PRINT_AGENT_POLL_MS || DEFAULT_POLL_MS),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) continue;
    if (name === '--server') options.server = value;
    if (name === '--key') options.key = value;
    if (name === '--ip') options.ip = value;
    if (name === '--port') options.port = Number(value);
    if (name === '--poll-ms') options.pollMs = Number(value);
    index += 1;
  }

  if (!options.server || !options.key || !options.ip) {
    throw new Error('Missing configuration. Required: --server, --key, --ip (or matching environment variables).');
  }

  let serverUrl;
  try {
    serverUrl = new URL(options.server);
  } catch {
    throw new Error('Server URL is invalid.');
  }
  if (!['https:', 'http:'].includes(serverUrl.protocol) || serverUrl.username || serverUrl.password) {
    throw new Error('Server URL must use HTTP or HTTPS and must not contain credentials.');
  }
  if (!isPrivateIPv4(options.ip)) {
    throw new Error('Printer IP must be a private IPv4 address on the cafe network.');
  }
  if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) {
    throw new Error('Printer port must be between 1 and 65535.');
  }
  if (!Number.isInteger(options.pollMs) || options.pollMs < 500 || options.pollMs > 30000) {
    throw new Error('Polling interval must be between 500 and 30000 milliseconds.');
  }

  options.server = serverUrl.origin;
  return options;
}

function decodeJob(job, config) {
  if (!job || typeof job !== 'object' || !job._id) throw new Error('Invalid job returned by server.');
  if (job.printerIp !== config.ip || Number(job.printerPort || DEFAULT_PORT) !== config.port) {
    throw new Error('Job printer address does not match this agent configuration.');
  }
  if (!isPrivateIPv4(job.printerIp)) throw new Error('Job contains a non-private printer address.');
  if (typeof job.data !== 'string' || !job.data.length || job.data.length > 2_000_000) {
    throw new Error('Print data is empty or exceeds the safe size limit.');
  }

  const bytes = Buffer.from(job.data, 'base64');
  if (!bytes.length || bytes.length > MAX_JOB_BYTES || bytes.toString('base64') !== job.data) {
    throw new Error('Print data is not valid base64 or exceeds the safe size limit.');
  }
  return bytes;
}

function sendRawToPrinter(ip, port, bytes, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: ip, port });
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      socket.end(bytes);
    });
    socket.once('timeout', () => finish(new Error('Connection to printer timed out.')));
    socket.once('error', error => finish(error));
    socket.once('close', hadError => {
      if (!settled && hadError) finish(new Error('Printer socket closed with an error.'));
      else if (!settled) finish(null);
    });
  });
}

async function requestJson(config, path, init = {}) {
  const response = await fetch(new URL(path, `${config.server}/`), {
    ...init,
    headers: {
      'x-print-agent-key': config.key,
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Server returned HTTP ${response.status}.`);
  }
  return body;
}

async function reportJob(config, jobId, error) {
  return requestJson(config, `/api/print-queue/${encodeURIComponent(jobId)}/done`, {
    method: 'PATCH',
    body: JSON.stringify(error ? { error: String(error).slice(0, 500) } : {}),
  });
}

async function processJob(job, config, dependencies = {}) {
  const send = dependencies.sendRawToPrinter || sendRawToPrinter;
  const report = dependencies.reportJob || reportJob;
  let error = null;

  try {
    const bytes = decodeJob(job, config);
    await send(config.ip, config.port, bytes);
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
  }

  try {
    await report(config, String(job?._id || ''), error);
  } catch (cause) {
    const reportError = cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `Could not record print-job status (${reportError}). The job will not be retried automatically; check the printer before resubmitting.`,
    );
  }

  return { sent: !error, error };
}

async function pollOnce(config, dependencies = {}) {
  const request = dependencies.requestJson || requestJson;
  const process = dependencies.processJob || processJob;
  const response = await request(config, '/api/print-queue/pending');
  if (!response.job) return false;
  const result = await process(response.job, config, dependencies);
  if (result.sent) {
    console.log(`[QIROX Print Agent] Sent job ${response.job._id} to ${config.ip}:${config.port}. Confirm that paper came out.`);
  } else {
    console.error(`[QIROX Print Agent] Job ${response.job._id} failed: ${result.error}`);
  }
  return true;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(config) {
  if (typeof fetch !== 'function' || typeof AbortSignal.timeout !== 'function') {
    throw new Error('Node.js 20.19 or newer (up to 22.x) is required on the cafe PC.');
  }

  let stopping = false;
  process.once('SIGINT', () => { stopping = true; });
  process.once('SIGTERM', () => { stopping = true; });
  console.log(`[QIROX Print Agent] Running for ${config.ip}:${config.port}. This computer must stay on the same cafe network as the printer.`);

  while (!stopping) {
    let claimedJob = false;
    try {
      claimedJob = await pollOnce(config);
    } catch (error) {
      console.error(`[QIROX Print Agent] ${error.message || error}`);
    }
    if (!claimedJob && !stopping) await wait(config.pollMs);
  }
  console.log('[QIROX Print Agent] Stopped.');
}

if (require.main === module) {
  try {
    run(parseArgs()).catch(error => {
      console.error(`[QIROX Print Agent] ${error.message || error}`);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error(`[QIROX Print Agent] ${error.message || error}`);
    process.exitCode = 1;
  }
}

module.exports = {
  decodeJob,
  isPrivateIPv4,
  parseArgs,
  pollOnce,
  processJob,
  sendRawToPrinter,
};
