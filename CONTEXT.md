# Bellona - General Project Context

> Last updated: April 2026  
> Quick reference for AI and development memory

---

## What Ares Is

A **100% free and open-source** competition and community platform for digital and physical games. Users create games, organize leagues and tournaments in many formats (round robin, Elo rating, single and double elimination, Swiss system, group stage, and more), schedule and record matches, build teams and clans, and interact through forums and highly customizable profiles.

The product is built for **communities** - it is not an official publisher platform. No feature will ever be placed behind a paywall; the project is open source, open to contributors, and intends to sustain itself through sponsors and donations.

---

## Stack

| Layer      | Tech                                                 |
| ---------- | ---------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend    | NestJS, GraphQL (code-first), Passport-JWT           |
| Database   | PostgreSQL + Prisma                                  |
| Auth (web) | NextAuth.js (CredentialsProvider -> Discord via API) |
| Auth (api) | Discord OAuth + JWT (7d expiry)                      |
| Monorepo   | pnpm workspaces + Turborepo                          |
| i18n       | next-intl, locales: `en` and `pt`                    |
| Upload     | Presigned URL (S3-compatible)                        |
| Logger     | pino (API) + custom logger (web)                     |

---

## Monorepo Structure

```
apps/api        -> NestJS + GraphQL
apps/web        -> Next.js
packages/db     -> Prisma schema, migrations, seed
packages/core   -> Shared enums, permissions, and types
```

---

## Domain: Core Entities

### User

- Authenticated through Discord (OAuth in the API, then JWT for the web app)
- Fields: `name`, `username`, `email`, `imageUrl`, `bio`, `profileColor`, `country`, `isAdmin`, `onboardingCompleted`
- Can have granular permissions in addition to `isAdmin`

### Game

- Created by users (or by an admin)
- Status: `PENDING` | `APPROVED`
- Has a unique `slug`, thumbnail image (460x215), and background
- Optional Steam link (`steamUrl`)

### Event

- Generic container for competitions inside a `Game`
- Types: `LEAGUE` | `TOURNAMENT`
- Status: `PENDING` | `ACTIVE` | `FINISHED` | `CANCELLED`
- Each `Event` can have a specific extension (for example, `League`)

### League _(Event extension)_

- Rating system: `elo` or `points`
- **Elo fields:**
  - `initialElo` - players' starting rating (default: 1000)
  - `kFactor` - maximum rating change per match (1-100)
  - `scoreRelevance` - how much score margin affects calculation (0.0-1.0)
  - `inactivityDecay` - points lost per day of inactivity
  - `inactivityThresholdHours` - hours without playing before decay starts
  - `inactivityDecayFloor` - minimum Elo reachable through decay
- **Points fields:**
  - `pointsPerWin`, `pointsPerDraw`, `pointsPerLoss`
- `allowDraw` - whether draws are possible
- `allowedFormats` - accepted match formats (for example, `ONE_V_ONE`, `FREE_FOR_ALL`)

### Player _(under review)_

- Currently a link between `User` and `Game` with nickname history (`PlayerUsername[]`)
- **Planned refactor**: the `Player` entity as a direct link to `Game` does not make conceptual sense; username storage logic also needs to be rethought because there is no easy way to guarantee that a nickname actually belongs to the user in that game. The entity may be removed or restructured - still under analysis

### LeagueEntry

- `Player <-> League` link with current `currentElo`

### Result / Match _(under review)_

- Currently: a match recorded inside a `League` with `format`, `ResultEntry[]`, and `eloDifference` per player
- Supports `ResultAttachment` (image or video: YouTube, Twitch, and so on)
- **Planned refactor**: in addition to recording results, it will be possible to **schedule matches** (`Match`). The current model will be restructured to separate scheduling from result registration. None of this has actually been implemented in the backend yet, which makes the refactor easier

---

> Planned features and the product vision are in [ROADMAP.md](ROADMAP.md).

---

## Important Business Rules

### Elo and `scoreRelevance`

The standard Elo formula is `ΔElo = K × (S - E)`, where:

- `S` = Score: **1.0** (win), **0.5** (draw), **0.0** (loss)
- `E` = expected win probability based on the Elo difference

`scoreRelevance` does **not multiply** the Elo gained. It **changes the value of `S`** based on the score margin:

