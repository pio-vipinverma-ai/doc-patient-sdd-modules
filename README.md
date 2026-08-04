# Doc Patient App - F1 Secure Login

This repository contains the F1 implementation baseline for secure doctor login using a React frontend and an Express backend with JWT authentication.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Setup

1. Install root dependencies:

```bash
npm install
```

2. Install client dependencies:

```bash
npm --prefix client install
```

3. Install server dependencies:

```bash
npm --prefix server install
```

4. Copy environment file:

```bash
copy server\\.env.example server\\.env
```

5. Apply SQL migrations from `server/db` in numeric order, then apply seed script.

## Run

- Start both apps:

```bash
npm run dev
```

- Frontend default: http://localhost:5173
- Backend default: http://localhost:4000

## Testing

- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`
- Full suite: `npm run test:all`

## F1 API

- POST `/api/v1/auth/login`
- GET `/api/v1/auth/me`
- GET `/api/v1/protected/dashboard`
