# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tech stack (what this repo is)

- Node.js + TypeScript, using ESM (see `package.json` with `"type": "module"`).
- Express API server.
- PostgreSQL via Neon serverless (`@neondatabase/serverless`) + Drizzle ORM/migrations.
- Jest (ts-jest ESM preset) for tests.
- ESLint (flat config) + Prettier.

## Common commands (PowerShell / Windows)

Dependency install:

- `npm ci` (preferred when `package-lock.json` is present)
- `npm install`

Build:

- `npm run build` (TypeScript → `dist/`)

Run the server:

- Production-ish (compiled JS): `node dist/src/index.js`
- Dev (uses compiled output):
  - Terminal A: `npm run build -- --watch`
  - Terminal B: `npm run dev` (runs `nodemon dist/src/index.js`)

Lint/format:

- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`

Tests:

- `npm test`
- `npm run test:coverage`
- Single test file: `npm test -- src/controller/test.test.ts`
- Single test name/pattern: `npm test -- -t "calculateOrderTotal"`

Database (Drizzle):

- `npm run db:generate` (generate migrations into `drizzle/` based on `src/models/schema.ts`)
- `npm run db:migrate`
- `npm run db:studio`
- `npm run db:pull`

Notes on scripts:

- `npm run start` currently points at `ts-node src/src/index.ts` (that path does not exist). To run the app, prefer `node dist/src/index.js` after `npm run build`.

## Runtime configuration

Environment variables are loaded via `dotenv/config` (see `src/index.ts`, `src/config/db.ts`, and `drizzle.config.ts`).

Important variables:

- `DATABASE_URL`: Postgres connection string (required for Drizzle + Neon).
- `JWT_SECRET`: secret for signing JWTs (see `src/utils/jwt.ts`).
- `LOG_LEVEL`: winston log level (default: `info`).
- `NODE_ENV`: affects cookie `secure` flag and whether console logging is enabled.

Logging:

- `src/config/logger.ts` logs to `log/error.log` and `log/combined.log` (and to console when `NODE_ENV != "production"`).
- HTTP request logs are wired via `morgan(...)` → `logger` in `src/app.ts`.

## High-level architecture

### Entrypoints

- `src/index.ts`: loads env (`dotenv/config`) and boots the server by importing `./server.js`.
- `src/server.ts`: binds the Express app to port `5000`.
- `src/app.ts`: configures Express middleware and routes.

### Request flow / layering

The code follows a fairly standard route → controller → service → DB pattern:

- Routes: `src/routes/*.routes.ts` define Express routers and map HTTP endpoints to controllers.
- Controllers: `src/controller/*.ts` handle HTTP-level concerns (request/response, validation, cookies, calling services).
- Validations: `src/validations/*.ts` contain Zod schemas used by controllers.
- Services: `src/services/*.ts` implement business logic and DB access.
- DB/config: `src/config/db.ts` constructs and exports a Drizzle client (`db`) backed by Neon serverless.
- DB schema: `src/models/schema.ts` defines tables; `src/models/relations.ts` defines relations.

Example (auth/signup):

- `POST /api/auth/sign-up` (`src/routes/auth.routes.ts`)
  → `signup` (`src/controller/auth.controller.ts`)
  → validates `req.body` with `signupSchema` (`src/validations/auth.validation.ts`)
  → creates a user via `createUser` (`src/services/auth.service.ts`)
  → issues JWT (`src/utils/jwt.ts`) and sets `auth_token` cookie (`src/utils/cookies.ts`).

### Drizzle migrations

- Drizzle config: `drizzle.config.ts`
  - schema source: `src/models/schema.ts`
  - generated migrations output: `drizzle/` (timestamp-prefixed `.sql` files)

## TypeScript + ESM conventions (important in this repo)

- Imports in `.ts` files use `.js` extensions (e.g. `import { app } from "./app.js"`). This is intentional for ESM output; keep this convention when adding new modules.
- Jest is configured for ESM and includes a `moduleNameMapper` to strip `.js` from relative imports (see `jest.config.ts`).
