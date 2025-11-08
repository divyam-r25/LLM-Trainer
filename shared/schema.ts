import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Personas table - stores AI persona configurations
export const personas = pgTable("personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  keyHash: text("key_hash").notNull().unique(),
  personaId: varchar("persona_id").notNull().references(() => personas.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Analytics table - tracks usage metrics
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => personas.id, { onDelete: "cascade" }),
  apiKeyId: varchar("api_key_id").references(() => apiKeys.id, { onDelete: "cascade" }),
  tokensUsed: integer("tokens_used").notNull().default(0),
  requestCount: integer("request_count").notNull().default(1),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Chat messages - for sandbox testing
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => personas.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().default("default"),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define relations
export const personasRelations = relations(personas, ({ many }) => ({
  apiKeys: many(apiKeys),
  chatMessages: many(chatMessages),
  analytics: many(analytics),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  persona: one(personas, {
    fields: [apiKeys.personaId],
    references: [personas.id],
  }),
  analytics: many(analytics),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  persona: one(personas, {
    fields: [chatMessages.personaId],
    references: [personas.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  persona: one(personas, {
    fields: [analytics.personaId],
    references: [personas.id],
  }),
  apiKey: one(apiKeys, {
    fields: [analytics.apiKeyId],
    references: [apiKeys.id],
  }),
}));

// Insert schemas
export const insertPersonaSchema = createInsertSchema(personas, {
  examples: z.array(z.object({
    input: z.string().min(1),
    output: z.string().min(1),
  })).min(0),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys, {
  name: z.string().min(1, "API key name is required"),
}).omit({
  id: true,
  userId: true,
  keyHash: true,
  createdAt: true,
  lastUsedAt: true,
  isActive: true,
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
  sessionId?: string;
};

export type ChatResponse = {
  message: string;
  tokensUsed: number;
};

export type ApiKeyWithPlainText = ApiKey & {
  plainTextKey?: string;
};

// User types - Required for Replit Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
