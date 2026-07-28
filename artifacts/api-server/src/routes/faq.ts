import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { faqItemsTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";

const router: IRouter = Router();
const SESSION_COOKIE = "golustore_admin";

function requireAdmin(req: any, res: any, next: any): void {
  if (req.signedCookies?.[SESSION_COOKIE] !== "authenticated") {
    res.status(401).json({ error: "Not authenticated" }); return;
  }
  next();
}

// Public: list active FAQ items ordered by displayOrder
router.get("/faq", async (_req, res): Promise<void> => {
  const items = await db.select().from(faqItemsTable)
    .where(eq(faqItemsTable.isActive, true))
    .orderBy(asc(faqItemsTable.displayOrder), asc(faqItemsTable.createdAt));
  res.json(items);
});

// Admin CRUD
router.get("/admin/faq", requireAdmin, async (_req, res): Promise<void> => {
  const items = await db.select().from(faqItemsTable).orderBy(asc(faqItemsTable.displayOrder), desc(faqItemsTable.createdAt));
  res.json(items);
});

router.post("/admin/faq", requireAdmin, async (req, res): Promise<void> => {
  const { question, answer, displayOrder, isActive } = req.body;
  if (!question || !answer) { res.status(400).json({ error: "Question and answer required" }); return; }
  const [item] = await db.insert(faqItemsTable).values({
    question: question.trim(),
    answer: answer.trim(),
    displayOrder: displayOrder ?? 0,
    isActive: isActive !== false,
  }).returning();
  res.status(201).json(item);
});

router.patch("/admin/faq/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { question, answer, displayOrder, isActive } = req.body;
  const updates: Record<string, any> = {};
  if (question !== undefined) updates.question = question.trim();
  if (answer !== undefined) updates.answer = answer.trim();
  if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);
  if (isActive !== undefined) updates.isActive = isActive;
  const [item] = await db.update(faqItemsTable).set(updates).where(eq(faqItemsTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/admin/faq/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  await db.delete(faqItemsTable).where(eq(faqItemsTable.id, id));
  res.status(204).end();
});

export default router;
