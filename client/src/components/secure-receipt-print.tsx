import { useRef, useState } from "react";
import { Printer, RefreshCw, AlertCircle, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@/lib/useTranslate";
import { useReceiptPreview, useReceiptPrintJob } from "@/hooks/use-receipt-print";
import type { ReceiptPrintJob, PrintApiError } from "@/hooks/use-receipt-print";

export function ReceiptJobStatus({ job }: { job: ReceiptPrintJob }) {
  const tc = useTranslate();
  const labels = {
    pending: tc("تم قبول مهمة الطباعة", "Print job accepted"),
    processing: tc("جارٍ الإرسال للطابعة", "Sending to printer"),
    spooled: tc("أُرسلت إلى طابور النظام؛ تحقق من الطابعة", "Accepted by system spooler; check the printer"),
    completed: tc("اكتمل طابور الطباعة؛ لم يتم تأكيد خروج الورقة", "Spool completed; physical printing not confirmed"),
    failed: tc("خطأ في الطابعة", "Printer error"),
    unknown: tc("النتيجة غير مؤكدة؛ تحقق من الطابعة قبل إعادة الطباعة", "Uncertain result; check the printer before reprinting"),
  };
  return <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1" role="status">
    <p className="font-semibold">{labels[job.status]}</p>
    {job.bridgeOnline === false && <p>{tc("جسر الطباعة غير متاح", "Print bridge unavailable")}</p>}
    {job.errorCode && <p className="text-xs text-muted-foreground break-words">{job.errorCode}</p>}
  </div>;
}
export function ReceiptPrintError({ error }: { error: PrintApiError }) {
  const tc = useTranslate();
  return <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm space-y-1">
    <p className="flex gap-2 items-center font-semibold"><AlertCircle className="h-4 w-4 shrink-0" />
      {error.status === 401 ? tc("سجّل دخول الموظف لعرض الفاتورة", "Sign in as staff to access this receipt")
        : error.status === 403 ? tc("لا تملك صلاحية الوصول لهذه الفاتورة أو الإجراء", "You do not have permission for this receipt or action")
        : tc("تعذر إكمال الطلب", "Could not complete the request")}</p>
    <p className="break-words text-muted-foreground">{error.message}</p>
  </div>;
}
export default function SecureReceiptPrint({ orderId, offline = false }: { orderId?: string | null; offline?: boolean }) {
  const tc = useTranslate();
  const preview = useReceiptPreview(offline ? null : orderId);
  const print = useReceiptPrintJob(`order:${orderId || ""}`, "/jobs", { orderId: orderId || "" });
  const iframe = useRef<HTMLIFrameElement>(null);
  const [loadedHtml, setLoadedHtml] = useState<string | null>(null);
  const [browserNotice, setBrowserNotice] = useState(false);
  const [browserError, setBrowserError] = useState(false);
  const browserLock = useRef(false);
  const data = preview.data;
  const ready = !!data?.html && loadedHtml === data.html;
  function browserPrint() {
    if (!ready || browserLock.current || !iframe.current?.contentWindow) return;
    browserLock.current = true;
    try {
      // Keep this synchronous within the user gesture, including on iPad Safari.
      iframe.current.contentWindow.focus();
      iframe.current.contentWindow.print();
      setBrowserNotice(true); setBrowserError(false);
    } catch { setBrowserError(true); }
    finally { window.setTimeout(() => { browserLock.current = false; }, 1000); }
  }
  if (offline || !orderId) return <div className="rounded-xl border bg-muted/30 p-5 space-y-2 text-sm">
    <Receipt className="h-6 w-6 text-primary" />
    <p className="font-semibold">{tc("يجب حفظ الطلب على الخادم أولاً", "Save this order online first")}</p>
    <p className="text-muted-foreground">{tc("بعد المزامنة، افتح الطلب المحفوظ لطباعة فاتورته المعتمدة.", "After syncing, open the saved order to print its authoritative receipt.")}</p>
  </div>;
  return <section className="space-y-3" aria-label={tc("معاينة وطباعة الفاتورة", "Receipt preview and printing")}>
    {preview.isLoading && <div role="status" className="space-y-3 rounded-xl border bg-muted/30 p-5">
      <p className="text-sm">{tc("جارٍ تحضير الفاتورة", "Preparing receipt")}</p>
      <div className="h-5 w-2/3 rounded bg-primary/10" /><div className="h-40 rounded bg-primary/5" />
    </div>}
    {preview.error && <><ReceiptPrintError error={preview.error} /><Button variant="outline" onClick={() => void preview.refetch()}>{tc("إعادة المحاولة", "Try again")}</Button></>}
    {data && !preview.error && <>
      <iframe key={`${orderId}:${data.html}`} ref={iframe} title={tc("معاينة الفاتورة المعتمدة", "Authoritative receipt preview")}
        sandbox="allow-same-origin allow-modals" srcDoc={data.html}
        onLoad={() => setLoadedHtml(data.html)}
        className="block w-full h-[360px] rounded-xl border bg-background" />
      <Button className="w-full min-h-12 gap-2 text-base font-bold" disabled={print.busy || (data.config.adapter === "browser" ? !ready : !!print.job)}
        onClick={() => data.config.adapter === "browser" ? browserPrint() : void print.submit()}>
        <Printer className="h-5 w-5" />{print.busy ? tc("جارٍ الإرسال للطابعة", "Sending to printer") : tc("طباعة الفاتورة", "Print Receipt")}
      </Button>
      {data.config.adapter === "usb-bridge" && <>
        {(!data.config.paired || !data.config.online) && <p role="status" className="text-sm text-muted-foreground">{tc("جسر الطباعة غير متاح. شغّل الكمبيوتر المقترن أو استخدم المتصفح.", "Print bridge unavailable. Start the paired computer or use browser printing.")}</p>}
        <Button variant="outline" className="w-full gap-2 min-h-11" disabled={!ready || print.busy} onClick={browserPrint}>
          <Printer className="h-4 w-4" />{tc("الطباعة باستخدام المتصفح", "Print using browser")}
        </Button>
      </>}
      <p className="text-xs text-muted-foreground leading-relaxed">{tc("على iPad اختر طابعة متوافقة من خيارات طباعة iPadOS. المتصفح لا يدعم USB مباشرة ولا يؤكد خروج الورقة.", "On iPad, select a compatible printer in iPadOS printing options. The browser cannot access USB directly or confirm paper output.")}</p>
    </>}
    {print.error && <ReceiptPrintError error={print.error} />}
    {print.error && !print.job && !print.conflict && <Button variant="outline" disabled={print.busy} onClick={() => void print.submit()}>{tc("إعادة إرسال نفس الطلب بأمان", "Resend the same request safely")}</Button>}
    {print.job && <ReceiptJobStatus job={print.job} />}
    {print.conflict && <p className="text-sm">{tc("توجد مهمة لهذا الطلب. تم عرض حالتها؛ لن تُرسل نسخة ثانية تلقائياً.", "A job already exists. Its status is shown; no duplicate was sent.")}</p>}
    {print.timedOut && <p className="text-sm">{tc("انتهت متابعة الحالة. تحقق يدوياً قبل إعادة الطباعة.", "Status monitoring timed out. Check manually before reprinting.")}</p>}
    {print.job && <div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={print.busy} onClick={() => void print.refresh()} className="gap-2"><RefreshCw className="h-4 w-4" />{tc("تحديث الحالة", "Refresh status")}</Button>
      {print.job.status === "failed" && print.job.canRetry && <Button variant="outline" disabled={print.busy} onClick={() => void print.retry()}>{tc("إعادة محاولة آمنة", "Safe retry")}</Button>}
      {data?.canReprint && data.config.canManage && !["pending", "processing"].includes(print.job.status) && <Button variant="outline" disabled={print.busy} onClick={() => {
        if (window.confirm(tc("تحقق من الطابعة أولاً. هل تريد إرسال نسخة إضافية؟", "Check the printer first. Send an additional copy?"))) void print.submit(true);
      }}>{tc("إعادة طباعة بواسطة المدير", "Manager reprint")}</Button>}
    </div>}
    {browserNotice && <p role="status" className="text-sm">{tc("تم فتح خيارات طباعة المتصفح؛ تحقق من الطابعة. لم يتم تأكيد الطباعة.", "Browser print options opened; check the printer. Printing is not confirmed.")}</p>}
    {browserError && <p role="alert" className="text-sm text-destructive">{tc("تعذر فتح الطباعة. تحقق من إعدادات المتصفح وأعد المحاولة.", "Could not open printing. Check browser settings and try again.")}</p>}
  </section>;
}
