# Ares — Contexto Geral do Projeto

> Última atualização: Abril 2026  
> Referência rápida para IA e memória de desenvolvimento

---

## O que é o Ares

Plataforma **open-source e 100% gratuita** de competições e comunidade para jogos digitais e físicos. Usuários criam jogos, organizam ligas e torneios em diversos formatos (pontos corridos, Elo rating, eliminatória simples/dupla, sistema suíço, fase de grupos, e mais), agendam e registram partidas, formam times e clãs, e interagem através de fóruns e perfis altamente customizáveis.

O produto é voltado para **comunidades** — não é uma plataforma oficial de publishers. Nenhuma funcionalidade será colocada atrás de paywall; o projeto é open-source, aberto a colaboradores, e pretende se sustentar via patrocinadores e doações.

---

## Stack

| Camada     | Tech                                                 |
| ---------- | ---------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend    | NestJS, GraphQL (code-first), Passport-JWT           |
| Banco      | PostgreSQL + Prisma                                  |
| Auth (web) | NextAuth.js (CredentialsProvider → Discord via API)  |
| Auth (api) | Discord OAuth + JWT (7d expiry)                      |
| Monorepo   | pnpm workspaces + Turborepo                          |
| i18n       | next-intl, locales: `en` e `pt`                      |
| Upload     | Presigned URL (S3-compatible)                        |
| Logger     | pino (API) + logger próprio (web)                    |

---

## Estrutura do Monorepo

```
apps/api        → NestJS + GraphQL
apps/web        → Next.js
packages/db     → Prisma schema, migrations, seed
packages/core   → Enums, permissões e tipos compartilhados
```

---

## Domínio: Entidades Principais

### User

- Autenticado via Discord (OAuth na API, depois JWT para o web)
- Campos: `name`, `username`, `email`, `imageUrl`, `bio`, `profileColor`, `country`, `isAdmin`, `onboardingCompleted`
- Pode ter permissões granulares além de `isAdmin`

### Game

- Criado por usuários (ou pelo admin)
- Status: `PENDING` | `APPROVED`
- Tem `slug` único, imagem de thumbnail (460×215) e background
- Link opcional para Steam (`steamUrl`)

### Event

- Contêiner genérico para competições dentro de um `Game`
- Tipos: `LEAGUE` | `TOURNAMENT`
- Status: `PENDING` | `ACTIVE` | `FINISHED` | `CANCELLED`
- Cada Event pode ter uma extensão específica (ex: `League`)

### League _(extensão de Event)_

- Sistema de rating: `elo` ou `points`
- **Campos Elo:**
  - `initialElo` — rating inicial dos jogadores (padrão: 1000)
  - `kFactor` — magnitude máxima de variação por partida (1–100)
  - `scoreRelevance` — impacto da margem de placar no cálculo (0.0–1.0)
  - `inactivityDecay` — pontos perdidos por dia de inatividade
  - `inactivityThresholdHours` — horas sem jogar antes do decay começar
  - `inactivityDecayFloor` — Elo mínimo atingível por decay
- **Campos Points:**
  - `pointsPerWin`, `pointsPerDraw`, `pointsPerLoss`
- `allowDraw` — se empates são possíveis
- `allowedFormats` — formatos de partida aceitos (ex: `ONE_V_ONE`, `FREE_FOR_ALL`)

### Player _(em revisão)_

- Atualmente é um vínculo entre `User` e `Game` com histórico de nicks (`PlayerUsername[]`)
- **Refactor planejado**: a entidade Player como vínculo direto com Game não faz sentido conceitual; a lógica de armazenamento de usernames também precisa ser repensada (não há forma fácil de garantir que um nick realmente pertence ao usuário naquele jogo). A entidade pode ser eliminada ou reestruturada — ainda em análise

### LeagueEntry

- Vínculo `Player ↔ League` com `currentElo` atual

### Result / Match _(em revisão)_

- Atualmente: partida registrada dentro de uma League com `format`, `ResultEntry[]` e `eloDifference` por jogador
- Suporta `ResultAttachment` (imagem ou vídeo: YouTube, Twitch, etc.)
- **Refactor planejado**: além de registrar resultados, será possível **agendar partidas** (Match). O modelo atual será reestruturado para separar agendamento de resultado. Nada disso foi efetivamente implementado no backend ainda, facilitando o refactor

---

> Funcionalidades planejadas e visão de produto estão em [ROADMAP.md](ROADMAP.md).

---

## Regras de Negócio Importantes

### Elo e scoreRelevance

A fórmula Elo padrão é: `ΔElo = K × (S - E)`, onde:

- `S` = Score: **1.0** (vitória), **0.5** (empate), **0.0** (derrota)
- `E` = probabilidade esperada de vitória baseada na diferença de Elo

O `scoreRelevance` **não multiplica** o Elo ganho. Ele **modifica o valor de S** com base na margem de placar:

- `scoreRelevance = 0` → S é sempre binário (1/0.5/0); a margem de placar é ignorada
- `scoreRelevance > 0` → vitórias apertadas fazem S se aproximar de 0.5 (quase empate para o Elo)
- `scoreRelevance = 1` → uma vitória por 15×14 pode gerar quase o mesmo Elo que um empate

#### Fórmula de mapeamento margem → S

