import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

type InvoicePayload = {
  orderNumber: string;
  tenantId: string;
  expiresAt: number;
};

const TOKEN_TTL_MS = 15 * 60 * 1000;
const fontPath = path.join(process.cwd(), "server/assets/DejaVuSans.ttf");

function signingSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Invoice signing is not configured");
  return secret;
}

export function createPosInvoiceToken(orderNumber: string, tenantId: string, now = Date.now()) {
  if (!orderNumber || !tenantId) throw new Error("Invoice token requires an order and tenant");
  const payload: InvoicePayload = { orderNumber, tenantId, expiresAt: now + TOKEN_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", signingSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyPosInvoiceToken(token: unknown, now = Date.now()): InvoicePayload | null {
  if (typeof token !== "string" || token.length > 2048) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = crypto.createHmac("sha256", signingSecret()).update(encoded).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, "base64url");
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as InvoicePayload;
    if (
      !payload ||
      typeof payload.orderNumber !== "string" ||
      typeof payload.tenantId !== "string" ||
      !Number.isSafeInteger(payload.expiresAt) ||
      payload.expiresAt <= now ||
      payload.expiresAt > now + TOKEN_TTL_MS + 60_000
    ) return null;
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createPosInvoiceUrl(orderNumber: string, tenantId: string) {
  const base = new URL(process.env.PUBLIC_APP_URL || "https://elwa.site");
  if (base.protocol !== "https:" || base.username || base.password) {
    throw new Error("A public HTTPS app URL is required for QIROX invoice attachments");
  }
  const token = createPosInvoiceToken(orderNumber, tenantId);
  const url = new URL("/api/public/pos-invoice.pdf", base);
  url.searchParams.set("token", token);
  return url.href;
}

function parseItems(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function money(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function addTlv(tag: number, value: string) {
  const bytes = Buffer.from(value, "utf8");
  return Buffer.concat([Buffer.from([tag, bytes.length]), bytes]);
}

export async function createPosInvoicePdf(order: any, business: any): Promise<Buffer> {
  if (!fs.existsSync(fontPath)) throw new Error("Arabic invoice font asset is missing");
  const total = money(order.totalAmount);
  const taxRate = Number.isFinite(Number(business?.vatPercentage)) ? Number(business.vatPercentage) : 15;
  const subtotal = Number.isFinite(Number(order.subtotal)) ? money(order.subtotal) : total / (1 + taxRate / 100);
  const tax = Number.isFinite(Number(order.tax)) ? money(order.tax) : Math.max(0, total - subtotal);
  const doc = new PDFDocument({ size: "A4", margins: { top: 42, right: 42, bottom: 42, left: 42 }, compress: true });
  const chunks: Buffer[] = [];
  const completed = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", chunk => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.font(fontPath);

  const logoPath = path.join(process.cwd(), "public/elwa-invoice-logo.png");
  if (fs.existsSync(logoPath)) {
    try { doc.image(logoPath, 245, 40, { fit: [105, 65], align: "center" }); } catch {}
  }
  doc.moveDown(5);
  doc.fontSize(20).fillColor("#1f2d2e").text(business?.tradeNameAr || "إلوة", { align: "center", features: ["rtla"] } as any);
  doc.moveDown(0.4);
  doc.fontSize(14).text(business?.vatNumber ? "فاتورة ضريبية مبسطة" : "فاتورة مبيعات", { align: "center", features: ["rtla"] } as any);
  doc.moveDown(1);

  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  const right = doc.page.width - doc.page.margins.right;
  const left = doc.page.margins.left;
  const drawInfoRow = (label: string, value: string) => {
    const y = doc.y;
    doc.fontSize(10).text(label, right - 160, y, { width: 150, align: "right", features: ["rtla"] } as any);
    doc.fontSize(10).text(value, left, y, { width: 240, align: "left" });
    doc.moveDown(1.4);
  };
  drawInfoRow("رقم الفاتورة", String(order.orderNumber || "").slice(0, 80));
  if (!Number.isNaN(date.getTime())) drawInfoRow("التاريخ", date.toISOString().slice(0, 16).replace("T", " "));
  if (business?.vatNumber) drawInfoRow("الرقم الضريبي", String(business.vatNumber).slice(0, 40));
  drawInfoRow("السجل التجاري", String(business?.commercialRegistration || "4030534754").slice(0, 40));
  doc.moveDown(0.2);
  doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#9fb2b3").stroke();
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#536263")
    .text("الصنف", right - 230, doc.y, { width: 220, align: "right", features: ["rtla"] } as any)
    .text("الكمية", right - 310, doc.y, { width: 70, align: "center" })
    .text("المبلغ", left, doc.y, { width: 100, align: "left" });
  doc.moveDown(1);
  doc.fillColor("#1f2d2e");

  const items = parseItems(order.items).slice(0, 100);
  for (const item of items) {
    if (doc.y > doc.page.height - 105) doc.addPage();
    const name = String(item?.nameAr || item?.name || item?.productName || item?.title || item?.coffeeItem?.nameAr || "صنف").slice(0, 100);
    const quantity = money(item?.quantity ?? item?.qty ?? 1);
    const lineAmount = Number(item?.totalPrice ?? item?.lineTotal ?? item?.amount);
    const amount = Number.isFinite(lineAmount) ? lineAmount : money(item?.unitPrice ?? item?.price) * quantity;
    const rowY = doc.y;
    doc.fontSize(10).text(name, right - 230, rowY, { width: 220, align: "right", features: ["rtla"] } as any)
      .text(String(quantity), right - 310, rowY, { width: 70, align: "center" })
      .text(amount.toFixed(2), left, rowY, { width: 100, align: "left" });
    doc.moveDown(1.4);
    doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#e2e6e6").stroke();
    doc.moveDown(0.35);
  }

  if (doc.y > doc.page.height - 190) doc.addPage();
  const drawTotalRow = (label: string, value: string, size = 11, color = "#1f2d2e") => {
    const y = doc.y;
    doc.fontSize(size).fillColor(color).text(label, right - 220, y, { width: 210, align: "right", features: ["rtla"] } as any);
    doc.fontSize(size).fillColor(color).text(value, left, y, { width: 150, align: "left" });
    doc.moveDown(size > 12 ? 1.8 : 1.5);
  };
  doc.moveDown(0.5);
  drawTotalRow("المجموع قبل الضريبة — ريال سعودي", subtotal.toFixed(2));
  drawTotalRow("ضريبة القيمة المضافة — ريال سعودي", tax.toFixed(2));
  drawTotalRow("الإجمالي — ريال سعودي", total.toFixed(2), 15, "#6e8a8b");
  const paymentLabels: Record<string, string> = {
    cash: "نقدي", pos: "شبكة", card: "بطاقة", network: "شبكة",
    "pos-network": "شبكة", apple_pay: "Apple Pay", mada: "مدى",
    "bank_transfer": "تحويل بنكي", "qahwa-card": "بطاقة ولاء",
  };
  const payment = String(order.paymentMethod || "").toLowerCase();
  drawInfoRow("طريقة الدفع", paymentLabels[payment] || "غير محدد");

  if (business?.vatNumber) {
    const qrPayload = Buffer.concat([
      addTlv(1, String(business.tradeNameAr || "إلوة")),
      addTlv(2, String(business.vatNumber)),
      addTlv(3, date.toISOString()),
      addTlv(4, total.toFixed(2)),
      addTlv(5, tax.toFixed(2)),
    ]).toString("base64");
    const qr = await QRCode.toBuffer(qrPayload, { type: "png", width: 128, margin: 1, errorCorrectionLevel: "M" });
    if (doc.y > doc.page.height - 160) doc.addPage();
    doc.moveDown(1).image(qr, doc.page.margins.left + 10, doc.y, { fit: [100, 100] });
  }

  doc.end();
  return completed;
}