- `scoreRelevance = 0` -> `S` is always binary (1/0.5/0); score margin is ignored
- `scoreRelevance > 0` -> close wins push `S` closer to 0.5 (almost a draw for Elo)
- `scoreRelevance = 1` -> a 15x14 win can generate almost the same Elo as a draw

#### Margin-to-`S` Mapping Formula

```
S = 1 - scoreRelevance × (loserScore / winnerScore) × 0.5
```

**Properties:**

- `loserScore = 0` (complete win) -> `S = 1.0` always, regardless of `scoreRelevance`
- `loserScore -> winnerScore` (minimum win) -> `S -> 1 - scoreRelevance × 0.5` (minimum of `0.5` when `scoreRelevance = 1`)
- `scoreRelevance = 0` -> `S = 1.0` always (explicit bypass; margin ignored)
- `scoreRelevance = 1` and score `10x9` -> `S = 1 - 1 × (9/10) × 0.5 = 0.55`
- `scoreRelevance = 1` and score `10x2` -> `S = 1 - 1 × (2/10) × 0.5 = 0.90`

Expected probability `E` uses the standard 400-point scale:

```
E = 1 / (1 + 10^((eloB - eloA) / 400))
```

> **Status**: the formula is defined and implemented in the frontend simulator (Format Logic).  
> The real per-match Elo calculation in the backend (`Result` mutations) has not been built yet.

### Permissions (RBAC)

Defined in `packages/core`:

- `manage_games` - create/edit/approve games
- `manage_players` - manage players
- `manage_events` - manage leagues/events

`isAdmin = true` bypasses all permission checks. Granular permissions exist for moderators and organizers.

### League Creation with a New Game

When creating a league, the user can provide `gameName` instead of `gameId`. If the game does not exist, it is created automatically with status `APPROVED` and an auto-generated slug.

### League Registration

- Admins/editors: can add any player through `addPlayerToLeague`
- Regular users: self-register through `registerSelfToLeague` (creates the `Player` in the game if it does not exist)

### Tournaments Linked to Leagues (Cross-Event Bonus)

Tournaments can be linked to a league of the same game, affecting the league standings in two different ways depending on the system:

- **Elo League (Model A - integrated)**: tournament matches feed directly into the same league Elo pool. Tournament results are treated as league matches for rating purposes. Equivalent to the FIDE model in chess
- **Points League (Model B - configurable bonus)**: the tournament is independent, but when configuring the league, the organizer defines linked tournaments and how many bonus points 1st, 2nd, 3rd place, and other positions receive in the league standings

Both models can coexist: the league chooses which one applies based on its `classificationSystem`.

### Ownership

- The league creator can edit their own league
- An admin can edit any league
- The game creator can edit their own game
- `manage_games` bypasses game ownership

---

## Auth Flow

```
Discord OAuth (API)
    ↓
Nest generates a JWT (7 days) with: sub, username, imageUrl, isAdmin, permissions
    ↓
Single-use AuthCode stored in the database
    ↓
Web exchanges the code for the token through /auth/callback
    ↓
NextAuth persists the session with the JWT
    ↓
Apollo Client injects Authorization: Bearer <token> into all queries
    ↓
API validates through JwtStrategy -> GqlAuthGuard
```

The web session is revalidated every **5 minutes** through `/auth/me`.

---

## Frontend Routes (App Router)

| Route                                  | Description                    |
| -------------------------------------- | ------------------------------ |
| `/`                                    | Home with the game list        |
| `/games`                               | All games                      |
| `/games/[gameSlug]`                    | Game page + its leagues        |
| `/games/[gameSlug]/events/[eventSlug]` | League page (`LeagueTemplate`) |
| `/events`                              | Global event listing           |
| `/profile/[username]`                  | User profile                   |
| `/auth/signin`                         | Login (Discord)                |

---

## API Modules

| Module    | Responsibility                                             |
| --------- | ---------------------------------------------------------- |
| `auth`    | Discord OAuth, JWT, AuthCode, guards, decorators, /auth/me |
| `games`   | Game CRUD, approval, search                                |
| `leagues` | League CRUD, entries, player registration                  |
| `users`   | User lookup, profile, search                               |
| `storage` | Presigned URL generation for image uploads                 |
| `audit`   | Administrative action log                                  |

---

## Current Implementation Status

### Completed