```
S = 1 - scoreRelevance × (loserScore / winnerScore) × 0.5
```

**Propriedades:**

- `loserScore = 0` (vitória total) → `S = 1.0` sempre, independente do `scoreRelevance`
- `loserScore → winnerScore` (vitória mínima) → `S → 1 - scoreRelevance × 0.5` (mínimo de `0.5` quando `scoreRelevance = 1`)
- `scoreRelevance = 0` → `S = 1.0` sempre (bypass explícito; margem ignorada)
- `scoreRelevance = 1` e placar `10×9` → `S = 1 - 1 × (9/10) × 0.5 = 0.55`
- `scoreRelevance = 1` e placar `10×2` → `S = 1 - 1 × (2/10) × 0.5 = 0.90`

A probabilidade esperada `E` usa a escala padrão de 400 pontos:

```
E = 1 / (1 + 10^((eloB - eloA) / 400))
```

> **Status**: a fórmula está definida e implementada no simulador do frontend (Format Logic).
> O cálculo real de Elo por partida no backend (mutations de Result) ainda não foi construído.

### Permissões (RBAC)

Definidas em `packages/core`:

- `manage_games` — criar/editar/aprovar jogos
- `manage_players` — gerenciar jogadores
- `manage_events` — gerenciar ligas/eventos

`isAdmin = true` bypassa todas as checagens de permissão. Permissões granulares são para moderadores/organizadores.

### Criação de Liga com jogo novo

Ao criar uma liga, o usuário pode informar um `gameName` em vez de `gameId`. Se o jogo não existir, ele é criado automaticamente com status `APPROVED` e slug gerado automaticamente.

### Registro em liga

- Admins/editores: podem adicionar qualquer player via `addPlayerToLeague`
- Usuários comuns: se auto-registram via `registerSelfToLeague` (cria o Player no jogo se não existir)

### Torneios vinculados a ligas (bônus cross-evento)

Torneios podem ser vinculados a uma liga do mesmo jogo, afetando a classificação da liga de duas formas dependendo do sistema:

- **Liga Elo (Modelo A — integrado)**: as partidas do torneio alimentam diretamente o mesmo pool de Elo da liga. Os resultados do torneio são tratados como partidas da liga para fins de cálculo de rating. Equivalente ao modelo FIDE no xadrez
- **Liga por pontos (Modelo B — bônus configurável)**: o torneio é independente, mas ao configurar a liga o organizador define torneios vinculados e quantos pontos de bônus o 1º, 2º, 3º lugar (e demais posições) recebem na tabela da liga

Os dois modelos podem coexistir: a liga escolhe qual se aplica dependendo do seu `classificationSystem`.

### Ownership

- Criador da liga pode editar a própria liga
- Admin pode editar qualquer liga
- Criador do jogo pode editar o próprio jogo
- `manage_games` bypassa ownership para jogos

---

## Auth Flow

```
Discord OAuth (API)
    ↓
Nest gera JWT (7 dias) com: sub, username, imageUrl, isAdmin, permissions
    ↓
AuthCode de uso único armazenado no banco
    ↓
Web troca o code pelo token via /auth/callback
    ↓
NextAuth persiste sessão com o JWT
    ↓
Apollo Client injeta Authorization: Bearer <token> em todas as queries
    ↓
API valida via JwtStrategy → GqlAuthGuard
```

A sessão no web é revalidada a cada **5 minutos** via `/auth/me`.

---

## Rotas do Frontend (App Router)

| Rota                                   | Descrição                       |
| -------------------------------------- | ------------------------------- |
| `/`                                    | Home com lista de jogos         |
| `/games`                               | Todos os jogos                  |
| `/games/[gameSlug]`                    | Página do jogo + suas ligas     |
| `/games/[gameSlug]/events/[eventSlug]` | Página da liga (LeagueTemplate) |
| `/events`                              | Listagem global de eventos      |
| `/profile/[username]`                  | Perfil do usuário               |
| `/auth/signin`                         | Login (Discord)                 |

---

## Módulos da API

| Módulo    | Responsabilidade                                           |
| --------- | ---------------------------------------------------------- |
| `auth`    | Discord OAuth, JWT, AuthCode, guards, decorators, /auth/me |
| `games`   | CRUD de jogos, aprovação, busca                            |
| `leagues` | CRUD de ligas, entries, registro de players                |
| `users`   | Consulta de usuários, perfil, busca                        |
| `storage` | Geração de presigned URLs para upload de imagens           |
| `audit`   | Log de ações administrativas                               |

---

## Estado Atual de Implementação

### Concluído ✅

- Autenticação ponta a ponta (Discord OAuth → JWT → NextAuth → Apollo)
- RBAC com guards no backend (GqlAuthGuard, PermissionsGuard)
- GraphQL codegen no frontend (tipos gerados automaticamente)
- Enums e permissões centralizados em `@ares/core`
- Migrations versionadas com Prisma
- Logger estruturado (pino na API, custom no web)
- Bootstrap hardened (ValidationPipe, CORS estrito, introspection/playground só em dev)
- Upload via presigned URL
- Listagem, criação e edição de jogos e ligas
- Registro de players em ligas
- i18n com next-intl (en + pt)
- Onboarding wizard para novos usuários (multi-step: identidade, país, interesses de jogos)
