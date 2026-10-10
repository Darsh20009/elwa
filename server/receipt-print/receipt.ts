import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import QRCode from "qrcode";

export const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]!));
const amount = (v: unknown) => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v).toFixed(2) : "—";

/** Totals below are saved values only. No VAT assumptions or inferred payment state. */
export function receiptHtml(order: any, business: any, width: 58 | 80, assets: { logo?: string; qr?: string } = {}, reprint = false) {
  if (![58, 80].includes(width)) throw new Error("Unsupported paper width");
  if (!Number.isFinite(Number(order.totalAmount)) || order.totalAmount == null) throw new Error("Invoice total missing");
  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  if (!Array.isArray(items) || !items.length || items.length > 200) throw new Error("Invalid invoice items");
  const e = escapeHtml;
  const safeImage = (s?: string) => s && /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(s) ? s : "";
  const rows = items.map((item: any) => {
    const name = item.coffeeItem?.nameAr || item.nameAr || item.name || item.productName || "—";
    const en = item.coffeeItem?.nameEn || item.nameEn || "";
    const price = item.unitPrice ?? item.price ?? item.coffeeItem?.price;
    return `<tr><td>${e(name)}${en ? `<small dir="ltr">${e(en)}</small>` : ""}</td><td>${e(item.quantity)}</td><td dir="ltr">${amount(price)}</td></tr>`;
  }).join("");
  const summary = [
    ["المجموع الفرعي / Subtotal", order.subtotal],
    ["الخصم / Discount", order.discountAmount],
    ["الضريبة / Tax", order.tax],
    ["التوصيل / Delivery", order.deliveryFee],
    ["الإجمالي / Total", order.totalAmount],
  ].filter(([, value]) => value !== undefined && value !== null);
  let date = "—";
  if (order.createdAt && !Number.isNaN(new Date(order.createdAt).getTime())) {
    date = new Date(order.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Riyadh" });
  }
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Receipt ${e(order.orderNumber)}</title>
<style>
@page { size: ${width}mm auto; margin: 0; }
* { box-sizing: border-box; } html,body { margin:0; background:white; color:black; }
body { width:${width}mm; padding:3mm; font:12px Arial,"Noto Sans Arabic",sans-serif; line-height:1.65; overflow-wrap:anywhere; }
header,footer { text-align:center; } h1 { font-size:17px; margin:4px 0; } p { margin:3px 0; }
img.logo { max-width:24mm; max-height:22mm; object-fit:contain; } img.qr { width:27mm; height:27mm; }
table { width:100%; border-collapse:collapse; margin:10px 0; } td,th { text-align:start; vertical-align:top; padding:4px 1px; border-bottom:1px dashed #888; }
td:first-child { width:60%; } small { display:block; font-size:10px; }
.summary { display:flex; justify-content:space-between; gap:8px; } .total { font-weight:bold; font-size:15px; border-top:1px solid; }
@media print { nav,button,aside { display:none!important; } body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } tr { break-inside:avoid; } }
</style></head><body>
<header>${safeImage(assets.logo) ? `<img class="logo" src="${safeImage(assets.logo)}" alt="">` : ""}
<h1>${e(business.tradeNameAr || business.businessName || "Elwa / إلوة")}</h1>
${business.tradeNameEn ? `<p dir="ltr">${e(business.tradeNameEn)}</p>` : ""}
${business.vatNumber ? `<p>الرقم الضريبي / VAT: ${e(business.vatNumber)}</p>` : ""}
${business.commercialRegistration ? `<p>السجل التجاري / CR: ${e(business.commercialRegistration)}</p>` : ""}
<p>إيصال / Receipt: <b dir="ltr">${e(order.orderNumber)}</b></p><p dir="ltr">${e(date)}</p>
${reprint ? "<b>إعادة طباعة / REPRINT</b>" : ""}</header>
${order.customerName ? `<p>العميل / Customer: ${e(order.customerName)}</p>` : ""}
<table><thead><tr><th>الصنف / Item</th><th>العدد / Qty</th><th>سعر الوحدة / Unit</th></tr></thead><tbody>${rows}</tbody></table>
${summary.map(([label, value], i) => `<div class="summary ${i === summary.length - 1 ? "total" : ""}"><span>${label}</span><span dir="ltr">${amount(value)} ${e(business.currency || "SAR")}</span></div>`).join("")}
<p>طريقة الدفع / Payment: ${e(order.paymentMethod || "غير مسجلة / Not recorded")}</p>
<p>حالة الدفع / Status: ${e(order.paymentStatus || "غير مسجلة / Not recorded")}</p>
<footer>${safeImage(assets.qr) ? `<img class="qr" src="${safeImage(assets.qr)}" alt="Tax QR">` : ""}<p>شكراً لزيارتكم / Thank you</p></footer>
</body></html>`;
}

export async function renderReceipt(order: any, business: any, width: 58 | 80, reprint = false) {
  let logo: string | undefined;
  try {
    logo = `data:image/png;base64,${(await readFile(resolve("public/elwa-invoice-logo.png"))).toString("base64")}`;
  } catch { /* Text identity remains; never fetch arbitrary database URLs. */ }
  let qr: string | undefined;
  if (business.vatNumber && order.tax != null && order.createdAt && business.tradeNameAr) {
    const fields = [business.tradeNameAr, business.vatNumber, new Date(order.createdAt).toISOString(), amount(order.totalAmount), amount(order.tax)];
    const buffers = fields.map((value, index) => {
      const text = Buffer.from(String(value), "utf8");
      if (text.length > 255) throw new Error("Tax QR field too long");
      return Buffer.concat([Buffer.from([index + 1, text.length]), text]);
    });
    qr = await QRCode.toDataURL(Buffer.concat(buffers).toString("base64"), { margin: 1, width: 140 });
  }
  return receiptHtml(order, business, width, { logo, qr }, reprint);
}
