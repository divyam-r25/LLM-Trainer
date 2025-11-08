import {
  personas,
  apiKeys,
  analytics,
  chatMessages,
  users,
  type Persona,
  type InsertPersona,
  type ApiKey,
  type InsertApiKey,
  type Analytics,
  type ChatMessage,
  type InsertChatMessage,
  type PersonaWithStats,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Personas
  getAllPersonas(userId: string): Promise<PersonaWithStats[]>;
  getPersona(id: string, userId: string): Promise<Persona | undefined>;
  createPersona(persona: InsertPersona & { userId: string }): Promise<Persona>;
  updatePersona(id: string, persona: Partial<InsertPersona>, userId: string): Promise<Persona | undefined>;
  deletePersona(id: string, userId: string): Promise<boolean>;
  publishPersona(id: string, userId: string): Promise<Persona | undefined>;
  unpublishPersona(id: string, userId: string): Promise<Persona | undefined>;

  // API Keys
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey, plainTextKey: string, keyHash: string): Promise<{ apiKey: ApiKey; plainTextKey: string }>;
  deleteApiKey(id: string): Promise<boolean>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  toggleApiKeyStatus(id: string, isActive: boolean): Promise<ApiKey | undefined>;
  regenerateApiKey(id: string, newPlainTextKey: string, newKeyHash: string): Promise<{ apiKey: ApiKey; plainTextKey: string }>;

  // Analytics
  getAnalyticsByPersona(personaId: string): Promise<Analytics[]>;
  createAnalytics(analytics: {
    personaId: string;
    apiKeyId?: string;
    tokensUsed: number;
    requestCount: number;
  }): Promise<Analytics>;

  // Chat Messages
  getChatMessages(personaId: string, sessionId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(personaId: string, sessionId?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllPersonas(userId: string): Promise<PersonaWithStats[]> {
    const allPersonas = await db.select().from(personas).where(eq(personas.userId, userId));
    
    const personasWithStats = await Promise.all(
      allPersonas.map(async (persona) => {
        const personaAnalytics = await db
          .select({
            totalRequests: sql<number>`COALESCE(SUM(${analytics.requestCount}), 0)`,
            totalTokens: sql<number>`COALESCE(SUM(${analytics.tokensUsed}), 0)`,
          })
          .from(analytics)
          .where(eq(analytics.personaId, persona.id));

        const apiKeyCount = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(apiKeys)
          .where(eq(apiKeys.personaId, persona.id));

        return {
          ...persona,
          totalRequests: Number(personaAnalytics[0]?.totalRequests || 0),
          totalTokens: Number(personaAnalytics[0]?.totalTokens || 0),
          apiKeyCount: Number(apiKeyCount[0]?.count || 0),
        };
      })
    );

    return personasWithStats;
  }

  async getPersona(id: string, userId: string): Promise<Persona | undefined> {
    const [persona] = await db.select().from(personas).where(
      and(eq(personas.id, id), eq(personas.userId, userId))
    );
    return persona;
  }

  async createPersona(insertPersona: InsertPersona & { userId: string }): Promise<Persona> {
    const [persona] = await db.insert(personas).values(insertPersona).returning();
    return persona;
  }

  async updatePersona(id: string, updates: Partial<InsertPersona>, userId: string): Promise<Persona | undefined> {
    const [updated] = await db
      .update(personas)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(personas.id, id), eq(personas.userId, userId)))
      .returning();
    return updated;
  }

  async deletePersona(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(personas).where(and(eq(personas.id, id), eq(personas.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async publishPersona(id: string, userId: string): Promise<Persona | undefined> {
    const [updated] = await db
      .update(personas)
      .set({ isPublished: 1, updatedAt: new Date() })
      .where(and(eq(personas.id, id), eq(personas.userId, userId)))
      .returning();
    return updated;
  }

  async unpublishPersona(id: string, userId: string): Promise<Persona | undefined> {
    const [updated] = await db
      .update(personas)
      .set({ isPublished: 0, updatedAt: new Date() })
      .where(and(eq(personas.id, id), eq(personas.userId, userId)))
      .returning();
    return updated;
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys);
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return apiKey;
  }

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash));
    return apiKey;
  }

  async createApiKey(
    insertApiKey: InsertApiKey,
    plainTextKey: string,
    keyHash: string
  ): Promise<{ apiKey: ApiKey; plainTextKey: string }> {
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        ...insertApiKey,
        keyHash,
      })
      .returning();
    
    return { apiKey, plainTextKey };
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }

  async toggleApiKeyStatus(id: string, isActive: boolean): Promise<ApiKey | undefined> {
    const [updated] = await db
      .update(apiKeys)
      .set({ isActive })
      .where(eq(apiKeys.id, id))
      .returning();
    return updated;
  }

  async regenerateApiKey(
    id: string,
    newPlainTextKey: string,
    newKeyHash: string
  ): Promise<{ apiKey: ApiKey; plainTextKey: string }> {
    const [updated] = await db
      .update(apiKeys)
      .set({ keyHash: newKeyHash })
      .where(eq(apiKeys.id, id))
      .returning();
    
    return { apiKey: updated, plainTextKey: newPlainTextKey };
  }

  async getAnalyticsByPersona(personaId: string): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.personaId, personaId));
  }

  async createAnalytics(data: {
    personaId: string;
    apiKeyId?: string;
    tokensUsed: number;
    requestCount: number;
  }): Promise<Analytics> {
    const [created] = await db
      .insert(analytics)
      .values({
        personaId: data.personaId,
        apiKeyId: data.apiKeyId || null,
        tokensUsed: data.tokensUsed,
        requestCount: data.requestCount,
      })
      .returning();
    return created;
  }

  async getChatMessages(personaId: string, sessionId?: string): Promise<ChatMessage[]> {
    if (sessionId) {
      return await db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.personaId, personaId),
            eq(chatMessages.sessionId, sessionId)
          )
        )
        .orderBy(chatMessages.createdAt);
    }
    
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.personaId, personaId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async clearChatMessages(personaId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      await db
        .delete(chatMessages)
        .where(
          and(
            eq(chatMessages.personaId, personaId),
            eq(chatMessages.sessionId, sessionId)
          )
        );
    } else {
      await db.delete(chatMessages).where(eq(chatMessages.personaId, personaId));
    }
  }
}

export const storage = new DatabaseStorage();
