import test from "node:test";
import assert from "node:assert/strict";
import {
  createPosInvoicePdf,
  createPosInvoiceToken,
  verifyPosInvoiceToken,
} from "../server/pos-invoice-pdf";

test("POS invoice links are signed, expire, and reject altered tokens", () => {
  process.env.SESSION_SECRET = "test-session-secret-with-at-least-thirty-two-characters";
  const token = createPosInvoiceToken("POS-1024", "elwa-tenant", 1_800_000_000_000);
  const decoded = verifyPosInvoiceToken(token, 1_800_000_001_000);
  assert.equal(decoded?.orderNumber, "POS-1024");
  assert.equal(decoded?.tenantId, "elwa-tenant");
  assert.equal(verifyPosInvoiceToken(token, 1_800_000_901_000), null);
  assert.equal(verifyPosInvoiceToken(`${token}x`, 1_800_000_001_000), null);
});

test("POS invoice PDF renders order details and returns PDF bytes", async () => {
  const pdf = await createPosInvoicePdf({
    orderNumber: "POS-1024",
    createdAt: new Date("2026-10-12T10:30:00.000Z"),
    items: [{ nameAr: "قهوة عربية", quantity: 2, totalPrice: 24 }],
    subtotal: 20.87,
    tax: 3.13,
    totalAmount: 24,
    paymentMethod: "cash",
  }, {
    tradeNameAr: "إلوة",
    vatNumber: "312718675800003",
    commercialRegistration: "4030534754",
    vatPercentage: 15,
  });

  assert.ok(pdf.length > 1_000);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
});
