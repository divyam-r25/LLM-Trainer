# ForgeAI

**Tagline**: Train. Test. Deploy custom AI personas in minutes.

### Overview

ForgeAI is a platform designed to enable users to create, simulate, and publish custom AI personalities without the need for traditional fine-tuning. By simply entering intent descriptions or a few-shot examples, the system automatically builds a specialized persona prompt. These trained AI models can be tested in a live chat sandbox and instantly deployed as public API endpoints. The project aims to provide a fast, intuitive, and developer-friendly experience for creating and deploying AI personas, complete with features like API key management and usage analytics.

### User Preferences

I prefer clear and concise explanations. I value an iterative development approach, where changes are introduced incrementally. Please ask for confirmation before implementing any major architectural changes or introducing new dependencies.

### System Architecture

**UI/UX Decisions**:
ForgeAI adopts a minimalist, Linear/Vercel-inspired developer dashboard design with a premium AI-tool aesthetic. Key design principles include:
- Clean, scannable hierarchy with clear visual weight.
- Developer-first user experience prioritizing speed and clarity.
- **Typography**: Inter font for interface text and JetBrains Mono for code blocks.
- **Color Palette** (Modern Cyan-Gray Theme):
  - Background: #F4F4F9 (Very light grayish/lavender) - Main background
  - Accent: #B8DBD9 (Light cyan/teal) - Highlights, glows, links
  - Secondary: #586F7C (Medium gray-blue) - Secondary elements, muted text
  - Primary: #2F4550 (Dark blue-gray) - Buttons, sidebar, dark elements
  - Text: #000000 (Black) - Primary text, headings
  - Card Background: #FFFFFF (White) - Cards, panels
  - **Glowing Effects**: Personas feature subtle cyan/teal glowing animations
- Consistent spacing utilizing Tailwind's spacing scale.
- Sidebar navigation with icon and label menu items (dark blue-gray background with white text).
- Responsive grids for displaying persona libraries.
- Code blocks with syntax highlighting and copy-to-clipboard functionality.
- Beautiful empty states and loading skeletons.
- Premium particle sphere loading animations for AI operations.
- **Glowing Persona Cards**: Subtle cyan/teal glow effects on persona cards with intensified glow on hover.
- **Dual Route System**: Both standalone routes (`/create`, `/chat/:id`) and integrated routes (`/personas/new`, `/personas/:id/test`) are available for flexibility.
- **Accessibility**: High contrast ratios (>7:1 for text, ~9:1 for buttons) ensuring WCAG compliance.

**Technical Implementations**:
- **Frontend**: React with TypeScript and Wouter for routing.
  - **Pages**: `create-persona.tsx`, `chat-page.tsx`, `persona-form.tsx`, `chat-sandbox.tsx`, `dashboard.tsx`, `api-keys.tsx`, `analytics.tsx`, `persona-deploy.tsx`, `home.tsx`
  - **Routes**: Both standalone (`/create`, `/chat/:id`) and integrated (`/personas/*`) routes available
- **Backend**: Express.js, providing RESTful API endpoints for all CRUD operations.
  - **API Aliases**: `/api/trainers` routes as aliases for `/api/personas` endpoints for compatibility
- **State Management**: TanStack Query is used for efficient data fetching and caching.
- **Design System**: Tailwind CSS for styling, complemented by Shadcn UI components.
- **Database**: PostgreSQL with Drizzle ORM for persistent data storage.
  - **Multi-Tenant Security**: All personas and API keys filtered by authenticated userId
- **Authentication**: Replit Auth blueprint integration for user authentication (OAuth with Google and Email/Password), including `users` and `sessions` tables.
- **Security**: Bcrypt-hashed API keys, rate limiting (60 requests/minute), and `isAuthenticated` middleware for protected routes.
  - **User Isolation**: Complete multi-tenant authorization for personas and API keys
  - **Type Safety**: AuthenticatedRequest interface for all protected routes
  - **API Authentication**: Public API endpoint (`POST /api/v1/chat/:personaId`) uses apiKey in request body for simpler integration (no Authorization header required)
- **Adaptive Prompt Engineering**: A core system that automatically generates structured system prompts from user inputs.
- **Chat Management**: Chat message persistence with session management, markdown rendering using `react-markdown` and `remark-gfm`.

**Feature Specifications**:
- **Persona Creation & Management**: Users can define, create, update, delete, publish, and unpublish AI personas.
  - **Standalone Create Page** (`/create`): Independent persona creation page that redirects to `/chat/:id` on success
  - **Original Create Page** (`/personas/new`): Original persona form that redirects to `/personas/:id/test`
  - **Persona ID Visibility**: Each persona card displays its unique ID with one-click copy functionality for easy API integration
- **Live Chat Sandbox**: Real-time persona testing with conversation history and persistent sessions.
  - **Standalone Chat Page** (`/chat/:id`): Independent chat sandbox for testing personas
  - **Original Chat Page** (`/personas/:id/test`): Original chat sandbox integrated with persona management
- **API Deployment**: One-click deployment of personas as public API endpoints with secure authentication.
  - **Public API Endpoint**: `POST /api/v1/chat/:personaId` with apiKey and message in request body
  - **Simple Authentication**: API key sent in JSON body (no Authorization header needed)
- **API Key Management**: Generation, regeneration, and management of secure API keys.
  - **Persona ID Column**: API Keys table displays truncated persona IDs with copy buttons
  - **Comprehensive Documentation**: Built-in API usage guide with cURL, JavaScript, and Python examples
- **Analytics Dashboard**: Tracking of token usage, requests, and performance metrics.
- **Loading Animations**: Integration of premium particle sphere animations with framer-motion for AI operations.

### External Dependencies

- **AI Integration**: Google Gemini API (`gemini-2.5-flash`) for chat completions.
- **Database**: PostgreSQL.
- **ORM**: Drizzle ORM.
- **Authentication**: Replit Auth.
- **Styling**: Tailwind CSS.
- **UI Components**: Shadcn UI.
- **State Management**: TanStack Query.
- **Animation**: Framer Motion.
- **Markdown Rendering**: `react-markdown` and `remark-gfm`.