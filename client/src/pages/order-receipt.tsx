import { useParams, useLocation } from "wouter";
import { ArrowRight, ArrowLeft, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SecureReceiptPrint from "@/components/secure-receipt-print";
import { useTranslate } from "@/lib/useTranslate";
import { brand } from "@/lib/brand";

export default function OrderReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const tc = useTranslate();
  const { i18n } = useTranslation();
  const rtl = i18n.language !== "en";
  return <main className="min-h-[100dvh] bg-muted/20 px-4 py-6" dir={rtl ? "rtl" : "ltr"} data-testid="page-order-receipt">
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => { if (window.history.length > 1) window.history.back(); else setLocation("/employee/orders"); }}>
          {rtl ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}{tc("رجوع", "Back")}
        </Button>
        <span className="text-sm font-bold text-primary">{tc(brand.nameAr, brand.nameEn)}</span>
      </div>
      <Card className="overflow-hidden border-primary/15">
        <div className="flex items-center gap-3 border-b bg-primary/5 p-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">{tc("فاتورة الطلب", "Order receipt")}</h1>
        </div>
        <div className="p-4"><SecureReceiptPrint key={id} orderId={id} /></div>
      </Card>
    </div>
  </main>;
}
