import { randomUUID } from "crypto";

export interface ProductImageAssetRecord {
  id: string;
  tenantId: string;
  fileName: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  imageData: Buffer;
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
  model: ProductImageAssetModel;
  optimize: (buffer: Buffer) => Promise<Buffer>;
  now?: () => Date;
}): Promise<ProductImageLibraryEntry> {
  const optimizedBuffer = await options.optimize(options.inputBuffer);
  if (!optimizedBuffer.length) {
    throw new ProductImageUploadError("لم يتم إنشاء بيانات للصورة بعد المعالجة");
  }
  const id = randomUUID();
  const url = `/api/product-images/${id}/image`;
  const uploadedAt = (options.now || (() => new Date()))();
  const asset = await options.model.create({
    id,
    tenantId: options.tenantId,
    fileName: options.originalFilename,
    url,
    contentType: "image/webp",
    sizeBytes: optimizedBuffer.length,
    imageData: optimizedBuffer,
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
