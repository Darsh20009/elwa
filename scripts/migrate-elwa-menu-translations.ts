import mongoose from "mongoose";
import { CoffeeItemModel, MenuCategoryModel } from "../shared/schema";

const TENANT_ID = "elwa-specialty-coffee";
const BRANCH_ID = "elwa-bahrah";

const productNamesEn: Record<string, string> = {
  "foodics-bahrah-sk-0123": "Affogato",
  "foodics-bahrah-sk-0127": "World Coffee Day Offer — October 1",
  "foodics-bahrah-sk-0122": "Large Ice Cream",
  "foodics-bahrah-sk-0121": "Small Ice Cream",
  "foodics-bahrah-sk-0119": "Large Flat White",
  "foodics-bahrah-sk-0118": "Large Latte",
  "foodics-bahrah-sk-0117": "Large Cappuccino",
  "foodics-bahrah-sk-0116": "Large Black Tea",
  "foodics-bahrah-sk-0115": "Signature Espresso",
  "foodics-bahrah-sk-0114": "Fun Box for Two",
  "foodics-bahrah-sk-0113": "Fun Box for One",
  "foodics-bahrah-sk-0110": "Saudi Coffee Box",
  "foodics-bahrah-sk-0109": "Iced Hibiscus Box",
  "foodics-bahrah-sk-0108": "Hot Chocolate Box",
  "foodics-bahrah-sk-0106": "Iced Spiced Spanish Latte",
  "foodics-bahrah-sk-0105": "Spiced Spanish Latte",
  "foodics-bahrah-sk-0104": "Creamy Hot Chocolate with Marshmallows",
  "foodics-bahrah-sk-0103": "Iced Honey Cinnamon Latte",
  "foodics-bahrah-sk-0102": "Honey Cinnamon Latte",
  "foodics-bahrah-sk-0101": "Brownie Cheesecake",
  "foodics-bahrah-sk-0097": "Coffee of the Day Box",
  "foodics-bahrah-sk-0089": "Peach Iced Tea",
  "foodics-bahrah-sk-0086": "Brazilian Coffee",
  "foodics-bahrah-sk-0085": "Colombian La Vista",
  "foodics-bahrah-sk-0084": "Ethiopian Shakiso",
  "foodics-bahrah-sk-0083": "Yemeni Coffee",
  "foodics-bahrah-sk-0082": "Colombian Mango",
  "foodics-bahrah-sk-0076": "Salted Caramel",
  "foodics-bahrah-sk-0075": "Iced Salted Caramel",
  "foodics-bahrah-sk-0074": "Milk",
  "foodics-bahrah-sk-0073": "Cup",
  "foodics-bahrah-sk-0072": "Ahmed Al-Zamil Cake",
  "foodics-bahrah-sk-0070": "Match Table Reservation",
  "foodics-bahrah-sk-0069": "Elwa Tea",
  "foodics-bahrah-sk-0068": "Black Tea Pot",
  "foodics-bahrah-sk-0067": "Black Tea",
  "foodics-bahrah-sk-0066": "Upside-Down Cheesecake",
  "foodics-bahrah-sk-0064": "Elwa Signature",
  "foodics-bahrah-sk-0063": "Rose Berry Mojito",
  "foodics-bahrah-sk-0062": "Blueberry Mojito",
  "foodics-bahrah-sk-0061": "Watermelon Mojito",
  "foodics-bahrah-sk-0060": "Passion Fruit Mojito",
  "foodics-bahrah-sk-0059": "Iced Hibiscus",
  "foodics-bahrah-sk-0053": "Premium Iced V60",
  "foodics-bahrah-sk-0052": "Premium Hot V60",
  "foodics-bahrah-sk-0051": "Turkish Coffee with Milk",
  "foodics-bahrah-sk-0050": "French Coffee with Hazelnut",
  "foodics-bahrah-sk-0049": "Turkish Coffee with Cardamom",
  "foodics-bahrah-sk-0048": "Sahlab",
  "foodics-bahrah-sk-0046": "San Sebastian Cheesecake",
  "foodics-bahrah-sk-0045": "Honey Cake",
  "foodics-bahrah-sk-0043": "Occasion Package",
  "foodics-bahrah-sk-0042": "Ice",
  "foodics-bahrah-sk-0040": "Iced V60",
  "foodics-bahrah-sk-0038": "Iced Coffee of the Day",
  "foodics-bahrah-sk-0037": "Iced Latte",
  "foodics-bahrah-sk-0036": "Iced Spanish Latte",
  "foodics-bahrah-sk-0035": "Iced White Mocha",
  "foodics-bahrah-sk-0034": "Iced Dark Mocha",
  "foodics-bahrah-sk-0033": "Iced Matcha",
  "foodics-bahrah-sk-0032": "Iced Americano",
  "foodics-bahrah-sk-0031": "Iced Caramel Macchiato",
  "foodics-bahrah-sk-0029": "Caramel Macchiato",
  "foodics-bahrah-sk-0027": "White Mocha",
  "foodics-bahrah-sk-0026": "Hot Coffee of the Day",
  "foodics-bahrah-sk-0019": "Crispy Cake",
  "foodics-bahrah-sk-0018": "Cookies",
  "foodics-bahrah-sk-0017": "Water",
  "foodics-bahrah-sk-0016": "Matcha",
  "foodics-bahrah-sk-0015": "Hot Chocolate",
  "foodics-bahrah-sk-0014": "Saudi Coffee Cup",
  "foodics-bahrah-sk-0013": "Saudi Coffee Pot",
  "foodics-bahrah-sk-0012": "Hot V60",
  "foodics-bahrah-sk-0010": "Dark Mocha",
  "foodics-bahrah-sk-0009": "Spanish Latte",
  "foodics-bahrah-sk-0008": "Cappuccino",
  "foodics-bahrah-sk-0007": "Latte",
  "foodics-bahrah-sk-0006": "Flat White",
  "foodics-bahrah-sk-0005": "Cortado",
  "foodics-bahrah-sk-0004": "Americano",
  "foodics-bahrah-sk-0003": "Espresso Macchiato",
  "foodics-bahrah-sk-0002": "Espresso",
};

