import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SarIcon from "@/components/sar-icon";
import { useTranslate } from "@/lib/useTranslate";
import type { FoodicsMonthlySalesRow } from "@shared/foodics-monthly-sales";

interface FoodicsHistoryResponse {
  source: string;
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;
  currency: string;
  monthlySales: FoodicsMonthlySalesRow[];
}

function formatCurrency(value: number, locale: string) {
  return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthLabel(month: string, locale: string) {
  return new Date(`${month}-01T12:00:00Z`).toLocaleDateString(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function FoodicsSalesHistoryCard() {
  const tc = useTranslate();
  const locale = tc("ar-SA", "en-US");
  const [selectedMonth, setSelectedMonth] = useState("");
  const { data, isLoading, isError } = useQuery<FoodicsHistoryResponse>({
    queryKey: ["/api/admin/foodics-monthly-sales"],
    queryFn: async () => {
      const response = await fetch("/api/admin/foodics-monthly-sales", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load Foodics history");
      return response.json();
    },
    retry: false,
  });

  const rows = data?.monthlySales ?? [];
  const visibleRows = selectedMonth ? rows.filter((row) => row.month === selectedMonth) : rows;
  const hasVisibleRows = visibleRows.length > 0;
  const totals = visibleRows.reduce(
    (sum, row) => ({
      orders: sum.orders + row.orders,
      netSales: sum.netSales + row.netSales,
      netPaid: sum.netPaid + row.netPaid,
      refunds: sum.refunds + row.refunds,
    }),
    { orders: 0, netSales: 0, netPaid: 0, refunds: 0 },
  );
  const chartData = visibleRows.map((row) => ({
    ...row,
    label: monthLabel(row.month, locale),
  }));

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              {tc("المبيعات التاريخية لفرع بحرة", "Bahrah historical sales")}
            </CardTitle>
            <CardDescription className="mt-1">
              {tc(
                `ملخص شهري لبيانات ${data?.branchNameAr ?? "فرع بحرة"} مدمج في إجمالي اللوحة. لا يتضمن التقرير الطلبات الفردية أو التكاليف، لذلك صافي المبيعات ليس صافي الربح.`,
                `Monthly ${data?.branchNameEn ?? "Bahrah branch"} totals are included in the dashboard summary. The report has no individual orders or costs, so net sales are not net profit.`,
              )}
            </CardDescription>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {tc("تعذر تحميل ملخص المبيعات التاريخية.", "Could not load the historical sales summary.")}
          </div>
        ) : isLoading ? (
          <div className="h-44 animate-pulse rounded-lg bg-muted/50" />
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedMonth
                  ? tc(`عرض ${monthLabel(selectedMonth, locale)}`, `Showing ${monthLabel(selectedMonth, locale)}`)
                  : tc(`${rows.length} شهرًا من البيانات الشهرية`, `${rows.length} months of monthly data`)}
              </p>
              <div className="flex items-end gap-2">
                <label className="grid gap-1 text-xs text-muted-foreground">
                  <span>{tc("ابحث بالشهر", "Find a month")}</span>
                  <Input
                    type="month"
                    value={selectedMonth}
                    min={rows[0]?.month}
                    max={rows[rows.length - 1]?.month}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    aria-label={tc("اختر شهرًا لعرض أرقامه", "Select a month to view its figures")}
                    className="w-44"
                  />
                </label>
                {selectedMonth && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMonth("")}>
                    {tc("عرض الكل", "Show all")}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                { label: tc("صافي المبيعات", "Net sales"), value: hasVisibleRows ? <>{formatCurrency(totals.netSales, locale)} <SarIcon /></> : "—" },
                { label: tc("صافي المدفوعات", "Net paid"), value: hasVisibleRows ? <>{formatCurrency(totals.netPaid, locale)} <SarIcon /></> : "—" },
                { label: tc("الطلبات", "Orders"), value: hasVisibleRows ? totals.orders.toLocaleString(locale) : "—" },
                { label: tc("مبالغ الإرجاع", "Refunds"), value: hasVisibleRows ? <>{formatCurrency(totals.refunds, locale)} <SarIcon /></> : "—" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>

            {hasVisibleRows ? (
              <div className="h-56 w-full" aria-label={tc("مخطط صافي المبيعات شهرياً", "Monthly net sales chart")}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="foodicsNetSalesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2D9B6E" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#2D9B6E" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={54} />
                    <Tooltip
                      labelFormatter={(label, payload) => {
                        const row = payload?.[0]?.payload as FoodicsMonthlySalesRow | undefined;
                        return row ? `${label}${row.isPartial ? ` — ${tc("شهر جزئي", "partial month")}` : ""}` : label;
                      }}
                      formatter={(value: number) => [`${formatCurrency(value, locale)} ${tc("ر.س", "SAR")}`, tc("صافي المبيعات", "Net sales")]}
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="netSales" stroke="#2D9B6E" strokeWidth={2.5} fill="url(#foodicsNetSalesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 py-8 text-center text-sm text-muted-foreground">
                {tc("لا توجد بيانات لهذا الشهر.", "No data is available for this month.")}
              </div>
            )}

            <div className="max-h-72 overflow-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">{tc("الشهر", "Month")}</th>
                    <th className="px-3 py-2 text-end font-medium">{tc("الطلبات", "Orders")}</th>
                    <th className="px-3 py-2 text-end font-medium">{tc("صافي المبيعات", "Net sales")}</th>
                    <th className="px-3 py-2 text-end font-medium">{tc("صافي المدفوعات", "Net paid")}</th>
                    <th className="px-3 py-2 text-end font-medium">{tc("الإرجاع", "Refunds")}</th>
                    <th className="px-3 py-2 text-end font-medium">{tc("الخصم", "Discount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-t border-border/70">
                      <td className="whitespace-nowrap px-3 py-2 text-start text-foreground">
                        {monthLabel(row.month, locale)}
                        {row.isPartial && <span className="ms-1 text-[10px] text-amber-600">{tc("(جزئي)", "(partial)")}</span>}
                      </td>
                      <td className="px-3 py-2 text-end tabular-nums">{row.orders.toLocaleString(locale)}</td>
                      <td className="px-3 py-2 text-end tabular-nums">{formatCurrency(row.netSales, locale)}</td>
                      <td className="px-3 py-2 text-end tabular-nums">{formatCurrency(row.netPaid, locale)}</td>
                      <td className="px-3 py-2 text-end tabular-nums">{formatCurrency(row.refunds, locale)}</td>
                      <td className="px-3 py-2 text-end tabular-nums">{row.discount === null ? "—" : formatCurrency(row.discount, locale)}</td>
                    </tr>
                  ))}
                  {!hasVisibleRows && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                        {tc("لا توجد بيانات لهذا الشهر.", "No data is available for this month.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}