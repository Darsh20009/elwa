export interface PosWhatsappDelivery {
  ok: boolean;
  provider: "QIROX";
  delivery: {
    customer: "sent" | "failed";
    receiver: "sent" | "failed";
  };
  invoicePdfAttached: boolean;
}

export async function sendPosOrderWhatsApp(orderNumber: string): Promise<PosWhatsappDelivery> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/send-whatsapp`, {
    method: "POST",
    credentials: "include",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.error || "تعذر إرسال رسائل واتساب عبر QIROX");
  }
  return result as PosWhatsappDelivery;
}
