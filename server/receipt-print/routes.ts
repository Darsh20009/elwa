import { Router, type RequestHandler } from "express";
import { randomBytes, createHash } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { BranchModel, OrderModel, BusinessConfigModel } from "@shared/schema";
import { requireAuth, requireCashierAccess, type AuthRequest } from "../middleware/auth";
import { ReceiptPrinter, ReceiptPrintJob } from "./models";
import { renderReceipt, receiptHtml } from "./receipt";
import { isPrintManager, mayAccessBranch, isBridgeOnline, canRetryJob } from "./policy";

const router = Router();
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const id = z.string().regex(/^[a-f0-9]{24}$/i);
const key = z.string().min(16).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const text = z.string().trim().max(120);
const fail = (status: number, message: string) => Object.assign(new Error(message), { status });
const run = (fn: (req: any, res: any) => Promise<any>): RequestHandler => (req, res, next) => { Promise.resolve(fn(req, res)).catch(next); };
const bodyWithoutServerTenant = (req: any) => {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? { ...req.body } : {};
  // The app-wide SaaS gate injects the authoritative tenantId into every API body.
  delete body.tenantId;
  return body;
};

router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
router.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));
router.use((req, res, next) => {
  // Agent requests have no Origin. A browser Origin is supplementary, not authentication.
  if (!["GET", "HEAD"].includes(req.method) && req.get("origin") &&
      req.get("origin") !== `${req.protocol}://${req.get("host")}`) {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  next();
});

const manage: RequestHandler = (req: AuthRequest, res, next) =>
  isPrintManager(req.employee) ? next() : void res.status(403).json({ error: "Manager access required" });

async function branchScope(req: AuthRequest, requested?: string) {
  const employee = req.employee!;
  const branchId = requested || employee.branchId;
  const query: any = { tenantId: employee.tenantId };
  if (branchId) query.id = branchId;
  else if (!["admin", "owner"].includes(employee.role)) throw fail(403, "Assigned branch required");
  const branch: any = await BranchModel.findOne(query).sort({ isMainBranch: -1 }).lean();
  if (!branch || !mayAccessBranch(employee, branch.tenantId, branch.id)) throw fail(403, "Branch access denied");
  return { tenantId: employee.tenantId, branchId: branch.id };
}
async function configFor(scope: any) {
  return await ReceiptPrinter.findOne(scope) || { ...scope, adapter: "browser", paperWidth: 80, name: "", manufacturer: "", model: "" };
}
function publicConfig(c: any, employee?: any) {
  return { branchId: c.branchId, name: c.name, manufacturer: c.manufacturer, model: c.model,
    paperWidth: c.paperWidth, adapter: c.adapter, paired: Boolean(c.credentialVersion),
    online: isBridgeOnline(c.lastSeenAt), lastSeenAt: c.lastSeenAt || null,
    lastSuccessfulJob: c.lastSuccessfulJob || null, canManage: isPrintManager(employee) };
}
async function authorizedOrder(req: AuthRequest, orderId: string) {
  const order: any = await OrderModel.findOne({ _id: id.parse(orderId), tenantId: req.employee!.tenantId }).lean();
  if (!order || !mayAccessBranch(req.employee, order.tenantId, order.branchId)) throw fail(404, "Invoice unavailable");
  return order;
}
async function authorizedJob(req: AuthRequest, jobId: string) {
  const job: any = await ReceiptPrintJob.findOne({ _id: id.parse(jobId), tenantId: req.employee!.tenantId });
  if (!job || !mayAccessBranch(req.employee, job.tenantId, job.branchId)) throw fail(404, "Print job unavailable");
  return job;
}
function jobResult(job: any) { return { id: String(job._id), status: job.status }; }
async function checkedReceipt(order: any, business: any, width: 58 | 80, reprint = false) {
  const html = await renderReceipt(order, business, width, reprint);
  if (Buffer.byteLength(html, "utf8") > 2_000_000) throw fail(413, "Receipt is too large to print");
  return html;
}
async function expireClaims(bridgeId: any) {
  // Never resend a possibly submitted job after crash/restart.
  await ReceiptPrintJob.updateMany({ bridgeId, status: "processing",
    claimedAt: { $lt: new Date(Date.now() - 120_000) } },
  { $set: { status: "unknown", errorCode: "BRIDGE_INTERRUPTED", finishedAt: new Date() } });
}

// Agent-only routes precede employee session middleware.
router.post("/agent/pair", rateLimit({ windowMs: 300_000, max: 10 }), run(async (req, res) => {
  const body = z.object({ code: z.string().regex(/^[A-Fa-f0-9]{16}$/) }).strict().parse(bodyWithoutServerTenant(req));
  const token = randomBytes(32).toString("hex");
  const config: any = await ReceiptPrinter.findOneAndUpdate(
    { pairHash: hash(body.code.toUpperCase()), pairExpiresAt: { $gt: new Date() } },
    { $set: { tokenHash: hash(token), lastSeenAt: new Date() }, $inc: { credentialVersion: 1 },
      $unset: { pairHash: "", pairExpiresAt: "" } }, { new: true });
  if (!config) throw fail(401, "Pairing code invalid or expired");
  // A new installation must not resume jobs claimed by the previous credential.
  await ReceiptPrintJob.updateMany({ bridgeId: config._id, status: "processing" },
    { $set: { status: "unknown", errorCode: "CREDENTIAL_ROTATED", finishedAt: new Date() } });
  res.json({ token, bridgeId: String(config._id), paperWidth: config.paperWidth });
}));
router.use("/agent", (req: any, res, next) => {
  (async () => {
    const token = req.get("authorization")?.replace(/^Bearer /, "") || "";
    if (!/^[a-f0-9]{64}$/.test(token)) throw fail(401, "Bridge credential required");
    const config = await ReceiptPrinter.findOne({ tokenHash: hash(token) });
    if (!config) throw fail(401, "Bridge credential revoked");
    req.bridge = config;
    next();
  })().catch(next);
});

router.post("/agent/poll", run(async (req, res) => {
  z.object({}).strict().parse(bodyWithoutServerTenant(req));
  const config = req.bridge;
  await ReceiptPrinter.updateOne({ _id: config._id }, { $set: { lastSeenAt: new Date() } });
  await expireClaims(config._id);
  if (config.adapter !== "usb-bridge") return res.json({ job: null });
  const claimToken = randomBytes(32).toString("hex");
  const job: any = await ReceiptPrintJob.findOneAndUpdate(
    { bridgeId: config._id, status: "pending" },
    { $set: { status: "processing", claimedAt: new Date(), claimHash: hash(claimToken), credentialVersion: config.credentialVersion },
      $unset: { errorCode: "" } },
    { sort: { createdAt: 1 }, new: true }).select("+html");
  res.json({ job: job ? { id: String(job._id), html: job.html, paperWidth: job.paperWidth, claimToken } : null });
}));
router.post("/agent/jobs/:id/result", run(async (req, res) => {
  const body = z.object({
    claimToken: z.string().regex(/^[a-f0-9]{64}$/),
    status: z.enum(["spooled", "completed", "failed", "unknown"]),
    errorCode: z.enum(["RENDER_FAILED", "DRIVER_UNAVAILABLE", "SPOOL_UNCERTAIN", "SPOOL_FAILED", "BRIDGE_INTERRUPTED"]).optional(),
    spoolId: z.string().regex(/^[a-zA-Z0-9_.-]{1,100}$/).optional(),
  }).strict().parse(bodyWithoutServerTenant(req));
  const job: any = await ReceiptPrintJob.findOne({
    _id: id.parse(req.params.id), bridgeId: req.bridge._id, claimHash: hash(body.claimToken),
    credentialVersion: req.bridge.credentialVersion,
  });
  if (!job) throw fail(404, "Claim unavailable");
  if (job.status === body.status) return res.json({ ok: true }); // acknowledgement retry only
  if (!(job.status === "processing" || (job.status === "spooled" && ["completed", "unknown"].includes(body.status)))) {
    throw fail(409, "Invalid job state transition");
  }
  const changed = await ReceiptPrintJob.updateOne({ _id: job._id, status: job.status },
    { $set: { status: body.status, errorCode: body.errorCode, spoolId: body.spoolId,
      finishedAt: ["completed", "failed", "unknown"].includes(body.status) ? new Date() : undefined } });
  if (!changed.modifiedCount) throw fail(409, "Job state changed");
  if (body.status === "completed") {
    await ReceiptPrinter.updateOne({ _id: req.bridge._id }, { $set: { lastSuccessfulJob: String(job._id) } });
  }
  res.json({ ok: true, physicalConfirmed: false });
}));

router.use(requireAuth as RequestHandler, requireCashierAccess as RequestHandler);
router.get("/config", run(async (req, res) => {
  const scope = await branchScope(req, z.string().max(100).optional().parse(req.query.branchId));
  res.json(publicConfig(await configFor(scope), req.employee));
}));
router.put("/config", manage, run(async (req, res) => {
  const body = z.object({
    branchId: z.string().min(1).max(100), name: text, manufacturer: text, model: text,
    paperWidth: z.union([z.literal(58), z.literal(80)]), adapter: z.enum(["browser", "usb-bridge"]),
  }).strict().parse(bodyWithoutServerTenant(req));
  const scope = await branchScope(req, body.branchId);
  // A paper-width/driver change must not silently alter already queued receipts.
  const existing: any = await ReceiptPrinter.findOne(scope);
  if (existing && await ReceiptPrintJob.exists({ bridgeId: existing._id, status: { $in: ["pending", "processing"] } })) {
    throw fail(409, "Finish or revoke outstanding jobs before changing configuration");
  }
  const config = await ReceiptPrinter.findOneAndUpdate(scope, { $set: body }, { upsert: true, new: true, runValidators: true });
  res.json(publicConfig(config, req.employee));
}));
router.post("/pair-code", manage, run(async (req, res) => {
  const body = z.object({ branchId: z.string().min(1).max(100) }).strict().parse(bodyWithoutServerTenant(req));
  const scope = await branchScope(req, body.branchId);
  const code = randomBytes(8).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 300_000);
  const config = await ReceiptPrinter.findOneAndUpdate(scope,
    { $set: { pairHash: hash(code), pairExpiresAt: expiresAt } }, { upsert: true, new: true });
  res.json({ code, expiresAt, branchId: config.branchId });
}));
router.post("/revoke", manage, run(async (req, res) => {
  const body = z.object({ branchId: z.string().min(1).max(100) }).strict().parse(bodyWithoutServerTenant(req));
  const scope = await branchScope(req, body.branchId);
  const config = await ReceiptPrinter.findOneAndUpdate(scope,
    { $unset: { tokenHash: "", pairHash: "", pairExpiresAt: "", lastSeenAt: "" }, $set: { credentialVersion: 0 } },
    { new: true });
  if (config) {
    await ReceiptPrintJob.updateMany({ bridgeId: config._id, status: "processing" },
      { $set: { status: "unknown", errorCode: "BRIDGE_INTERRUPTED", finishedAt: new Date() } });
    await ReceiptPrintJob.updateMany({ bridgeId: config._id, status: "pending" },
      { $set: { status: "failed", errorCode: "DRIVER_UNAVAILABLE", finishedAt: new Date() } });
  }
  res.json({ ok: true });
}));
router.get("/orders/:id/preview", run(async (req, res) => {
  const order = await authorizedOrder(req, req.params.id);
  const config = await configFor({ tenantId: order.tenantId, branchId: order.branchId });
  const business: any = await BusinessConfigModel.findOne({ tenantId: order.tenantId }).lean();
  if (!business) throw fail(409, "Business receipt settings unavailable");
  res.json({ orderId: String(order._id), html: await checkedReceipt(order, business, config.paperWidth),
    config: publicConfig(config, req.employee), canReprint: isPrintManager(req.employee) });
}));

