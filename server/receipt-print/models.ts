import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  branchId: { type: String, required: true },
  name: { type: String, default: "" },
  manufacturer: { type: String, default: "" },
  model: { type: String, default: "" },
  paperWidth: { type: Number, enum: [58, 80], default: 80 },
  adapter: { type: String, enum: ["browser", "usb-bridge"], default: "browser" },
  tokenHash: { type: String, select: false },
  pairHash: { type: String, select: false },
  pairExpiresAt: Date,
  credentialVersion: { type: Number, default: 0 },
  lastSeenAt: Date,
  lastSuccessfulJob: String,
}, { timestamps: true });
configSchema.index({ tenantId: 1, branchId: 1 }, { unique: true });

const jobSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  branchId: { type: String, required: true },
  bridgeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId: String,
  actorId: { type: String, required: true },
  idempotencyKey: { type: String, required: true },
  // First print has a deterministic key, explicit reprints have unique keys.
  dedupeKey: { type: String, required: true },
  reprint: { type: Boolean, default: false },
  isTest: { type: Boolean, default: false },
  paperWidth: { type: Number, required: true },
  html: { type: String, required: true, select: false },
  status: { type: String, enum: ["pending", "processing", "spooled", "completed", "failed", "unknown"], default: "pending" },
  errorCode: String,
  claimHash: { type: String, select: false },
  claimedAt: Date,
  credentialVersion: Number,
  spoolId: String,
  finishedAt: Date,
}, { timestamps: true });
jobSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true });
jobSchema.index({ tenantId: 1, dedupeKey: 1 }, { unique: true });
jobSchema.index({ bridgeId: 1, status: 1, createdAt: 1 });
// No automatic deletion: deduplication and audit records must survive restarts.
export const ReceiptPrinter = mongoose.models.ReceiptPrinter || mongoose.model("ReceiptPrinter", configSchema);
export const ReceiptPrintJob = mongoose.models.ReceiptPrintJob || mongoose.model("ReceiptPrintJob", jobSchema);
