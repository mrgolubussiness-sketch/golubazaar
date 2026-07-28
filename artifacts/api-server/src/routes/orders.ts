import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, storeSettingsTable, couponsTable } from "@workspace/db";
import { eq, desc, gte, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const SESSION_COOKIE = "golustore_admin";

function requireAdmin(req: any, res: any, next: any): void {
  if (req.signedCookies?.[SESSION_COOKIE] !== "authenticated") {
    res.status(401).json({ error: "Not authenticated" }); return;
  }
  next();
}

async function getDiscordWebhookUrl(): Promise<string | null> {
  const rows = await db.select().from(storeSettingsTable).where(eq(storeSettingsTable.key, "discordWebhookUrl"));
  return rows[0]?.value ?? null;
}

async function sendDiscordNotification(webhookUrl: string, order: typeof ordersTable.$inferSelect) {
  const total = order.productPrice * order.quantity - (order.discountAmount ?? 0);
  const payload = {
    embeds: [{
      title: `🎫 New Order #${order.id}`,
      color: 0x00ffcc,
      fields: [
        { name: "📦 Product", value: order.productName, inline: true },
        { name: "💰 Price", value: `₹${order.productPrice} × ${order.quantity}`, inline: true },
        { name: "🏷️ Total", value: `₹${total.toLocaleString("en-IN")}${order.couponCode ? ` (${order.couponCode})` : ""}`, inline: true },
        { name: "👤 Customer", value: order.customerName, inline: true },
        { name: "📧 Email", value: order.customerEmail, inline: true },
        { name: "💬 Discord", value: order.customerDiscord, inline: true },
        ...(order.notes ? [{ name: "📝 Notes", value: order.notes, inline: false }] : []),
      ],
      footer: { text: "GoluBazaar • Reply to their Discord to complete the deal" },
      timestamp: new Date().toISOString(),
    }],
  };
  await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

// Public: POST /orders
router.post("/orders", async (req, res): Promise<void> => {
  const { productId, productName, productPrice, customerName, customerEmail, customerDiscord, quantity, notes, couponCode } = req.body;
  if (!productId || !productName || productPrice == null || !customerName || !customerEmail || !customerDiscord) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const auth = getAuth(req);
  const qty = Math.max(1, Number(quantity ?? 1));
  const rawTotal = Number(productPrice) * qty;

  // Apply coupon if provided
  let discountAmount: number | null = null;
  let appliedCode: string | null = null;
  if (couponCode) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, couponCode.trim().toUpperCase()));
    if (coupon?.isActive && !(coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) && !(coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)) {
      discountAmount = coupon.discountType === "percent"
        ? Math.min((rawTotal * coupon.discountValue) / 100, rawTotal)
        : Math.min(coupon.discountValue, rawTotal);
      discountAmount = Math.round(discountAmount * 100) / 100;
      appliedCode = coupon.code;
      await db.update(couponsTable).set({ usedCount: coupon.usedCount + 1 }).where(eq(couponsTable.id, coupon.id));
    }
  }

  const [order] = await db.insert(ordersTable).values({
    productId: Number(productId),
    productName: String(productName),
    productPrice: Number(productPrice),
    customerClerkId: auth?.userId ?? null,
    customerName: String(customerName),
    customerEmail: String(customerEmail),
    customerDiscord: String(customerDiscord),
    quantity: qty,
    notes: notes ? String(notes) : null,
    couponCode: appliedCode,
    discountAmount,
    status: "pending",
  }).returning();

  getDiscordWebhookUrl()
    .then((url) => { if (url) void sendDiscordNotification(url, order); })
    .catch(() => {});

  res.status(201).json(order);
});

// Customer: GET /my-orders
router.get("/my-orders", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.customerClerkId, auth.userId)).orderBy(desc(ordersTable.createdAt));
  res.json(orders);
});

// Admin: GET /admin/orders
router.get("/admin/orders", requireAdmin, async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  res.json(orders);
});

