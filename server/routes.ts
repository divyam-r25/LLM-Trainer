import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPersonaSchema, insertApiKeySchema, type ChatRequest, type ChatResponse } from "@shared/schema";
import { generateSystemPrompt, getChatCompletion } from "./openai";

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
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, personaId } = req.body as ChatRequest;

      if (!message || !personaId) {
        return res.status(400).json({ error: "Message and personaId are required" });
      }

      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      const chatHistory = await storage.getChatMessages(personaId);
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
        role: "user",
        content: message,
      });

      await storage.createChatMessage({
        personaId,
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
      
      if (error?.status === 429) {
        return res.status(429).json({ 
          error: "OpenAI API quota exceeded. Please check your OpenAI account billing and add credits." 
        });
      }
      
      if (error?.code === 'insufficient_quota') {
        return res.status(429).json({ 
          error: "OpenAI API quota exceeded. Please add credits to your OpenAI account." 
        });
      }

      if (error?.status === 401) {
        return res.status(500).json({ 
          error: "OpenAI API key is invalid. Please check your OPENAI_API_KEY environment variable." 
        });
      }
      
      res.status(500).json({ 
        error: error?.message || "Failed to process chat message" 
      });
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

      const apiKey = authHeader.substring(7);
      const keyRecord = await storage.getApiKeyByKey(apiKey);

      if (!keyRecord || keyRecord.personaId !== personaId) {
        return res.status(403).json({ error: "Invalid API key for this persona" });
      }

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
      const apiKey = await storage.createApiKey(data);
      res.status(201).json(apiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create API key" });
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
