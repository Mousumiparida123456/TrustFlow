import { pgTable, serial, integer, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertsTable = pgTable("tf_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id"),
  alertType: text("alert_type").notNull(),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true, timestamp: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
