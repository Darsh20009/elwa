import mongoose from "mongoose";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  BranchModel,
  CoffeeItemModel,
  MenuCategoryModel,
} from "../shared/schema";

const TENANT_ID = process.env.TENANT_ID;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
const BRANCH_ID = "elwa-bahrah";
const MAPS_URL = "https://maps.app.goo.gl/6H9bRVzpCAbF1c6ZA?g_st=ic";
const EXPECTED_PRODUCTS = 82;
const EXPECTED_CATEGORIES = 14;
const apply = process.argv.includes("--apply");

const productFiles = [
  "attached_assets/Pasted--1-sk-0127--1791156734597_1791156734598.txt",
  "attached_assets/Pasted--sk-0045--1791158430492_1791158430492.txt",
];

type FoodicsProduct = {
  nameAr: string;
  sku: string;
  category: string;
  price: number;
};

const foodCategories = new Set([
  "آيس كريم",
  "الحفلات",
  "الحلويات",
  "العروض",
  "بوكس الجمعات",
]);

function fail(message: string): never {
  throw new Error(message);
}

function stableCategoryId(name: string): string {
  const digest = createHash("sha256").update(name, "utf8").digest("hex").slice(0, 16);
  return `foodics-bahrah-category-${digest}`;
}

function parsePrice(value: string): number {
  const normalized = value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^\d.]/g, "");
  const price = Number(normalized);
  if (!Number.isFinite(price) || price < 0) fail(`Invalid product price: ${value}`);
  return price;
}

async function readProducts(): Promise<FoodicsProduct[]> {
  const products: FoodicsProduct[] = [];
  for (const relativePath of productFiles) {
    const source = await readFile(resolve(process.cwd(), relativePath), "utf8");
    for (const line of source.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const fields = line.split("\t").map((field) => field.trim());
      const sku = fields[1] || "";
      if (!/^sk-\d{4}$/.test(sku)) continue;
      if (fields.length < 6 || fields[5] !== "نشط") {
        fail(`Foodics product ${sku} is not an active, complete export row`);
      }
      const nameAr = (fields[0] || "").replace(/^\uFEFF/, "");
      const category = fields[2] || "";
      if (!nameAr || !category) fail(`Foodics product ${sku} is missing a name or category`);
      products.push({ nameAr, sku, category, price: parsePrice(fields[3] || "") });
    }
  }

  const skuSet = new Set(products.map((product) => product.sku));
  if (products.length !== EXPECTED_PRODUCTS || skuSet.size !== EXPECTED_PRODUCTS) {
    fail(`Expected ${EXPECTED_PRODUCTS} unique active products; found ${products.length}`);
  }
  const categories = new Set(products.map((product) => product.category));
  if (categories.size !== EXPECTED_CATEGORIES) {
    fail(`Expected ${EXPECTED_CATEGORIES} categories; found ${categories.size}`);
  }
  return products;
}

