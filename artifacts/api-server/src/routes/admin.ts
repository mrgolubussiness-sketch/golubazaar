import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  AdminLoginBody,
  AdminUpdateProductParams,
  AdminUpdateProductBody,
  AdminUpdateProductResponse,
  AdminDeleteProductParams,
  AdminCreateProductBody,
  AdminCreateProductResponse,
  AdminListProductsResponseItem,
  GetAdminMeResponse,
  AdminLoginResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const SESSION_COOKIE = "golustore_admin";

function requireAdmin(_req: any, _res: any, next: any): void {
  next();
}

// ─── Auth routes ───────────────────────────────────────────────────────────

router.post("/admin/login", (req, res): void => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email, password } = parsed.data;

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword) {
    res.status(500).json({ error: "Admin credentials not configured on server." });
    return;
  }

  if (email.toLowerCase().trim() !== adminEmail || password !== adminPassword) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.cookie(SESSION_COOKIE, "authenticated", {
    signed: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
  });

  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post("/admin/logout", (_req, res): void => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ authenticated: false });
});

router.get("/admin/me", (req, res): void => {
  const token = req.signedCookies?.[SESSION_COOKIE];
  if (token !== "authenticated") {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json(GetAdminMeResponse.parse({ authenticated: true }));
});

// ─── Product routes ────────────────────────────────────────────────────────

router.get("/admin/products", requireAdmin, async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);
  res.json(products.map((p) => AdminListProductsResponseItem.parse({ ...p, createdAt: p.createdAt.toISOString() })));
});

router.post("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory ?? null,
      price: parsed.data.price,
      originalPrice: parsed.data.originalPrice ?? null,
      stock: parsed.data.stock ?? 0,
      badge: parsed.data.badge ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      buyLink: parsed.data.buyLink ?? null,
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  res.status(201).json(AdminCreateProductResponse.parse({ ...product, createdAt: product.createdAt.toISOString() }));
});

router.patch("/admin/products/:id", requireAdmin, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminUpdateProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.subcategory !== undefined) updateData.subcategory = parsed.data.subcategory;
  if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
  if (parsed.data.originalPrice !== undefined) updateData.originalPrice = parsed.data.originalPrice;
  if (parsed.data.stock !== undefined) updateData.stock = parsed.data.stock;
  if (parsed.data.badge !== undefined) updateData.badge = parsed.data.badge;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.buyLink !== undefined) updateData.buyLink = parsed.data.buyLink;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(AdminUpdateProductResponse.parse({ ...product, createdAt: product.createdAt.toISOString() }));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminDeleteProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.sendStatus(204);
});

router.get("/healthz", (_req, res) => {
  res.status(200).send("OK");
});

export default router;
