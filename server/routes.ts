import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPersonaSchema, insertApiKeySchema, type ChatRequest, type ChatResponse } from "@shared/schema";
import { generateSystemPrompt, getChatCompletion } from "./gemini";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { rateLimiter } from "./rate-limiter";

export async function registerRoutes(app: Express): Promise<Server> {
  // Personas
  app.get("/api/personas", async (req, res) => {
    try {
      const personas = await storage.getAllPersonas();
      res.json(personas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personas" });
    }
  });

  app.get("/api/personas/:id", async (req, res) => {
    try {
      const persona = await storage.getPersona(req.params.id);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch persona" });
    }
  });

  app.post("/api/personas", async (req, res) => {
    try {
      const data = insertPersonaSchema.parse(req.body);
      
      const systemPrompt = await generateSystemPrompt({
        name: data.name,
        intent: data.intent,
        examples: data.examples,
      });

      const persona = await storage.createPersona({
        ...data,
        systemPrompt,
      });

      res.status(201).json(persona);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create persona" });
    }
  });

  app.patch("/api/personas/:id", async (req, res) => {
    try {
      const data = insertPersonaSchema.partial().parse(req.body);
      
      let systemPrompt = data.systemPrompt;
      if (data.name || data.intent || data.examples) {
        const existingPersona = await storage.getPersona(req.params.id);
        if (!existingPersona) {
          return res.status(404).json({ error: "Persona not found" });
        }

        systemPrompt = await generateSystemPrompt({
          name: data.name || existingPersona.name,
          intent: data.intent || existingPersona.intent,
          examples: data.examples || existingPersona.examples,
        });
      }

      const persona = await storage.updatePersona(req.params.id, {
        ...data,
        systemPrompt,
      });

      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      res.json(persona);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update persona" });
    }
  });

  app.delete("/api/personas/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePersona(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete persona" });
    }
  });

  app.patch("/api/personas/:id/publish", async (req, res) => {
    try {
      const persona = await storage.publishPersona(req.params.id);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: "Failed to publish persona" });
    }
  });

  app.patch("/api/personas/:id/unpublish", async (req, res) => {
    try {
      const persona = await storage.unpublishPersona(req.params.id);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: "Failed to unpublish persona" });
    }
  });

  // Chat (Sandbox)
  app.get("/api/chat/:personaId/history", async (req, res) => {
    try {
      const { personaId } = req.params;
      const { sessionId } = req.query;

      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      const messages = await storage.getChatMessages(
        personaId,
        sessionId as string | undefined
      );
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, personaId, sessionId } = req.body as ChatRequest;

      if (!message || !personaId) {
        return res.status(400).json({ error: "Message and personaId are required" });
      }

      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      const chatHistory = await storage.getChatMessages(personaId, sessionId);
      const conversationHistory = chatHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      const completion = await getChatCompletion({
        systemPrompt: persona.systemPrompt,
        message,
        conversationHistory,
      });

      await storage.createChatMessage({
        personaId,
        sessionId: sessionId || "default",
        role: "user",
        content: message,
      });

      await storage.createChatMessage({
        personaId,
        sessionId: sessionId || "default",
        role: "assistant",
        content: completion.message,
      });

      await storage.createAnalytics({
        personaId,
        tokensUsed: completion.tokensUsed,
        requestCount: 1,
      });

      const response: ChatResponse = {
        message: completion.message,
        tokensUsed: completion.tokensUsed,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      if (error?.status === 429 || error?.code === 'insufficient_quota') {
        return res.status(429).json({ 
          error: "AI API quota exceeded. Please check your API key billing and add credits." 
        });
      }

      if (error?.status === 401 || error?.code === 'UNAUTHENTICATED') {
        return res.status(500).json({ 
          error: "AI API key is invalid. Please check your GEMINI_API_KEY environment variable." 
        });
      }
      
      res.status(500).json({ 
        error: error?.message || "Failed to process chat message" 
      });
    }
  });

  app.delete("/api/chat/:personaId/clear", async (req, res) => {
    try {
      const { personaId } = req.params;
      const { sessionId } = req.query;

      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      await storage.clearChatMessages(personaId, sessionId as string | undefined);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to clear chat:", error);
      res.status(500).json({ error: "Failed to clear chat" });
    }
  });

  // Public API endpoint for deployed personas
  app.post("/api/v1/chat/:personaId", async (req, res) => {
    try {
      const { personaId } = req.params;
      const { message } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization header" });
      }

      const plainTextKey = authHeader.substring(7);
      const keyHash = await bcrypt.hash(plainTextKey, 10);
      
      const allKeys = await storage.getAllApiKeys();
      let keyRecord = null;
      
      for (const key of allKeys) {
        const matches = await bcrypt.compare(plainTextKey, key.keyHash);
        if (matches && key.personaId === personaId) {
          keyRecord = key;
          break;
        }
      }

      if (!keyRecord) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      if (!keyRecord.isActive) {
        return res.status(403).json({ error: "API key has been disabled" });
      }

      const rateLimit = rateLimiter.checkLimit(keyRecord.id);
      if (!rateLimit.allowed) {
        const resetDate = new Date(rateLimit.resetTime);
        return res.status(429).json({
          error: "Rate limit exceeded",
          resetAt: resetDate.toISOString(),
        });
      }

      res.setHeader("X-RateLimit-Limit", "60");
      res.setHeader("X-RateLimit-Remaining", rateLimit.remaining.toString());
      res.setHeader("X-RateLimit-Reset", new Date(rateLimit.resetTime).toISOString());

      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      if (!persona.isPublished) {
        return res.status(403).json({ error: "Persona is not published" });
      }

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const completion = await getChatCompletion({
        systemPrompt: persona.systemPrompt,
        message,
      });

      await storage.updateApiKeyLastUsed(keyRecord.id);

      await storage.createAnalytics({
        personaId,
        apiKeyId: keyRecord.id,
        tokensUsed: completion.tokensUsed,
        requestCount: 1,
      });

      const response: ChatResponse = {
        message: completion.message,
        tokensUsed: completion.tokensUsed,
      };

      res.json(response);
    } catch (error) {
      console.error("Public API chat error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // API Keys
  app.get("/api/api-keys", async (req, res) => {
    try {
      const keys = await storage.getAllApiKeys();
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/api-keys", async (req, res) => {
    try {
      const data = insertApiKeySchema.parse(req.body);
      
      const plainTextKey = `fai_${randomUUID().replace(/-/g, "")}`;
      const keyHash = await bcrypt.hash(plainTextKey, 10);
      
      const result = await storage.createApiKey(data, plainTextKey, keyHash);
      
      res.status(201).json({
        ...result.apiKey,
        plainTextKey: result.plainTextKey,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  app.patch("/api/api-keys/:id/regenerate", async (req, res) => {
    try {
      const plainTextKey = `fai_${randomUUID().replace(/-/g, "")}`;
      const keyHash = await bcrypt.hash(plainTextKey, 10);
      
      const result = await storage.regenerateApiKey(req.params.id, plainTextKey, keyHash);
      
      if (!result.apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json({
        ...result.apiKey,
        plainTextKey: result.plainTextKey,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to regenerate API key" });
    }
  });

  app.patch("/api/api-keys/:id/toggle", async (req, res) => {
    try {
      const { isActive } = req.body;
      
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }
      
      const apiKey = await storage.toggleApiKeyStatus(req.params.id, isActive);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json(apiKey);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle API key status" });
    }
  });

  app.delete("/api/api-keys/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteApiKey(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "API key not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
