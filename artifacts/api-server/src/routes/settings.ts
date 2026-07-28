import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storeSettingsTable, categoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  AdminUpdateSettingsBody,
  AdminCreateCategoryBody,
  AdminUpdateCategoryBody,
  AdminUpdateCategoryParams,
  AdminDeleteCategoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SESSION_COOKIE = "golustore_admin";

function requireAdmin(req: any, res: any, next: any): void {
  const token = req.signedCookies?.[SESSION_COOKIE];
  if (token !== "authenticated") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// Helper: get all settings as an object
async function getAllSettings() {
  const rows = await db.select().from(storeSettingsTable);
  const map: Record<string, string | null> = {};
  for (const row of rows) {
    map[row.key] = row.value ?? null;
  }
  return {
    storeName: map["storeName"] ?? "GoluBazaar",
    tagline: map["tagline"] ?? null,
    logoUrl: map["logoUrl"] ?? null,
    discordLink: map["discordLink"] ?? null,
    whatsappNumber: map["whatsappNumber"] ?? null,
    contactEmail: map["contactEmail"] ?? null,
    announcementText: map["announcementText"] ?? null,
    announcementActive: map["announcementActive"] === "true",
    aboutText: map["aboutText"] ?? null,
    discordUsername: map["discordUsername"] ?? null,
    discordSupportServer: map["discordSupportServer"] ?? null,
    discordShopLink: map["discordShopLink"] ?? null,
    telegramLink: map["telegramLink"] ?? null,
    instagramLink: map["instagramLink"] ?? null,
    youtubeLink: map["youtubeLink"] ?? null,
    discordWebhookUrl: map["discordWebhookUrl"] ?? null,
  };
}

// Helper: upsert a setting key
async function upsertSetting(key: string, value: string | null) {
  await db
    .insert(storeSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: storeSettingsTable.key, set: { value } });
}

// Public: GET /store-settings
router.get("/store-settings", async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json(settings);
});

// Admin: GET /admin/settings
router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json(settings);
});

// Admin: PATCH /admin/settings
router.patch("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminUpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { data } = parsed;
  const entries: [string, string | null][] = [];

  if (data.storeName !== undefined) entries.push(["storeName", data.storeName]);
  if (data.tagline !== undefined) entries.push(["tagline", data.tagline]);
  if (data.logoUrl !== undefined) entries.push(["logoUrl", data.logoUrl]);
  if (data.discordLink !== undefined) entries.push(["discordLink", data.discordLink]);
  if (data.whatsappNumber !== undefined) entries.push(["whatsappNumber", data.whatsappNumber]);
  if (data.contactEmail !== undefined) entries.push(["contactEmail", data.contactEmail]);
  if (data.announcementText !== undefined) entries.push(["announcementText", data.announcementText]);
  if (data.announcementActive !== undefined)
    entries.push(["announcementActive", data.announcementActive ? "true" : "false"]);
  if (data.aboutText !== undefined) entries.push(["aboutText", data.aboutText]);
  if (data.discordUsername !== undefined) entries.push(["discordUsername", data.discordUsername]);
  if (data.discordSupportServer !== undefined) entries.push(["discordSupportServer", data.discordSupportServer]);
  if (data.discordShopLink !== undefined) entries.push(["discordShopLink", data.discordShopLink]);
  if (data.telegramLink !== undefined) entries.push(["telegramLink", data.telegramLink]);
  if (data.instagramLink !== undefined) entries.push(["instagramLink", data.instagramLink]);
  if (data.youtubeLink !== undefined) entries.push(["youtubeLink", data.youtubeLink]);
  if ((data as any).discordWebhookUrl !== undefined) entries.push(["discordWebhookUrl", (data as any).discordWebhookUrl]);

  for (const [key, value] of entries) {
    await upsertSetting(key, value);
  }

  res.json(await getAllSettings());
});

// Admin: GET /admin/categories
router.get("/admin/categories", requireAdmin, async (_req, res): Promise<void> => {
  const cats = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.id));
  res.json(cats);
});

// Admin: POST /admin/categories
router.post("/admin/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cat] = await db
    .insert(categoriesTable)
    .values({
      slug: parsed.data.slug,
      label: parsed.data.label,
      icon: parsed.data.icon,
      color: parsed.data.color ?? null,
      description: parsed.data.description ?? null,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  res.status(201).json(cat);
});

// Admin: PATCH /admin/categories/:id
router.patch("/admin/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminUpdateCategoryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AdminUpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.slug !== undefined) update.slug = parsed.data.slug;
  if (parsed.data.label !== undefined) update.label = parsed.data.label;
  if (parsed.data.icon !== undefined) update.icon = parsed.data.icon;
  if (parsed.data.color !== undefined) update.color = parsed.data.color;
  if (parsed.data.description !== undefined) update.description = parsed.data.description;
  if (parsed.data.isActive !== undefined) update.isActive = parsed.data.isActive;
  if (parsed.data.sortOrder !== undefined) update.sortOrder = parsed.data.sortOrder;

  const [cat] = await db
    .update(categoriesTable)
    .set(update)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();

  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.json(cat);
});

// Admin: DELETE /admin/categories/:id
router.delete("/admin/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminDeleteCategoryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cat] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();

  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
