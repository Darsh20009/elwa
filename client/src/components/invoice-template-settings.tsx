import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Link2, Plus, Save, Trash2 } from "lucide-react";
import {
  normalizeReceiptTemplate,
  receiptDisplayKeys,
  receiptTemplateSchema,
  type ReceiptCustomCode,
  type ReceiptDisplayKey,
  type ReceiptTemplateConfig,
} from "@shared/receipt-template";
import { useTranslate } from "@/lib/useTranslate";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const templateOptions = [
  { value: "default", ar: "الشكل الحالي", en: "Current design" },
  { value: "campaign", ar: "الدفاع عن الوطن", en: "Defend the homeland" },
  { value: "custom", ar: "مخصص", en: "Custom" },
] as const;

const displayOptions: Array<{ key: ReceiptDisplayKey; ar: string; en: string }> = [
  { key: "orderNumber", ar: "رقم الطلب", en: "Order number" },
  { key: "logo", ar: "شعار المنشأة", en: "Business logo" },
  { key: "businessDetails", ar: "اسم المنشأة", en: "Business name" },
  { key: "branchInfo", ar: "معلومات الفرع", en: "Branch details" },
  { key: "legalInfo", ar: "البيانات الضريبية والسجل", en: "Tax and registration details" },
  { key: "cashier", ar: "اسم الكاشير", en: "Cashier name" },
  { key: "customer", ar: "بيانات العميل", en: "Customer details" },
  { key: "date", ar: "التاريخ والوقت", en: "Date and time" },
  { key: "orderType", ar: "نوع الطلب", en: "Order type" },
  { key: "items", ar: "الأصناف", en: "Order items" },
  { key: "itemCount", ar: "عدد المنتجات", en: "Item count" },
  { key: "totals", ar: "المجاميع والضريبة", en: "Totals and tax" },
  { key: "payment", ar: "طريقة الدفع", en: "Payment method" },
  { key: "notes", ar: "ملاحظات العميل", en: "Customer notes" },
  { key: "trackingBarcode", ar: "باركود رقم الطلب والتتبع", en: "Order number and tracking codes" },
  { key: "tagline", ar: "عبارة المنشأة", en: "Business tagline" },
  { key: "thankYou", ar: "رسالة الشكر", en: "Thank-you message" },
  { key: "poweredBy", ar: "عبارة أسفل الفاتورة", en: "Receipt footer" },
];

const pageNames = {
  customer: ["طلباتي للعميل", "Customer order page"],
  employee: ["طلبات الموظفين ونقاط البيع", "Employee orders and POS"],
  thermal: ["الإيصال الحراري", "Thermal receipt"],
} as const;

