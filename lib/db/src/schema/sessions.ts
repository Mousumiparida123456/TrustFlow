import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  trustScore: integer("trust_score").notNull().default(15),
  riskLevel: text("risk_level").notNull().default("low"),
  ipAddress: text("ip_address").notNull().default("127.0.0.1"),
  location: text("location").notNull().default("Unknown"),
  device: text("device").notNull().default("Unknown"),
  deviceFingerprint: text("device_fingerprint"),
  isActive: boolean("is_active").notNull().default(true),
  isSuspicious: boolean("is_suspicious").notNull().default(false),
  otpCode: text("otp_code"),
  otpExpiry: timestamp("otp_expiry"),
  loginTime: timestamp("login_time").notNull().defaultNow(),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
