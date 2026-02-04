# Attimo - Task & Note Management Application

## Live Deployment

**Frontend (Netlify):** https://attimo-note-ai.netlify.app  
**Backend (Railway):** https://attimo-note-ai-production.up.railway.app  
**API Documentation:** https://attimo-note-ai-production.up.railway.app/api-docs

The application is fully deployed using Netlify for frontend hosting, Railway for backend infrastructure, and Supabase for database and authentication services.

## Local Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Erfan-FK/attimo-task.git
cd attimo-task
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:

**Frontend (`apps/web/.env`):**
```bash
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your Supabase credentials and API URL
```

**Backend (`apps/api/.env`):**
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your Supabase and Groq API credentials
```

4. Run the application:
```bash
# From project root - starts both frontend and backend concurrently
pnpm dev
```

Frontend will be available at `http://localhost:3000`  
Backend will be available at `http://localhost:4000`

## Technology Stack

### Frontend Architecture
- **Framework:** Next.js 15 (App Router with React Server Components)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 3.4 with custom design system
- **UI Components:** Radix UI primitives with custom implementations
- **State Management:** React Context API for authentication
- **Form Handling:** React Hook Form with Zod validation
- **HTTP Client:** Native Fetch API with custom wrapper
- **Animations:** Framer Motion
- **Date Handling:** date-fns
- **Notifications:** Sonner (toast notifications)

### Backend Architecture
- **Framework:** Express.js 4.21
- **Language:** TypeScript 5.9
- **Runtime:** Node.js with tsx for development hot-reload
- **Authentication:** JWT verification via Supabase JWKS
- **Validation:** Zod schemas for request/response validation
- **Security:** Helmet.js for HTTP headers, CORS configuration, rate limiting
- **API Documentation:** Swagger/OpenAPI 3.0 with swagger-ui-express
- **AI Integration:** Groq SDK for LLM-powered features

### Database & Services
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth with JWT tokens
- **ORM:** Supabase Client SDK
- **AI Provider:** Groq (LLaMA models)

### Infrastructure
- **Monorepo:** pnpm workspaces
- **Frontend Hosting:** Netlify (SSR + Static Generation)
- **Backend Hosting:** Railway (containerized deployment)
- **Database Hosting:** Supabase (managed PostgreSQL)

## Project Structure

### Backend (`apps/api/src`)

```
src/
├── config/          # Configuration files
│   └── supabase.ts  # Supabase admin client configuration
├── lib/             # Core business logic
│   ├── ai.ts        # AI integration (Groq SDK, prompt engineering)
│   ├── supabase.ts  # Supabase client initialization
│   └── validators.ts # Zod schemas for request validation
├── middleware/      # Express middleware layer
│   ├── auth.ts      # JWT authentication & authorization
│   ├── error.ts     # Centralized error handling
│   └── rate-limit.ts # Rate limiting configurations
├── routes/          # API route handlers
│   ├── ai.ts        # AI-powered note enhancement endpoints
│   ├── notes.ts     # CRUD operations for notes
│   ├── profile.ts   # User profile management
│   └── tasks.ts     # CRUD operations for tasks
├── types/           # TypeScript type definitions
│   └── express.d.ts # Express request type extensions
├── app.ts           # Express application setup
├── index.ts         # Server entry point
└── swagger.ts       # OpenAPI specification
```

**Backend Architecture Layers:**
1. **Route Layer:** HTTP endpoint definitions with OpenAPI documentation
2. **Middleware Layer:** Authentication, validation, rate limiting, error handling
3. **Business Logic Layer:** Core functionality in `lib/` directory
4. **Data Access Layer:** Supabase client for database operations
5. **External Services Layer:** AI integration via Groq SDK

### Frontend (`apps/web/src`)

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public routes (login, signup, landing)
│   ├── app/               # Protected application routes
│   │   ├── dashboard/     # Dashboard with stats and recent items
│   │   ├── notes/         # Notes management with AI tools
│   │   ├── settings/      # User settings and profile
│   │   └── tasks/         # Task management with filters
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles and Tailwind directives
├── components/            # React components
│   ├── app-shell/        # Application shell (sidebar, navigation)
│   ├── notes/            # Note-specific components (editor, AI panel)
│   ├── tasks/            # Task-specific components (cards, modals)
│   └── ui/               # Reusable UI primitives (buttons, inputs, etc.)
├── contexts/             # React Context providers
│   └── auth-context.tsx  # Authentication state management
├── lib/                  # Utilities and configurations
│   ├── api.ts           # API client with typed endpoints
│   ├── supabase/        # Supabase client configuration
│   └── utils.ts         # Helper functions (cn, date formatting)
├── types/               # TypeScript type definitions
│   └── supabase.ts      # Database schema types
└── middleware.ts        # Next.js middleware for auth protection
```

**Frontend Architecture Patterns:**
1. **Route-based Code Splitting:** Automatic by Next.js App Router
2. **Server/Client Component Separation:** RSC for static content, client components for interactivity
3. **Centralized API Client:** Type-safe API calls via `lib/api.ts`
4. **Context-based State:** Authentication state shared via React Context
5. **Component Composition:** Radix UI primitives wrapped with custom styling

## Implementation Details

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. Supabase returns JWT access token
3. Frontend stores token in memory (via Context)
4. Backend validates JWT using Supabase JWKS endpoint
5. Middleware attaches `userId` to request object
6. Routes use `userId` for data isolation

### AI Features Implementation
- **Summarize:** Extracts 5 key bullet points + main takeaway
- **Improve:** Enhances grammar, clarity, and structure
- **Extract Tasks:** Identifies actionable items from note content
- All AI requests use streaming with 30-second timeout
- AI history stored in `note_ai_runs` table for audit trail

### Security Measures
- JWT-based authentication with token expiration
- Rate limiting on all endpoints (100 req/15min general, 20 req/15min AI)
- CORS configuration with origin whitelist
- Helmet.js for security headers
- Input validation via Zod schemas
- SQL injection prevention via parameterized queries (Supabase SDK)
- XSS prevention via React's built-in escaping

### Database Schema
- **users:** Managed by Supabase Auth
- **tasks:** User tasks with status, priority, deadline, tags
- **notes:** User notes with content, tags, pinned status
- **note_ai_runs:** AI operation history with action type and output
- **profiles:** Extended user profile data (full_name, theme)

## Future Enhancements & Tradeoffs

### Potential Features

**Backend:**
- File attachments for notes
- Advanced search with full-text indexing
- Task dependencies and subtasks
- Email notifications for task deadlines

**Frontend:**
- Drag-and-drop task reordering
- Kanban board view for tasks
- Calendar view for deadline visualization
- Customizable dashboard widgets

### Current Design Tradeoffs

**Tradeoffs:**
1. **No Refresh Tokens:** Simpler auth flow, less secure for long sessions
   - **Alternative:** Refresh token rotation for better security
   
2. **Synchronous AI:** Simpler error handling, blocks user during processing
   - **Alternative:** Async job queue with webhooks/polling for status

### Scalability Improvements
**Performance Optimizations:**
- Caching
- pagination

### Technical Debt Considerations
**Current Limitations:**
- Basic rate limiting (IP-based only)
- No request/response compression
- Limited input sanitization
- No database migration system
- Hardcoded AI prompts (should be configurable)

**Recommended Improvements:**
- Enhance rate limiting with user-based tracking
- Implement database migration tool (Prisma, TypeORM)