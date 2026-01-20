# k8s-demo

A Node.js/Express application with Drizzle ORM and Neon Database.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Neon Account](https://console.neon.tech/) (for database)

## Environment Setup

This project uses different configurations for development and production:

| Environment | Database                        | Connection                           |
| ----------- | ------------------------------- | ------------------------------------ |
| Development | Neon Local (ephemeral branches) | `postgres://neon:npg@db:5432/neondb` |
| Production  | Neon Cloud (serverless)         | `DATABASE_URL` from Neon Console     |

### Getting Neon Credentials

1. **Neon API Key**: Go to [Neon Console → API Keys](https://console.neon.tech/app/settings/api-keys)
2. **Project ID**: Found in Project Settings → General
3. **Database URL** (production): Found in Connection Details of your project

## Development (Neon Local)

Neon Local creates ephemeral database branches that are automatically created when the container starts and deleted when it stops.

### 1. Configure Environment

Copy and edit the development environment file:

```bash
# Edit .env.development with your Neon credentials
NEON_API_KEY=your_api_key_here
NEON_PROJECT_ID=your_project_id_here
```

### 2. Start Development Environment

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development up --build
```

The app will be available at `http://localhost:3000`

### 3. Stop Development Environment

```bash
docker compose -f docker-compose.dev.yml down
```

> **Note**: The ephemeral database branch is automatically deleted when the container stops.

## Production (Neon Cloud)

Production connects directly to your Neon Cloud database using the serverless driver.

### 1. Configure Environment

Edit `.env.production` with your Neon Cloud database URL:

```bash
DATABASE_URL=postgres://neondb_owner:your_password@ep-xxx-yyy.region.aws.neon.tech/neondb?sslmode=require
```

### 2. Start Production Environment

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

### 3. Stop Production Environment

```bash
docker compose -f docker-compose.prod.yml down
```

## Database Migrations

Run migrations using Drizzle Kit:

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Environment Variables

### Development (`.env.development`)

| Variable          | Description                        | Required            |
| ----------------- | ---------------------------------- | ------------------- |
| `PORT`            | Application port                   | No (default: 3000)  |
| `LOG_LEVEL`       | Logging level                      | No (default: debug) |
| `NEON_API_KEY`    | Neon API key for branch management | **Yes**             |
| `NEON_PROJECT_ID` | Neon project identifier            | **Yes**             |

### Production (`.env.production`)

| Variable       | Description                  | Required           |
| -------------- | ---------------------------- | ------------------ |
| `PORT`         | Application port             | No (default: 3000) |
| `LOG_LEVEL`    | Logging level                | No (default: info) |
| `DATABASE_URL` | Neon Cloud connection string | **Yes**            |

## How It Works

### Development Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Your App      │────▶│   Neon Local     │────▶│   Neon Cloud    │
│   (Container)   │     │   (Proxy)        │     │   (Ephemeral    │
│                 │     │   db:5432        │     │    Branch)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

- App connects to `db:5432` (Neon Local proxy)
- Neon Local creates an ephemeral branch from your project
- Changes are isolated and branch is deleted on container stop

### Production Flow

```
┌─────────────────┐                             ┌─────────────────┐
│   Your App      │────────────────────────────▶│   Neon Cloud    │
│   (Container)   │       DATABASE_URL          │   (Serverless)  │
└─────────────────┘                             └─────────────────┘
```

- App connects directly to Neon Cloud using `DATABASE_URL`
- Uses Neon serverless driver with connection pooling

## Project Structure

```
├── src/
│   ├── config/
│   │   └── db.ts          # Database configuration (handles dev/prod)
│   ├── models/
│   │   └── schema.ts      # Drizzle schema definitions
│   └── ...
├── drizzle/               # Migration files
├── Dockerfile             # Multi-stage build (dev/prod)
├── docker-compose.dev.yml # Development with Neon Local
├── docker-compose.prod.yml # Production with Neon Cloud
├── .env.development       # Dev environment variables
└── .env.production        # Prod environment variables
```

## Troubleshooting

### Neon Local not connecting

1. Ensure `NEON_API_KEY` and `NEON_PROJECT_ID` are correct
2. Check Docker logs: `docker compose -f docker-compose.dev.yml logs db`
3. Verify your Neon project has available branches

### Connection refused in development

The app container might start before the db container is ready. The `depends_on` directive handles this, but if issues persist:

```bash
# Restart just the app
docker compose -f docker-compose.dev.yml restart app
```

### SSL errors in production

Ensure your `DATABASE_URL` includes `?sslmode=require` at the end.

## License

ISC
