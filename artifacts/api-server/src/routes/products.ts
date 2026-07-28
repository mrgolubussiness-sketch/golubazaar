import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
  ListProductsResponseItem,
  GetProductResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, search } = parsed.data;
  const conditions = [eq(productsTable.isActive, true)];

  if (category) {
    conditions.push(eq(productsTable.category, category));
  }

  if (search) {
    conditions.push(
      or(
        ilike(productsTable.name, `%${search}%`),
        ilike(productsTable.description, `%${search}%`),
      )!,
    );
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(and(...conditions))
    .orderBy(productsTable.createdAt);

  res.json(products.map((p) => ListProductsResponseItem.parse({ ...p, createdAt: p.createdAt.toISOString() })));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.isActive, true),
        sql`${productsTable.badge} IS NOT NULL`,
      ),
    )
    .limit(8);

  res.json(products.map((p) => ListProductsResponseItem.parse({ ...p, createdAt: p.createdAt.toISOString() })));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.id, parsed.data.id), eq(productsTable.isActive, true)));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse({ ...product, createdAt: product.createdAt.toISOString() }));
});

router.get("/categories", async (_req, res): Promise<void> => {
  const counts = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .where(eq(productsTable.isActive, true))
    .groupBy(productsTable.category);

  const labels: Record<string, { label: string; icon: string }> = {
    discord: { label: "Discord", icon: "MessageSquare" },
    ott: { label: "OTT Subscriptions", icon: "Tv" },
    gaming: { label: "Gaming", icon: "Gamepad2" },
  };

  const result = counts.map((row) => ({
    category: row.category,
    label: labels[row.category]?.label ?? row.category,
    icon: labels[row.category]?.icon ?? "Package",
    count: row.count,
  }));

  res.json(result);
});

router.get("/store-stats", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)::int`,
      inStock: sql<number>`sum(case when ${productsTable.stock} > 0 then 1 else 0 end)::int`,
    })
    .from(productsTable)
    .where(eq(productsTable.isActive, true))
    .groupBy(productsTable.category);

  const totals = {
    totalProducts: 0,
    discordProducts: 0,
    ottProducts: 0,
    gamingProducts: 0,
    inStockProducts: 0,
  };

  for (const row of rows) {
    totals.totalProducts += row.count;
    totals.inStockProducts += row.inStock ?? 0;
    if (row.category === "discord") totals.discordProducts = row.count;
    if (row.category === "ott") totals.ottProducts = row.count;
    if (row.category === "gaming") totals.gamingProducts = row.count;
  }

  res.json(totals);
});

export default router;
