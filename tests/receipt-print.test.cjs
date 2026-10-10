'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { receiptHtml } = require('../server/receipt-print/receipt.ts');
const { mayAccessBranch, canRetryJob } = require('../server/receipt-print/policy.ts');
const { validateConfig, validateJob, processJob } = require('../public/usb-print-bridge.cjs');

const staff = { tenantId: 'tenant-a', branchId: 'branch-a', role: 'cashier' };

test('receipt escapes database content and prints only persisted monetary values', () => {
  const html = receiptHtml({
    _id: 'ignored', orderNumber: '<script>unsafe</script>', customerName: 'A & B',
    createdAt: '2026-01-01T10:00:00Z', paymentMethod: 'cash', paymentStatus: 'paid',
    subtotal: 10, tax: 1.5, totalAmount: 11.5, items: [
      { nameAr: '<img src=x>', quantity: 2, unitPrice: 4 },
    ],
  }, { tradeNameAr: 'إلوة', currency: 'SAR' }, 58, {}, true);
  assert.match(html, /&lt;script&gt;unsafe&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(html, /إعادة طباعة \/ REPRINT/);
  assert.match(html, /11\.50 SAR/);
  assert.match(html, /10\.00 SAR/);
  assert.match(html, /1\.50 SAR/);
  assert.doesNotMatch(html, /20\.00/);
  assert.match(html, /default-src 'none'/);
});

test('receipt requires saved totals and known paper widths', () => {
  assert.throws(() => receiptHtml({ items: [], totalAmount: 10 }, {}, 58), /invoice items/);
  assert.throws(() => receiptHtml({ items: [{ quantity: 1 }], totalAmount: null }, {}, 58), /total missing/);
  assert.throws(() => receiptHtml({ items: [{ quantity: 1 }], totalAmount: 1 }, {}, 57), /paper width/);
});

test('branch scope and retry policy deny cross-branch staff and uncertain resends', () => {
  assert.equal(mayAccessBranch(staff, 'tenant-a', 'branch-a'), true);
  assert.equal(mayAccessBranch(staff, 'tenant-a', 'branch-b'), false);
  assert.equal(mayAccessBranch(staff, 'tenant-b', 'branch-a'), false);
  assert.equal(mayAccessBranch({ tenantId: 'tenant-a', role: 'admin' }, 'tenant-a', 'branch-b'), true);
  assert.equal(canRetryJob('failed'), true);
  for (const status of ['pending', 'processing', 'spooled', 'unknown', 'completed']) {
    assert.equal(canRetryJob(status), false);
  }
});

test('bridge configuration and received jobs reject unsafe input', () => {
  assert.throws(() => validateConfig({ server: 'http://example.test', printer: 'queue', chrome: '/usr/bin/chrome' }), /HTTPS/);
  assert.throws(() => validateConfig({ server: 'https://example.test', printer: 'queue; touch /tmp/x', chrome: '/usr/bin/chrome' }), /queue/);
  assert.throws(() => validateJob({ id: 'a'.repeat(24), claimToken: 'b'.repeat(64), paperWidth: 80, html: '<script>print()</script>' }), /Invalid receipt/);
});

test('bridge submits a roll-sized receipt once and reports OS spool acceptance honestly', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'elwa-test-'));
  const saved = [];
  const calls = [];
  const config = { server: 'https://elwa.example', printer: 'epson_usb', chrome: '/usr/bin/chromium', token: 'c'.repeat(64) };
  const job = { id: 'a'.repeat(24), claimToken: 'b'.repeat(64), paperWidth: 58,
    html: '<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src \'none\'">' };
  try {
    const result = await processJob(job, config, {
      save: async entry => saved.push({ ...entry }),
      makeTemp: async () => directory,
      render: async (_html, pdf, width) => {
        assert.equal(width, 58);
        await fs.writeFile(pdf, 'minimal-pdf');
      },
      command: async (exe, args) => {
        calls.push([exe, args]);
        if (exe === '/usr/bin/lpstat' && args[0] === '-p') return 'printer eps on';
        if (exe === '/usr/bin/lpstat') return 'eps accepting requests';
        if (exe === '/usr/bin/lp') return 'request id is eps-42 (1 file(s))';
        throw new Error('Unexpected local command');
      },
    });
    assert.equal(result.status, 'spooled');
    assert.equal(result.spoolId, 'eps-42');
    assert.equal(result.identity, require('node:crypto').createHash('sha256').update(config.token).digest('hex'));
    assert.equal(calls.filter(([exe]) => exe === '/usr/bin/lp').length, 1);
    assert.equal(saved[0].status, 'unknown');
    assert.equal(saved[1].errorCode, 'SPOOL_UNCERTAIN');
    assert.equal(saved[2].status, 'spooled');
    await assert.rejects(fs.access(directory), { code: 'ENOENT' });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('uncertain OS submission is not retried by the bridge', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'elwa-test-'));
  let submits = 0;
  const saved = [];
  const config = { server: 'https://elwa.example', printer: 'epson_usb', chrome: '/usr/bin/chromium', token: 'c'.repeat(64) };
  const job = { id: 'a'.repeat(24), claimToken: 'b'.repeat(64), paperWidth: 80,
    html: '<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src \'none\'">' };
  try {
    const result = await processJob(job, config, {
      save: async entry => saved.push({ ...entry }),
      makeTemp: async () => directory,
      render: async (_html, pdf) => fs.writeFile(pdf, 'minimal-pdf'),
      command: async (exe, args) => {
        if (exe === '/usr/bin/lpstat' && args[0] === '-p') return 'printer eps on';
        if (exe === '/usr/bin/lpstat') return 'eps accepting requests';
        if (exe === '/usr/bin/lp') { submits++; throw new Error('acknowledgement lost'); }
        throw new Error('Unexpected local command');
      },
    });
    assert.equal(result.status, 'unknown');
    assert.equal(result.errorCode, 'SPOOL_UNCERTAIN');
    assert.equal(submits, 1);
    assert.equal(saved.at(-1).status, 'unknown');
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
