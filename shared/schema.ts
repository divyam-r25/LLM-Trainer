import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Personas table - stores AI persona configurations
export const personas = pgTable("personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  intent: text("intent").notNull(),
  examples: jsonb("examples").notNull().$type<Array<{ input: string; output: string }>>(),
  systemPrompt: text("system_prompt").notNull(),
  isPublished: integer("is_published").notNull().default(0),
  currentVersion: integer("current_version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// API Keys table - stores generated API keys for accessing personas
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Analytics table - tracks usage metrics
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  apiKeyId: varchar("api_key_id").references(() => apiKeys.id),
  tokensUsed: integer("tokens_used").notNull().default(0),
  requestCount: integer("request_count").notNull().default(1),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Chat messages - for sandbox testing
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertPersonaSchema = createInsertSchema(personas, {
  examples: z.array(z.object({
    input: z.string().min(1),
    output: z.string().min(1),
  })).min(0),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys, {
  name: z.string().min(1, "API key name is required"),
}).omit({
  id: true,
  key: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Persona = typeof personas.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type Analytics = typeof analytics.$inferSelect;

// Additional types for API responses
export type PersonaWithStats = Persona & {
  totalRequests?: number;
  totalTokens?: number;
  apiKeyCount?: number;
};

export type ChatRequest = {
  message: string;
  personaId: string;
};

export type ChatResponse = {
  message: string;
  tokensUsed: number;
};
