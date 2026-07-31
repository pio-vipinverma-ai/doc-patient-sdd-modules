# Testing Setup Guide

## Stack
- Test framework: Vitest
- Assertion library: Vitest expect and Testing Library matchers for frontend DOM assertions
- Mocking: Vitest mocks (vi.fn, vi.spyOn, vi.mock)
- API integration helper: supertest
- E2E runner: Playwright

## Directory Structure
- tests/unit/client
- tests/unit/server
- tests/integration/api
- tests/integration/client
- tests/e2e
- tests/fixtures
- tests/helpers

## Commands
- Run unit tests: npm run test:unit
- Watch unit tests: npm run test:unit:watch
- Run integration tests: npm run test:integration
- Watch integration tests: npm run test:integration:watch
- Run e2e tests: npm run test:e2e
- Run e2e in UI mode: npm run test:e2e:ui
- Run coverage: npm run test:coverage
- Run full suite: npm run test:all

## Coverage Thresholds
Coverage is collected by Vitest V8 provider using vitest.config.ts.

Global thresholds:
- Lines: 85%
- Statements: 85%
- Functions: 85%
- Branches: 80%

Measurement:
1. Run npm run test:coverage
2. Read terminal summary
3. Open coverage/index.html for detailed report

## Unit Test Pattern (with mock)
See tests/unit/server/auth.service.test.ts for a replicable unit + mock pattern.
