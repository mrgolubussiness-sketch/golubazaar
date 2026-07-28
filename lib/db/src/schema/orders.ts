import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productPrice: real("product_price").notNull(),
  customerClerkId: text("customer_clerk_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerDiscord: text("customer_discord").notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("pending"), // pending | in_progress | completed | cancelled
  notes: text("notes"),
  couponCode: text("coupon_code"),
  discountAmount: real("discount_amount"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Order = typeof ordersTable.$inferSelect;
