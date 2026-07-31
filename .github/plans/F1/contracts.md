# F1 API Contracts

## Overview
This document defines F1 authentication and protected-route API contracts, including input payloads, response payloads, and HTTP status codes.

## API Conventions
- Base path: /api/v1
- Content type: application/json
- Auth header: Authorization: Bearer <JWT>
- Error envelope:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "requestId": "string"
  }
}
```

## Endpoint: POST /api/v1/auth/login
Authenticate doctor credentials and issue an access token.

### Request Payload

```json
{
  "email": "doctor@clinic.com",
  "password": "PlainTextPassword123"
}
```

### Validation Rules
- email: required, valid email format
- password: required, minimum length 8

### Success Response
- Status: 200 OK

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "7c6b9c9b-2f4d-4f63-a8a1-9e66d55d364f",
    "email": "doctor@clinic.com",
    "displayName": "Dr. Smith",
    "role": "DOCTOR"
  }
}
```

### Error Responses
- Status: 400 Bad Request
  - Invalid payload structure or field validation failed
- Status: 401 Unauthorized
  - Invalid credentials (generic message; no credential enumeration)
- Status: 429 Too Many Requests
  - Login throttled/temporarily blocked by policy
- Status: 500 Internal Server Error
  - Unexpected server failure

## Endpoint: GET /api/v1/auth/me
Return authenticated user profile from token context.

### Request Payload
- None

### Success Response
- Status: 200 OK

```json
{
  "user": {
    "id": "7c6b9c9b-2f4d-4f63-a8a1-9e66d55d364f",
    "email": "doctor@clinic.com",
    "displayName": "Dr. Smith",
    "role": "DOCTOR"
  }
}
```

### Error Responses
- Status: 401 Unauthorized
  - Missing, malformed, invalid, or expired token
- Status: 500 Internal Server Error

## Endpoint: GET /api/v1/protected/dashboard
Example protected endpoint used to validate route enforcement.

### Request Payload
- None

### Success Response
- Status: 200 OK

```json
{
  "message": "Authorized",
  "data": {
    "summary": "placeholder"
  }
}
```

### Error Responses
- Status: 401 Unauthorized
- Status: 500 Internal Server Error

## Endpoint: POST /api/v1/auth/logout (Optional for F1)
Stateless logout semantics for JWT-based auth.

### Request Payload
- None

### Success Response
- Status: 200 OK

```json
{
  "message": "Logged out"
}
```

### Notes
- In F1, logout is client-side token discard.
- Token revocation/denylist behavior is deferred and optional.

## Status Code Matrix
- 200 OK: Request handled successfully
- 400 Bad Request: Request payload invalid
- 401 Unauthorized: Authentication failed or token missing/invalid
- 403 Forbidden: Reserved for role authorization phases after F1
- 404 Not Found: Resource or route not found
- 429 Too Many Requests: Rate-limited/locked per policy
- 500 Internal Server Error: Unexpected backend error

## Acceptance Criteria Mapping
- AC-1: POST /auth/login valid credentials returns 200 and token
- AC-2: POST /auth/login invalid credentials returns 401 with generic auth error
- AC-3: Protected endpoint access without valid token returns 401 and frontend redirects to login
