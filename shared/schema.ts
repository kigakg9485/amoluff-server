import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'admin', 'script', 'hacks'
  discordUsername: text("discord_username").notNull(),
  discordUserId: text("discord_user_id"),
  formData: json("form_data").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'accepted', 'rejected'
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
});

export const applicationSettings = pgTable("application_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().unique(), // 'admin', 'script', 'hacks'
  isOpen: boolean("is_open").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
});

export const insertApplicationSettingsSchema = createInsertSchema(applicationSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplicationSettings = z.infer<typeof insertApplicationSettingsSchema>;
export type ApplicationSettings = typeof applicationSettings.$inferSelect;
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
