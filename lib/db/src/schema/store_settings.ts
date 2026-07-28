import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";

export const storeSettingsTable = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
});
