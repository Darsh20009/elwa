import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Loader2, Mail, MessageCircle, Phone, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerPhoneInput } from "@/components/customer-phone-input";
import { useToast } from "@/hooks/use-toast";
import { useCustomer } from "@/contexts/CustomerContext";
import { customerStorage } from "@/lib/customer-storage";
import { brand } from "@/lib/brand";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_CUSTOMER_PHONE_COUNTRY,
  formatCustomerPhoneForStorage,
  type CustomerPhoneCountryCode,
} from "@shared/customer-phone";

type PublicConfig = {
  businessName?: string;
  logoUrl?: string;
  primaryColor?: string;
  heroImageUrl?: string;
};

type PendingAction = "send" | "verify" | null;

function toWesternDigits(value: string) {
  return value.replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function safePrimaryColor(value?: string) {
  if (value && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value)) return value;
  return brand.colors.primary.hex;
}

async function requestJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const candidate = String(payload.message || payload.error || "");
    const message = candidate.length > 0 && candidate.length <= 180 &&
      !/dev.?otp|otp\s*[:=]\s*\d{4,}|verification code.{0,20}\d{4,}|stack|password|token|secret/i.test(candidate)
      ? candidate
      : "Could not complete this request. Please try again.";
    throw new Error(message);
  }
  return payload as T;
}

