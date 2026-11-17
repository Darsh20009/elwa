export interface FinancialReportAccount {
  id: string;
  normalBalance: "debit" | "credit";
  openingBalance?: number;
  branchId?: string;
}

export interface FinancialReportJournalEntry {
  status: string;
  entryDate: Date | string;
  lines: Array<{
    accountId: string;
    debit?: number;
    credit?: number;
    branchId?: string;
  }>;
}

export interface FinancialReportRefund {
  refundAmount?: number | null;
  restockCogsAmount?: number | null;
  statusBeforeRefund?: string | null;
}

export function applySalesRefunds(
  revenue: number,
  cogs: number,
  refunds: FinancialReportRefund[],
): { revenue: number; cogs: number } {
  const salesRefunds = refunds.filter((refund) => refund.statusBeforeRefund !== "cancelled");
  const refundedRevenueExcludingVat = salesRefunds.reduce(
    (sum, refund) => sum + (Number(refund.refundAmount) || 0),
    0,
  ) / 1.15;
  const restockedCogs = salesRefunds.reduce(
    (sum, refund) => sum + (Number(refund.restockCogsAmount) || 0),
    0,
  );

  return {
    revenue: revenue - refundedRevenueExcludingVat,
    cogs: Math.max(0, cogs - restockedCogs),
  };
}

/**
 * Rebuild balances from opening balances and posted ledger lines so historical
 * statements don't accidentally use today's account.currentBalance.
 */
export function calculateAccountBalances(
  accounts: FinancialReportAccount[],
  entries: FinancialReportJournalEntry[],
  asOfDate: Date,
  branchId?: string,
): Map<string, number> {
  if (Number.isNaN(asOfDate.getTime())) {
    throw new Error("A valid report date is required");
  }

  const accountsById = new Map(accounts.map((account) => [account.id, account]));
  const balances = new Map(
    accounts.map((account) => [
      account.id,
      !branchId || account.branchId === branchId
        ? Number(account.openingBalance) || 0
        : 0,
    ]),
  );

  for (const entry of entries) {
    if (entry.status !== "posted" && entry.status !== "reversed") continue;
    if (new Date(entry.entryDate).getTime() > asOfDate.getTime()) continue;

    for (const line of entry.lines || []) {
      const account = accountsById.get(line.accountId);
      if (!account) continue;
      const effectiveBranch = line.branchId || account.branchId;
      if (branchId && effectiveBranch !== branchId) continue;

      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;
      const movement = account.normalBalance === "debit"
        ? debit - credit
        : credit - debit;
      balances.set(account.id, (balances.get(account.id) || 0) + movement);
    }
  }

  return balances;
}