- End-to-end authentication (Discord OAuth -> JWT -> NextAuth -> Apollo)
- RBAC with backend guards (`GqlAuthGuard`, `PermissionsGuard`)
- Frontend GraphQL codegen (types generated automatically)
- Enums and permissions centralized in `@bellona/core`
- Versioned Prisma migrations
- Structured logging (pino in the API, custom logger in the web app)
- Hardened bootstrap (`ValidationPipe`, strict CORS, introspection/playground only in dev)
- Uploads through presigned URLs
- Game and league listing, creation, and editing
- Player registration in leagues
- i18n with next-intl (`en` + `pt`)
- Onboarding wizard for new users (multi-step: identity, country, game interests)

\*\*\* Add File: c:\Desenvolvimento\Ares\ROADMAP.md

# Bellona - Product Roadmap

> Last updated: April 2026  
> Planned feature vision. For the current technical state, see `CONTEXT.md`.

---

## Competition Formats

- **Leagues**: round robin, Elo rating (already partially implemented)
- **Bracket tournaments**: single elimination, double elimination (losers bracket), Swiss system, group stage, and custom stage composition
- Each event can combine formats (for example, group stage -> elimination bracket)

---

## Community and Social

- **Follow players + activity feed**: users follow other players and get a personalized feed with results, ranking changes, newly joined events, and more. A must-have for a real community
- **Forums and posts**: create topics and publications on pages such as the user page (Steam-like), community page (game), and event page
- **Customizable profiles**: highly customizable user pages inspired by Discord and Steam - each player's personal "temple"
- **Notification and invite system**: invite users to events, notify them about matches, ranking updates, posts, and more
- **Event moderation staff**: organizers can define moderators with specific permissions
- **Player career timeline**: a profile timeline showing participated events, relevant results (1st place, longest win streak), and Elo changes over time
- **Cross-event leaderboard per game**: global meta-ranking per game calculated from performance across all active leagues and tournaments. To stay fair, it should require a minimum number of matches or participated events as an eligibility rule. In the future it may expand to cross-game ranking (influential players across multiple games), but that requires very careful criteria
- **Vouching / community reputation**: after matches, participants evaluate each other in categories such as fair play, punctuality, and communication. This produces a visible reputation score on the profile. It does not affect ranking and exists for community trust. Secondary priority for now
- **Rivalries and H2H history**: auto-generated player cards for frequent matchups, showing historical win/loss and Elo differences over time. This is a "living world" feature for the site, with low systemic priority and reserved for the distant future

---

## Matches and Matchmaking

- **Availability and challenges inside leagues**: players in leagues, especially Elo leagues, can declare availability and nearby-Elo players can issue challenges. Accepted matches enter the league automatically. On the profile, users can configure recurring availability (for example, "afternoons", "weekends and Wednesday"), applicable in any context
- **Casual matches and pickup queue**: outside formal events, players declare availability for a game/format; the system matches them by Elo and creates a casual match recorded in history. This acts as continuous warm-up between events

---

## Teams, Captaincy, and Clans

- **Teams with a captain**: teams are created by the players themselves, with one member as captain. The captain manages the roster (add/remove members, submit results for the team). The event organizer only approves or rejects registered teams, without micromanaging the roster
- **Clans**: groups of users with their own ranking based on the members' collective performance. High complexity - requires careful modeling of links among users, teams, clans, and results

---

## Seasons

- **Manual season system**: when creating a new event, the organizer can specify a source event (a "parent event"). The new event inherits the previous event's settings and is treated as a new season. On the frontend, the event page shows integrated season navigation (select, tabs, or similar). No automation - season creation is always an intentional organizer action

---

## Dynamic Event Data

- Event creators can define **custom result fields** (dynamic forms)
- They can represent general event data or per-player data (for example, kills, assists, healing done, damage dealt, match rating)
- This lets each community adapt statistics to its own game

---

## Integrations

- **"Live" page**: a per-game section showing ongoing matches, with stream links (YouTube, Twitch) whenever provided on the match or event. Critical for making the platform feel alive and encouraging participants to stream
- **Discord webhook**: event organizers connect a Discord channel webhook and Ares automatically posts match results, top 3 ranking changes, and tournament phase starts. No bot, just webhook. It can evolve into a bot with interactive commands later
- **Steam API**: fetch and suggest new games if they do not already exist in the project, with caching to avoid excessive use of the free API

---

## Administration and Moderation

- **Administrative panel**: for users with `isAdmin` or granular permissions
- **Ban/block system**: ban users from events, games, or the platform

---

## Performance and Caching

- Aggressive page and ranking caching in Next.js (ISR/revalidation) to reduce API load
- An essential strategy for maintaining performance with lean infrastructure

