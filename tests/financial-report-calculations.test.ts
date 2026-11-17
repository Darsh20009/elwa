import assert from "node:assert/strict";
import test from "node:test";
import { applySalesRefunds, calculateAccountBalances } from "../server/financial-report-calculations";

test("subtracts completed refunds without VAT and restores only saved returned costs", () => {
  const adjusted = applySalesRefunds(100, 20, [
    { refundAmount: 23, restockCogsAmount: 5, statusBeforeRefund: "completed" },
    { refundAmount: 11.5, restockCogsAmount: 50, statusBeforeRefund: "cancelled" },
  ]);

  assert.deepEqual(adjusted, { revenue: 80, cogs: 15 });
});

test("builds as-of account balances from opening amounts and posted entries", () => {
  const balances = calculateAccountBalances(
    [
      { id: "cash", normalBalance: "debit", openingBalance: 100 },
      { id: "sales", normalBalance: "credit", openingBalance: 0 },
    ],
    [
      {
        status: "posted",
        entryDate: "2026-11-10T10:00:00.000Z",
        lines: [
          { accountId: "cash", debit: 50 },
          { accountId: "sales", credit: 50 },
        ],
      },
      {
        status: "posted",
        entryDate: "2026-11-20T10:00:00.000Z",
        lines: [
          { accountId: "cash", debit: 25 },
          { accountId: "sales", credit: 25 },
        ],
      },
      {
        status: "draft",
        entryDate: "2026-11-12T10:00:00.000Z",
        lines: [{ accountId: "cash", debit: 1000 }],
      },
    ],
    new Date("2026-11-17T23:59:59.999Z"),
  );

  assert.equal(balances.get("cash"), 150);
  assert.equal(balances.get("sales"), 50);
});

test("keeps branch balances separate and includes reversed ledger lines", () => {
  const balances = calculateAccountBalances(
    [
      { id: "cash", normalBalance: "debit", openingBalance: 300, branchId: "north" },
      { id: "sales", normalBalance: "credit" },
    ],
    [
      {
        status: "posted",
        entryDate: "2026-11-10T10:00:00.000Z",
        lines: [
          { accountId: "cash", debit: 20, branchId: "north" },
          { accountId: "sales", credit: 20, branchId: "north" },
        ],
      },
      {
        status: "reversed",
        entryDate: "2026-11-11T10:00:00.000Z",
        lines: [
          { accountId: "cash", credit: 5, branchId: "north" },
          { accountId: "sales", debit: 5, branchId: "north" },
        ],
      },
      {
        status: "posted",
        entryDate: "2026-11-12T10:00:00.000Z",
        lines: [
          { accountId: "cash", debit: 70, branchId: "south" },
          { accountId: "sales", credit: 70, branchId: "south" },
        ],
      },
    ],
    new Date("2026-11-17T23:59:59.999Z"),
    "north",
  );

  assert.equal(balances.get("cash"), 315);
  assert.equal(balances.get("sales"), 15);
});