async function createJob(req: any, data: any, res: any) {
  const scope = { tenantId: data.tenantId, branchId: data.branchId };
  const config: any = await ReceiptPrinter.findOne(scope);
  if (!config || config.adapter !== "usb-bridge" || !config.credentialVersion) throw fail(409, "Pair and configure a USB bridge first");
  const existing: any = await ReceiptPrintJob.findOne({ tenantId: scope.tenantId, idempotencyKey: data.idempotencyKey });
  if (existing) {
    if (existing.branchId !== scope.branchId || existing.orderId !== data.orderId || existing.reprint !== data.reprint || existing.isTest !== data.isTest) {
      throw fail(409, "Idempotency key belongs to another request");
    }
    return res.json(jobResult(existing));
  }
  // Fail before creating any job if bridge unavailable; keep invoice accessible.
  if (!isBridgeOnline(config.lastSeenAt)) throw fail(503, "Bridge unavailable");
  const dedupeKey = data.isTest ? `test:${data.idempotencyKey}` :
    data.reprint ? `reprint:${data.orderId}:${data.idempotencyKey}` : `first:${data.orderId}`;
  try {
    const job = await ReceiptPrintJob.create({ ...data, dedupeKey, bridgeId: config._id,
      actorId: req.employee.id, paperWidth: config.paperWidth });
    res.status(201).json(jobResult(job));
  } catch (error: any) {
    if (error.code !== 11000) throw error;
    const prior: any = await ReceiptPrintJob.findOne({ tenantId: scope.tenantId, dedupeKey });
    if (prior?.idempotencyKey === data.idempotencyKey) return res.json(jobResult(prior));
    return res.status(409).json({ error: "A first print already exists; inspect its status or request an authorized reprint", jobId: prior ? String(prior._id) : undefined });
  }
}
router.post("/jobs", run(async (req, res) => {
  const body = z.object({ orderId: id, idempotencyKey: key, reprint: z.boolean().default(false) }).strict().parse(bodyWithoutServerTenant(req));
  if (body.reprint && !isPrintManager(req.employee)) throw fail(403, "Manager permission required for reprints");
  const order = await authorizedOrder(req, body.orderId);
  const config = await configFor({ tenantId: order.tenantId, branchId: order.branchId });
  const business = await BusinessConfigModel.findOne({ tenantId: order.tenantId }).lean();
  if (!business) throw fail(409, "Business receipt settings unavailable");
  await createJob(req, { ...body, tenantId: order.tenantId, branchId: order.branchId, isTest: false,
    html: await checkedReceipt(order, business, config.paperWidth, body.reprint) }, res);
}));
router.post("/test", manage, run(async (req, res) => {
  const body = z.object({ branchId: z.string().min(1).max(100), idempotencyKey: key }).strict().parse(bodyWithoutServerTenant(req));
  const scope = await branchScope(req, body.branchId);
  const config = await configFor(scope);
  // Explicit non-financial sample, never an invoice/payment record.
  const html = receiptHtml({ orderNumber: "TEST — ليست فاتورة", createdAt: new Date(), totalAmount: 0,
    items: [{ nameAr: "اختبار عرض الورق والنص العربي", nameEn: "Paper width and English test", quantity: 1, unitPrice: 0 }],
    paymentStatus: "TEST ONLY", paymentMethod: "TEST ONLY" },
  { tradeNameAr: "اختبار الطابعة — إلوة", currency: "SAR" }, config.paperWidth);
  await createJob(req, { ...scope, idempotencyKey: body.idempotencyKey, isTest: true, reprint: false, html }, res);
}));
router.get("/jobs/:id", run(async (req, res) => {
  let job = await authorizedJob(req, req.params.id);
  await expireClaims(job.bridgeId);
  job = await authorizedJob(req, req.params.id);
  const config: any = await ReceiptPrinter.findById(job.bridgeId);
  res.json({ ...jobResult(job), errorCode: job.errorCode || null, canRetry: canRetryJob(job.status),
    bridgeOnline: isBridgeOnline(config?.lastSeenAt), physicalConfirmed: false });
}));
router.post("/jobs/:id/retry", run(async (req, res) => {
  z.object({}).strict().parse(bodyWithoutServerTenant(req));
  const job = await authorizedJob(req, req.params.id);
  if ((job.isTest || job.reprint) && !isPrintManager(req.employee)) throw fail(403, "Manager required");
  if (job.orderId) await authorizedOrder(req, job.orderId);
  const config: any = await ReceiptPrinter.findById(job.bridgeId);
  if (!config?.credentialVersion || config.adapter !== "usb-bridge" || !isBridgeOnline(config.lastSeenAt)) throw fail(503, "Bridge unavailable");
  if (!canRetryJob(job.status)) throw fail(409, "Do not retry an uncertain or submitted print; check the printer first");
  const retried = await ReceiptPrintJob.findOneAndUpdate({ _id: job._id, status: "failed" },
    { $set: { status: "pending" }, $unset: { errorCode: "", claimHash: "", claimedAt: "", finishedAt: "", spoolId: "" } }, { new: true });
  if (!retried) throw fail(409, "Job already retried");
  res.json(jobResult(retried));
}));
router.use((error: any, _req: any, res: any, _next: any) => {
  const status = error instanceof z.ZodError ? 400 : error.status || 500;
  // Never include DB documents, payloads, credentials, or driver stderr.
  res.status(status).json({ error: status === 400 ? "Invalid print request" : status === 500 ? "Print service error" : error.message });
});
export default router;
