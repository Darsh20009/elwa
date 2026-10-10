import mongoose from "mongoose";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { CustomerModel } from "../shared/schema";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
const APPLY = process.argv.includes("--apply");
const EXPORT_TOTAL = 1025;
const CUSTOMER_HEADERS = [
  "الاسم",
  "الهاتف",
  "البريد الإلكتروني",
  "إجمالي الطلبات",
  "آخر طلب",
  "رصيد الحساب",
];

type ImportCustomer = {
  phone: string;
  name: string;
  email?: string;
};

function abort(message: string): never {
  throw new Error(message);
}

function normalizeDigits(value: string): string {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return value.replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

function normalizeSaudiMobile(value: string): string | null {
  let digits = normalizeDigits(value).replace(/\D/g, "");
  if (digits.startsWith("00966")) digits = digits.slice(5);
  else if (digits.startsWith("966")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return /^5\d{8}$/.test(digits) ? digits : null;
}

function normalizeEmail(value: string): string | undefined {
  const email = value.trim().toLowerCase();
  if (!email || email === "—" || email === "-") return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    abort("The customer export contains an invalid email value; no records were changed.");
  }
  return email;
}

function parsePageRange(line: string): { start: number; end: number; total: number } | null {
  if (!line.includes("عرض من")) return null;
  const numbers = normalizeDigits(line).match(/\d[\d,]*/g)?.map((value) => Number(value.replace(/,/g, ""))) ?? [];
  if (numbers.length < 3) return null;
  const [start, end, total] = numbers.slice(-3);
  if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(total) || start < 1 || end < start || total < end) {
    return null;
  }
  return { start, end, total };
}

function missingRanges(covered: Set<number>, total: number): string[] {
  const ranges: string[] = [];
  let start = 0;
  for (let page = 1; page <= total + 1; page++) {
    const missing = page <= total && !covered.has(page);
    if (missing && start === 0) start = page;
    if (!missing && start !== 0) {
      const end = page - 1;
      ranges.push(start === end ? String(start) : `${start}–${end}`);
      start = 0;
    }
  }
  return ranges;
}