export default function InvoiceTemplateSettings() {
  const tc = useTranslate();
  const { toast } = useToast();
  const config = useQuery<any>({ queryKey: ["/api/business-config"] });
  const [draft, setDraft] = useState<ReceiptTemplateConfig | null>(null);

  useEffect(() => {
    if (config.data) setDraft(normalizeReceiptTemplate(config.data.receiptTemplate));
  }, [config.data]);

  const saveMutation = useMutation({
    mutationFn: async (receiptTemplate: ReceiptTemplateConfig) => {
      const response = await apiRequest("PATCH", "/api/business-config", { receiptTemplate });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-config"] });
      toast({ title: tc("تم حفظ تصميم الفاتورة", "Invoice design saved") });
    },
    onError: () => toast({
      title: tc("تعذر الحفظ", "Could not save"),
      description: tc("تحقق من رابط الباركود ثم حاول مرة أخرى.", "Check the barcode link and try again."),
      variant: "destructive",
    }),
  });

  const template = draft || normalizeReceiptTemplate(config.data?.receiptTemplate);
  const valid = useMemo(() => receiptTemplateSchema.safeParse(template).success, [template]);

  function updateTemplate(patch: Partial<ReceiptTemplateConfig>) {
    setDraft(previous => ({ ...normalizeReceiptTemplate(previous), ...patch }));
  }
  function updateDisplay(key: ReceiptDisplayKey, checked: boolean) {
    setDraft(previous => {
      const current = normalizeReceiptTemplate(previous);
      return { ...current, display: { ...current.display, [key]: checked } };
    });
  }
  function updateCode(id: string, patch: Partial<ReceiptCustomCode>) {
    setDraft(previous => {
      const current = normalizeReceiptTemplate(previous);
      return { ...current, customCodes: current.customCodes.map(code => code.id === id ? { ...code, ...patch } : code) };
    });
  }
  function addCode() {
    if (template.customCodes.length >= 4) return;
    const id = globalThis.crypto?.randomUUID?.() || `code-${Date.now()}`;
    updateTemplate({
      customCodes: [...template.customCodes, {
        id,
        enabled: true,
        label: tc("رابط جديد", "New link"),
        url: "",
        page: "thermal",
      }],
    });
  }

  const campaign = template.mode === "campaign";
  return (
    <Card className="border-primary/20" dir="rtl" data-testid="invoice-template-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-primary" />
          {tc("تصميم الفاتورة والإيصال", "Invoice and receipt design")}
        </CardTitle>
        <CardDescription>
          {tc("اختر القالب، ثم تحكم في العناصر والروابط التي تظهر على كل صفحة.", "Choose a design, then control which elements and links appear on each page.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {config.isLoading && <p role="status" className="text-sm text-muted-foreground">{tc("جارٍ تحميل الإعدادات…", "Loading settings…")}</p>}
        {config.error && <p role="alert" className="text-sm text-destructive">{tc("تعذر تحميل إعدادات الفاتورة.", "Could not load invoice settings.")}</p>}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label={tc("قالب الفاتورة", "Invoice template")}>
          {templateOptions.map(option => (
            <Button
              key={option.value}
              type="button"
              variant={template.mode === option.value ? "default" : "outline"}
              className="min-h-12 justify-between whitespace-normal"
              aria-pressed={template.mode === option.value}
              data-testid={`invoice-template-${option.value}`}
              onClick={() => updateTemplate({ mode: option.value })}
            >
              <span>{tc(option.ar, option.en)}</span>
              {template.mode === option.value && <Check className="h-4 w-4 shrink-0" />}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-4">
            <section className="rounded-xl border p-4">
              <h3 className="font-bold">{tc("إظهار وإخفاء العناصر", "Show or hide receipt elements")}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {tc("تُطبّق الاختيارات على القالب الحالي. صورة الحملة ورقم الطلب في قالب الحملة ثابتان لضمان ظهور الترتيب المطلوب.", "These switches apply to the selected design. The campaign image and its order number stay together in the campaign template.")}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {displayOptions.map(option => {
                  const lockedOrderNumber = campaign && option.key === "orderNumber";
                  return (
                    <label key={option.key} className="flex min-h-11 items-center justify-between gap-3 border-b py-2 text-sm">
                      <span>{tc(option.ar, option.en)}</span>
                      <Switch
                        checked={template.display[option.key]}
                        disabled={lockedOrderNumber || saveMutation.isPending}
                        onCheckedChange={checked => updateDisplay(option.key, checked)}
                        aria-label={tc(option.ar, option.en)}
                        data-testid={`invoice-display-${option.key}`}
                      />
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 rounded-md bg-amber-50 p-2 text-xs leading-5 text-amber-900">
                {tc("الباركود الخطي يحمل رقم الطلب فقط، وQR التتبع يفتح صفحة متابعة الطلب؛ إذا لم تستخدم قارئًا أو متابعة الطلب فأوقف هذا الخيار. رمز ZATCA الضريبي يبقى ظاهرًا عند توفر بياناته.", "The linear barcode contains only the order number; the tracking QR opens the order-status page. Turn this off if you do not use scanning or order tracking. The ZATCA tax QR remains when its data is available.")}
              </p>
            </section>

            {template.mode === "custom" && (
              <section className="space-y-3 rounded-xl border p-4">
                <h3 className="font-bold">{tc("تنسيق القالب المخصص", "Custom design styling")}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm">{tc("لون العناوين", "Heading color")}</span>
                    <Input
                      type="color"
                      className="h-10 w-16 cursor-pointer p-1"
                      value={template.accentColor}
                      onChange={event => updateTemplate({ accentColor: event.target.value })}
                      aria-label={tc("لون العناوين", "Heading color")}
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <Label>{tc("حجم النص", "Text size")}</Label>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3"
                      value={template.fontSize}
                      onChange={event => updateTemplate({ fontSize: event.target.value as ReceiptTemplateConfig["fontSize"] })}
                    >
                      <option value="small">{tc("صغير", "Small")}</option>
                      <option value="medium">{tc("متوسط", "Medium")}</option>
                      <option value="large">{tc("كبير", "Large")}</option>
                    </select>
                  </label>
                </div>
              </section>
            )}

            <section className="space-y-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold">{tc("روابط وباركودات مخصصة", "Custom links and QR codes")}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{tc("أضف حتى 4 روابط HTTPS/HTTP، وحدد الصفحة التي يظهر فيها كل رمز.", "Add up to 4 HTTP/HTTPS links and choose which page shows each code.")}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addCode} disabled={template.customCodes.length >= 4 || saveMutation.isPending}>
                  <Plus className="ml-1 h-4 w-4" />{tc("إضافة باركود", "Add QR code")}
                </Button>
              </div>
              {template.customCodes.length === 0 && <p className="text-sm text-muted-foreground">{tc("لا توجد روابط مخصصة.", "No custom links yet.")}</p>}
              <div className="space-y-3">
                {template.customCodes.map((code, index) => (
                  <div key={code.id} className="space-y-3 rounded-lg bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <label className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="shrink-0 text-xs text-muted-foreground">{index + 1}</span>
                        <Input
                          value={code.label}
                          maxLength={48}
                          onChange={event => updateCode(code.id, { label: event.target.value })}
                          aria-label={tc("اسم الباركود", "QR code label")}
                          placeholder={tc("مثال: قائمة المشروبات", "e.g. Drinks menu")}
                        />
                      </label>
                      <Switch checked={code.enabled} onCheckedChange={enabled => updateCode(code.id, { enabled })} aria-label={tc("تفعيل الباركود", "Enable QR code")} />
                      <Button type="button" variant="ghost" size="icon" aria-label={tc("حذف الباركود", "Remove QR code")}
                        onClick={() => updateTemplate({ customCodes: template.customCodes.filter(item => item.id !== code.id) })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      type="url"
                      dir="ltr"
                      value={code.url}
                      onChange={event => updateCode(code.id, { url: event.target.value })}
                      aria-label={tc("رابط الباركود", "QR code URL")}
                      placeholder="https://example.com/menu"
                    />
                    <label className="block space-y-1 text-sm">
                      <span>{tc("الصفحة التي يظهر فيها", "Show this code on")}</span>
                      <select
                        className="h-10 w-full rounded-md border bg-background px-3"
                        value={code.page}
                        onChange={event => updateCode(code.id, { page: event.target.value as ReceiptCustomCode["page"] })}
                      >
                        {Object.entries(pageNames).map(([value, labels]) => <option key={value} value={value}>{tc(labels[0], labels[1])}</option>)}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-xl border bg-muted/20 p-3">
            <p className="mb-2 text-center text-xs font-semibold text-muted-foreground">{tc("معاينة تقريبية للطباعة", "Approximate print preview")}</p>
            <div className="mx-auto w-full max-w-[240px] overflow-hidden bg-white text-center text-black shadow-sm" dir="rtl">
              {campaign
                ? <img src="/invoice-campaign-header.png" alt={tc("صورة حملة الدفاع عن الوطن", "Campaign artwork")} className="block h-auto w-full" />
                : template.display.logo && <img src="/elwa-invoice-logo.png" alt={tc("شعار إلوة", "Elwa logo")} className="mx-auto my-3 h-auto w-28 object-contain" />}
              {template.display.orderNumber && <p className="py-2 text-xl font-black">#{tc("رقم الطلب", "Order number")}</p>}
              {template.display.businessDetails && <p className="font-bold">{tc("إلوة للقهوة المختصة", "Elwa Specialty Coffee")}</p>}
              {template.display.date && <p className="text-xs text-gray-500">{tc("التاريخ والوقت", "Date and time")}</p>}
              {template.display.items && <div className="mx-3 my-3 space-y-2 border-y border-dashed py-2 text-xs"><p>{tc("الصنف × 1", "Item × 1")}</p><p>{tc("المجموع", "Total")}</p></div>}
              {template.customCodes.some(code => code.enabled) && <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border border-dashed text-[10px]">{tc("QR", "QR")}</div>}
              {template.display.thankYou && <p className="pb-3 text-xs">{tc("شكرًا لزيارتكم", "Thank you")}</p>}
            </div>
            {campaign && <p className="mt-2 text-center text-xs text-muted-foreground">{tc("الصورة ممتدة بعرض الورقة، ويأتي رقم الطلب أسفلها.", "The artwork spans the paper width, with the order number immediately below.")}</p>}
          </aside>
        </div>

        <Button
          type="button"
          className="w-full min-h-11 gap-2"
          disabled={!config.data || !valid || saveMutation.isPending}
          onClick={() => saveMutation.mutate(template)}
          data-testid="button-save-invoice-template"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? tc("جارٍ الحفظ…", "Saving…") : tc("حفظ تصميم الفاتورة", "Save invoice design")}
        </Button>
      </CardContent>
    </Card>
  );
}