// Admin: GET /admin/orders/export — CSV download
router.get("/admin/orders/export", requireAdmin, async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  const headers = ["ID", "Product", "Price", "Qty", "Discount", "Total", "Coupon", "Customer", "Email", "Discord", "Status", "Notes", "Date"];
  const rows = orders.map((o) => {
    const total = o.productPrice * o.quantity - (o.discountAmount ?? 0);
    return [
      o.id, `"${o.productName}"`, o.productPrice, o.quantity, o.discountAmount ?? 0,
      total.toFixed(2), o.couponCode ?? "", `"${o.customerName}"`, `"${o.customerEmail}"`,
      `"${o.customerDiscord}"`, o.status, `"${(o.notes ?? "").replace(/"/g, '""')}"`,
      new Date(o.createdAt).toISOString(),
    ].join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="orders-${Date.now()}.csv"`);
  res.send(csv);
});

// Admin: GET /admin/order-stats — daily revenue/orders for last 30 days
router.get("/admin/order-stats", requireAdmin, async (_req, res): Promise<void> => {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const rows = await db.select({
    date: sql<string>`DATE(${ordersTable.createdAt} AT TIME ZONE 'UTC')`,
    orders: sql<number>`count(*)::int`,
    revenue: sql<number>`sum(${ordersTable.productPrice} * ${ordersTable.quantity} - COALESCE(${ordersTable.discountAmount}, 0))::float`,
  }).from(ordersTable)
    .where(gte(ordersTable.createdAt, since))
    .groupBy(sql`DATE(${ordersTable.createdAt} AT TIME ZONE 'UTC')`)
    .orderBy(sql`DATE(${ordersTable.createdAt} AT TIME ZONE 'UTC')`);
  res.json(rows);
});

// ─── Email helper ─────────────────────────────────────────────────────────────
async function sendStatusEmail(order: typeof ordersTable.$inferSelect, newStatus: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !order.customerEmail || order.customerEmail === "not provided") return;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "GoluBazaar <onboarding@resend.dev>";

  const total = (order.productPrice * order.quantity - (order.discountAmount ?? 0)).toFixed(2);
  const templates: Record<string, { subject: string; headline: string; body: string; color: string }> = {
    in_progress: { subject: `⚙️ Order #${order.id} is being processed — GoluBazaar`, headline: "We're on it!", body: "Your order is now being processed. The seller will reach out to you on Discord shortly to complete the delivery.", color: "#3b82f6" },
    completed:   { subject: `✅ Order #${order.id} delivered — GoluBazaar`,             headline: "Your order is complete!", body: "Your order has been delivered! Check your Discord DMs — everything has been sent over. Enjoy!", color: "#00ffcc" },
    cancelled:   { subject: `Order #${order.id} cancelled — GoluBazaar`,                headline: "Order cancelled",         body: "Your order has been cancelled. If you have questions, please reach out to us on Discord.", color: "#ef4444" },
  };
  const tmpl = templates[newStatus];
  if (!tmpl) return;

  const html = `<div style="background:#0a0a14;font-family:sans-serif;padding:40px 0"><div style="max-width:480px;margin:0 auto;background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden"><div style="padding:32px;border-bottom:1px solid rgba(255,255,255,0.05)"><div style="font-size:24px;font-weight:900;color:#fff;text-transform:uppercase">${tmpl.headline}</div><div style="color:#71717a;font-size:13px;margin-top:4px">Order #${order.id}</div></div><div style="padding:28px 32px"><p style="color:#d4d4d8;line-height:1.7;margin:0 0 24px">${tmpl.body}</p><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px"><div style="font-weight:700;color:#fff;margin-bottom:8px">${order.productName}</div><div style="color:#71717a;font-size:13px">₹${order.productPrice} × ${order.quantity}${order.discountAmount ? ` − ₹${order.discountAmount} discount` : ""} = <span style="color:${tmpl.color};font-weight:700">₹${total}</span></div><div style="color:#71717a;font-size:12px;margin-top:6px">Discord: ${order.customerDiscord}</div></div></div><div style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,0.05);color:#52525b;font-size:11px">GoluBazaar • Not affiliated with Discord, Netflix, Riot Games, or other mentioned brands.</div></div></div>`;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to: [order.customerEmail], subject: tmpl.subject, html }),
    });
    if (!resp.ok) logger.warn({ status: resp.status }, "Status email send failed");
  } catch (err) {
    logger.warn({ err }, "Error sending status email");
  }
}

// Admin: PATCH /admin/orders/:id
router.patch("/admin/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status } = req.body;
  const valid = ["pending", "in_progress", "completed", "cancelled"];
  if (!status || !valid.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  sendStatusEmail(order, status).catch(() => {});
  res.json(order);
});

export default router;
