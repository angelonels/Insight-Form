# InsightForm

InsightForm is an AI-powered survey and form platform for creating forms, collecting responses, analyzing feedback, asking questions about response data, and generating insight reports.

The full system design is captured in [ARCHITECTURE.md](/Users/angelonelson/Documents/InsightForm/ARCHITECTURE.md).

## Stack

- React + Vite + TypeScript frontend
- Express + TypeScript modular monolith API
- PostgreSQL + pgvector
- Redis + BullMQ worker
- Clerk authentication
- AWS Bedrock for AI inference only
- LangChain and LangGraph for selected AI workflows

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Run local infrastructure:

```bash
docker compose up -d postgres redis
```

## Workspace

```text
apps/web  - React frontend
apps/api  - Express API and worker
packages/shared - shared TypeScript utilities and contracts
```