export default function QiroxCustomerAccess({ compact = false, onAuthenticated }: { compact?: boolean; onAuthenticated?: () => void } = {}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.toLowerCase().startsWith("ar") ?? true;
  const [, setLocation] = useLocation();
  const { setCustomer } = useCustomer();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CustomerPhoneCountryCode>(DEFAULT_CUSTOMER_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [pending, setPending] = useState<PendingAction>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: publicConfig, isError: configError, refetch: retryPublicConfig } = useQuery<PublicConfig>({
    queryKey: ["/api/saas/public-config"],
    retry: false,
    queryFn: () => requestJson<PublicConfig>("/api/saas/public-config"),
  });

  const text = (ar: string, en: string) => isArabic ? ar : en;
  const accent = safePrimaryColor(publicConfig?.primaryColor);
  const businessName = publicConfig?.businessName || (isArabic ? brand.nameAr : brand.nameEn);
  const logo = publicConfig?.logoUrl || brand.logoCustomer || brand.logoAssetCustomer;
  const heroImage = publicConfig?.heroImageUrl;
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (expiresAt === null) {
      setRemainingSeconds(0);
      return;
    }
    const updateRemaining = () => setRemainingSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const startOver = () => {
    setChallengeId(null);
    setPhone("");
    setNeedsProfile(false);
    setName("");
    setEmail("");
    setExpiresAt(null);
    setCode("");
    setErrorMessage("");
  };

  const validateDetails = () => {
    const cleanPhone = formatCustomerPhoneForStorage(phoneInput, phoneCountry);
    if (!cleanPhone) {
      setErrorMessage(text("أدخل رقم جوال صحيحاً واختر رمز الدولة.", "Enter a valid phone number and select its country code."));
      return null;
    }
    return cleanPhone;
  };

  const sendCode = async (event?: FormEvent) => {
    event?.preventDefault();
    const cleanPhone = validateDetails();
    if (!cleanPhone) return;
    setPending("send");
    setErrorMessage("");
    try {
      const result = await requestJson<{ challengeId?: string; expiresIn?: number }>("/api/saas/customer/send-code", {
        phone: cleanPhone,
      });
      if (!result.challengeId) throw new Error(text("تعذر بدء التحقق. أعد المحاولة.", "Could not start verification. Please try again."));
      const duration = Number.isFinite(result.expiresIn) && Number(result.expiresIn) > 0 ? Number(result.expiresIn) : 300;
      setPhone(cleanPhone);
      setChallengeId(result.challengeId);
      setNeedsProfile(false);
      setExpiresAt(Date.now() + duration * 1000);
      setCode("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : text("تعذر إرسال رمز WhatsApp. أعد المحاولة.", "Could not send the WhatsApp code. Please retry."));
    } finally {
      setPending(null);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!challengeId || remainingSeconds <= 0) {
      setErrorMessage(text("انتهت صلاحية الرمز. أرسل رمزاً جديداً للمتابعة.", "This code has expired. Request a new code to continue."));
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setErrorMessage(text("أدخل الرمز المكوّن من 6 أرقام.", "Enter the 6-digit code."));
      return;
    }
    if (needsProfile && name.trim().length < 2) {
      setErrorMessage(text("أدخل الاسم بحرفين على الأقل لإكمال إنشاء الحساب.", "Enter a name with at least 2 characters to finish creating your account."));
      return;
    }
    if (needsProfile && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage(text("تحقق من صيغة البريد الإلكتروني.", "Enter a valid email address."));
      return;
    }
    setPending("verify");
    setErrorMessage("");
    try {
      const result = await requestJson<{ customer?: Record<string, unknown> } & Record<string, unknown>>(
        "/api/saas/customer/verify-code",
        {
          phone,
          challengeId,
          code,
          ...(needsProfile ? { name: name.trim(), email: email.trim() } : {}),
        },
      );
      if (result.needsProfile) {
        setNeedsProfile(true);
        setErrorMessage("");
        return;
      }
      const rawCustomer = (result.customer || result) as Record<string, unknown>;
      const customer = Object.fromEntries(
        Object.entries(rawCustomer).filter(([key]) => !/^(?:devOtp|otp|token|accessToken|refreshToken|challengeId)$/i.test(key)),
      );
      if (!customer || typeof customer !== "object" || !customer.id || !customer.phone) {
        throw new Error(text("تعذر تأكيد جلسة العميل. أعد المحاولة.", "Customer session could not be confirmed. Please retry."));
      }

      // Keep the template's established customer cache/context behavior; the API's session cookie remains authoritative.
      setCustomer(customer as unknown as Parameters<typeof setCustomer>[0]);
      customerStorage.clearGuestInfo();
      customerStorage.setGuestMode(false);
      toast({
        title: text("مرحباً بك!", "Welcome!"),
        description: result.emailStatus === "failed"
          ? text("تم تسجيل دخولك، لكن تعذر إرسال رسالة البريد. راجع إدارة النظام.", "You are signed in, but the email could not be sent. Contact the system administrator.")
          : text(`أهلاً ${String(customer.name || name || "")}`, `Hello ${String(customer.name || name || "")}`),
      });
      if (onAuthenticated) onAuthenticated();
      else setLocation("/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : text("تعذر التحقق من الرمز. أعد المحاولة.", "Could not verify the code. Please retry."));
    } finally {
      setPending(null);
    }
  };

  const timeLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const Root = compact ? "div" : "main";

  return (
    <Root
      dir={isArabic ? "rtl" : "ltr"}
      className={compact
        ? "w-full"
        : "relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/[0.07] to-background p-4 sm:p-6"}
    >
      {!compact && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
          {heroImage && <img src={heroImage} alt="" className="h-full w-full object-cover opacity-20" />}
          <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/70 to-background" />
        </div>
      )}

      <div className={`relative z-10 w-full ${compact ? "" : "max-w-md"}`}>
        {!compact && (
          <div className="mb-6 flex flex-col items-center text-center">
            <div
              className="mb-4 flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[24px] border border-border/70 bg-card p-2 shadow-lg"
              style={{ boxShadow: `0 12px 34px -18px ${accent}88` }}
            >
              {logo ? <img src={logo} alt={businessName} className="h-full w-full object-contain" /> : <MessageCircle className="h-8 w-8" style={{ color: accent }} />}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">{text("دخول آمن للعملاء", "CUSTOMER ACCESS")}</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{businessName}</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {text("سجّل الدخول أو أنشئ حساباً جديداً باستخدام رمز تحقق عبر WhatsApp.", "Sign in or create an account with a one-time WhatsApp verification code.")}
            </p>
            {configError && (
              <div role="status" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{text("تعذّر تحميل بعض تفاصيل النشاط.", "Some business details could not be loaded.")}</span>
                <button type="button" onClick={() => void retryPublicConfig()} className="font-semibold underline underline-offset-2">
                  {text("إعادة المحاولة", "Retry")}
                </button>
              </div>
            )}
          </div>
        )}

        <Card className={compact
          ? "border-0 bg-transparent shadow-none"
          : "overflow-hidden border-border/70 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-sm"}>
          {(!compact || challengeId) && (
            <CardHeader className={compact ? "space-y-1 p-0 pb-2" : "space-y-4 pb-4"}>
            <div className="flex items-center justify-between gap-3">
              {challengeId ? (
                <button type="button" onClick={startOver} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
                  <BackIcon className="h-4 w-4" />{text("تغيير البيانات", "Change details")}
                </button>
              ) : compact ? null : <span className="text-xs font-medium text-muted-foreground">{text("متابعة آمنة", "Secure sign-in")}</span>}
              {!compact && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />{text("جلسة محمية", "Protected session")}
                </span>
              )}
            </div>
            <div>
              <CardTitle className={compact ? "text-base font-bold" : "text-xl font-bold"}>{challengeId ? text("تحقق من رقمك", "Verify your number") : text("مرحباً بك", "Welcome")}</CardTitle>
              <CardDescription className={compact ? "mt-1 text-xs leading-4" : "mt-1.5 leading-5"}>
                {challengeId
                  ? text(`أرسلنا رمزاً إلى WhatsApp على ${phone.startsWith("+") ? phone : `+966${phone}`}.`, `A code was sent on WhatsApp to ${phone.startsWith("+") ? phone : `+966${phone}`}.`)
                  : text("أدخل رقم جوالك مع رمز الدولة. إذا كان حسابك موجوداً سنسجّلك، وإذا لم يكن موجوداً سنطلب اسمك بعد التحقق.", "Enter your number with its country code. Existing accounts sign in; new customers add a name after verification.")}
              </CardDescription>
            </div>
            </CardHeader>
          )}

          <CardContent className={compact ? "space-y-3 p-0" : "space-y-4"}>
            {!challengeId ? (
              <form onSubmit={sendCode} className={compact ? "space-y-2.5" : "space-y-4"}>
                <div className="space-y-1.5">
                  <Label htmlFor="qirox-customer-phone" className={`flex items-center gap-2 font-semibold ${compact ? "text-xs" : "text-sm"}`}><Phone className="h-4 w-4 text-muted-foreground" />{text("رقم الجوال", "Mobile number")}</Label>
                  <CustomerPhoneInput
                    id="qirox-customer-phone"
                    value={phoneInput}
                    onChange={value => { setPhoneInput(value); setErrorMessage(""); }}
                    country={phoneCountry}
                    onCountryChange={setPhoneCountry}
                    isArabic={isArabic}
                    required
                    className={compact ? "h-10 rounded-lg" : "h-11 rounded-xl"}
                    data-testid="qirox-customer-phone"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={pending !== null}
                  className={`${compact ? "h-10 rounded-lg text-sm" : "h-12 rounded-xl text-base"} w-full font-bold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5`}
                  style={{ backgroundColor: accent }}
                >
                  {pending === "send" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
                  {pending === "send" ? text("جارٍ إرسال الرمز…", "Sending code…") : text("إرسال رمز WhatsApp", "Send WhatsApp code")}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className={compact ? "space-y-3" : "space-y-4"}>
                {needsProfile && (
                  <>
                    <div className={compact
                      ? "rounded-lg border border-primary/15 bg-primary/[0.045] p-2 text-[11px] leading-4 text-muted-foreground"
                      : "rounded-xl border border-primary/15 bg-primary/[0.045] p-3.5 text-xs leading-5 text-muted-foreground"}>
                      {text("تم التحقق من رقمك. أكمل إنشاء الحساب بالاسم، والبريد اختياري.", "Your number is verified. Add your name to create the account; email is optional.")}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qirox-customer-name" className={`flex items-center gap-2 font-semibold ${compact ? "text-xs" : "text-sm"}`}><UserRound className="h-4 w-4 text-muted-foreground" />{text("الاسم", "Name")}</Label>
                      <Input
                        id="qirox-customer-name"
                        autoComplete="name"
                        value={name}
                        onChange={event => { setName(event.target.value); setErrorMessage(""); }}
                        placeholder={text("اسمك الكامل", "Your full name")}
                        minLength={2}
                        required
                        className={compact ? "h-9 rounded-lg bg-background" : "h-11 rounded-xl bg-background"}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qirox-customer-email" className={`flex items-center gap-2 font-semibold ${compact ? "text-xs" : "text-sm"}`}><Mail className="h-4 w-4 text-muted-foreground" />{text("البريد الإلكتروني (اختياري)", "Email (optional)")}</Label>
                      <Input
                        id="qirox-customer-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        dir="ltr"
                        value={email}
                        onChange={event => { setEmail(event.target.value); setErrorMessage(""); }}
                        placeholder="name@example.com"
                        className={compact ? "h-9 rounded-lg bg-background text-left" : "h-11 rounded-xl bg-background text-left"}
                      />
                    </div>
                  </>
                )}
                {!compact && (
                  <div className="rounded-xl border border-primary/15 bg-primary/[0.045] p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><MessageCircle className="h-4 w-4" /></span>
                      <p className="text-xs leading-5 text-muted-foreground">{text("افتح محادثة WhatsApp وأدخل رمز التحقق المكوّن من 6 أرقام. لا تشارك الرمز مع أي شخص.", "Open WhatsApp and enter the 6-digit verification code. Never share the code with anyone.")}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="qirox-customer-code" className={compact ? "text-xs font-semibold" : "text-sm font-semibold"}>{text("رمز التحقق", "Verification code")}</Label>
                  <Input
                    id="qirox-customer-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    dir="ltr"
                    value={code}
                    onChange={event => { setCode(toWesternDigits(event.target.value).replace(/\D/g, "").slice(0, 6)); setErrorMessage(""); }}
                    placeholder="••••••"
                    maxLength={6}
                    required
                    className={compact
                      ? "h-12 rounded-lg bg-background text-center font-mono text-xl tracking-[0.4em]"
                      : "h-14 rounded-xl bg-background text-center font-mono text-2xl tracking-[0.55em]"}
                  />
                </div>
                <div className={`flex items-center justify-between gap-3 text-muted-foreground ${compact ? "text-[11px]" : "text-xs"}`}>
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{remainingSeconds > 0 ? text(`ينتهي خلال ${timeLabel}`, `Expires in ${timeLabel}`) : text("انتهت صلاحية الرمز", "Code expired")}</span>
                  {!compact && remainingSeconds > 0 && <span>{text("صالحة لمدة 5 دقائق", "Valid for 5 minutes")}</span>}
                </div>
                <Button type="submit" disabled={pending !== null || remainingSeconds <= 0 || code.length !== 6} className={`${compact ? "h-10 rounded-lg text-sm" : "h-12 rounded-xl text-base"} w-full font-bold text-primary-foreground shadow-md`} style={{ backgroundColor: accent }}>
                  {pending === "verify" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {pending === "verify" ? text("جارٍ التحقق…", "Verifying…") : text("تأكيد وتسجيل الدخول", "Verify and sign in")}
                </Button>
                <Button type="button" variant="outline" onClick={() => void sendCode()} disabled={pending !== null} className={`${compact ? "h-9 rounded-lg text-xs" : "h-11 rounded-xl"} w-full`}>
                  {pending === "send" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  {pending === "send" ? text("جارٍ إرسال رمز جديد…", "Sending a new code…") : text("إعادة إرسال الرمز", "Resend code")}
                </Button>
              </form>
            )}

            {errorMessage && (
              <div role="alert" className={`flex items-start justify-between gap-3 rounded-xl border border-destructive/25 bg-destructive/5 text-destructive ${compact ? "p-2 text-xs" : "p-3 text-sm"}`}>
                <span className="leading-5">{errorMessage}</span>
                {pending === null && !challengeId && <button type="button" onClick={() => void sendCode()} className="shrink-0 font-semibold underline underline-offset-2">{text("إعادة المحاولة", "Retry")}</button>}
              </div>
            )}

            {!compact && (
              <div className="flex items-center justify-center gap-2 border-t border-border/70 pt-4 text-[11px] leading-5 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: accent }} />
                <span>{text("رمز مؤقت للتحقق فقط. لا نطلب كلمة مرور.", "One-time verification only. We never ask for a password.")}</span>
              </div>
            )}
          </CardContent>
        </Card>
        {!compact && <p className="mt-4 text-center text-[10px] tracking-wide text-muted-foreground/75">{text("بالاستمرار، سيتم إنشاء جلسة عميل آمنة لهذا المتصفح.", "Continuing creates a secure customer session in this browser.")}</p>}
      </div>
    </Root>
  );
}