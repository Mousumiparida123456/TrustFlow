import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("tf_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  trustScore: integer("trust_score").notNull().default(15),
  riskLevel: text("risk_level").notNull().default("low"),
  isActive: boolean("is_active").notNull().default(true),
  loginAttempts: integer("login_attempts").notNull().default(0),
  flaggedTransactions: integer("flagged_transactions").notNull().default(0),
  location: text("location").notNull().default("Unknown"),
  device: text("device").notNull().default("Unknown"),
  deviceFingerprint: text("device_fingerprint"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
