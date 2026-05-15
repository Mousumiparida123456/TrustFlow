import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const behaviorEventsTable = pgTable("tf_behavior_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  userId: integer("user_id").notNull(),
  eventType: text("event_type").notNull(),
  typingSpeed: real("typing_speed"),
  keystrokeInterval: real("keystroke_interval"),
  mouseVelocity: real("mouse_velocity"),
  clickCount: integer("click_count"),
  scrollSpeed: real("scroll_speed"),
  pageX: real("page_x"),
  pageY: real("page_y"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertBehaviorEventSchema = createInsertSchema(behaviorEventsTable).omit({ id: true, timestamp: true });
export type InsertBehaviorEvent = z.infer<typeof insertBehaviorEventSchema>;
export type BehaviorEvent = typeof behaviorEventsTable.$inferSelect;
