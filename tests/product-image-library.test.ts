import assert from "node:assert/strict";
import test from "node:test";
import {
  listProductImageAssets,
  ProductImageAssetModel,
  ProductImageStorage,
  ProductImageUploadError,
  saveProductImageAsset,
} from "../server/product-image-library";

test("uploads an optimized image and records it for the same tenant", async () => {
  const inputBuffer = Buffer.from("original");
  const optimizedBuffer = Buffer.from("optimized-webp");
  const uploadCalls: Array<{ url: string; init?: RequestInit }> = [];
  const created: any[] = [];
  const aclCalls: any[] = [];
  const storage: ProductImageStorage = {
    async getObjectEntityUploadURL() {
      return "https://storage.example/signed-upload";
    },
    normalizeObjectEntityPath() {
      return "/objects/uploads/image-1";
    },
    async trySetObjectEntityAclPolicy(path, policy) {
      aclCalls.push({ path, policy });
      return path;
    },
  };

  const result = await saveProductImageAsset({
    inputBuffer,
    originalFilename: "drink.jpg",
    tenantId: "tenant-1",
    uploadedBy: "manager-1",
    storage,
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
      assert.equal(buffer, inputBuffer);
      return optimizedBuffer;
    },
    async upload(url, init) {
      uploadCalls.push({ url, init });
      return new Response(null, { status: 200 });
    },
    now: () => new Date("2026-11-17T10:00:00.000Z"),
  });

  assert.equal(uploadCalls.length, 1);
  assert.equal(uploadCalls[0].url, "https://storage.example/signed-upload");
  assert.equal(uploadCalls[0].init?.method, "PUT");
  assert.equal(uploadCalls[0].init?.headers && (uploadCalls[0].init.headers as Record<string, string>)["Content-Type"], "image/webp");
  assert.equal(created[0].sizeBytes, optimizedBuffer.length);
  assert.equal(created[0].tenantId, "tenant-1");
  assert.deepEqual(aclCalls, [{
    path: "/objects/uploads/image-1",
    policy: { owner: "tenant-1", visibility: "public" },
  }]);
  assert.deepEqual(result, {
    id: "/objects/uploads/image-1",
    filename: "drink.jpg",
    url: "/objects/uploads/image-1",
    uploadedAt: "2026-11-17T10:00:00.000Z",
  });
});

test("does not create an asset if object storage rejects the upload", async () => {
  let created = false;
  await assert.rejects(
    saveProductImageAsset({
      inputBuffer: Buffer.from("image"),
      originalFilename: "drink.jpg",
      tenantId: "tenant-1",
      storage: {
        async getObjectEntityUploadURL() { return "https://storage.example/upload"; },
        normalizeObjectEntityPath() { return "/objects/image-2"; },
        async trySetObjectEntityAclPolicy(path) { return path; },
      },
      model: {
        async create(record) {
          created = true;
          return record;
        },
        find() {
          throw new Error("Listing is not expected during upload");
        },
      },
      async optimize(buffer) { return buffer; },
      async upload() { return new Response(null, { status: 500 }); },
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
