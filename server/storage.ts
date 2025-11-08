import {
  type Persona,
  type InsertPersona,
  type ApiKey,
  type InsertApiKey,
  type Analytics,
  type ChatMessage,
  type InsertChatMessage,
  type PersonaWithStats,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Personas
  getAllPersonas(): Promise<PersonaWithStats[]>;
  getPersona(id: string): Promise<Persona | undefined>;
  createPersona(persona: InsertPersona): Promise<Persona>;
  updatePersona(id: string, persona: Partial<InsertPersona>): Promise<Persona | undefined>;
  deletePersona(id: string): Promise<boolean>;
  publishPersona(id: string): Promise<Persona | undefined>;
  unpublishPersona(id: string): Promise<Persona | undefined>;

  // API Keys
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<boolean>;
  updateApiKeyLastUsed(id: string): Promise<void>;

  // Analytics
  getAnalyticsByPersona(personaId: string): Promise<Analytics[]>;
  createAnalytics(analytics: {
    personaId: string;
    apiKeyId?: string;
    tokensUsed: number;
    requestCount: number;
  }): Promise<Analytics>;

  // Chat Messages
  getChatMessages(personaId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(personaId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private personas: Map<string, Persona>;
  private apiKeys: Map<string, ApiKey>;
  private analytics: Map<string, Analytics>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.personas = new Map();
    this.apiKeys = new Map();
    this.analytics = new Map();
    this.chatMessages = new Map();
  }

  async getAllPersonas(): Promise<PersonaWithStats[]> {
    const personaArray = Array.from(this.personas.values());
    
    return personaArray.map((persona) => {
      const personaAnalytics = Array.from(this.analytics.values()).filter(
        (a) => a.personaId === persona.id
      );
      const totalRequests = personaAnalytics.reduce((sum, a) => sum + a.requestCount, 0);
      const totalTokens = personaAnalytics.reduce((sum, a) => sum + a.tokensUsed, 0);
      const apiKeyCount = Array.from(this.apiKeys.values()).filter(
        (k) => k.personaId === persona.id
      ).length;

      return {
        ...persona,
        totalRequests,
        totalTokens,
        apiKeyCount,
      };
    });
  }

  async getPersona(id: string): Promise<Persona | undefined> {
    return this.personas.get(id);
  }

  async createPersona(insertPersona: InsertPersona): Promise<Persona> {
    const id = randomUUID();
    const now = new Date();
    const persona: Persona = {
      ...insertPersona,
      id,
      isPublished: insertPersona.isPublished ?? 0,
      currentVersion: insertPersona.currentVersion ?? 1,
      createdAt: now,
      updatedAt: now,
    };
    this.personas.set(id, persona);
    return persona;
  }

  async updatePersona(
    id: string,
    updates: Partial<InsertPersona>
  ): Promise<Persona | undefined> {
    const persona = this.personas.get(id);
    if (!persona) return undefined;

    const updated: Persona = {
      ...persona,
      ...updates,
      updatedAt: new Date(),
    };
    this.personas.set(id, updated);
    return updated;
  }

  async deletePersona(id: string): Promise<boolean> {
    return this.personas.delete(id);
  }

  async publishPersona(id: string): Promise<Persona | undefined> {
    const persona = this.personas.get(id);
    if (!persona) return undefined;

    const updated: Persona = {
      ...persona,
      isPublished: 1,
      updatedAt: new Date(),
    };
    this.personas.set(id, updated);
    return updated;
  }

  async unpublishPersona(id: string): Promise<Persona | undefined> {
    const persona = this.personas.get(id);
    if (!persona) return undefined;

    const updated: Persona = {
      ...persona,
      isPublished: 0,
      updatedAt: new Date(),
    };
    this.personas.set(id, updated);
    return updated;
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values());
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find((k) => k.key === key);
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = randomUUID();
    const key = `fai_${randomUUID().replace(/-/g, "")}`;
    const now = new Date();
    
    const apiKey: ApiKey = {
      ...insertApiKey,
      id,
      key,
      createdAt: now,
      lastUsedAt: null,
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    const apiKey = this.apiKeys.get(id);
    if (apiKey) {
      this.apiKeys.set(id, {
        ...apiKey,
        lastUsedAt: new Date(),
      });
    }
  }

  async getAnalyticsByPersona(personaId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (a) => a.personaId === personaId
    );
  }

  async createAnalytics(data: {
    personaId: string;
    apiKeyId?: string;
    tokensUsed: number;
    requestCount: number;
  }): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      id,
      personaId: data.personaId,
      apiKeyId: data.apiKeyId || null,
      tokensUsed: data.tokensUsed,
      requestCount: data.requestCount,
      timestamp: new Date(),
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getChatMessages(personaId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((m) => m.personaId === personaId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatMessages(personaId: string): Promise<void> {
    const messagesToDelete = Array.from(this.chatMessages.entries())
      .filter(([, m]) => m.personaId === personaId)
      .map(([id]) => id);

    messagesToDelete.forEach((id) => this.chatMessages.delete(id));
  }
}

export const storage = new MemStorage();
