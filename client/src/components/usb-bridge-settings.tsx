import { useEffect, useRef, useState } from "react";
import { Printer, RefreshCw, ShieldCheck, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslate } from "@/lib/useTranslate";
import { receiptRequest, useReceiptPrintConfig, useReceiptPrintJob } from "@/hooks/use-receipt-print";
import type { PrintApiError, ReceiptPrintConfig } from "@/hooks/use-receipt-print";
import { ReceiptJobStatus, ReceiptPrintError } from "@/components/secure-receipt-print";

export default function UsbBridgeSettings({ branchId }: { branchId?: string | null }) {
  const tc = useTranslate();
  const config = useReceiptPrintConfig(branchId);
  const [draft, setDraft] = useState<ReceiptPrintConfig | null>(null);
  const [pair, setPair] = useState<{ code: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PrintApiError | null>(null);
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  const initializedBranch = useRef<string | null>(null);
  const test = useReceiptPrintJob(`test:${branchId || ""}`, "/test", { branchId: branchId || "" });
  useEffect(() => {
    generation.current += 1;
    initializedBranch.current = null;
    setDraft(null); setPair(null); setError(null); setSaved(false); lock.current = false; setBusy(false);
    return () => { generation.current += 1; };
  }, [branchId]);
  useEffect(() => {
    if (config.data && initializedBranch.current !== branchId) {
      setDraft(config.data);
      initializedBranch.current = branchId || null;
    }
  }, [config.data, branchId]);
  useEffect(() => {
    if (!pair) return;
    const delay = new Date(pair.expiresAt).getTime() - Date.now();
    if (delay <= 0) { setPair(null); return; }
    const timeout = window.setTimeout(() => setPair(null), Math.min(delay, 300000));
    return () => window.clearTimeout(timeout);
  }, [pair]);
  async function action(kind: "save" | "pair" | "revoke") {
    if (lock.current || !branchId || !config.data?.canManage || !draft) return;
    lock.current = true; setBusy(true); setError(null); setSaved(false);
    const current = generation.current;
    try {
      if (kind === "save") {
        await receiptRequest("PUT", "/config", { branchId, name: draft.name, manufacturer: draft.manufacturer, model: draft.model, paperWidth: draft.paperWidth, adapter: draft.adapter });
        if (current === generation.current) { setSaved(true); setPair(null); }
      } else if (kind === "pair") {
        const code = await receiptRequest<{ code: string; expiresAt: string }>("POST", "/pair-code", { branchId });
        if (current === generation.current) setPair(code);
      } else {
        await receiptRequest("POST", "/revoke", { branchId });
        if (current === generation.current) setPair(null);
      }
      if (current === generation.current) await config.refetch();
    } catch (cause) {
      if (current === generation.current) setError(cause as PrintApiError);
    } finally {
      if (current === generation.current) { lock.current = false; setBusy(false); }
    }
  }
  if (!branchId) return <p className="rounded-xl border p-4 text-sm">{tc("اختر الفرع لإدارة الطابعة.", "Select a branch to manage its printer.")}</p>;
  if (config.isLoading) return <div role="status" className="rounded-xl border p-5 space-y-3"><p>{tc("جارٍ تحميل إعدادات الطابعة", "Loading printer settings")}</p><div className="h-24 rounded bg-primary/5" /></div>;
  if (config.error) return <div className="space-y-3"><ReceiptPrintError error={config.error} /><Button variant="outline" onClick={() => void config.refetch()}>{tc("إعادة المحاولة", "Try again")}</Button></div>;
  if (!config.data?.canManage) return <div className="rounded-xl border bg-muted/30 p-5 space-y-2"><ShieldCheck className="h-6 w-6 text-primary" /><p>{tc("إعدادات الطابعة متاحة للمدير المخوّل فقط.", "Printer settings are available to authorized managers only.")}</p></div>;
  if (!draft) return null;
  const status = config.data;
  function update<K extends keyof ReceiptPrintConfig>(key: K, value: ReceiptPrintConfig[K]) {
    setDraft(previous => previous ? { ...previous, [key]: value } : previous); setSaved(false);
  }
  return <div className="rounded-xl border border-primary/20 bg-background p-4 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div><h3 className="font-bold flex gap-2 items-center"><Printer className="h-5 w-5 text-primary" />{tc("طباعة الفواتير", "Receipt printing")}</h3><p className="text-xs text-muted-foreground mt-1">{tc("إعدادات آمنة لهذا الفرع", "Secure settings for this branch")}</p></div>
      <Button size="icon" variant="outline" aria-label={tc("تحديث الحالة", "Refresh status")} onClick={() => void config.refetch()} disabled={busy}><RefreshCw className="h-4 w-4" /></Button>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">{tc("استخدم الموقع من Safari أو Chrome على iPad. لطابعة USB تحتاج إلى جسر على كمبيوتر متوافق؛ لا تثبّت تطبيقاً على iPad.", "Use this website in Safari or Chrome on iPad. A USB printer needs a bridge on a compatible computer; no iPad app is required.")}</p>
    <fieldset disabled={busy} className="space-y-3">
      <label className="block text-sm space-y-1"><span>{tc("اسم الطابعة", "Printer name")}</span><Input value={draft.name || ""} onChange={e => update("name", e.target.value)} /></label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block text-sm space-y-1"><span>{tc("الشركة المصنّعة", "Manufacturer")}</span><Input value={draft.manufacturer || ""} onChange={e => update("manufacturer", e.target.value)} /></label>
        <label className="block text-sm space-y-1"><span>{tc("الموديل", "Model")}</span><Input value={draft.model || ""} onChange={e => update("model", e.target.value)} /></label>
      </div>
      <p className="text-xs text-muted-foreground">{tc("تحقق من ملصق الطابعة وبرنامج تشغيلها قبل اختيار الجسر وعرض الورق.", "Verify the printer label and driver before selecting the bridge and paper width.")}</p>
      <label className="block text-sm space-y-1"><span>{tc("عرض الورق", "Paper width")}</span><select className="h-11 w-full rounded-md border bg-background px-3" value={draft.paperWidth} onChange={e => update("paperWidth", Number(e.target.value) as 58 | 80)}><option value={58}>58 mm</option><option value={80}>80 mm</option></select></label>
      <label className="block text-sm space-y-1"><span>{tc("طريقة الطباعة", "Printing method")}</span><select className="h-11 w-full rounded-md border bg-background px-3" value={draft.adapter || "browser"} onChange={e => update("adapter", e.target.value as ReceiptPrintConfig["adapter"])}><option value="browser">{tc("المتصفح (الافتراضي)", "Browser (default)")}</option><option value="usb-bridge">{tc("جسر USB على الكمبيوتر", "USB bridge on computer")}</option></select></label>
      <Button className="w-full min-h-11" onClick={() => void action("save")}>{busy ? tc("جارٍ المعالجة", "Working") : tc("حفظ الإعدادات", "Save settings")}</Button>
    </fieldset>
    {saved && <p role="status" className="text-sm">{tc("تم حفظ الإعدادات", "Settings saved")}</p>}
    <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-2">
      <p className="font-semibold flex gap-2 items-center"><Link2 className="h-4 w-4" />{status.paired ? tc("الجسر مقترن", "Bridge paired") : tc("الجسر غير مقترن", "Bridge not paired")} · {status.online ? tc("متصل", "Online") : tc("غير متصل", "Offline")}</p>
      {status.lastSeenAt && <p className="text-xs break-words">{tc("آخر اتصال: ", "Last seen: ")}{new Date(status.lastSeenAt).toLocaleString()}</p>}
      {status.lastSuccessfulJob && <p className="text-xs break-all">{tc("آخر مهمة ناجحة: ", "Last successful job: ")}{typeof status.lastSuccessfulJob === "string" ? status.lastSuccessfulJob : status.lastSuccessfulJob.id || status.lastSuccessfulJob.completedAt}</p>}
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={busy} onClick={() => void action("pair")}>{tc("إنشاء رمز اقتران", "Create pairing code")}</Button>
      <Button variant="outline" disabled={busy || !status.paired} onClick={() => { if (window.confirm(tc("إلغاء اقتران الجسر وإبطال بيانات اتصاله؟", "Revoke this bridge and its credentials?"))) void action("revoke"); }}>{tc("إلغاء الاقتران", "Revoke pairing")}</Button>
      <Button variant="outline" disabled={busy || test.busy || status.adapter !== "usb-bridge" || !status.paired || !status.online || !!test.job} onClick={() => void test.submit()}>{tc("طباعة اختبار", "Test print")}</Button>
    </div>
    {pair && <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2"><p className="text-sm">{tc("أدخل الرمز على كمبيوتر الجسر. يظهر هنا فقط ويُحذف خلال خمس دقائق.", "Enter this code on the bridge computer. It is shown only here and disappears within five minutes.")}</p><p className="font-mono text-2xl tracking-widest select-all" dir="ltr">{pair.code}</p><p className="text-xs">{tc("ينتهي في: ", "Expires: ")}{new Date(pair.expiresAt).toLocaleTimeString()}</p></div>}
    <div className="flex flex-col gap-2 text-sm"><a className="underline underline-offset-4 text-primary" href="/docs/usb-print-bridge.md" target="_blank" rel="noopener noreferrer">{tc("تعليمات التثبيت واستكشاف الأخطاء", "Installation and troubleshooting")}</a><a className="underline underline-offset-4 text-primary" href="/usb-print-bridge.cjs" download>{tc("تنزيل جسر الكمبيوتر", "Download computer bridge")}</a></div>
    {error && <ReceiptPrintError error={error} />}
    {test.error && <ReceiptPrintError error={test.error} />}
    {test.error && !test.job && <Button variant="outline" disabled={test.busy} onClick={() => void test.submit()}>{tc("إعادة إرسال نفس الاختبار", "Resend the same test")}</Button>}
    {test.job && <><ReceiptJobStatus job={test.job} /><Button variant="outline" disabled={test.busy} onClick={() => void test.refresh()}>{tc("تحديث حالة الاختبار", "Refresh test status")}</Button>{test.job.status === "failed" && test.job.canRetry && <Button variant="outline" disabled={test.busy} onClick={() => void test.retry()}>{tc("إعادة محاولة آمنة", "Safe retry")}</Button>}</>}
    {test.timedOut && <p className="text-sm">{tc("انتهت المتابعة؛ تحقق من الطابعة ثم حدّث الحالة يدوياً.", "Monitoring timed out; check the printer and refresh status manually.")}</p>}
  </div>;
}
