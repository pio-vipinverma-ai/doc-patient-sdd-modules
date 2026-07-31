# F1 Quickstart

## Prerequisites
- Node.js LTS
- npm
- PostgreSQL 14+

## Environment Variables
Set in server/.env (from server/.env.example):
- SERVER_PORT=4000
- DATABASE_URL=postgres://username:password@localhost:5432/doc_patient
- JWT_SECRET=replace_with_strong_secret
- JWT_EXPIRES_IN=3600
- LOGIN_RATE_LIMIT_WINDOW_SEC=60
- LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
- ACCOUNT_LOCK_MINUTES=15

Note: rate-limit and lock values are placeholders until security policy finalization.

## Setup Steps
1. Install root dependencies.
2. Install client dependencies.
3. Install server dependencies.
4. Create PostgreSQL database.
5. Apply DB migrations.
6. Seed single doctor account.

## Run Steps
1. Start backend server.
2. Start frontend app.

## API Smoke Test Payloads

### Valid login
Request to POST /api/v1/auth/login:

```json
{
  "email": "doctor@clinic.com",
  "password": "CorrectPassword123"
}
```
Expected:
- 200 with accessToken

### Invalid login
Request to POST /api/v1/auth/login:

```json
{
  "email": "doctor@clinic.com",
  "password": "WrongPassword"
}
```
Expected:
- 401 with generic authentication error

### Protected route without token
Request to GET /api/v1/protected/dashboard with no Authorization header.
Expected:
- 401 Unauthorized

## Browser Smoke Test
1. Open login page.
2. Submit valid credentials.
3. Confirm redirect to dashboard.
4. Log out by clearing token.
5. Navigate directly to protected route.
6. Confirm redirect to login and return URL behavior.

## Troubleshooting
- DB connection error:
  - Validate DATABASE_URL and PostgreSQL service status.
- JWT errors:
  - Ensure JWT_SECRET is set and consistent across restarts.
- CORS errors:
  - Confirm backend allows frontend origin.
- Repeated 429 responses:
  - Reset lock window or clear test login attempt rows.
