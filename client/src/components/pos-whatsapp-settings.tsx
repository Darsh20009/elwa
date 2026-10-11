import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Loader2, Save } from "lucide-react";
import { useTranslate } from "@/lib/useTranslate";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReceiverResponse {
  receiverNumber: string;
}

export default function PosWhatsappSettings({ canEdit }: { canEdit: boolean }) {
  const tc = useTranslate();
  const { toast } = useToast();
  const [receiverNumber, setReceiverNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const { data, isLoading } = useQuery<ReceiverResponse>({
    queryKey: ["/api/pos/whatsapp-receiver"],
    enabled: canEdit,
    staleTime: 300_000,
  });

  useEffect(() => {
    if (data) setReceiverNumber(data.receiverNumber || "");
  }, [data]);

  if (!canEdit) return null;

  const saveReceiver = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/pos/whatsapp-receiver", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverNumber }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || tc("تعذر حفظ الرقم", "Could not save the number"));
      setReceiverNumber(result.receiverNumber || "");
      queryClient.setQueryData(["/api/pos/whatsapp-receiver"], result);
      toast({
        title: tc("تم حفظ رقم استقبال الطلبات", "Order receiver number saved"),
      });
    } catch (error) {
      toast({
        title: tc("تعذر حفظ رقم واتساب", "Could not save WhatsApp number"),
        description: error instanceof Error ? error.message : tc("تحقق من الرقم وحاول مجدداً", "Check the number and try again"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-md border p-3" data-testid="pos-whatsapp-receiver-settings">
      <Label htmlFor="pos-whatsapp-receiver" className="flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="h-4 w-4" />
        {tc("رقم واتساب لاستقبال طلبات POS", "WhatsApp number for POS orders")}
      </Label>
      <div className="flex gap-2">
        <Input
          id="pos-whatsapp-receiver"
          type="tel"
          inputMode="tel"
          dir="ltr"
          value={receiverNumber}
          onChange={(event) => setReceiverNumber(event.target.value)}
          placeholder="05xxxxxxxx أو +9665xxxxxxxx"
          disabled={isLoading || saving}
          data-testid="input-pos-whatsapp-receiver"
        />
        <Button type="button" onClick={saveReceiver} disabled={isLoading || saving} data-testid="button-save-pos-whatsapp-receiver">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="sr-only">{tc("حفظ", "Save")}</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {tc("يرسل QIROX تفاصيل كل طلب POS إلى هذا الرقم. تغييره متاح للمالك أو المدير فقط.", "QIROX sends POS order details to this number. Only the owner or admin can change it.")}
      </p>
    </div>
  );
}
