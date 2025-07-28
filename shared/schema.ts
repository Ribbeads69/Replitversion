import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company"),
  position: text("position"),
  phone: text("phone"),
  status: text("status").notNull().default("new"), // new, contacted, replied, unsubscribed
  tags: text("tags").array().default([]),
  customFields: jsonb("custom_fields").default({}),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const sequences = pgTable("sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sequenceId: varchar("sequence_id").references(() => sequences.id),
  status: text("status").notNull().default("draft"), // draft, active, paused, completed
  totalContacts: integer("total_contacts").default(0).notNull(),
  sentEmails: integer("sent_emails").default(0).notNull(),
  openedEmails: integer("opened_emails").default(0).notNull(),
  repliedEmails: integer("replied_emails").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const campaignContacts = pgTable("campaign_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id).notNull(),
  contactId: varchar("contact_id").references(() => contacts.id).notNull(),
  currentStep: integer("current_step").default(0).notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, opened, replied, paused
  lastEmailSentAt: timestamp("last_email_sent_at"),
  nextEmailAt: timestamp("next_email_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Insert schemas
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSequenceSchema = createInsertSchema(sequences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignContactSchema = createInsertSchema(campaignContacts).omit({
  id: true,
  createdAt: true,
});

// Types
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Sequence = typeof sequences.$inferSelect;
export type InsertSequence = z.infer<typeof insertSequenceSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignContact = typeof campaignContacts.$inferSelect;
export type InsertCampaignContact = z.infer<typeof insertCampaignContactSchema>;

// Additional types for API responses
export type DashboardMetrics = {
  totalContacts: number;
  activeCampaigns: number;
  openRate: number;
  replyRate: number;
};

export type CampaignWithSequence = Campaign & {
  sequence?: Sequence;
};

export type ContactWithEngagement = Contact & {
  campaignCount: number;
  lastCampaign?: string;
};
