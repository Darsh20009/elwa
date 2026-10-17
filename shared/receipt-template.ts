import { z } from "zod";

export const receiptSurfaces = ["customer", "employee", "thermal"] as const;
export type ReceiptSurface = typeof receiptSurfaces[number];

export const receiptDisplayKeys = [
  "orderNumber",
  "logo",
  "businessDetails",
  "branchInfo",
  "legalInfo",
  "cashier",
  "customer",
  "date",
  "orderType",
  "items",
  "itemCount",
  "totals",
  "payment",
  "notes",
  "trackingBarcode",
  "tagline",
  "thankYou",
  "poweredBy",
] as const;

export type ReceiptDisplayKey = typeof receiptDisplayKeys[number];
export type ReceiptDisplayConfig = Record<ReceiptDisplayKey, boolean>;

export interface ReceiptCustomCode {
  id: string;
  enabled: boolean;
  label: string;
  url: string;
  page: ReceiptSurface;
}

export interface ReceiptTemplateConfig {
  mode: "default" | "campaign" | "custom";
  display: ReceiptDisplayConfig;
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  customCodes: ReceiptCustomCode[];
}

export const defaultReceiptTemplate: ReceiptTemplateConfig = {
  mode: "default",
  display: {
    orderNumber: true,
    logo: true,
    businessDetails: true,
    branchInfo: true,
    legalInfo: true,
    cashier: true,
    customer: true,
    date: true,
    orderType: true,
    items: true,
    itemCount: true,
    totals: true,
    payment: true,
    notes: true,
    trackingBarcode: true,
    tagline: true,
    thankYou: true,
    poweredBy: true,
  },
  accentColor: "#2D9B6E",
  fontSize: "medium",
  customCodes: [],
};

const freshDefault = (): ReceiptTemplateConfig => ({
  ...defaultReceiptTemplate,
  display: { ...defaultReceiptTemplate.display },
  customCodes: [],
});

const customCodeSchema = z.object({
  id: z.string().trim().min(1).max(64),
  enabled: z.boolean(),
  label: z.string().trim().min(1).max(48),
  url: z.string().trim().url().max(500).refine((value) => {
    try {
      const parsed = new URL(value);
      return ["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password;
    } catch {
      return false;
    }
  }, "Barcode links must be HTTP or HTTPS URLs without credentials"),
  page: z.enum(receiptSurfaces),
}).strict();

export const receiptTemplateSchema = z.object({
  mode: z.enum(["default", "campaign", "custom"]),
  display: z.object({
    orderNumber: z.boolean(),
    logo: z.boolean(),
    businessDetails: z.boolean(),
    branchInfo: z.boolean(),
    legalInfo: z.boolean(),
    cashier: z.boolean(),
    customer: z.boolean(),
    date: z.boolean(),
    orderType: z.boolean(),
    items: z.boolean(),
    itemCount: z.boolean(),
    totals: z.boolean(),
    payment: z.boolean(),
    notes: z.boolean(),
    trackingBarcode: z.boolean(),
    tagline: z.boolean(),
    thankYou: z.boolean(),
    poweredBy: z.boolean(),
  }).strict(),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  fontSize: z.enum(["small", "medium", "large"]),
  customCodes: z.array(customCodeSchema).max(4),
}).strict();

export function normalizeReceiptTemplate(value: unknown): ReceiptTemplateConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return freshDefault();
  const input = value as Partial<ReceiptTemplateConfig>;
  const merged = {
    ...defaultReceiptTemplate,
    ...input,
    display: { ...defaultReceiptTemplate.display, ...(input.display || {}) },
    customCodes: Array.isArray(input.customCodes) ? input.customCodes : [],
  };
  const parsed = receiptTemplateSchema.safeParse(merged);
  return parsed.success ? parsed.data : freshDefault();
}