const categoryNamesEn: Record<string, string> = {
  "آيس كريم": "Ice Cream",
  "الإسبريسو": "Espresso",
  "الحفلات": "Celebrations & Events",
  "الحلويات": "Desserts",
  "الشاي": "Tea",
  "العروض": "Offers",
  "المحاصيل": "Coffee Beans",
  "المشروبات الشتوية": "Winter Drinks",
  "المشروبات المقطرة": "Pour-Over Coffee",
  "بوكس الجمعات": "Gathering Boxes",
  "مشروبات آخرى": "Other Drinks",
  "مشروبات الإسبريسو": "Espresso Drinks",
  "مشروبات باردة": "Cold Drinks",
  "موهيتو": "Mojitos",
};

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");

  const databaseFromUri = new URL(uri).pathname.replace(/^\/+/, "").split("/")[0];
  const databaseName = databaseFromUri || process.env.MONGODB_DATABASE;
  if (!databaseName || /qirox/i.test(databaseName)) {
    throw new Error("Refusing to run without the tenant database configured");
  }
  if (databaseFromUri && process.env.MONGODB_DATABASE && databaseFromUri !== process.env.MONGODB_DATABASE) {
    throw new Error("MONGODB_DATABASE does not match the configured connection");
  }

  await mongoose.connect(uri, { dbName: databaseName, serverSelectionTimeoutMS: 5000 });
  try {
    const categories = await MenuCategoryModel.find({
      tenantId: TENANT_ID,
      branchId: BRANCH_ID,
    }).exec();
    const categoriesByArabicName = new Map(categories.map((category) => [category.nameAr, category]));
    const missingCategories = Object.keys(categoryNamesEn).filter((nameAr) => !categoriesByArabicName.has(nameAr));
    if (missingCategories.length) {
      throw new Error(`Missing expected menu categories: ${missingCategories.join(", ")}`);
    }

    const productIds = Object.keys(productNamesEn);
    const products = await CoffeeItemModel.find({
      tenantId: TENANT_ID,
      id: { $in: productIds },
    }).exec();
    if (products.length !== productIds.length) {
      const found = new Set(products.map((product) => product.id));
      const missingProducts = productIds.filter((id) => !found.has(id));
      throw new Error(`Expected ${productIds.length} products; missing ${missingProducts.length}`);
    }

    const productUpdates = products.flatMap((product) => {
      const category = categoriesByArabicName.get(product.category);
      if (!category) {
        throw new Error(`No linked category found for product ${product.id}`);
      }
      if (product.nameEn?.trim() && product.categoryId === category.id) return [];
      return {
        updateOne: {
          filter: { tenantId: TENANT_ID, id: product.id },
          update: {
            $set: {
              nameEn: product.nameEn?.trim() || productNamesEn[product.id],
              categoryId: category.id,
              updatedAt: new Date(),
            },
          },
        },
      };
    });
    const categoryUpdates = categories
      .filter((category) => categoryNamesEn[category.nameAr] && !category.nameEn?.trim())
      .map((category) => ({
        updateOne: {
          filter: { tenantId: TENANT_ID, id: category.id },
          update: { $set: { nameEn: categoryNamesEn[category.nameAr], updatedAt: new Date() } },
        },
      }));

    const [productsResult, categoriesResult] = await Promise.all([
      CoffeeItemModel.bulkWrite(productUpdates),
      categoryUpdates.length ? MenuCategoryModel.bulkWrite(categoryUpdates) : Promise.resolve(null),
    ]);

    const verifiedProducts = await CoffeeItemModel.find({
      tenantId: TENANT_ID,
      id: { $in: productIds },
    }).select("id nameEn categoryId").lean();
    const incomplete = verifiedProducts.filter((product) => !product.nameEn?.trim() || !product.categoryId);
    if (incomplete.length) throw new Error(`Verification failed for ${incomplete.length} products`);

    console.log(
      `Updated ${verifiedProducts.length} products; linked ${productsResult.modifiedCount} product records; ` +
      `filled ${categoriesResult?.modifiedCount ?? 0} category translations.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

migrate().catch((error: unknown) => {
  const message = (error instanceof Error ? error.message : "Unknown migration error")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s'"<>]+/gi, "[database connection]");
  console.error(`Menu translation migration failed: ${message}`);
  process.exitCode = 1;
});