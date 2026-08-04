import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { productsTable, adminCredentialsTable } from "@workspace/db";
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
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// ─── Auth helpers ──────────────────────────────────────────────────────────

function requireAdmin(req: any, res: any, next: any): void {
  const token = req.signedCookies?.[SESSION_COOKIE];
  if (token !== "authenticated") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

/** Ensure at least one admin credential row exists (bootstrap on first run). */
async function ensureDefaultCredentials(): Promise<void> {
  const existing = await db.select().from(adminCredentialsTable).limit(1);
  if (existing.length > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!email || !plainPassword) {
    throw new Error(
      "No admin credentials exist in the database and ADMIN_EMAIL / ADMIN_PASSWORD " +
      "environment variables are not set. Set both secrets before starting the server " +
      "so a secure admin account can be created automatically on first run.",
    );
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);
  await db.insert(adminCredentialsTable).values({ email: email.toLowerCase().trim(), passwordHash });
}

// Bootstrap on server start — crash fast if credentials are absent and env vars aren't set
ensureDefaultCredentials().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

// ─── Auth routes ───────────────────────────────────────────────────────────

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email, password } = parsed.data;

  // Look up admin by email
  const [cred] = await db
    .select()
    .from(adminCredentialsTable)
    .where(eq(adminCredentialsTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (!cred) {
    // Don't reveal whether email exists — same response as wrong password
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Check lockout
  if (cred.lockedUntil && cred.lockedUntil > new Date()) {
    const remaining = Math.ceil((cred.lockedUntil.getTime() - Date.now()) / 60000);
    res.status(401).json({ error: `Too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.` });
    return;
  }

  // Verify password
  const valid = await bcrypt.compare(password, cred.passwordHash);

  if (!valid) {
    const newAttempts = (cred.failedAttempts ?? 0) + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;
    await db
      .update(adminCredentialsTable)
      .set({
        failedAttempts: newAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : null,
      })
      .where(eq(adminCredentialsTable.id, cred.id));

    if (shouldLock) {
      res.status(401).json({ error: "Too many failed attempts. Account locked for 15 minutes." });
    } else {
      const attemptsLeft = MAX_ATTEMPTS - newAttempts;
      res.status(401).json({ error: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.` });
    }
    return;
  }

  // Success — reset attempts and issue session
  await db
    .update(adminCredentialsTable)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(adminCredentialsTable.id, cred.id));

      res.cookie(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

router.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

export default router;

