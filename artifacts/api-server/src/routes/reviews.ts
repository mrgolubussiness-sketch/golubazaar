import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();
const SESSION_COOKIE = "golustore_admin";

function requireAdmin(req: any, res: any, next: any): void {
  if (req.signedCookies?.[SESSION_COOKIE] !== "authenticated") {
    res.status(401).json({ error: "Not authenticated" }); return;
  }
  next();
}

// Public: get approved reviews for a product
router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const productId = parseInt(req.params.id as string, 10);
  const reviews = await db.select().from(reviewsTable)
    .where(and(eq(reviewsTable.productId, productId), eq(reviewsTable.isApproved, true)))
    .orderBy(desc(reviewsTable.createdAt));
  res.json(reviews);
});

// Clerk-auth: submit a review
router.post("/products/:id/reviews", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Sign in to leave a review" }); return; }
  const productId = parseInt(req.params.id as string, 10);
  const { rating, body, customerName } = req.body;
  if (!rating || rating < 1 || rating > 5) { res.status(400).json({ error: "Rating 1-5 required" }); return; }

  // one review per user per product
  const existing = await db.select().from(reviewsTable)
    .where(and(eq(reviewsTable.productId, productId), eq(reviewsTable.customerClerkId, auth.userId)));
  if (existing.length > 0) { res.status(409).json({ error: "You have already reviewed this product" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    productId,
    customerClerkId: auth.userId,
    customerName: customerName?.trim() || "Customer",
    rating: Number(rating),
    body: body?.trim() || null,
    isApproved: false,
  }).returning();
  res.status(201).json(review);
});

// Admin: list all reviews
router.get("/admin/reviews", requireAdmin, async (_req, res): Promise<void> => {
  const reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
  res.json(reviews);
});

// Admin: approve / update review
router.patch("/admin/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { isApproved } = req.body;
  const [review] = await db.update(reviewsTable).set({ isApproved }).where(eq(reviewsTable.id, id)).returning();
  if (!review) { res.status(404).json({ error: "Not found" }); return; }
  res.json(review);
});

// Admin: delete review
router.delete("/admin/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  res.status(204).end();
});

export default router;
