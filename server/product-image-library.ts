export interface ProductImageStorage {
  getObjectEntityUploadURL(): Promise<string>;
  normalizeObjectEntityPath(path: string): string;
  trySetObjectEntityAclPolicy(
    path: string,
    policy: { owner: string; visibility: "public" | "private" },
  ): Promise<string>;
}

export interface ProductImageAssetRecord {
  id: string;
  tenantId: string;
  fileName: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy?: string;
  uploadedAt: Date;
}

export interface ProductImageAssetModel {
  create(record: ProductImageAssetRecord): Promise<ProductImageAssetRecord>;
  find(filter: { tenantId: string }): {
    sort(order: { uploadedAt: -1 }): {
      lean(): Promise<ProductImageAssetRecord[]>;
    };
  };
}

export interface ProductImageLibraryEntry {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
}

export class ProductImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductImageUploadError";
  }
}

export async function saveProductImageAsset(options: {
  inputBuffer: Buffer;
  originalFilename: string;
  tenantId: string;
  uploadedBy?: string;
  storage: ProductImageStorage;
  model: ProductImageAssetModel;
  optimize: (buffer: Buffer) => Promise<Buffer>;
  upload?: typeof fetch;
  now?: () => Date;
}): Promise<ProductImageLibraryEntry> {
  const optimizedBuffer = await options.optimize(options.inputBuffer);
  const uploadURL = await options.storage.getObjectEntityUploadURL();
  const objectPath = options.storage.normalizeObjectEntityPath(uploadURL);
  const upload = options.upload || fetch;
  const uploadResponse = await upload(uploadURL, {
    method: "PUT",
    body: optimizedBuffer as unknown as BodyInit,
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(optimizedBuffer.length),
    },
  });

  if (!uploadResponse.ok) {
    throw new ProductImageUploadError("Object storage upload failed");
  }

  await options.storage.trySetObjectEntityAclPolicy(objectPath, {
    owner: options.tenantId,
    visibility: "public",
  });

  const uploadedAt = (options.now || (() => new Date()))();
  const asset = await options.model.create({
    id: objectPath,
    tenantId: options.tenantId,
    fileName: options.originalFilename,
    url: objectPath,
    contentType: "image/webp",
    sizeBytes: optimizedBuffer.length,
    uploadedBy: options.uploadedBy,
    uploadedAt,
  });

  return {
    id: asset.id,
    filename: asset.fileName,
    url: asset.url,
    uploadedAt: asset.uploadedAt.toISOString(),
  };
}

export async function listProductImageAssets(options: {
  tenantId: string;
  model: ProductImageAssetModel;
  legacyImages?: ProductImageLibraryEntry[];
}): Promise<ProductImageLibraryEntry[]> {
  const storedAssets = await options.model
    .find({ tenantId: options.tenantId })
    .sort({ uploadedAt: -1 })
    .lean();

  const entries = storedAssets.map((image) => ({
    id: image.id,
    filename: image.fileName,
    url: image.url,
    uploadedAt: new Date(image.uploadedAt).toISOString(),
  }));

  entries.push(...(options.legacyImages || []));
  entries.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
  return entries;
}
