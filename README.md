# Ares

Monorepo para um produto de ranking e torneios com web em `Next.js`, API em `NestJS` e pacote compartilhado de banco com Prisma.

## Stack

- `Next.js 16` com `App Router`, TypeScript e `Turbopack` no ambiente local.
- `NestJS` com GraphQL.
- `Prisma` + `Postgres`.
- `Tailwind CSS v4`.
- `Zod` + `@t3-oss/env-nextjs` para envs tipadas.

## Estrutura

```text
apps/
  api/
  web/
packages/
  core/
  db/
```

## Variáveis de ambiente

Cada app é dono das suas variáveis de ambiente. Use os arquivos `.env.example` dentro de cada app como ponto de partida.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Preencha no `apps/api/.env`:

- `DATABASE_URL`
- `JWT_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `CORS_ORIGIN`

Preencha no `apps/web/.env`:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_API_URL`

## Scripts úteis

```bash
pnpm dev
pnpm dev:api
pnpm dev:web
pnpm lint
pnpm typecheck
pnpm format
```

## Fluxo sugerido

1. Subir um Postgres compatível com Vercel/Neon.
2. Configurar um app OAuth no Discord.
3. Configurar as envs do `apps/api` e `apps/web`.
4. Rodar `pnpm install` e depois `pnpm dev`.