---

## Business Model

- **100% free, forever** - no feature behind a paywall
- Open source and open to contributors
- Sustainability through sponsors and donations

---

## Long-Term Vision

Ares is evolving from a league tool into a **complete competitive community platform**:

1. Anyone can register a game and organize competitions in multiple formats (league, bracket tournament, Swiss, groups, and so on)
2. Matches can be **scheduled** or have **results recorded** with evidence (screenshot/video) and custom data
3. Rankings update automatically - Elo sensitive to score margin, points, or format-specific metrics
4. Players form **teams** and **clans** with collective rankings
5. Every page (user, game, event) has its own **forums**, and profiles are highly customizable
6. **Notifications, invites, and moderation** create a complete social ecosystem
7. Everything is 100% free, open source, and community-sustained

---

## Identity Expansions (Outside-the-Box Ideas)

Beyond the classic "tournaments and leagues" shape, Ares has natural room for adjacent concepts that enrich the ecosystem and attract new kinds of audiences:

### Confirmed

- **Faction Metagame (Territory Control)**: players choose a faction (global houses/guilds). Wins in casual matches or tournaments generate "influence points" for the faction. The site itself gains a metagame where factions dominate the ranking month by month, giving purpose to players who would never win an individual tournament
- **Bounty Hunters Hub (Bounties & Challenges)**: asynchronous competition system. A contract board with objectives such as "First to kill Boss X without taking damage" or "Speedrun under 2 minutes". Players claim them and submit video proof. Focused on speedrunners and engaged creators, not traditional esports
- **Mentorship Economy (Ares Academy)**: high-Elo players create "Bootcamps". Experienced players get a separate _Teaching Elo_ based exclusively on the improvement rate of their students. Encourages cooperation instead of toxicity
- **Advanced LFG Ecosystem (The "Corner Club")**: matchmaking based on behavior and vibe, not ranking. Weekend social events focused on bringing together similar profiles (`[Mic ON]`, `[Zero Tryhard]`, `[Drinking While Playing]`). This addresses the chronic problem of not having people to play with in low-stress environments
- **Oracle (Prediction Market)**: players make virtual bets, with no real money, on matches and tournaments before they happen - who will win, by how much, who drops in groups. Correct predictions accumulate a separate _Prediction Elo_. This creates a parallel esport for spectators and analysts who never compete but still earn prestige by predicting well
- **Regional Pride / Geographic Identity**: players represent their city, state, or country. Real regional rankings with aggregated contribution. Events like "regional derby" or "city vs city" emerge naturally from the data. This gives local identity to a culture that is otherwise purely online and anonymous
- **Chronicles (Automatic Narrator)**: the site observes patterns in the data and generates sports-journalism-style headlines automatically - _"Player X is on a 6-match unbeaten streak, the longest of the season"_, _"These two have never faced each other and may be the finalists"_. Turns cold data into emergent storytelling without human moderation. High impact, low technical cost
- **Format Lab**: users invent their own competition formats, test them in a sandbox with simulated matches, publish them, and let other organizers adopt them. Formats become entities ranked by popularity. This democratizes competition design and creates a community around structural creativity

### Possibilities

- **Hall of Legendary Matches**: matches can be "immortalized" through community voting via Discord-style emoji reactions. Admission to the Hall is based on accumulated engagement. YouTube and Twitch integration would let videos be embedded directly on the site with timestamp linking, so users can comment on and react to specific moments, and those links would work in posts and forums
- **Game Wiki**: each game in Ares could have its own wiki, working as an integrated Fandom/Wikia with collaborative editing and moderation controls. This complements forums with evergreen content such as guides, lore, character maps, and meta information. The organizer or game community manages edit access

---

## Implementation Backlog

Planned or in-progress items, with no defined date:

