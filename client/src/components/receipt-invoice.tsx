import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import type { Order } from "@shared/schema";
import { brand } from "@/lib/brand";
import { useRef, useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { fmtOrderNum, printHtmlInPage, isAndroidDevice } from "@/lib/print-utils";
import { useTranslate } from "@/lib/useTranslate";
import { normalizeReceiptTemplate, type ReceiptSurface } from "@shared/receipt-template";

interface ReceiptInvoiceProps {
  order: Order;
  variant?: "button" | "auto";
  precomputedTrackingQr?: string;
  precomputedZatcaQr?: string;
  surface?: ReceiptSurface;
}

function parseNum(v: any): number {
  const n = parseFloat(String(v || 0));
  return isNaN(n) ? 0 : n;
}

function Sar() {
  return (
    <span style={{ fontWeight: 700, fontFamily: "Arial, sans-serif", fontSize: "0.9em" }}>
      SAR
    </span>
  );
}

export function ReceiptInvoice({ order, variant = "button", precomputedTrackingQr, precomputedZatcaQr, surface = "employee" }: ReceiptInvoiceProps) {
  const tc = useTranslate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const businessConfig = useQuery<any>({ queryKey: ["/api/business-config"] });
  const template = useMemo(
    () => normalizeReceiptTemplate(businessConfig.data?.receiptTemplate),
    [businessConfig.data?.receiptTemplate],
  );
  const customCodes = useMemo(
    () => template.customCodes.filter(code => code.enabled && code.page === surface),
    [template.customCodes, surface],
  );
  const customCodeKey = JSON.stringify(customCodes);
  const [trackingQrUrl, setTrackingQrUrl] = useState<string>(precomputedTrackingQr || "");
  const [zatcaQrUrl, setZatcaQrUrl] = useState<string>(precomputedZatcaQr || "");
  const [customQrUrls, setCustomQrUrls] = useState<Record<string, string>>({});

  const getItemsArray = (): any[] => {
    try {
      if (!order?.items) return [];
      if (Array.isArray(order.items)) return order.items;
      if (typeof order.items === "string") {
        const p = JSON.parse(order.items);
        return Array.isArray(p) ? p : [];
      }
      if (typeof order.items === "object") return Object.values(order.items as any);
      return [];
    } catch { return []; }
  };

  const items = getItemsArray();
  const safeOrder = (order || {}) as any;
  const totalAmount = parseNum(safeOrder.totalAmount);
  const subtotal = totalAmount / 1.15;
  const vat = totalAmount - subtotal;

  // Step 1: Generate QR codes
  useEffect(() => {
    if (!order?.orderNumber) return;
    (async () => {
      try {
        const url = `${window.location.origin}/track/${encodeURIComponent(String(order.orderNumber))}`;
        setTrackingQrUrl(await QRCode.toDataURL(url, { width: 200, margin: 1, errorCorrectionLevel: "M" }));
      } catch {}
      try {
        const payload = btoa(`\x01\x10Elwa\x02\x0F312718675800003\x03\x14${new Date(order.createdAt).toISOString()}\x04\x08${totalAmount.toFixed(2)}\x05\x08${vat.toFixed(2)}`);
        setZatcaQrUrl(await QRCode.toDataURL(payload, { width: 180, margin: 1, errorCorrectionLevel: "M" }));
      } catch {}
    })();
  }, [order?.orderNumber]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(customCodes.map(async code => {
      try {
        return [code.id, await QRCode.toDataURL(code.url, { width: 180, margin: 1, errorCorrectionLevel: "M" })] as const;
      } catch {
        return [code.id, ""] as const;
      }
    })).then(entries => {
      if (!cancelled) setCustomQrUrls(Object.fromEntries(entries.filter(([, url]) => Boolean(url))));
    });
    return () => { cancelled = true; };
  }, [customCodeKey, surface]);

  if (!order?.orderNumber) return null;

  const orderNum = String(order.orderNumber).replace(/\D/g, "").padStart(4, "0");
  const createdAt = new Date(order.createdAt);
  const dateStr = `${createdAt.getDate().toString().padStart(2, "0")}.${(createdAt.getMonth() + 1).toString().padStart(2, "0")}.${createdAt.getFullYear()}`;
  const timeStr = createdAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const orderTypeLabel = (() => {
    const t = safeOrder.deliveryType || safeOrder.orderType || "";
    if (t === "dine_in" || t === "dine-in") return safeOrder.tableNumber ? `محلي — طاولة ${safeOrder.tableNumber}` : "محلي";
    if (t === "takeaway" || t === "pickup") return "سفري";
    if (t === "car_pickup" || t === "car-pickup") return "استلام بالسيارة";
    if (t === "delivery") return "توصيل";
    return "محلي";
  })();

  const paymentLabel = (() => {
    const m = (safeOrder.paymentMethod || "").toLowerCase();
    const sub = (safeOrder.paymentSubMethod || safeOrder.cardBrand || "").toLowerCase();
    if (m === "cash") return "نقدي";
    if (m === "card" || m === "network" || m === "pos" || m === "pos-network") return "شبكة";
    if (m === "loyalty" || m === "qirox-card" || m === "qahwa-card") return "بطاقة ولاء";
    // Apple Pay — detect via method OR sub-method OR gateway sub-method
    if (m === "apple_pay" || m === "neoleap-apple-pay" || m === "paymob-apple-pay" ||
        sub === "apple_pay" || sub === "applepay" || sub.includes("apple")) return "Apple Pay";
    if (m === "geidea") {
      if (sub === "apple_pay" || sub.includes("apple")) return "Apple Pay";
      if (sub === "mada") return "مدى";
      return "بطاقة ائتمان";
    }
    if (m === "paymob" || m === "paymob-card") return "بطاقة ائتمان";
    if (m === "mada" || m === "bank_transfer") return "تحويل بنكي";
    if (m === "rajhi") return "بنك الراجحي";
    if (m === "alinma") return "Alinma Pay";
    if (m === "stc-pay") return "STC Pay";
    if (m === "split") return "نقدي + شبكة";
    if (!m || m === "undefined") return "نقدي";
    return m;
  })();

  const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
  const isCampaign = template.mode === "campaign";
  const sectionCss = Object.entries(template.display)
    .filter(([, visible]) => !visible)
    .map(([key]) => `[data-invoice-section="${key}"]{display:none!important;}`)
    .join("\n");
  const customScale = template.mode === "custom"
    ? template.fontSize === "small" ? 0.92 : template.fontSize === "large" ? 1.1 : 1
    : 1;

  // Build a stand-alone HTML doc by cloning the on-screen invoice — vector text, instant.
  const buildPrintDoc = (): string => {
    const el = invoiceRef.current;
    if (!el) return "";
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.margin = "0 auto";
    return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<title>فاتورة ${order.orderNumber}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { margin: 0; padding: 0; background: #fff; font-family: 'Cairo','Tajawal',Tahoma,Arial,sans-serif; }
  body { padding: 4mm 2mm; }
  img { max-width: 100%; }
</style></head><body>${clone.outerHTML}</body></html>`;
  };

  // ── Pre-rendered hidden print iframe — desktop/iOS only.
  //    On Android we NEVER create a staged iframe because any iframe in the DOM
  //    (even hidden at top:-9999px) causes Android Chrome/WebView to recalculate
  //    the page viewport to match the iframe's narrow paper width, shrinking the
  //    entire UI. Android uses window.print() via printHtmlInPage() instead.
  const printIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [printReady, setPrintReady] = useState(false);

  useEffect(() => {
    // Skip staged iframe on Android — we use the no-iframe path
    if (isAndroidDevice) { setPrintReady(true); return; }
    // Wait until both QR codes are generated before staging the iframe
    if (!trackingQrUrl || !zatcaQrUrl || !invoiceRef.current) return;
    try { printIframeRef.current?.remove(); } catch {}
    printIframeRef.current = null;
    setPrintReady(false);

    let cancelled = false;
    (async () => {
      // Wait for the on-screen invoice images (logo + QR) to actually paint
      const deadline = Date.now() + 4000;
      while (Date.now() < deadline) {
        const el = invoiceRef.current;
        if (!el) return;
        const imgs = Array.from(el.querySelectorAll("img")) as HTMLImageElement[];
        if (imgs.every((i) => i.complete && i.naturalWidth > 0)) break;
        await new Promise((r) => setTimeout(r, 60));
      }
      if (cancelled) return;

      const html = buildPrintDoc();
      if (!html) return;
      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:302px;height:1px;border:none;opacity:0;pointer-events:none;";
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(html);
      doc.close();

      // Wait for iframe images to load, then mark ready
      const innerDeadline = Date.now() + 3000;
      while (Date.now() < innerDeadline) {
        const imgs = Array.from(doc.querySelectorAll("img")) as HTMLImageElement[];
        if (imgs.length === 0 || imgs.every((i) => i.complete && i.naturalWidth > 0)) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      if (cancelled) {
        try { iframe.remove(); } catch {}
        return;
      }
      printIframeRef.current = iframe;
      setPrintReady(true);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingQrUrl, zatcaQrUrl, customQrUrls, customCodeKey, template.mode, sectionCss, surface]);

  // Cleanup the staged iframe on unmount
  useEffect(() => {
    return () => {
      try { printIframeRef.current?.remove(); } catch {}
      printIframeRef.current = null;
    };
  }, []);

  // Print handler:
  //   Android → no-iframe path via printHtmlInPage (avoids viewport shrinkage)
  //   Desktop/iOS → staged iframe for zero-delay synchronous print
  const printReceipt = async (): Promise<void> => {
    const html = buildPrintDoc();
    if (!html) return;

    // Android: inject into main document and call window.print() — no iframe
    if (isAndroidDevice) {
      printHtmlInPage(html, '80mm');
      return;
    }

    // Desktop / iOS: use staged iframe if ready, else build on demand
    const staged = printIframeRef.current;
    if (staged && staged.contentWindow) {
      try { staged.contentWindow.focus(); staged.contentWindow.print(); } catch {}
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:302px;height:1px;border:none;opacity:0;pointer-events:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();
    await new Promise((r) => setTimeout(r, 80));
    try { iframe.contentWindow!.focus(); iframe.contentWindow!.print(); } catch {}
    const cleanup = () => { try { iframe.remove(); } catch {} };
    iframe.contentWindow?.addEventListener("afterprint", cleanup, { once: true });
    setTimeout(cleanup, 8000);
  };

  // Save as PDF — opens the browser's native print dialog where the user picks "Save as PDF".
  const generatePDF = async () => {
    await printReceipt();
  };

  useEffect(() => {
    if (variant !== "auto" || !(order?.id || order?.orderNumber)) return;
    if (!printReady) return;
    // If a hardware thermal printer is configured, printTaxInvoice() already
    // handled printing this receipt.  Firing window.print() here too would:
    //   • produce a duplicate paper receipt for every customer (all devices)
    //   • freeze the POS UI on Android (synchronous window.print() blocks JS)
    // Only fall through to browser print when no thermal printer is configured
    // (i.e., the operator is using a regular desktop printer or "browser" mode).
    const thermalConfigured = (() => {
      try {
        const stored = localStorage.getItem('printerSettings');
        if (!stored) return false;
        const ps = JSON.parse(stored);
        return Boolean(ps.enabled && ps.mode && ps.mode !== 'browser');
      } catch { return false; }
    })();
    if (thermalConfigured) return;
    // On Android WebView, window.print() blocks the entire JS thread
    // synchronously — NEVER call it automatically. The thermal printer is
    // the only non-blocking print path on Android.  If thermal is not
    // configured, the cashier must press the print button manually or
    // configure a thermal printer in settings.
    if (isAndroidDevice) return;
    const t = setTimeout(() => { printReceipt(); }, 50);
    return () => clearTimeout(t);
  }, [variant, order?.id, order?.orderNumber, printReady]);

  /* ─── style helpers ─── */
  const cell = (extra?: React.CSSProperties): React.CSSProperties => ({ padding: "3px 0", fontSize: "13px", lineHeight: "1.7", ...extra });
  const bold = (extra?: React.CSSProperties): React.CSSProperties => ({ fontWeight: 700, ...extra });
  const dash = (): React.CSSProperties => ({ borderTop: "1px dashed #aaa", margin: "10px 0" });

  return (
    <div className="space-y-4">
      <div
        ref={invoiceRef}
        data-testid="invoice-preview"
        data-receipt-mode={template.mode}
        style={{
          direction: "rtl",
          fontFamily: "'Cairo', 'Tajawal', Tahoma, Arial, sans-serif",
          background: "#fff",
          color: "#000",
          width: "300px",
          margin: "0 auto",
          padding: "0",
          fontSize: template.mode === "custom" ? `${13 * customScale}px` : "13px",
          lineHeight: 1.5,
          fontWeight: 700,
        }}
      >
        {sectionCss && <style>{sectionCss}</style>}
        {/* ── top spacing ── */}
        <div style={{ height: isCampaign ? 0 : "20px" }} />

        {isCampaign && (
          <img
            src="/invoice-campaign-header.png"
            alt="بالغوا بالدفاع عن وطنكم"
            className="invoice-campaign-header"
            style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
          />
        )}

        {/* ── 1. Order number ── */}
        <div data-invoice-section="orderNumber" style={{ textAlign: "center", fontWeight: 900, fontSize: isCampaign ? "26px" : "22px", letterSpacing: "2px", padding: isCampaign ? "2px 0 6px" : "10px 0 6px" }}>
          #{orderNum}
        </div>

        {/* ── 2. Logo ── */}
        {!isCampaign && (
          <div data-invoice-section="logo" style={{ padding: "6px 0 10px", marginBottom: "4px" }}>
            <img
              src="/elwa-invoice-logo.png?v=4"
              alt="Elwa"
              crossOrigin="anonymous"
              style={{ width: "200px", height: "auto", display: "block", margin: "0 auto" }}
            />
          </div>
        )}

        {/* ── 3. Business info ── */}
        <div style={{ textAlign: "center", fontSize: "12px", lineHeight: "1.9", marginBottom: "8px" }}>
          <div data-invoice-section="businessDetails" style={{ fontWeight: 900, fontSize: "15px" }}>Elwa</div>
          <div data-invoice-section="branchInfo" style={{ fontSize: "11px", color: "#444" }}>حي المروج، طريق الأمير مقرن</div>
          <div data-invoice-section="legalInfo" style={{ direction: "ltr", fontSize: "11px", color: "#444" }}>الرقم الضريبي: 312718675800003</div>
          <div data-invoice-section="legalInfo" style={{ fontSize: "11px", color: "#444" }}>101000004295 :رقم الفاتورة</div>
          <div data-invoice-section="date" style={{ direction: "ltr", fontSize: "11px", color: "#444" }}>{timeStr} · {dateStr}</div>
          <div data-invoice-section="orderType" style={{ fontWeight: 700, fontSize: "13px", marginTop: "3px", background: template.mode === "custom" ? `${template.accentColor}18` : "#f0f0f0", padding: "2px 8px", display: "inline-block", borderRadius: "4px" }}>
            {orderTypeLabel}
          </div>
        </div>

        {/* ── 4. Cashier ── */}
        {safeOrder.employeeName && (
          <div data-invoice-section="cashier" style={{ textAlign: "center", fontSize: "11px", color: "#555", marginBottom: "4px" }}>
            الكاشير: <strong>{safeOrder.employeeName}</strong>
          </div>
        )}

        {/* ── 5. Items header ── */}
        <div data-invoice-section="items" style={dash()} />
        <div data-invoice-section="items" style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#555", fontWeight: 700, padding: "2px 0 3px" }}>
          <span>السعر</span>
          <span>المنتج</span>
        </div>
        <div data-invoice-section="items" style={dash()} />

        {/* ── 6. Items list (bilingual) ── */}
        {items.map((item: any, idx: number) => {
          const nameAr = item.nameAr || item.coffeeItem?.nameAr || item.name || "";
          const nameEn = item.nameEn || item.coffeeItem?.nameEn || "";
          const qty = item.quantity || 1;
          const unitPrice = parseNum(item.price ?? item.coffeeItem?.price ?? 0);
          const lineTotal = unitPrice * qty;
          const selectedSize = item.selectedSize || item.coffeeItem?.selectedSize || "";
          const addons: string[] = item.customization?.selectedItemAddons?.map((a: any) => a.nameAr).filter(Boolean) || [];
          return (
            <div key={idx} data-invoice-section="items" style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", ...cell() }}>
                <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "11px", flexShrink: 0, whiteSpace: "nowrap" }}>
                  SAR {lineTotal.toFixed(2)}
                </span>
                <div style={{ textAlign: "right", paddingRight: "6px" }}>
                  <div style={{ fontWeight: 700 }}>{qty}× {nameAr}</div>
                  {nameEn ? <div style={{ fontSize: "11px", color: "#666", direction: "ltr", textAlign: "right" }}>{nameEn}</div> : null}
                  {selectedSize ? <div style={{ fontSize: "11px", color: "#555" }}>الحجم: {selectedSize}</div> : null}
                  {addons.map((a, i) => <div key={i} style={{ fontSize: "11px", color: "#555" }}>+ {a}</div>)}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── 7. Item count ── */}
        <div data-invoice-section="itemCount" style={dash()} />
        <div data-invoice-section="itemCount" style={{ textAlign: "center", fontSize: "11px", color: "#333", padding: "2px 0" }}>
          عدد المنتجات: {totalQty}
        </div>
        <div data-invoice-section="itemCount" style={dash()} />

        {/* ── 8. Totals ── */}
        {[
          { label: "المجموع الفرعي", value: subtotal.toFixed(2) },
          { label: "ضريبة القيمة المضافة (15%)", value: vat.toFixed(2) },
        ].map(({ label, value }) => (
          <div key={label} data-invoice-section="totals" style={{ display: "flex", justifyContent: "space-between", ...cell({ fontSize: "12px" }) }}>
            <span style={{ fontFamily: "Arial, sans-serif" }}>SAR {value}</span>
            <span>{label}</span>
          </div>
        ))}

        {/* Grand total */}
        <div data-invoice-section="totals" style={{ display: "flex", justifyContent: "space-between", ...cell(bold({ fontSize: "16px", borderTop: `2px solid ${template.mode === "custom" ? template.accentColor : "#000"}`, paddingTop: "8px", marginTop: "10px" })) }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 900 }}>SAR {totalAmount.toFixed(2)}</span>
          <span>المجموع الكلي</span>
        </div>

        {/* Payment method */}
        <div data-invoice-section="payment" style={{ display: "flex", justifyContent: "space-between", ...cell({ fontSize: "12px", paddingTop: "4px" }) }}>
          <span style={{ fontFamily: "Arial, sans-serif" }}>SAR {totalAmount.toFixed(2)}</span>
          <span>طريقة الدفع: {paymentLabel}</span>
        </div>

        <div data-invoice-section="notes" style={dash()} />

        {/* ── 8b. ملاحظات العميل ── */}
        {(() => {
          let notesText = safeOrder.notes;
          if (!notesText) return null;
          // Guard: if notes was accidentally stored as an object, stringify it safely
          if (typeof notesText === "object") {
            try { notesText = JSON.stringify(notesText); } catch { notesText = ""; }
          }
          notesText = String(notesText).trim();
          if (!notesText) return null;
          return (
            <div data-invoice-section="notes" style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "6px", padding: "8px 10px", margin: "4px 0 8px", fontSize: "12px", lineHeight: "1.9", direction: "rtl", textAlign: "right" }}>
              <div style={{ fontWeight: 900, color: "#92400e", marginBottom: "3px" }}>📝 ملاحظات العميل:</div>
              <div style={{ color: "#78350f", fontWeight: 700, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'Cairo', 'Tajawal', Tahoma, Arial, sans-serif" }}>
                {notesText}
              </div>
            </div>
          );
        })()}

        {/* ── 9. Tagline ── */}
        <div data-invoice-section="tagline" style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, padding: "2px 0 4px" }}>
          "قهوة تُقال .. وورد يُهدى"
        </div>
        <div data-invoice-section="tagline" style={{ textAlign: "center", fontSize: "11px", color: "#555", paddingBottom: "8px" }}>Elwa</div>

        {/* ── 10. Tracking QR barcode — small on right with text beside it ── */}
        {trackingQrUrl && (
          <div data-invoice-section="trackingBarcode" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", padding: "6px 4px 4px", direction: "rtl" }}>
            <img src={trackingQrUrl} alt="Tracking QR" style={{ width: "52px", height: "52px", flexShrink: 0 }} />
            <div style={{ textAlign: "right", lineHeight: "1.7" }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: "#111" }}>باركود تتبع الطلب</div>
              <div style={{ fontSize: "10px", color: "#555" }}>امسح لتتبع طلبك</div>
              <div style={{ fontSize: "10px", color: "#555" }}>وتسجيل الدخول</div>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />

        {/* ── 11. ZATCA QR barcode ── */}
        {zatcaQrUrl && (
          <div style={{ textAlign: "center", padding: "6px 0 10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#111", marginBottom: "6px" }}>
              الفاتورة الضريبية
            </div>
            <img src={zatcaQrUrl} alt="ZATCA QR" style={{ width: "144px", height: "144px", display: "inline-block" }} />
            <div style={{ fontSize: "10px", color: "#555", marginTop: "4px", fontFamily: "Arial, sans-serif" }}>
              فاتورة ضريبية — الرقم الضريبي: 312718675800003
            </div>
          </div>
        )}

        {customCodes.map(code => customQrUrls[code.id] && (
          <div key={code.id} style={{ textAlign: "center", padding: "6px 0 10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 900, marginBottom: "4px" }}>{code.label}</div>
            <img src={customQrUrls[code.id]} alt="" style={{ width: "100px", height: "100px", display: "inline-block" }} />
          </div>
        ))}

        <div data-invoice-section="thankYou" style={{ textAlign: "center", fontSize: "12px", fontWeight: 700, padding: "2px 0 8px" }}>
          <div>شكراً لزيارتكم</div>
          <div style={{ fontSize: "10px", fontWeight: 400, color: "#555" }}>Thank you for visiting us</div>
        </div>

        {/* ── 12. Powered by ── */}
        <div data-invoice-section="poweredBy" style={{ borderTop: "1px dashed #ccc", textAlign: "center", padding: "10px 0", marginTop: "4px", fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#555", letterSpacing: "0.3px" }}>
          Powered by QIROX STUDIO
        </div>

        <div style={{ height: "16px" }} />
      </div>

      {/* ─── Action Buttons ─── */}
      {variant === "button" && (
        <div className="flex gap-2 w-full no-print">
          <Button onClick={printReceipt} className="flex-1 bg-primary hover:bg-primary/90" data-testid="button-print-invoice">
            <Printer className="ml-2 h-4 w-4" />
            {tc("طباعة الفاتورة", "Print Invoice")}
          </Button>
          <Button onClick={generatePDF} variant="outline" className="flex-1" data-testid="button-download-invoice">
            <Download className="ml-2 h-4 w-4" />
            {tc("حفظ PDF", "Save PDF")}
          </Button>
        </div>
      )}
    </div>
  );
}
