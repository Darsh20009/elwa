'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const {
  decodeJob,
  isPrivateIPv4,
  parseArgs,
  pollOnce,
  processJob,
  sendRawToPrinter,
} = require('../public/print-agent.cjs');

const config = {
  server: 'https://elwa.site',
  key: 'test-agent-key',
  ip: '192.168.8.208',
  port: 9100,
};

test('accepts only private IPv4 printer addresses', () => {
  assert.equal(isPrivateIPv4('192.168.8.208'), true);
  assert.equal(isPrivateIPv4('10.1.2.3'), true);
  assert.equal(isPrivateIPv4('172.20.1.2'), true);
  assert.equal(isPrivateIPv4('8.8.8.8'), false);
  assert.equal(isPrivateIPv4('192.168.8.999'), false);
  assert.equal(isPrivateIPv4('192.168.8.1;calc'), false);
});

test('validates agent configuration and rejects public printer targets', () => {
  const options = parseArgs([
    '--server', 'https://elwa.site/path',
    '--key', 'test-agent-key',
    '--ip', '192.168.8.208',
    '--port', '9100',
  ]);
  assert.equal(options.server, 'https://elwa.site');
  assert.throws(
    () => parseArgs(['--server', 'https://elwa.site', '--key', 'x', '--ip', '8.8.8.8']),
    /private IPv4/,
  );
});

test('decodes only jobs addressed to the configured printer', () => {
  const bytes = Buffer.from([0x1b, 0x40, 0x41]);
  const job = {
    _id: 'job-1',
    printerIp: config.ip,
    printerPort: config.port,
    data: bytes.toString('base64'),
  };
  assert.deepEqual(decodeJob(job, config), bytes);
  assert.throws(() => decodeJob({ ...job, printerIp: '192.168.8.5' }, config), /does not match/);
  assert.throws(() => decodeJob({ ...job, data: 'not-base64!' }, config), /valid base64/);
});

test('processes a claimed job once and reports the outcome', async () => {
  const bytes = Buffer.from([1, 2, 3]);
  const job = {
    _id: 'job-2',
    printerIp: config.ip,
    printerPort: config.port,
    data: bytes.toString('base64'),
  };
  let sendCalls = 0;
  const reports = [];

  const result = await processJob(job, config, {
    sendRawToPrinter: async (ip, port, payload) => {
      sendCalls += 1;
      assert.equal(ip, config.ip);
      assert.equal(port, config.port);
      assert.deepEqual(payload, bytes);
    },
    reportJob: async (_config, jobId, error) => reports.push({ jobId, error }),
  });

  assert.equal(sendCalls, 1);
  assert.deepEqual(reports, [{ jobId: 'job-2', error: null }]);
  assert.deepEqual(result, { sent: true, error: null });
});

test('does not retry a printer send after an uncertain failure', async () => {
  const job = {
    _id: 'job-3',
    printerIp: config.ip,
    printerPort: config.port,
    data: Buffer.from([1]).toString('base64'),
  };
  let sendCalls = 0;
  let reportError;

  const result = await processJob(job, config, {
    sendRawToPrinter: async () => {
      sendCalls += 1;
      throw new Error('connection timed out');
    },
    reportJob: async (_config, _jobId, error) => { reportError = error; },
  });

  assert.equal(sendCalls, 1);
  assert.match(reportError, /timed out/);
  assert.equal(result.sent, false);
});

test('sends ESC/POS bytes to a local mock TCP printer', async (t) => {
  const received = new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      const chunks = [];
      socket.on('data', chunk => chunks.push(chunk));
      socket.on('end', () => resolve(Buffer.concat(chunks)));
      socket.on('error', reject);
    });
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      t.after(() => new Promise((closeResolve, closeReject) => {
        server.close(error => error ? closeReject(error) : closeResolve());
      }));
      sendRawToPrinter('127.0.0.1', address.port, Buffer.from([0x1b, 0x40, 0x41]), 3000)
        .catch(reject);
    });
  });

  assert.deepEqual(await received, Buffer.from([0x1b, 0x40, 0x41]));
});

test('polls one queued job and delegates its processing', async () => {
  const paths = [];
  let processed = 0;
  const claimed = await pollOnce(config, {
    requestJson: async (_config, path) => {
      paths.push(path);
      return { job: { _id: 'job-4' } };
    },
    processJob: async () => {
      processed += 1;
      return { sent: true, error: null };
    },
  });

  assert.equal(claimed, true);
  assert.deepEqual(paths, ['/api/print-queue/pending']);
  assert.equal(processed, 1);
});