async function main() {
  if (!TENANT_ID || !MONGODB_URI) fail("TENANT_ID and MONGODB_URI must be configured");
  const dbFromUri = new URL(MONGODB_URI).pathname.replace(/^\/+/, "").split("/")[0];
  const databaseName = dbFromUri || MONGODB_DATABASE;
  if (!databaseName || /qirox/i.test(databaseName)) {
    fail("Refusing to import without a configured Elwa database");
  }
  if (dbFromUri && MONGODB_DATABASE && dbFromUri !== MONGODB_DATABASE) {
    fail("MONGODB_DATABASE does not match the configured MongoDB database");
  }

  const products = await readProducts();
  const categories = [...new Set(products.map((product) => product.category))].sort((a, b) =>
    a.localeCompare(b, "ar"),
  );
  const now = new Date();

  const branchDocument = {
    id: BRANCH_ID,
    tenantId: TENANT_ID,
    cafeId: TENANT_ID,
    nameAr: "فرع بحرة",
    nameEn: "Bahrah",
    address: "ج5921، بحره 22826",
    city: "بحرة",
    phone: "055 027 7975",
    mapsUrl: MAPS_URL,
    isActive: true,
    isMainBranch: false,
    isMaintenanceMode: false,
    isOnline: true,
    allowOnlineOrders: true,
    allowCarOrders: true,
    allowTableOrders: true,
    createdAt: now,
  };

  const categoryDocuments = categories.map((nameAr, orderIndex) => ({
    id: stableCategoryId(nameAr),
    tenantId: TENANT_ID,
    branchId: BRANCH_ID,
    nameAr,
    icon: "Coffee",
    department: foodCategories.has(nameAr) ? "food" : "drinks",
    orderIndex,
    isSystem: false,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  }));

  const itemDocuments = products.map((product) => ({
    id: `foodics-bahrah-${product.sku}`,
    tenantId: TENANT_ID,
    nameAr: product.nameAr,
    description: product.nameAr,
    price: product.price,
    category: product.category,
    menuType: foodCategories.has(product.category) ? "food" : "drinks",
    sku: product.sku,
    isAvailable: 1,
    availabilityStatus: "available",
    isNewProduct: 0,
    createdByBranchId: BRANCH_ID,
    publishedBranches: [BRANCH_ID],
    branchAvailability: [{ branchId: BRANCH_ID, isAvailable: 1, price: product.price }],
    hasRecipe: 0,
    requiresRecipe: 0,
    costOfGoods: 0,
    profitMargin: product.price,
    salesCount: 0,
    createdAt: now,
    updatedAt: now,
  }));

  await mongoose.connect(MONGODB_URI, { dbName: databaseName, serverSelectionTimeoutMS: 10000 });
  try {
    const branchWithId = await BranchModel.findOne({ id: BRANCH_ID }).lean();
    if (branchWithId && branchWithId.tenantId !== TENANT_ID) {
      fail(`Branch ID ${BRANCH_ID} is already owned by another tenant`);
    }
    const branchWithName = await BranchModel.findOne({
      tenantId: TENANT_ID,
      nameAr: branchDocument.nameAr,
      id: { $ne: BRANCH_ID },
    }).lean();
    if (branchWithName) fail("A Bahrah branch with a different ID already exists for this tenant");

    const categoryIds = categoryDocuments.map((category) => category.id);
    const categoryNames = categoryDocuments.map((category) => category.nameAr);
    const existingCategories = await MenuCategoryModel.find({
      $or: [
        { id: { $in: categoryIds } },
        { tenantId: TENANT_ID, branchId: BRANCH_ID, nameAr: { $in: categoryNames } },
      ],
    }).lean();
    const existingCategoryByName = new Map(
      existingCategories
        .filter((category) => category.tenantId === TENANT_ID && category.branchId === BRANCH_ID)
        .map((category) => [category.nameAr, category]),
    );
    for (const existing of existingCategories) {
      const expected = categoryDocuments.find((category) => category.id === existing.id);
      if (
        expected &&
        (existing.tenantId !== TENANT_ID ||
          existing.branchId !== BRANCH_ID ||
          existing.nameAr !== expected.nameAr)
      ) {
        fail(`Category ID collision detected for ${expected.nameAr}`);
      }
    }
    const categoriesToCreate = categoryDocuments.filter((category) => {
      const sameName = existingCategoryByName.get(category.nameAr);
      if (sameName && sameName.department !== category.department) {
        fail(`Existing category department differs for ${category.nameAr}`);
      }
      return !sameName;
    });

    const itemIds = itemDocuments.map((item) => item.id);
    const productSkus = products.map((product) => product.sku);
    const existingItems = await CoffeeItemModel.find({
      $or: [
        { id: { $in: itemIds } },
        { tenantId: TENANT_ID, sku: { $in: productSkus } },
      ],
    }).select({ id: 1, tenantId: 1, sku: 1, createdByBranchId: 1 }).lean();
    const existingById = new Map(existingItems.map((item) => [item.id, item]));
    const existingBySku = new Map(existingItems.map((item) => [item.sku, item]));
    for (const item of itemDocuments) {
      const sameId = existingById.get(item.id);
      const sameSku = existingBySku.get(item.sku);
      if (sameId && sameId.tenantId !== TENANT_ID) {
        fail(`Product ID collision detected for ${item.sku}`);
      }
      if (sameSku && sameSku.id !== item.id) {
        fail(`Foodics SKU ${item.sku} already exists under a different product ID`);
      }
      if (
        sameId &&
        (sameId.sku !== item.sku || sameId.createdByBranchId !== BRANCH_ID)
      ) {
        fail(`Existing product ${item.sku} does not match the Bahrah import identity`);
      }
    }
    const itemsToCreate = itemDocuments.filter(
      (item) => !existingById.has(item.id) && !existingBySku.has(item.sku),
    );

    const branchAction = branchWithId ? "keep existing" : "create";
    console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
    console.log(`Target database: ${databaseName}`);
    console.log(`Branch: ${branchAction}`);
    console.log(`Categories: create ${categoriesToCreate.length}, keep ${EXPECTED_CATEGORIES - categoriesToCreate.length}`);
    console.log(`Products: create ${itemsToCreate.length}, keep ${EXPECTED_PRODUCTS - itemsToCreate.length}`);
    console.log("Recipe/inventory links: disabled for all imported products");

    if (!apply) {
      console.log("No data was changed. Re-run with --apply to insert only missing records.");
      return;
    }

    if (!branchWithId) {
      await BranchModel.updateOne(
        { id: BRANCH_ID },
        { $setOnInsert: branchDocument },
        { upsert: true },
      );
    }
    if (categoriesToCreate.length) {
      await MenuCategoryModel.bulkWrite(
        categoriesToCreate.map((category) => ({
          updateOne: {
            filter: { id: category.id },
            update: { $setOnInsert: category },
            upsert: true,
          },
        })),
      );
    }
    if (itemsToCreate.length) {
      await CoffeeItemModel.bulkWrite(
        itemsToCreate.map((item) => ({
          updateOne: {
            filter: { id: item.id },
            update: { $setOnInsert: item },
            upsert: true,
          },
        })),
      );
    }

    const [branchCount, categoryCount, itemCount] = await Promise.all([
      BranchModel.countDocuments({ id: BRANCH_ID, tenantId: TENANT_ID }),
      MenuCategoryModel.countDocuments({
        tenantId: TENANT_ID,
        branchId: BRANCH_ID,
        id: { $in: categoryIds },
      }),
      CoffeeItemModel.countDocuments({
        tenantId: TENANT_ID,
        createdByBranchId: BRANCH_ID,
        id: { $in: itemIds },
      }),
    ]);
    if (branchCount !== 1 || categoryCount !== EXPECTED_CATEGORIES || itemCount !== EXPECTED_PRODUCTS) {
      fail(
        `Post-import verification failed: branch=${branchCount}, categories=${categoryCount}, products=${itemCount}`,
      );
    }
    console.log(`Verified: ${branchCount} branch, ${categoryCount} categories, ${itemCount} products.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`Bahrah import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});