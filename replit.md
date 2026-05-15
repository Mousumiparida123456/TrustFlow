# TrustFlow AI

An AI-powered behavioral authentication system for digital banking that continuously monitors user behavior and generates real-time trust/risk scores to detect fraud and account takeovers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/trustflow run dev` — run the frontend (port 20825)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Demo Credentials

All demo users have password: `demo123`

| Username | Risk Level | Description |
|---|---|---|
| `alice_johnson` | Low (Safe) | Normal user, consistent behavior |
| `bob_smith` | Medium | Occasional anomalies |
| `carol_white` | High | Multiple flagged transactions |
| `david_chen` | Low | Clean behavioral profile |
| `eve_attacker` | Critical | Blocked — account takeover simulation |
| `frank_miller` | Low | Regular banking user |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Recharts + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/` — DB schema (users, sessions, behavior_events, transactions, alerts)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/api-server/src/lib/trust-engine.ts` — Behavioral anomaly detection engine
- `artifacts/trustflow/src/` — React frontend

## Architecture decisions

- Trust score is 0–100 where higher = MORE risky (inverted from standard "trust" to align with risk scoring)
- Trust engine uses z-score based anomaly detection inspired by Isolation Forest principles
- Behavioral events are batched and sent every 3 seconds to avoid API flooding
- SessionToken stored in localStorage and passed via Authorization header or request body
- OTP codes are returned in the response body in demo mode (clearly labeled)

## Product

- Login with behavioral biometric capture (typing speed, keystrokes, mouse movement)
- Real-time trust score gauge with color-coded risk levels
- Adaptive authentication: OTP → Biometric → Block based on risk threshold
- Transaction monitoring with anomaly detection
- Admin security operations center with fraud heatmap
- Side-by-side fraud replay demo (Normal User vs. Attacker Simulation)
- Alert management for impossible travel, new devices, behavior changes

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing schema files
- Trust score direction: 0 = safe, 100 = critical risk
- The `trust-engine.ts` file lives in `api-server/src/lib/`, not in the db lib

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
