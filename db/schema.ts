import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const projects = sqliteTable("projects", {
  slug: text("slug").primaryKey(), title: text("title").notNull(), category: text("category").notNull(),
  summary: text("summary").notNull(), challenge: text("challenge").notNull(), solution: text("solution").notNull(),
  tech: text("tech").notNull().default(""), result: text("result").notNull().default(""),
  url: text("url").notNull(), image: text("image").notNull(), art: text("art").notNull(),
  status: text("status").notNull(), position: integer("position").notNull(), kind: text("kind").notNull()
});
export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull(),
  topic: text("topic").notNull(), brief: text("brief").notNull(), status: text("status").notNull(),
  budget: text("budget").notNull().default("Not specified"), mail: text("mail").notNull().default("not configured"),
  created: integer("created").notNull()
});
export const settings = sqliteTable("settings", {id: text("id").primaryKey(), value: text("value").notNull()});
export const limits = sqliteTable("submission_limits", {key:text("key").primaryKey(), expires:integer("expires").notNull(), count:integer("count").notNull()});

export const content=sqliteTable("studio_content",{
  id:text("id").primaryKey(), kind:text("kind").notNull(), title:text("title").notNull(),
  label:text("label").notNull(), body:text("body").notNull(), url:text("url").notNull(),
  image:text("image").notNull(), status:text("status").notNull(), updated:integer("updated").notNull()
});
export const challenges=sqliteTable("human_challenges",{id:text("id").primaryKey(),answer:text("answer").notNull(),expires:integer("expires").notNull()});
export const traffic=sqliteTable("traffic_totals",{key:text("key").primaryKey(),day:text("day").notNull(),page:text("page").notNull(),source:text("source").notNull(),views:integer("views").notNull()});
export const threads=sqliteTable("chat_threads",{id:text("id").primaryKey(),secret:text("secret").notNull(),name:text("name").notNull(),email:text("email").notNull(),updated:integer("updated").notNull()});
export const chatMessages=sqliteTable("chat_messages",{id:text("id").primaryKey(),thread:text("thread").notNull(),role:text("role").notNull(),body:text("body").notNull(),created:integer("created").notNull()});
export const ownerSessions=sqliteTable("owner_sessions",{
 tokenHash:text("token_hash").primaryKey(),credentialId:text("credential_id").notNull(),expires:integer("expires").notNull()
});