async function readExport(): Promise<{
  customers: ImportCustomer[];
  rawRows: number;
  skippedShortNames: number;
  duplicateRows: number;
  missingEmailCustomers: number;
  sourceFileCount: number;
  exportTotal: number;
  missingPages: string[];
}> {
  const assetDirectory = join(process.cwd(), "attached_assets");
  const files = (await readdir(assetDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".txt")
    .map((entry) => entry.name)
    .sort();

  const byPhone = new Map<string, ImportCustomer>();
  const coveredPages = new Set<number>();
  const paginationTotals = new Set<number>();
  let rawRows = 0;
  let skippedShortNames = 0;
  let duplicateRows = 0;
  let customerSourceFileCount = 0;
  let sawCustomerHeader = false;

  for (const file of files) {
    const content = (await readFile(join(assetDirectory, file), "utf8")).replace(/^\uFEFF/, "");
    let inCustomerTable = false;
    let fileHasCustomerHeader = false;

    for (const line of content.split(/\r?\n/)) {
      const columns = line.split("\t").map((column) => column.trim());
      if (CUSTOMER_HEADERS.every((header, index) => columns[index] === header)) {
        inCustomerTable = true;
        fileHasCustomerHeader = true;
        sawCustomerHeader = true;
        continue;
      }

      if (!inCustomerTable) continue;

      const page = parsePageRange(line);
      if (page) {
        paginationTotals.add(page.total);
        for (let number = page.start; number <= page.end; number++) coveredPages.add(number);
        continue;
      }

      if (columns.length < CUSTOMER_HEADERS.length || !columns[0] || !columns[1]) continue;
      const phone = normalizeSaudiMobile(columns[1]);
      if (!phone) {
        abort("The customer export contains a row with an invalid Saudi mobile number; no records were changed.");
      }

      const name = columns[0].trim();
      if (name.length < 2) {
        skippedShortNames++;
        continue;
      }
      const email = normalizeEmail(columns[2] || "");
      rawRows++;

      const existing = byPhone.get(phone);
      if (existing) {
        duplicateRows++;
        if (existing.name !== name || (existing.email && email && existing.email !== email)) {
          abort("The customer export has conflicting rows for the same mobile number; no records were changed.");
        }
        if (!existing.email && email) existing.email = email;
      } else {
        byPhone.set(phone, { phone, name, ...(email ? { email } : {}) });
      }
    }
    if (fileHasCustomerHeader) customerSourceFileCount++;
  }

  if (!sawCustomerHeader || byPhone.size === 0) {
    abort("No valid customer records were found in the attached Foodics export.");
  }
  if (paginationTotals.size !== 1 || !paginationTotals.has(EXPORT_TOTAL)) {
    abort("The customer export pagination does not match the expected 1,025-record export.");
  }

  const emailToPhone = new Map<string, string>();
  for (const customer of byPhone.values()) {
    if (!customer.email) continue;
    const priorPhone = emailToPhone.get(customer.email);
    if (priorPhone && priorPhone !== customer.phone) {
      abort("The customer export reuses an email address for different mobile numbers; no records were changed.");
    }
    emailToPhone.set(customer.email, customer.phone);
  }

  return {
    customers: [...byPhone.values()],
    rawRows,
    skippedShortNames,
    duplicateRows,
    missingEmailCustomers: [...byPhone.values()].filter((customer) => !customer.email).length,
    sourceFileCount: customerSourceFileCount,
    exportTotal: EXPORT_TOTAL,
    missingPages: missingRanges(coveredPages, EXPORT_TOTAL),
  };
}

function normalizeStoredEmail(value?: string): string | undefined {
  const email = value?.trim().toLowerCase();
  return email || undefined;
}

async function main() {
  if (!MONGODB_URI) abort("MONGODB_URI must be configured.");
  const dbFromUri = new URL(MONGODB_URI).pathname.replace(/^\/+/, "").split("/")[0];
  const databaseName = dbFromUri || MONGODB_DATABASE;
  if (!databaseName || /qirox/i.test(databaseName)) abort("Refusing to import without the configured Elwa database.");
  if (dbFromUri && MONGODB_DATABASE && dbFromUri !== MONGODB_DATABASE) {
    abort("MONGODB_DATABASE does not match the configured MongoDB database.");
  }

  const source = await readExport();
  await mongoose.connect(MONGODB_URI, { dbName: databaseName, serverSelectionTimeoutMS: 10000 });

  try {
    const existingCustomers = await CustomerModel.find({})
      .select({ phone: 1, email: 1, name: 1 })
      .lean();
    const existingByPhone = new Map<string, (typeof existingCustomers)[number]>();
    const existingByEmail = new Map<string, (typeof existingCustomers)[number]>();

    for (const existing of existingCustomers) {
      const phone = normalizeSaudiMobile(existing.phone || "");
      if (phone) {
        if (existingByPhone.has(phone)) {
          abort("The database already contains duplicate normalized customer mobile numbers; no records were changed.");
        }
        existingByPhone.set(phone, existing);
      }
      const email = normalizeStoredEmail(existing.email);
      if (email) {
        const prior = existingByEmail.get(email);
        if (prior && normalizeSaudiMobile(prior.phone || "") !== phone) {
          abort("The database already contains duplicate customer email addresses; no records were changed.");
        }
        existingByEmail.set(email, existing);
      }
    }

    let matchingExisting = 0;
    const newCustomers: ImportCustomer[] = [];
    for (const customer of source.customers) {
      const existing = existingByPhone.get(customer.phone);
      const existingEmail = normalizeStoredEmail(existing?.email);
      if (existing) {
        if (String(existing.name || "").trim() !== customer.name) {
          abort("A source mobile number matches a different existing customer name; no records were changed.");
        }
        if (existingEmail && customer.email && existingEmail !== customer.email) {
          abort("A source mobile number matches a customer with a different email; no records were changed.");
        }
        matchingExisting++;
        continue;
      }

      const emailOwner = customer.email ? existingByEmail.get(customer.email) : undefined;
      if (emailOwner && normalizeSaudiMobile(emailOwner.phone || "") !== customer.phone) {
        abort("A source email address belongs to a different existing customer; no records were changed.");
      }
      newCustomers.push(customer);
    }

    console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
    console.log(`Target database: ${databaseName}`);
    console.log(`Customer export pages supplied from ${source.sourceFileCount} source files.`);
    console.log(`Export total: ${source.exportTotal}; currently available pages are incomplete.`);
    console.log(`Customer rows with usable names and mobiles: ${source.rawRows}`);
    console.log(`Unique eligible customers after page deduplication: ${source.customers.length}`);
    console.log(`Duplicate page rows removed: ${source.duplicateRows}`);
    console.log(`Unique customers with no email: ${source.missingEmailCustomers}`);
    console.log(`Rows skipped for names shorter than two characters: ${source.skippedShortNames}`);
    console.log(`Existing matching customers kept unchanged: ${matchingExisting}`);
    console.log(`New customer records to add: ${newCustomers.length}`);
    console.log(`Missing page ranges: ${source.missingPages.join(", ") || "none"}`);
    console.log("Passwords, account balances, order totals, and loyalty records will not be imported.");

    if (!APPLY) {
      console.log("No data was changed. Re-run with --apply to add only missing eligible customers.");
      return;
    }

    if (newCustomers.length) {
      const now = new Date();
      await CustomerModel.bulkWrite(
        newCustomers.map((customer) => ({
          updateOne: {
            filter: { phone: customer.phone },
            update: {
              $setOnInsert: {
                ...customer,
                registeredBy: "foodics",
                isPasswordSet: 0,
                points: 0,
                pendingPoints: 0,
                walletBalance: 0,
                createdAt: now,
              },
            },
            upsert: true,
          },
        })),
      );
    }

    const verifiedCustomers = await CustomerModel.find({})
      .select({ phone: 1, registeredBy: 1 })
      .lean();
    const expectedPhones = new Set(source.customers.map((customer) => customer.phone));
    const verifiedPhones = new Set<string>();
    let foodicsCount = 0;
    for (const customer of verifiedCustomers) {
      const phone = normalizeSaudiMobile(customer.phone || "");
      if (phone && expectedPhones.has(phone)) {
        verifiedPhones.add(phone);
        if (customer.registeredBy === "foodics") foodicsCount++;
      }
    }
    if (verifiedPhones.size !== source.customers.length || foodicsCount < newCustomers.length) {
      abort("Post-import verification failed; check the database before retrying.");
    }
    console.log(`Verified: ${verifiedPhones.size} available unique customers are present; ${foodicsCount} marked as Foodics-imported.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(() => {
  console.error("Customer import stopped. No personal values were written to logs; review the source/database conflicts before retrying.");
  process.exitCode = 1;
});