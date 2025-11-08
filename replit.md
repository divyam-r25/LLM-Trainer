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

- **2025-11-08**: ✅ Updated ForgeAI Branding
  - Replaced placeholder logo with custom ForgeAI logo image across all pages
  - Updated homepage navigation, sidebar, and footer with new logo
  - Removed example persona cards (Customer Support Bot, Code Review Assistant, Sales Assistant)
  - Replaced persona cards with large centered logo display in hero section
  - Removed background styling from logo (no rounded corners, no shadows)
  - Logo displays cleanly with `object-contain` for proper scaling
  - Logo appears consistently in navigation bar (8x8), hero section (64x64), sidebar, and footer

- **2025-11-08**: ✅ Implemented Complete Authentication System with Replit Auth
  - **Backend Authentication**:
    - Installed and configured Replit Auth blueprint (OAuth with Google + Email/Password)
    - Added `users` and `sessions` tables to PostgreSQL schema
    - Created `replitAuth.ts` middleware for OAuth flow and session management
    - Implemented `isAuthenticated` middleware to protect all privileged routes
    - Added auth routes: `/api/login`, `/api/logout`, `/api/auth/user`, `/api/callback`
    - **Security Hardening**:
      - All persona CRUD endpoints now require authentication
      - All chat sandbox endpoints protected
      - All API key management endpoints protected
      - ReturnTo parameter sanitization prevents open redirect vulnerability
      - Session cookie `secure` flag is environment-aware (false in dev, true in prod)
  - **Frontend Authentication**:
    - Created `useAuth` React hook for managing auth state (`user`, `isAuthenticated`, `isLoading`)
    - Added `authUtils` for error handling and 401 redirect logic
    - Updated homepage navigation with Login button and user dropdown menu
    - User menu shows avatar, name, email, and logout option
    - Trial section works without login (preview only)
    - After login, trial data prefills persona form via query parameters
  - **User Flow**:
    - Unauthenticated users see Login button in navigation
    - Trial section allows preview without authentication
    - "Create Free Account" button redirects to `/api/login?returnTo=/personas/new?...`
    - After OAuth completes, user redirected to persona form with prefilled trial data
    - Protected dashboard pages check auth and redirect to login on 401
    - Logout destroys session and redirects to homepage
  - **Database Schema**:
    - `users`: id, sub (Replit user ID), email, firstName, lastName, profileImageUrl
    - `sessions`: PostgreSQL-backed express-session storage with 7-day TTL
  - **E2E Testing**: Complete authentication flow tested successfully
    - Unauthenticated trial preview ✓
    - Login with returnTo parameter ✓
    - Protected endpoint access ✓
    - Query param prefilling ✓
    - Logout flow ✓

- **2025-11-08**: ✅ Built complete ForgeAI Homepage
  - Modern, responsive landing page with Linear/Vercel aesthetic
  - Fixed navigation bar with logo and menu links
  - Hero section with compelling headline, dual CTAs, and animated persona cards
  - Replaced detailed analytics mockup with clean persona card previews
  - "Why ForgeAI" feature cards (No Fine-Tuning, Real-Time Testing, API-Ready)
  - Feature comparison table (ForgeAI vs Manual Prompting)
  - Interactive trial section for persona preview simulation
  - Testimonials section with user quotes
  - Comprehensive footer with quick links and social icons
  - Smooth scrolling for hash link navigation
  - Fully responsive design (desktop, tablet, mobile)
  - Homepage at `/`, Dashboard at `/dashboard`
  - All CTAs link to dashboard for user onboarding

- **2025-11-08**: ✅ Simplified navigation structure
  - Removed redundant "Personas" menu item from sidebar
  - Dashboard is the main hub for all persona management
  - Cleaner navigation: Dashboard, Analytics, API Keys
  - Removed duplicate `/personas` route

- **2025-11-08**: ✅ Added delete functionality to persona edit page
  - Delete button with confirmation dialog in edit mode
  - AlertDialog warns about permanent deletion and shows persona name
  - **Fixed**: Added cascade delete constraints to analytics table (personaId and apiKeyId)
  - Proper cascade deletion of all related data (API keys, analytics, chat messages)
  - Success/error toast notifications with redirect to dashboard
  - Destructive styling (red button) positioned on left side of form
  - Safe deletion with explicit user confirmation required
  - **Tested**: E2E test confirms DELETE returns 204, persona removed from dashboard

- **2025-11-08**: ✅ Implemented clean AI thinking loader
  - Replaced complex 3D particle system with simple, professional loading indicator
  - **Design**: Three pulsing dots with "Thinking..." text - matches modern AI chat UX patterns (ChatGPT, Claude)
  - **Animation**: Smooth framer-motion pulsing with sequential staggered delays (0.2s)
  - **Styling**: Muted background, rounded corners, compact size aligned to assistant side
  - **Performance**: Lightweight, fast rendering, works in all browsers without fallback complexity
  - **Integration**: Appears on first and subsequent messages via AnimatePresence transitions
  - **User Feedback**: Clean, minimal, professional appearance that doesn't overwhelm the chat
  - **Tested**: E2E test confirmed loader appears correctly with smooth transitions

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
