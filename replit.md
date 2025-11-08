# ForgeAI

**Tagline**: Train. Test. Deploy custom AI personas in minutes.

## Project Overview

ForgeAI is a platform that lets anyone create, simulate, and publish custom AI personalities without real fine-tuning. Users enter their intent or few-shot examples, and the adaptive system builds a specialized persona prompt. Each trained model can be tested in a live chat sandbox and instantly deployed as a public API endpoint.

## Architecture

- **Frontend**: React + TypeScript with Wouter routing
- **Backend**: Express.js with in-memory storage
- **AI Integration**: OpenAI API (gpt-5) for chat completions
- **Design System**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query for data fetching

## Key Features

### Core Functionality
1. **Persona Creation**: Define AI personas through intent descriptions and few-shot examples
2. **Adaptive Prompt Builder**: Automatically generates structured system prompts from user inputs
3. **Live Chat Sandbox**: Test personas in real-time with conversation history
4. **API Deployment**: One-click publish to generate public API endpoints
5. **API Key Management**: Generate and manage access keys for each persona
6. **Analytics Dashboard**: Track token usage, requests, and performance metrics

### Data Models

- **Personas**: AI personality configurations with name, description, intent, examples, and system prompts
- **API Keys**: Authentication tokens for accessing persona endpoints
- **Analytics**: Usage metrics tracking requests and token consumption
- **Chat Messages**: Conversation history for sandbox testing

## Technical Stack

### Frontend Components
- Dashboard with persona library grid
- Persona creation/edit forms with intent and example inputs
- Chat sandbox with message bubbles and typing indicators
- API deployment page with code examples
- API key management with copy-to-clipboard
- Analytics dashboard with metric cards and tables

### Backend Architecture
- RESTful API endpoints for CRUD operations
- OpenAI integration for chat completions
- In-memory storage (MemStorage) for rapid prototyping
- Request validation using Zod schemas
- Adaptive prompt engineering system

## API Endpoints

### Personas
- `GET /api/personas` - List all personas with stats
- `GET /api/personas/:id` - Get specific persona
- `POST /api/personas` - Create new persona
- `PATCH /api/personas/:id` - Update persona
- `DELETE /api/personas/:id` - Delete persona
- `PATCH /api/personas/:id/publish` - Publish persona
- `PATCH /api/personas/:id/unpublish` - Unpublish persona

### Chat
- `POST /api/chat` - Send message to persona in sandbox
- `POST /api/v1/chat/:personaId` - Public API endpoint for deployed personas

### API Keys
- `GET /api/api-keys` - List all API keys
- `POST /api/api-keys` - Generate new API key
- `DELETE /api/api-keys/:id` - Delete API key

## Design Guidelines

ForgeAI follows a Linear/Vercel-inspired minimalist developer dashboard design:

- Clean, scannable hierarchy with clear visual weight
- Developer-first UX prioritizing speed and clarity
- Inter font for interface, JetBrains Mono for code
- Consistent spacing using Tailwind's spacing scale
- Sidebar navigation with icon + label menu items
- Cards in responsive grids for persona library
- Code blocks with syntax highlighting and copy buttons
- Beautiful empty states and loading skeletons

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for chat completions

## Development Status

### Completed (Phase 1: Schema & Frontend)
- ✅ Data schema definition for all models
- ✅ Design system configuration (fonts, colors, spacing)
- ✅ All React components and pages
- ✅ Sidebar navigation and routing
- ✅ Theme toggle (light/dark mode)
- ✅ Beautiful loading and empty states
- ✅ Responsive layouts

### In Progress
- Backend implementation
- API integration
- OpenAI chat completion
- Analytics tracking

## Recent Changes

- **2024-01-08**: Initial schema and frontend implementation complete
  - Created all data models (Persona, ApiKey, Analytics, ChatMessage)
  - Built complete UI with sidebar navigation
  - Implemented all pages: Dashboard, Persona Form, Chat Sandbox, Deploy, API Keys, Analytics
  - Configured design tokens for developer-focused aesthetic
