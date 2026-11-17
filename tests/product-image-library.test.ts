import assert from "node:assert/strict";
import test from "node:test";
import {
  listProductImageAssets,
  ProductImageUploadError,
  saveProductImageAsset,
} from "../server/product-image-library";

test("stores an optimized image buffer in MongoDB and returns its image route", async () => {
  const inputBuffer = Buffer.from("original");
  const optimizedBuffer = Buffer.from("optimized-webp");
  const created: any[] = [];
  let optimizedInput: Buffer | undefined;

  const result = await saveProductImageAsset({
    inputBuffer,
    originalFilename: "drink.jpg",
    tenantId: "tenant-1",
    uploadedBy: "manager-1",
    model: {
      async create(record) {
        created.push(record);
        return record;
      },
      find() {
        throw new Error("Listing is not expected during upload");
      },
    },
    async optimize(buffer) {
      optimizedInput = buffer;
      return optimizedBuffer;
    },
    now: () => new Date("2026-11-17T10:00:00.000Z"),
  });

  assert.equal(optimizedInput, inputBuffer);
  assert.equal(created[0].sizeBytes, optimizedBuffer.length);
  assert.equal(created[0].tenantId, "tenant-1");
  assert.equal(created[0].imageData, optimizedBuffer);
  assert.equal(created[0].contentType, "image/webp");
  assert.match(created[0].id, /^[0-9a-f-]{36}$/i);
  assert.equal(created[0].url, `/api/product-images/${created[0].id}/image`);
  assert.equal(result.id, created[0].id);
  assert.equal(result.filename, "drink.jpg");
  assert.equal(result.url, created[0].url);
  assert.equal(result.uploadedAt, "2026-11-17T10:00:00.000Z");
});

test("does not create an asset when image optimization produces no bytes", async () => {
  let created = false;
  await assert.rejects(
    saveProductImageAsset({
      inputBuffer: Buffer.from("image"),
      originalFilename: "drink.jpg",
      tenantId: "tenant-1",
      model: {
        async create(record) {
          created = true;
          return record;
        },
        find() {
          throw new Error("Listing is not expected during upload");
        },
      },
      async optimize() { return Buffer.alloc(0); },
    }),
    ProductImageUploadError,
  );
  assert.equal(created, false);
});

test("lists saved images for only the requested tenant with legacy images", async () => {
  let filter: { tenantId: string } | undefined;
  let sort: { uploadedAt: -1 } | undefined;
  const result = await listProductImageAssets({
    tenantId: "tenant-a",
    model: {
      async create(record) { return record; },
      find(query) {
        filter = query;
        return {
          sort(order) {
            sort = order;
            return {
              async lean() {
                return [{
                  id: "/objects/new-image",
                  tenantId: "tenant-a",
                  fileName: "new.webp",
                  url: "/objects/new-image",
                  contentType: "image/webp",
                  sizeBytes: 42,
                  uploadedAt: new Date("2026-11-17T11:00:00.000Z"),
                }];
              },
            };
          },
        };
      },
    },
    legacyImages: [{
      id: "legacy:old.jpg",
      filename: "old.jpg",
      url: "/attached_assets/drinks/old.jpg",
      uploadedAt: "2026-11-16T10:00:00.000Z",
    }],
  });

  assert.deepEqual(filter, { tenantId: "tenant-a" });
  assert.deepEqual(sort, { uploadedAt: -1 });
  assert.deepEqual(result.map((image) => image.filename), ["new.webp", "old.jpg"]);
});
