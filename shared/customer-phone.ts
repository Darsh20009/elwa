import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type CustomerPhoneCountryCode = CountryCode;

export const DEFAULT_CUSTOMER_PHONE_COUNTRY: CustomerPhoneCountryCode = "SA";

export function getCustomerPhoneCountries() {
  return getCountries().map((country) => ({
    country,
    callingCode: getCountryCallingCode(country),
  }));
}

export function formatCustomerPhoneForStorage(
  input: string,
  country: CustomerPhoneCountryCode,
): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const isInternational = raw.startsWith("+") || raw.startsWith("00");
  const normalizedInput = raw.startsWith("00") ? `+${raw.slice(2)}` : raw;
  const parsed = isInternational
    ? parsePhoneNumberFromString(normalizedInput)
    : parsePhoneNumberFromString(raw, country);

  if (!parsed || !parsed.isPossible()) return null;

  // Keep Saudi numbers in the existing national format so they continue to
  // match customer accounts and guest orders created before country selection.
  if (parsed.country === "SA" && /^5\d{8}$/.test(parsed.nationalNumber)) {
    return parsed.nationalNumber;
  }

  return parsed.number;
}

export function normalizeCustomerPhone(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const raw = input.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");

  const legacySaudiNumber = digits.replace(/^0/, "");
  if (/^5\d{8}$/.test(legacySaudiNumber) && !raw.startsWith("+") && !raw.startsWith("00")) {
    return legacySaudiNumber;
  }
  if (/^9665\d{8}$/.test(digits)) return digits.slice(3);

  const normalizedInput = raw.startsWith("00") ? `+${raw.slice(2)}` : raw;
  if (!normalizedInput.startsWith("+")) return null;

  const parsed = parsePhoneNumberFromString(normalizedInput);
  if (!parsed || !parsed.isPossible()) return null;

  if (parsed.country === "SA" && /^5\d{8}$/.test(parsed.nationalNumber)) {
    return parsed.nationalNumber;
  }

  return parsed.number;
}