# AI Corporation Orchestrator Platform

**Production-ready multi-agent SaaS orchestration platform** for AI-powered business automation. Coordinate AI agents (CEO, CFO, HR, PM, etc.) to execute complex workflows and manage projects autonomously.

## Overview

This platform enables organizations to leverage multiple specialized AI agents working together to automate business processes, make strategic decisions, and manage projects. Built with enterprise-grade infrastructure and scalability in mind.

**Key Features:**
- 🤖 **Multi-Agent Orchestration**: Coordinate specialized AI agents (CEO, CFO, HR, PM, etc.)
- 🔄 **Workflow Engine**: JSON-based workflow definitions with 5 action types
- 📊 **Project Management**: Full CRUD operations for projects, tasks, and teams
- 🏢 **Multi-Tenancy**: Organization-based isolation with RBAC
- 🔒 **Type-Safe API**: End-to-end type safety with tRPC + Zod
- 📈 **Scalable Architecture**: Microservices with queue-based processing

## Tech Stack

### Backend
- **API Framework**: Fastify with tRPC for type-safe APIs
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Queue**: Redis + BullMQ for async job processing
- **Language**: TypeScript (strict mode)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation

### Infrastructure
- **Monorepo**: Turborepo with pnpm workspaces
- **Containerization**: Docker + Docker Compose
- **Runtime**: Node.js 18+
- **Testing**: Vitest with coverage reporting

## Domain Model Summary

**11 Core Entities**: Organization (multi-tenant root), User (RBAC), Project, Task, AgentProfile (CEO/CFO/HR/PM/etc.), AgentInstance, Workflow, WorkflowRun, Job (BullMQ), ToolDefinition, AuditLog

See full documentation in [Architecture section](#project-structure).

## Getting Started

### Requirements

- **Node.js** 18+
- **pnpm** 8+
- **Docker** & Docker Compose
- **OpenAI API Key**

### Quick Setup

```bash
# 1. Clone and navigate
git clone <repository-url>
cd ai-corp-orchestrator-platform

# 2. Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Add OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# 4. One-command setup
pnpm setup

# 5. Start development
pnpm dev
```

**Access**:
- Web Dashboard: http://localhost:3000
- API Server: http://localhost:3001
- tRPC Playground: http://localhost:3001/trpc

### Demo Credentials

After `pnpm db:seed`:
- Organization: **Demo Corporation** (`demo-corp`)
- Admin: `admin@demo-corp.com`
- Member: `member@demo-corp.com`

Copy the displayed IDs to `apps/web/.env.local`:
```env
NEXT_PUBLIC_DEFAULT_ORG_ID=<org-id>
NEXT_PUBLIC_DEFAULT_USER_ID=<user-id>
```

## Example Flow: Project Management (End-to-End Vertical Slice)

### 1. Create Project

**Web**: Navigate to `/projects/new` → Fill form → Submit

**API**:
```typescript
const project = await trpc.projects.create.mutate({
  name: "Q1 2024 Product Launch",
  description: "Launch AI analytics product",
  status: "PLANNING"
});
```

### 2. List Projects

**Web**: Visit `/projects` to see all projects

**API**:
```typescript
const projects = await trpc.projects.list.query();
```

### 3. View Details

**Web**: Click project card → See details, tasks, owner, metadata

**API**:
```typescript
const project = await trpc.projects.getById.query({ id: "proj_123" });
```

### 4. Update Project

**Web**: Click "Edit" → Modify fields → Save

**API**:
```typescript
await trpc.projects.update.mutate({
  id: "proj_123",
  status: "ACTIVE",
  description: "Updated"
});
```

### 5. Delete Project

**Web**: Click "Delete" → Confirm

**API**:
```typescript
await trpc.projects.delete.mutate({ id: "proj_123" });
```

## Demo Workflow: Weekly Executive Summary

Pre-configured workflow that runs every Monday at 9 AM:

1. **Data Gathering**: Searches project updates from past week
2. **CFO Analysis** (Morgan AI): Financial metrics, budget, ROI
3. **PM Review** (Jordan AI): Progress, blockers, next steps
4. **CEO Summary** (Alex AI): Strategic overview with recommendations

**Execute via Web**: `/workflows` → Click "Run" on "Weekly Executive Summary"

**Execute via API**:
```typescript
const run = await trpc.workflows.execute.mutate({
  workflowId: "workflow_id",
  initialContext: { timeframe: "last_week" }
});
```

**Monitor**: `/runs/[runId]` to see live execution logs

## Available Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm build            # Build all packages
pnpm start            # Production mode
pnpm test             # Run tests
pnpm lint             # Lint code

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema to DB
pnpm db:migrate       # Create migration
pnpm db:seed          # Seed demo data
pnpm db:studio        # Open DB GUI

# Docker
pnpm docker:up        # Start PostgreSQL + Redis
pnpm docker:down      # Stop services
pnpm docker:build     # Build images
pnpm docker:up:all    # Start full stack

# Quick Setup
pnpm setup            # Install + DB + Seed
```

## Project Structure

```
ai-corp-orchestrator-platform/
├── apps/
│   ├── api/              # Fastify + tRPC (Port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # 11 models
│   │   │   └── seed.ts        # Demo data
│   │   └── src/
│   │       ├── lib/           # DB, Queue, Redis
│   │       └── trpc/          # 7 routers
│   ├── worker/           # BullMQ processors
│   │   └── src/processors/
│   └── web/              # Next.js (Port 3000)
│       └── src/
│           ├── app/           # Pages
│           └── components/    # UI
└── packages/
    └── shared/           # Types + Utils
        └── src/
            ├── types/         # Zod schemas
            └── lib/           # Clients
```

## Future Extensions

- [ ] Authentication (NextAuth.js + OAuth)
- [ ] Real-time updates (WebSockets)
- [ ] Visual workflow editor
- [ ] Analytics dashboard
- [ ] Slack/Email integrations
- [ ] API key management
- [ ] Mobile app (React Native)
- [ ] Multi-language (i18n)

## Troubleshooting

**Database issues**:
```bash
pnpm docker:down && pnpm docker:up
pnpm db:push --force-reset && pnpm db:seed
```

**Port conflicts**:
```bash
lsof -i :3000  # Check ports
# Change PORT in .env files
```

**Prisma Client**:
```bash
pnpm db:generate
```

## License

MIT

---

**Version**: 2.0.0 (Phase 2 - Production Ready)  
**Built for**: Enterprise multi-agent automation
