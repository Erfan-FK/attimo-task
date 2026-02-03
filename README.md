# Tasks & Notes App - Monorepo

A production-ready full-stack tasks and notes application built with Next.js, Express, and TypeScript.

## 📁 Project Structure

```
.
├── apps/
│   ├── web/          # Next.js 14+ frontend (App Router)
│   └── api/          # Express REST API
├── package.json      # Root workspace configuration
└── pnpm-workspace.yaml
```

## 🚀 Setup

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

**For the web app (`apps/web/.env`):**
```bash
cp apps/web/.env.example apps/web/.env
```

**For the API (`apps/api/.env`):**
```bash
cp apps/api/.env.example apps/api/.env
```

## 🏃 Running Locally

### Development Mode

Run both web and API in parallel:

```bash
pnpm dev
```

Or run them individually:

```bash
# Web app only (http://localhost:3000)
pnpm --filter web dev

# API only (http://localhost:4000)
pnpm --filter api dev
```

### Production Build

```bash
pnpm build
```

### Start Production Servers

```bash
# Web app
pnpm --filter web start

# API
pnpm --filter api start
```

## 🔧 Available Scripts

- `pnpm dev` - Run both apps in development mode
- `pnpm build` - Build both apps for production
- `pnpm lint` - Lint all code
- `pnpm format` - Format code with Prettier

## 🌍 Environment Variables

### Web App (`apps/web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:4000` |

### API (`apps/api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## 📦 Tech Stack

### Frontend (Web)
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Linting:** ESLint + Prettier

### Backend (API)
- **Framework:** Express.js
- **Language:** TypeScript
- **Dev Tools:** tsx (hot reload)
- **Environment:** dotenv

### Monorepo
- **Package Manager:** pnpm with workspaces
- **Task Runner:** concurrently
- **Code Quality:** ESLint, Prettier (shared config)

## 🚢 Deployment Notes

### Web App (Next.js)

The web app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any Node.js hosting platform

Build command: `pnpm --filter web build`  
Start command: `pnpm --filter web start`

### API (Express)

The API can be deployed to:
- **Railway**
- **Render**
- **Heroku**
- **AWS EC2/ECS**
- **DigitalOcean App Platform**

Build command: `pnpm --filter api build`  
Start command: `pnpm --filter api start`

### Environment Variables

Ensure all environment variables are configured in your deployment platform. Never commit `.env` files with actual secrets.

## 📝 Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Keep components modular and reusable
- Write meaningful commit messages
- Test locally before pushing

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm format`
4. Submit a pull request

## 📄 License

ISC
