import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPersonaSchema, insertApiKeySchema, type ChatRequest, type ChatResponse, personas, apiKeys } from "@shared/schema";
import { generateSystemPrompt, getChatCompletion } from "./gemini";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { rateLimiter } from "./rate-limiter";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Type for authenticated requests with validated OIDC user claims
// The isAuthenticated middleware validates JWT tokens server-side via Replit OIDC
// and sets req.user after successful validation. This type ensures type safety
// when accessing authenticated user data in protected routes.
interface AuthenticatedRequest extends Request {
  user: {
    claims: {
      sub: string;  // User ID from OIDC provider (validated by Replit Auth)
      email?: string;
      first_name?: string;
      last_name?: string;
    };
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth - Reference: blueprint:javascript_log_in_with_replit
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Personas (Protected - require authentication)
  app.get("/api/personas", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const personas = await storage.getAllPersonas(userId);
      res.json(personas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personas" });
    }
  });

  app.get("/api/personas/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const persona = await storage.getPersona(req.params.id, userId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch persona" });
    }
  });

  app.post("/api/personas", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPersonaSchema.parse(req.body);
      
      const systemPrompt = await generateSystemPrompt({
        name: data.name,
        intent: data.intent,
        examples: data.examples,
      });

      const persona = await storage.createPersona({
        ...data,
        userId,
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

  app.patch("/api/personas/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPersonaSchema.partial().parse(req.body);
      
      let systemPrompt = data.systemPrompt;
      if (data.name || data.intent || data.examples) {
        const existingPersona = await storage.getPersona(req.params.id, userId);
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
      }, userId);

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

  app.delete("/api/personas/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deletePersona(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete persona" });
    }
  });

  app.patch("/api/personas/:id/publish", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const persona = await storage.publishPersona(req.params.id, userId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: "Failed to publish persona" });
    }
  });

  app.patch("/api/personas/:id/unpublish", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const persona = await storage.unpublishPersona(req.params.id, userId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: "Failed to unpublish persona" });
    }
  });

  // Chat (Sandbox)
  app.get("/api/chat/:personaId/history", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { personaId } = req.params;
      const { sessionId } = req.query;

      const persona = await storage.getPersona(personaId, userId);
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

  app.post("/api/chat", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, personaId, sessionId } = req.body as ChatRequest;

      if (!message || !personaId) {
        return res.status(400).json({ error: "Message and personaId are required" });
      }

      const persona = await storage.getPersona(personaId, userId);
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

  app.delete("/api/chat/:personaId/clear", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { personaId } = req.params;
      const { sessionId } = req.query;

      const persona = await storage.getPersona(personaId, userId);
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
      
      // Public API - For authentication, we need to check ALL keys (not filtered by userId)
      // because this is a public endpoint accessed via API key
      // We query the database directly to get all keys, then compare hashes
      const allKeys = await db.select().from(apiKeys);
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

      // Public API endpoint does not filter by userId (intentional)
      // This endpoint is meant for external access via API key authentication
      // We query the database directly instead of using storage.getPersona()
      // because getPersona() requires userId filtering for security
      // Here we only check: (1) persona exists, (2) persona is published
      const [personaResult] = await db.select().from(personas).where(eq(personas.id, personaId));
      if (!personaResult) {
        return res.status(404).json({ error: "Persona not found" });
      }

      if (!personaResult.isPublished) {
        return res.status(403).json({ error: "Persona is not published" });
      }
      
      const persona = personaResult;

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
  app.get("/api/api-keys", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const keys = await storage.getAllApiKeys(userId);
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/api-keys", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertApiKeySchema.parse(req.body);
      
      const plainTextKey = `fai_${randomUUID().replace(/-/g, "")}`;
      const keyHash = await bcrypt.hash(plainTextKey, 10);
      
      const result = await storage.createApiKey(data, userId, plainTextKey, keyHash);
      
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

  app.patch("/api/api-keys/:id/regenerate", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const plainTextKey = `fai_${randomUUID().replace(/-/g, "")}`;
      const keyHash = await bcrypt.hash(plainTextKey, 10);
      
      const result = await storage.regenerateApiKey(req.params.id, userId, plainTextKey, keyHash);
      
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

  app.patch("/api/api-keys/:id/toggle", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isActive } = req.body;
      
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }
      
      const apiKey = await storage.toggleApiKeyStatus(req.params.id, isActive, userId);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json(apiKey);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle API key status" });
    }
  });

  app.delete("/api/api-keys/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteApiKey(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "API key not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  // Trainers (Alias routes for /api/personas - for spec compatibility)
  app.get("/api/trainers", isAuthenticated, async (req, res) => {
    return app._router.handle(Object.assign(req, { url: "/api/personas" }), res);
  });

  app.get("/api/trainers/:id", isAuthenticated, async (req, res) => {
    return app._router.handle(Object.assign(req, { url: `/api/personas/${req.params.id}` }), res);
  });

  app.post("/api/trainers", isAuthenticated, async (req, res) => {
    return app._router.handle(Object.assign(req, { url: "/api/personas" }), res);
  });

  app.put("/api/trainers/:id", isAuthenticated, async (req, res) => {
    return app._router.handle(Object.assign(req, { url: `/api/personas/${req.params.id}`, method: "PATCH" }), res);
  });

  // Simulate training endpoint - previews system prompt generation
  app.post("/api/trainers/simulate", isAuthenticated, async (req, res) => {
    try {
      const { name, intent, examples } = req.body;
      
      if (!name || !intent) {
        return res.status(400).json({ error: "Name and intent are required" });
      }

      const systemPrompt = await generateSystemPrompt({
        name,
        intent,
        examples: examples || [],
      });

      res.json({ systemPrompt });
    } catch (error) {
      console.error("Simulate training error:", error);
      res.status(500).json({ error: "Failed to generate system prompt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
