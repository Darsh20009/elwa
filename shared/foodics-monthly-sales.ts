export interface FoodicsMonthlySalesRow {
  month: string;
  orders: number;
  netSales: number;
  netPaid: number;
  refunds: number;
  discount: number | null;
  isPartial?: boolean;
}

export const foodicsMonthlySalesInfo = {
  source: "Foodics",
  branchId: "elwa-bahrah",
  branchNameAr: "فرع بحرة",
  branchNameEn: "Bahrah branch",
  currency: "SAR",
} as const;

// These are monthly aggregates from the supplied Foodics report, not individual orders.
export const foodicsMonthlySales: FoodicsMonthlySalesRow[] = [
  { month: "2025-01", orders: 2477, netSales: 71517, netPaid: 71517, refunds: 32, discount: null },
  { month: "2025-02", orders: 1803, netSales: 47988.68, netPaid: 47988.68, refunds: 0, discount: 1838.32 },
  { month: "2025-03", orders: 1660, netSales: 45961.46, netPaid: 45961.46, refunds: 10, discount: 819.54 },
  { month: "2025-04", orders: 1394, netSales: 33601.92, netPaid: 36623.44, refunds: 0, discount: 522.39 },
  { month: "2025-05", orders: 2401, netSales: 52101.5, netPaid: 59834.2, refunds: 26, discount: 2186.58 },
  { month: "2025-06", orders: 2413, netSales: 50537.25, netPaid: 58031.2, refunds: 0, discount: 2771.92 },
  { month: "2025-07", orders: 2588, netSales: 56689.13, netPaid: 65173, refunds: 88, discount: 2077.7 },
  { month: "2025-08", orders: 2352, netSales: 51676.35, netPaid: 59427.8, refunds: 0, discount: 2192.35 },
  { month: "2025-09", orders: 2231, netSales: 44434.52, netPaid: 51099.7, refunds: 77, discount: 1662.87 },
  { month: "2025-10", orders: 2182, netSales: 43855.65, netPaid: 50434, refunds: 0, discount: 1648.7 },
  { month: "2025-11", orders: 1604, netSales: 33248.69, netPaid: 38236, refunds: 0, discount: 1500.87 },
  { month: "2025-12", orders: 1802, netSales: 33149.13, netPaid: 38121.5, refunds: 40, discount: 6050 },
  { month: "2026-01", orders: 1259, netSales: 24144.78, netPaid: 27766.5, refunds: 0, discount: 1436.96 },
  { month: "2026-02", orders: 1042, netSales: 18861.01, netPaid: 21750.92, refunds: 0, discount: 1619.86 },
  { month: "2026-03", orders: 1044, netSales: 19691.56, netPaid: 22717.95, refunds: 0, discount: 1460.61 },
  { month: "2026-04", orders: 1322, netSales: 25323.65, netPaid: 29175.78, refunds: 50, discount: 1528.52 },
  { month: "2026-05", orders: 1607, netSales: 32623.41, netPaid: 37573.31, refunds: 62, discount: 2113.98 },
  { month: "2026-06", orders: 1325, netSales: 25487.57, netPaid: 29323.78, refunds: 9, discount: 1022 },
  { month: "2026-07", orders: 1477, netSales: 29248.04, netPaid: 33643.43, refunds: 45, discount: 946.74 },
  { month: "2026-08", orders: 1262, netSales: 22977.39, netPaid: 26512.04, refunds: 0, discount: 1366.09 },
  { month: "2026-09", orders: 1261, netSales: 20556.92, netPaid: 23808.85, refunds: 0, discount: 2151.6 },
  { month: "2026-10", orders: 208, netSales: 3905.04, netPaid: 4507.53, refunds: 0, discount: 174.78, isPartial: true },
];