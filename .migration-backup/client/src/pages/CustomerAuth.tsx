import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCustomer } from "@/contexts/CustomerContext";
import clunyLogo from "@assets/cluny-logo-customer.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerPhoneInput } from "@/components/customer-phone-input";
import { SmartIdentifierInput } from "@/components/smart-identifier-input";
import { Phone, User, Lock, Mail, Eye, EyeOff, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { customerStorage } from "@/lib/customer-storage";
import {
  DEFAULT_CUSTOMER_PHONE_COUNTRY,
  formatCustomerPhoneForStorage,
  normalizeCustomerPhone,
  type CustomerPhoneCountryCode,
} from "@shared/customer-phone";

export default function CustomerAuth() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const { setCustomer } = useCustomer();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [guestInfo, setGuestInfo] = useState<{ name: string; phone: string } | null>(null);
  const [phoneCountry, setPhoneCountry] = useState<CustomerPhoneCountryCode>(DEFAULT_CUSTOMER_PHONE_COUNTRY);

  useEffect(() => {
    const info = customerStorage.getGuestInfo();
    if (info) {
      setGuestInfo(info);
      setName(info.name);
      setIdentifier(info.phone);
      setMode("register");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanIdentifier = identifier.replace(/\s/g, '').trim();
    
    if (!cleanIdentifier) {
      toast({
        title: i18n.language === 'ar' ? "خطأ" : "Error",
        description: i18n.language === 'ar' ? "يرجى إدخال رقم الجوال أو البريد الإلكتروني" : "Please enter phone number or email",
        variant: "destructive"
      });
      return;
    }

    if (!password || password.length < 4) {
      toast({
        title: i18n.language === 'ar' ? "خطأ" : "Error",
        description: i18n.language === 'ar' ? "كلمة المرور يجب أن تكون على الأقل 4 أحرف" : "Password must be at least 4 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/customers/login", {
        identifier: cleanIdentifier,
        password
      });
      
      const customer = await res.json();
      setCustomer(customer);
      
      toast({
        title: i18n.language === 'ar' ? "مرحباً بك!" : "Welcome!",
        description: i18n.language === 'ar' ? `أهلاً ${customer.name}، تم تسجيل دخولك بنجاح` : `Hello ${customer.name}, you have logged in successfully`,
      });

      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: i18n.language === 'ar' ? "خطأ" : "Error",
        description: error.message || (i18n.language === 'ar' ? "العميل غير مسجل لدينا" : "Customer not found"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectivePhone = guestInfo ? guestInfo.phone : identifier;
    const effectiveName = guestInfo ? guestInfo.name : name.trim();
    const cleanPhone = guestInfo
      ? normalizeCustomerPhone(effectivePhone)
      : formatCustomerPhoneForStorage(effectivePhone, phoneCountry);

    if (!cleanPhone) {
      toast({
        title: i18n.language === "ar" ? "خطأ" : "Error",
        description: i18n.language === "ar"
          ? phoneCountry === "SA" ? "رقم الجوال السعودي يجب أن يبدأ بـ 5 ويتكون من 9 أرقام" : "أدخل رقم جوال صحيحاً مع رمز الدولة المحدد"
          : phoneCountry === "SA" ? "Saudi mobile numbers must start with 5 and contain 9 digits" : "Enter a valid phone number for the selected country",
        variant: "destructive"
      });
      return;
    }

    if (!guestInfo) {
      if (!effectiveName || effectiveName.length < 2) {
        toast({
          title: i18n.language === 'ar' ? "خطأ" : "Error",
          description: i18n.language === 'ar' ? "الاسم يجب أن يكون على الأقل حرفين" : "Name must be at least 2 characters",
          variant: "destructive"
        });
        return;
      }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: i18n.language === 'ar' ? "خطأ" : "Error",
        description: i18n.language === 'ar' ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email address format",
        variant: "destructive"
      });
      return;
    }

    if (!password || password.length < 4) {
      toast({
        title: i18n.language === 'ar' ? "خطأ" : "Error",
        description: i18n.language === 'ar' ? "كلمة المرور يجب أن تكون على الأقل 4 أحرف" : "Password must be at least 4 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/customers/register", {
        phone: cleanPhone,
        name: effectiveName,
        ...(email.trim() ? { email: email.trim() } : {}),
        password,
      });
      
      const customer = await res.json();
      setCustomer(customer);

      if (guestInfo) {
        customerStorage.clearGuestInfo();
        customerStorage.setGuestMode(false);
        setGuestInfo(null);
      }

      toast({
        title: i18n.language === 'ar' ? "مرحباً بك!" : "Welcome!",
        description: i18n.language === 'ar'
          ? `أهلاً ${customer.name}، تم إنشاء حسابك وربط طلباتك السابقة`
          : `Hello ${customer.name}, your account was created and previous orders linked`,
      });

      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: i18n.language === 'ar' ? "خطأ" : "Error",
        description: error.message || (i18n.language === 'ar' ? "حدث خطأ أثناء إنشاء الحساب" : "An error occurred while creating your account"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-background"
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Card className="w-full max-w-md border-border bg-white dark:bg-card shadow-xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-border bg-muted">
              <img src={clunyLogo} alt="Elwa" className="w-full h-full object-cover rounded-2xl" />
            </div>
          </div>
          <CardTitle className="tracking-tight text-3xl font-bold text-foreground">
            {i18n.language === 'ar' ? "مرحباً بك في إلوة" : "Welcome to Elwa"}
          </CardTitle>
          <CardDescription className="text-lg text-[#b2babc]">
            {i18n.language === 'ar' ? "سجل دخولك للحصول على حسابك الخاص" : "Sign in to access your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")} className="w-full">
            <TabsList className="h-10 items-center justify-center rounded-md p-1 grid w-full grid-cols-2 bg-muted text-muted-foreground">
              <TabsTrigger value="login" data-testid="tab-login">{i18n.language === 'ar' ? "تسجيل دخول" : "Login"}</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">{i18n.language === 'ar' ? "حساب جديد" : "New Account"}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-5 mt-5">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-identifier" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-[#1f2025]">
                    <Mail className="w-4 h-4" />
                    {i18n.language === 'ar' ? "رقم الجوال أو البريد الإلكتروني" : "Phone number or Email"}
                  </Label>
                  <SmartIdentifierInput
                    id="login-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e)}
                    allowInternational
                    placeholder={i18n.language === 'ar' ? "5xxxxxxxx أو +رمز الدولة والرقم" : "5xxxxxxxx or +country code and number"}
                    data-testid="input-identifier"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {i18n.language === 'ar'
                      ? "يمكنك تسجيل الدخول برقم سعودي يبدأ بـ 5 (9 أرقام)، أو رقم دولي مع رمز الدولة، أو البريد الإلكتروني"
                      : "Login with a Saudi number starting with 5, an international number with its country code, or email"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-[#1f2025]">
                    <Lock className="w-4 h-4" />
                    {i18n.language === 'ar' ? "كلمة المرور" : "Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder={i18n.language === 'ar' ? "أدخل كلمة المرور" : "Enter password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${i18n.language === 'ar' ? 'pl-10' : 'pr-10'}`}
                      data-testid="input-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${i18n.language === 'ar' ? 'left-3' : 'right-3'} top-2.5 text-accent hover:text-accent/80`}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-black hover:text-black/70 transition-colors underline-offset-4 hover:underline"
                    data-testid="link-forgot-password"
                  >
                    {i18n.language === 'ar' ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold shadow-md transition-all duration-300 hover:scale-[1.02]"
                  data-testid="button-login"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{i18n.language === 'ar' ? "جارٍ تسجيل الدخول..." : "Logging in..."}</span>
                    </div>
                  ) : (
                    i18n.language === 'ar' ? "تسجيل الدخول" : "Login"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-5 mt-5">
              <form onSubmit={handleRegister} className="space-y-5">
                {guestInfo ? (
                  <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-700/50 rounded-lg p-3 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 dark:text-green-300 font-semibold text-sm">
                        {i18n.language === 'ar' ? `تسجيل حساب لـ ${guestInfo.name}` : `Creating account for ${guestInfo.name}`}
                      </p>
                      <p className="text-green-600/80 dark:text-green-400/70 text-xs mt-0.5">
                        {i18n.language === 'ar'
                          ? `رقم ${guestInfo.phone} • أدخل البريد وكلمة المرور فقط وسنربط طلباتك السابقة`
                          : `Phone ${guestInfo.phone} • Enter email & password to link your previous orders`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm font-medium leading-none flex items-center gap-2 text-[#1f2025]">
                        <User className="w-4 h-4" />
                        {i18n.language === 'ar' ? "الاسم" : "Name"}
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder={i18n.language === 'ar' ? "أدخل اسمك" : "Enter your name"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                        data-testid="input-name"
                        required={!guestInfo}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-phone" className="text-sm font-medium leading-none flex items-center gap-2 text-[#1f2025]">
                        <Phone className="w-4 h-4" />
                        {i18n.language === 'ar' ? "رقم الجوال" : "Phone Number"}
                      </Label>
                      <CustomerPhoneInput
                        id="register-phone"
                        value={identifier}
                        onChange={(e) => setIdentifier(e)}
                        country={phoneCountry}
                        onCountryChange={setPhoneCountry}
                        isArabic={i18n.language === "ar"}
                        data-testid="input-phone-register"
                        required={!guestInfo}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {i18n.language === 'ar'
                          ? "اختر رمز الدولة ثم أدخل الرقم المحلي"
                          : "Select a country code, then enter the local number"}
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-[#1f2025]">
                    <Mail className="w-4 h-4" />
                    {i18n.language === 'ar' ? "البريد الإلكتروني (اختياري)" : "Email Address (optional)"}
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    data-testid="input-email"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {i18n.language === 'ar' ? "يمكنك إضافته لاحقاً من ملفك الشخصي" : "You can add it later from your profile"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-[#1f2025]">
                    <Lock className="w-4 h-4" />
                    {i18n.language === 'ar' ? "كلمة المرور" : "Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={i18n.language === 'ar' ? "أدخل كلمة المرور (4 أحرف على الأقل)" : "Enter password (min 4 characters)"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${i18n.language === 'ar' ? 'pl-10' : 'pr-10'}`}
                      data-testid="input-password-register"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${i18n.language === 'ar' ? 'left-3' : 'right-3'} top-2.5 text-accent hover:text-accent/80`}
                      data-testid="button-toggle-password-register"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>


                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-[#102A4C]/25 transition-all duration-300 hover:scale-[1.02]"
                  data-testid="button-register"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{i18n.language === 'ar' ? "جارٍ إنشاء الحساب..." : "Creating account..."}</span>
                    </div>
                  ) : (
                    i18n.language === 'ar' ? "إنشاء حساب" : "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>


          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-accent/70 hover:text-accent transition-colors text-sm underline-offset-4 hover:underline"
              data-testid="link-skip"
            >
              {i18n.language === 'ar' ? "تخطي وتصفح القائمة" : "Skip and explore menu"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