- **Game selection in onboarding**: UI implemented with mock data; backend persistence (`UserGameInterest`) still missing
- **Backend Elo calculation**: formula is defined, but the `Result` mutation with automatic calculation is not implemented yet
- **Match/Result refactor**: separate match scheduling from result registration
- **Player refactor**: rethink the `User <-> Game` link; username logic needs a new approach
- **Tournament formats**: model brackets (elimination, Swiss, groups, stages) - only leagues exist today
- **Teams and Clans**: full modeling of teams, links, and collective ranking
- **Dynamic event data**: customizable forms for match statistics
- **Forums and posts**: topic and publication system by context (user, game, event)
- **Customizable profiles**: rich profile page customization
- **Notifications and invites**: system for inviting players and notifying about events
- **Administrative panel**: dedicated UI for admins and moderators
- **Ban/block system**: user moderation system
- **Steam API integration**: game lookup with caching
- **Page and ranking caching**: ISR and revalidation strategies in Next.js
- **N+1 / DataLoaders**: they exist, but coverage is still limited
- **Tests**: almost zero coverage, only boilerplate
- **i18n standardization**: multiple `useTranslations` per file; JSON structure can be reorganized
- **Ranking position**: `position` logic is not consolidated
- **Validation CI**: no automated pipeline before deploy
- **Game tags**: games can have tags (for example, "FPS", "MOBA") to improve search

\*\*\* Add File: c:\Desenvolvimento\Ares\README.md

<div align="center">
  <img src="apps/web/public/logo.png" alt="Bellona" width="80" />
  <h1>Bellona</h1>
</div>

**A 100% free and open-source competition and community platform** focused on games. Communities create games, organize leagues and tournaments in many formats (Elo, round robin, elimination, Swiss, group stage, and more), build teams and clans, and interact through forums and customizable profiles - all with no paywall.

> Public repository that also serves as an architecture reference for a modern monorepo with Next.js + NestJS + GraphQL + Prisma. Open to contributors and sustained by the community.

## What It Is

- Users sign in through Discord OAuth
- Anyone can create a game and organize competitions inside it
- **Leagues** with two modes: **Elo** (dynamic rating with K-factor, score relevance, and inactivity decay) or **Points** (win/draw/loss with configurable scoring)
- **Tournaments** with brackets: single elimination, double elimination, Swiss system, group stage, and custom stage composition
- Matches can be **scheduled** or have **results recorded** with format, score, and optional proof (image, YouTube, Twitch)
- Event creators define **custom per-match data** (kills, assists, damage, and so on) through dynamic forms
- **Teams and Clans**: create multi-player squads and track collective rankings
- **Forums and posts** on user, game, and event pages
- **Highly customizable profiles** - each player's personal "temple", inspired by Discord and Steam
- **Notifications and invites** for events, plus event moderation staff
- **Administrative panel** for admins and moderators
- Real-time ranking with aggressive page caching
- **100% free forever** - open source, sustained by sponsors and donations

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS v4 |
| Backend  | NestJS, code-first GraphQL, Passport-JWT          |
| Database | PostgreSQL + Prisma                               |
| Auth     | Discord OAuth -> JWT                              |
| Monorepo | pnpm workspaces + Turborepo                       |
| i18n     | next-intl (`en` and `pt`)                         |
| Upload   | Presigned URL (S3-compatible)                     |

## Structure

```
apps/
  api/       NestJS + GraphQL - backend
  web/       Next.js - frontend
packages/
  core/      Shared enums, permissions, and types
  db/        Prisma schema, migrations, and singleton client
```

To understand the conventions and architectural decisions, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (or Neon/Supabase)
- Discord OAuth application

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
```

**`apps/api/.env`:**

| Variable                | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string                        |
| `JWT_SECRET`            | Secret used to sign JWT tokens                      |
| `DISCORD_CLIENT_ID`     | Discord OAuth application client ID                 |
| `DISCORD_CLIENT_SECRET` | Discord OAuth application client secret             |
| `CORS_ORIGIN`           | Frontend URL (for example, `http://localhost:3000`) |

**`apps/web/.env`:**

| Variable              | Description                                    |
| --------------------- | ---------------------------------------------- |
| `NEXTAUTH_SECRET`     | NextAuth secret                                |
| `NEXT_PUBLIC_API_URL` | API URL (for example, `http://localhost:4000`) |

```bash
# 3. Run migrations and seed
pnpm db:migrate
pnpm db:seed

# 4. Start development
pnpm dev
```

## Main Scripts

```bash
pnpm dev           # starts API and web in parallel
pnpm dev:api       # only the API (port 4000)
pnpm dev:web       # only the frontend (port 3000)
pnpm lint          # lint all packages
pnpm typecheck     # tsc --noEmit in all packages
pnpm codegen       # regenerate Apollo types (run after changing the GraphQL schema)
pnpm db:migrate    # run Prisma migrations
```

## Contributing

This repository follows the conventions described in [ARCHITECTURE.md](ARCHITECTURE.md). Read it before opening a PR.
