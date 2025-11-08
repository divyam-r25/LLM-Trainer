# ForgeAI

**Tagline**: Train. Test. Deploy custom AI personas in minutes.

## Project Overview

ForgeAI is a platform that lets anyone create, simulate, and publish custom AI personalities without real fine-tuning. Users enter their intent or few-shot examples, and the adaptive system builds a specialized persona prompt. Each trained model can be tested in a live chat sandbox and instantly deployed as a public API endpoint.

## Architecture

- **Frontend**: React + TypeScript with Wouter routing
- **Backend**: Express.js with in-memory storage
- **AI Integration**: Google Gemini API (gemini-2.5-flash) for chat completions
- **Design System**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query for data fetching

## Key Features

### Core Functionality
1. **Persona Creation**: Define AI personas through intent descriptions and few-shot examples
2. **Adaptive Prompt Builder**: Automatically generates structured system prompts from user inputs
3. **Live Chat Sandbox**: Test personas in real-time with conversation history and persistent sessions
4. **API Deployment**: One-click publish to generate public API endpoints with secure authentication
5. **API Key Management**: Generate, regenerate, and manage bcrypt-hashed access keys
6. **Analytics Dashboard**: Track token usage, requests, and performance metrics
7. **Premium Loading Animations**: Particle sphere animations with framer-motion for AI operations

### Data Models

- **Personas**: AI personality configurations with name, description, intent, examples, and system prompts
- **API Keys**: Authentication tokens for accessing persona endpoints
- **Analytics**: Usage metrics tracking requests and token consumption
- **Chat Messages**: Conversation history for sandbox testing

## Technical Stack

### Frontend Components
- Dashboard with persona library grid
- Persona creation/edit forms with intent and example inputs
- Chat sandbox with markdown rendering, persistent sessions, and message history
- API deployment page with code examples and endpoint documentation
- API key management with secure hashing, regeneration, and copy-to-clipboard
- Analytics dashboard with metric cards and usage tables
- Premium AI loading animations with particle sphere effects

### Backend Architecture
- RESTful API endpoints for CRUD operations
- Google Gemini integration for chat completions
- PostgreSQL database with Drizzle ORM
- Bcrypt-hashed API keys with rate limiting (60 req/min)
- Request validation using Zod schemas
- Adaptive prompt engineering system
- Chat message persistence with session management

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

ForgeAI follows a Linear/Vercel-inspired minimalist developer dashboard design with premium AI-tool aesthetics:

- Clean, scannable hierarchy with clear visual weight
- Developer-first UX prioritizing speed and clarity
- Inter font for interface, JetBrains Mono for code
- Consistent spacing using Tailwind's spacing scale
- Sidebar navigation with icon + label menu items
- Cards in responsive grids for persona library
- Code blocks with syntax highlighting and copy buttons
- Beautiful empty states and loading skeletons
- Premium particle sphere loading animations for AI operations

## Environment Variables

- `GEMINI_API_KEY` - Google Gemini API key for chat completions

## Development Status

### Completed (Phase 1: Schema & Frontend)
- ✅ Data schema definition for all models
- ✅ Design system configuration (fonts, colors, spacing)
- ✅ All React components and pages
- ✅ Sidebar navigation and routing
- ✅ Theme toggle (light/dark mode)
- ✅ Beautiful loading and empty states
- ✅ Responsive layouts

### Completed (MVP + Enhancements)
- ✅ Backend implementation with RESTful APIs
- ✅ Gemini AI integration for chat completions
- ✅ PostgreSQL database with complete data persistence
- ✅ Bcrypt-hashed API keys with rate limiting
- ✅ Analytics tracking with token usage
- ✅ Complete CRUD operations for personas, API keys
- ✅ Chat sandbox with markdown rendering and persistent sessions
- ✅ API deployment and key management
- ✅ Improved error handling with clear user messages
- ✅ Premium AI loading animations with particle sphere effects

## Recent Changes

- **2025-11-08**: Added futuristic 3D particle-wave loader
  - Created ParticleWaveLoader component with morphing blob animation using Three.js
  - 800 WebGL particles with gradient colors (electric blue → violet → magenta)
  - Custom shader material for neon glow effects and additive blending
  - Multiple wave functions for organic, breathing movement
  - Pre-computed particle parameters for smooth deterministic animation
  - Automatic WebGL detection with CSS fallback for browser compatibility
  - CSS fallback uses 50 framer-motion animated particles with gradient colors
  - Proper memory management with geometry/material disposal
  - AnimatePresence integration for smooth fade in/out transitions
  - Applied to chat sandbox for premium AI thinking indicator

- **2025-11-08**: Database persistence and security features
  - Migrated from in-memory to PostgreSQL with Drizzle ORM
  - Implemented bcrypt-hashed API keys with regeneration capability
  - Added rate limiting at 60 requests/minute per API key
  - Chat message persistence with localStorage session management
  - Markdown rendering with react-markdown and remark-gfm
  - Clear chat functionality maintains session continuity

- **2025-11-08**: Switched from OpenAI to Google Gemini
  - Replaced OpenAI integration with Gemini AI (gemini-2.5-flash model)
  - Updated error handling for better user feedback
  - Fixed persona form hydration bug for edit workflow
  - Improved chat error messages to show specific quota/auth issues
  - All MVP features complete and functional

- **2025-11-08**: Initial MVP implementation complete
  - Created all data models (Persona, ApiKey, Analytics, ChatMessage)
  - Built complete UI with sidebar navigation
  - Implemented all pages: Dashboard, Persona Form, Chat Sandbox, Deploy, API Keys, Analytics
  - Backend APIs for CRUD operations, chat, analytics
  - Configured design tokens for developer-focused aesthetic
