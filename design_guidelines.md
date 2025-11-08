# ForgeAI Design Guidelines

## Design Approach
**System Selected**: Linear/Vercel-inspired minimalist developer dashboard
**Rationale**: ForgeAI is a developer-focused productivity tool requiring clarity, efficiency, and professional polish. Drawing from Linear's information hierarchy and Vercel's clean interface patterns.

## Core Design Principles
1. **Developer-First UX**: Prioritize speed, clarity, and information density
2. **Progressive Disclosure**: Show complexity only when needed
3. **Scannable Hierarchy**: Clear visual weight for primary actions and critical data

## Typography System
- **Display**: Large, bold headings for hero and section titles (text-4xl to text-6xl, font-bold)
- **Interface**: Medium weight for UI elements (text-sm to text-base, font-medium)
- **Body**: Regular weight for descriptions (text-sm to text-base, font-normal)
- **Code**: Monospace for API endpoints, keys, prompts (font-mono, text-sm)
- **Data**: Tabular numeric displays (font-mono for consistency)

Use single font family (Inter or system font stack) for consistency.

## Layout & Spacing System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16, 24 (p-2, m-4, gap-6, etc.)
- **Component padding**: p-4 to p-6 for cards
- **Section spacing**: py-12 to py-24 for vertical rhythm
- **Element gaps**: gap-4 for compact lists, gap-8 for feature grids

**Grid Structure**:
- Sidebar + main content layout (sidebar w-64, main flex-1)
- Cards in 2-3 column grids for persona library
- Single column for chat interfaces and forms

## Component Library

### Navigation
- **Sidebar**: Fixed left navigation (w-64) with icon + label menu items
- **Top Bar**: Breadcrumb trail, user profile, notifications
- **Tabs**: Underline style for switching between Trainer/Test/Deploy views

### Personas & Training
- **Persona Cards**: Compact cards showing name, description, version, usage stats
- **Trainer Interface**: Two-column layout (input form | live preview)
- **Example Inputs**: Tag-based input with add/remove chips
- **Version History**: Timeline view with expandable diff previews

### Chat Sandbox
- **Chat Container**: Centered, max-w-3xl conversation thread
- **Message Bubbles**: Distinct user vs AI styling, monospace for technical responses
- **Input Bar**: Fixed bottom with send button, character count
- **Sidebar Panel**: Collapsible persona settings and parameters

### API & Deployment
- **Endpoint Display**: Copyable code blocks with syntax highlighting
- **API Key Management**: Table with masked keys, copy button, regenerate action
- **Analytics Dashboard**: Metric cards (2-4 column grid) showing usage stats
- **Rate Limit Config**: Slider controls with real-time preview

### Data Display
- **Tables**: Zebra striping for readability, sortable headers
- **Stats Cards**: Large numbers with trend indicators
- **Code Blocks**: Syntax highlighted with copy button in top-right
- **Status Badges**: Rounded pills for Active/Inactive/Published states

### Forms & Inputs
- **Text Fields**: Clean borders, focus states without color
- **Textareas**: Auto-expanding for prompts and examples
- **Buttons**: 
  - Primary: Solid, medium weight (px-4 py-2)
  - Secondary: Outlined (border-2)
  - Ghost: Transparent with hover state
- **Toggles**: Switch components for feature flags

### Overlays
- **Modals**: Centered, max-w-2xl for confirmations and detailed forms
- **Toasts**: Top-right notifications for success/error states
- **Dropdowns**: Attached to trigger elements, minimal shadow

## Page Layouts

### Landing Page
- **Hero**: Full-width, centered text with product tagline and primary CTA
- **Three-Column Features**: Icon + title + description cards
- **Code Example**: Syntax-highlighted integration sample
- **Testimonials**: Two-column grid with avatars
- **Footer**: Links, documentation, social

### Dashboard
- **Sidebar**: Persistent navigation (Home, Personas, Analytics, API Keys, Settings)
- **Main Area**: Greeting header + quick stats cards + recent personas grid
- **Empty States**: Centered illustrations with "Create your first persona" CTA

### Persona Detail
- **Header**: Name, description, version dropdown, publish status
- **Tabbed Interface**: Train | Test | Deploy | Analytics
- **Training Tab**: Form on left (intent + examples), generated prompt preview on right
- **Test Tab**: Chat interface (60% width) + settings panel (40% width)
- **Deploy Tab**: Endpoint URL, API documentation, integration snippets

### Analytics
- **Overview Cards**: Grid showing total requests, tokens used, active personas
- **Charts**: Line graphs for usage trends
- **Persona Breakdown**: Table with per-persona metrics

## Responsive Behavior
- **Desktop (lg+)**: Full sidebar navigation, multi-column layouts
- **Tablet (md)**: Collapsible sidebar, 2-column grids
- **Mobile**: Hamburger menu, single-column stacked layouts, full-width chat

## Images
- **Hero Section**: Large, centered illustration or abstract visualization of AI training pipeline (1200x600px)
- **Empty States**: Small centered icons or illustrations for empty persona lists
- **Feature Icons**: Simple line icons for feature cards (24x24px)

No complex animations. Use subtle transitions on hover states only.