# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native app (智选 APP)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## 智选 APP (artifacts/mobile)

A coupon aggregation and cashback platform mobile app built with Expo React Native.

### Features
- **Home**: Search bar, platform category navigation (淘宝/京东/拼多多), hot product rankings, big coupon section, personalized recommendations
- **Discover**: Share for rewards, hot topics feed, 好物圈 (coming soon)
- **My Profile**: Cashback account with withdraw, order tracking, coupon wallet, footprint history, settings
- **Messages**: System announcements, cashback reminders with unread badge counter
- **Product Detail**: Full product info, coupon claim, cashback display
- **Search**: Keyword search with sort/filter options
- **Withdraw**: Amount selection, WeChat/Alipay payout, withdraw history
- **Orders**: Full order list with status tracking (pending/settled/invalid)
- **Coupon Wallet**: Manages claimed coupons with expiry tracking
- **Footprint**: Browsing history

### Tech Stack
- Expo Router (file-based routing)
- React Context (AppContext for global state)
- AsyncStorage for persistence
- @expo/vector-icons (Feather icons)
- expo-haptics for feedback
- React Native SafeArea for device-aware layout
- NativeTabs with liquid glass support on iOS 26

### Color Theme
- Primary: #FF4B4B (red)
- Accent: #FF8C00 (orange)
- Cashback highlight: #FF6B35

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client.

### `scripts` (`@workspace/scripts`)

Utility scripts package.
