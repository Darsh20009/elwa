import { apiRequest } from "@/lib/queryClient";

export interface PosWhatsappDelivery {
  ok: boolean;
  provider: "QIROX";
  delivery: {
    customer: "sent" | "failed" | "skipped";
    receiver: "sent" | "failed" | "skipped";
  };
  invoicePdfAttached: boolean;
}

export async function sendPosOrderWhatsApp(orderNumber: string): Promise<PosWhatsappDelivery> {
  const response = await apiRequest("POST", `/api/orders/${encodeURIComponent(orderNumber)}/send-whatsapp`);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.error || "تعذر إرسال رسائل واتساب عبر QIROX");
  }
  return result as PosWhatsappDelivery;
}
