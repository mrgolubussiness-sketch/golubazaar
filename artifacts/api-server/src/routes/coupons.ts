import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();
const SESSION_COOKIE = "golustore_admin";

function requireAdmin(req: any, res: any, next: any): void {
  if (req.signedCookies?.[SESSION_COOKIE] !== "authenticated") {
    res.status(401).json({ error: "Not authenticated" }); return;
  }
  next();
}

// Public: validate a coupon code against an order total
router.post("/coupons/validate", async (req, res): Promise<void> => {
  const { code, orderTotal } = req.body;
  if (!code) { res.status(400).json({ error: "Code required" }); return; }

  const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code.trim().toUpperCase()));
  if (!coupon || !coupon.isActive) { res.status(404).json({ error: "Invalid or expired coupon" }); return; }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    res.status(400).json({ error: "Coupon has expired" }); return;
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ error: "Coupon usage limit reached" }); return;
  }
  if (coupon.minOrderValue != null && orderTotal < coupon.minOrderValue) {
    res.status(400).json({ error: `Minimum order value is ₹${coupon.minOrderValue}` }); return;
  }

  const discount = coupon.discountType === "percent"
    ? Math.min((orderTotal * coupon.discountValue) / 100, orderTotal)
    : Math.min(coupon.discountValue, orderTotal);

  res.json({ valid: true, coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue }, discount: Math.round(discount * 100) / 100 });
});

// Admin CRUD
router.get("/admin/coupons", requireAdmin, async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
  res.json(coupons);
});

router.post("/admin/coupons", requireAdmin, async (req, res): Promise<void> => {
  const { code, discountType, discountValue, minOrderValue, maxUses, isActive, expiresAt } = req.body;
  if (!code || !discountType || discountValue == null) { res.status(400).json({ error: "Missing fields" }); return; }
  const [coupon] = await db.insert(couponsTable).values({
    code: code.trim().toUpperCase(),
    discountType,
    discountValue: Number(discountValue),
    minOrderValue: minOrderValue ? Number(minOrderValue) : null,
    maxUses: maxUses ? Number(maxUses) : null,
    isActive: isActive !== false,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json(coupon);
});

router.patch("/admin/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { code, discountType, discountValue, minOrderValue, maxUses, isActive, expiresAt } = req.body;
  const updates: Record<string, any> = {};
  if (code !== undefined) updates.code = code.trim().toUpperCase();
  if (discountType !== undefined) updates.discountType = discountType;
  if (discountValue !== undefined) updates.discountValue = Number(discountValue);
  if (minOrderValue !== undefined) updates.minOrderValue = minOrderValue ? Number(minOrderValue) : null;
  if (maxUses !== undefined) updates.maxUses = maxUses ? Number(maxUses) : null;
  if (isActive !== undefined) updates.isActive = isActive;
  if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
  const [coupon] = await db.update(couponsTable).set(updates).where(eq(couponsTable.id, id)).returning();
  if (!coupon) { res.status(404).json({ error: "Not found" }); return; }
  res.json(coupon);
});

router.delete("/admin/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  await db.delete(couponsTable).where(eq(couponsTable.id, id));
  res.status(204).end();
});

export default router;
