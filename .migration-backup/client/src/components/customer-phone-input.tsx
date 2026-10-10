import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_CUSTOMER_PHONE_COUNTRY,
  getCustomerPhoneCountries,
  type CustomerPhoneCountryCode,
} from "@shared/customer-phone";

interface CustomerPhoneInputProps {
  id: string;
  value: string;
  country: CustomerPhoneCountryCode;
  onChange: (value: string) => void;
  onCountryChange: (country: CustomerPhoneCountryCode) => void;
  isArabic: boolean;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
  required?: boolean;
}

export function CustomerPhoneInput({
  id,
  value,
  country = DEFAULT_CUSTOMER_PHONE_COUNTRY,
  onChange,
  onCountryChange,
  isArabic,
  placeholder,
  className = "",
  "data-testid": testId,
  required,
}: CustomerPhoneInputProps) {
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([isArabic ? "ar" : "en"], { type: "region" });
    const collator = new Intl.Collator(isArabic ? "ar" : "en");

    return getCustomerPhoneCountries()
      .map(({ country: code, callingCode }) => ({
        code,
        callingCode,
        name: names.of(code) || code,
      }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [isArabic]);

  return (
    <div className="flex gap-2" dir="ltr">
      <select
        value={country}
        onChange={(event) => onCountryChange(event.target.value as CustomerPhoneCountryCode)}
        aria-label={isArabic ? "رمز الدولة" : "Country calling code"}
        className="h-10 w-40 shrink-0 rounded-md border border-input bg-background px-2 text-sm text-foreground"
        data-testid={testId ? `${testId}-country` : undefined}
      >
        {countries.map(({ code, callingCode, name }) => (
          <option key={code} value={code}>
            {name} (+{callingCode})
          </option>
        ))}
      </select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={value}
        onChange={(event) => {
          const westernDigits = event.target.value
            .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
            .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
          onChange(westernDigits.replace(/\D/g, "").slice(0, 15));
        }}
        placeholder={placeholder || (country === "SA" ? "5xxxxxxxx" : isArabic ? "رقم الجوال" : "Phone number")}
        maxLength={15}
        className={`min-w-0 bg-background text-foreground ${className}`}
        dir="ltr"
        data-testid={testId}
        required={required}
      />
    </div>
  );
}