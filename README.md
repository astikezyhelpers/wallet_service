# CTMS Wallet Service

A lightweight Wallet, Transaction, and Budget management microservice.

- Runtime: Node.js + Express 5
- ORM: Prisma
- Database: PostgreSQL
- API Style: REST (JSON)

### Features
- Wallet creation, lookup, and status updates
- Transaction listing and creation
- Budget creation and lookup
- Consistent success/error response envelopes

## Getting Started

### Prerequisites
- Node.js 18+ (recommended 20+)
- PostgreSQL (local or remote)
- Prisma CLI (`npx prisma` is used via devDependency)

### Install
```bash
npm ci
```

### Environment
Create a `.env` file in the project root:
```env
# Example
PORT=3003
NODE_ENV=development

# Prisma/PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

### Database & Prisma
- Validate schema
```bash
npx prisma validate
```
- Generate client
```bash
npx prisma generate
```
- Apply migrations (creates the DB schema in your database)
```bash
npx prisma migrate deploy
```

### Run
```bash
npm run dev
```
Server starts at `http://localhost:3003` with base path `/api/v1`.

## API Docs
- Developer guide: `docs/API.md`
- OpenAPI spec: `docs/openapi.yaml`
- Low Level Design: `docs/LLD.md`

## Folder Structure
```
src/
  index.js          # bootstrap
  app.js            # express app, routes, middleware
  controllers/      # route handlers
  routes/           # route definitions (mounted under /api/v1)
  middleware/       # error handler
  lib/              # prisma client
  utils/            # ApiError, ApiResponse, asyncHandler
prisma/
  schema.prisma
  migrations/
```

## Conventions
- Success response: `ApiResponse`
- Error response: centralized `errorHandler` using `ApiError`

## CI
GitHub Actions workflow runs install and Prisma checks on push/PR. See `.github/workflows/ci.yml`.

## License
ISC 
