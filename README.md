# Tank Game Next

A classic NES-style web tank battle game built with **Next.js**, inspired by the legendary Battle City. Designed for Vercel deployment.

![Tank Game](https://img.shields.io/badge/version-1.0.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Game Features

- **Classic Gameplay** — Authentic NES-style tank battle mechanics with a 13×13 grid map
- **Multiple Tile Types** — Destructible bricks, indestructible steel, water, grass, and the eagle base
- **Enemy AI** — Autonomous enemy tanks with random movement and shooting
- **Player System** — Register, login, game records, and leaderboard
- **Mobile Support** — Virtual d-pad and fire button for touchscreen devices
- **Sound Effects** — Classic square-wave sounds via Web Audio API
- **Visual Effects** — Dynamic beam background, pixel-perfect rendering, shield and explosion effects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL (via Neon) |
| Authentication | JWT (jose) |
| Password Hashing | bcryptjs |
| Styling | CSS-in-JS + CSS variables |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── api/                  # REST API routes
│   │   ├── register/         # User registration
│   │   ├── login/            # User login
│   │   ├── logout/           # User logout
│   │   ├── me/               # Current user info
│   │   ├── game-records/     # Record saving/retrieval
│   │   └── leaderboard/      # Top 10 leaderboard
│   ├── login/                # Login page
│   ├── register/             # Register page
│   ├── profile/              # Profile & history page
│   ├── page.tsx              # Game main page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── TankGame.tsx          # Core game engine (Canvas)
│   ├── NavBar.tsx            # Navigation bar + leaderboard
│   └── BeamsBackground.tsx   # Animated beam background
├── lib/
│   ├── db.ts                 # Database connection pool
│   └── auth.ts               # JWT token management
scripts/
└── init-db.js                # Database table initialization
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (recommended: [Neon](https://neon.tech))

### 1. Clone and Install

```bash
git clone https://github.com/TimChen2026/Tank-Game-Next.git
cd Tank-Game-Next
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
JWT_SECRET=your-strong-random-secret-key
```

### 3. Initialize Database

```bash
npm run init-db
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### 5. Production Build

```bash
npm run build
npm start
```

## How to Play

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move Up | `W` / `↑` | D-pad ▲ |
| Move Down | `S` / `↓` | D-pad ▼ |
| Move Left | `A` / `←` | D-pad ◄ |
| Move Right | `D` / `→` | D-pad ► |
| Shoot | `Space` | Fire button 🔥 |
| Start / Restart | `Enter` / Click | Tap canvas |

- Destroy all **20 enemy tanks** to win
- Protect your **eagle base** (flashing icon at bottom center)
- You have **3 lives** — respawn with temporary invincibility

## Authentication System

### Architecture Overview

The game uses a **three-layer verification** system to ensure that only human-verified users can play. The core checks are:

1. **Middleware Layer** — Lightweight page routing control (does NOT block game homepage)
2. **Game Start Layer** — Verified JWT check when player presses ENTER / clicks Start
3. **API Layer** — Turnstile token verification on the server side for register/login

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client (Browser)                            │
│                                                                 │
│  ┌──────────┐    ┌───────────┐    ┌───────────┐                │
│  │ Register │    │   Login   │    │ Game Home │                │
│  │  Page    │    │   Page    │    │   Page    │                │
│  └────┬─────┘    └────┬──────┘    └─────┬─────┘                │
│       │               │                 │                      │
│       │    Turnstile  │   Turnstile     │  Press ENTER /       │
│       │    Widget     │   Widget        │  Click to Start      │
│       ▼               ▼                 ▼                      │
│  ┌───────────────────────────────────────────┐                 │
│  │        TankGame.initGame()                │                 │
│  │  Calls /api/me → checks verified JWT      │                 │
│  └───────────────────┬───────────────────────┘                 │
│                      │                                         │
│         ┌────────────┴────────────┐                            │
│         ▼                         ▼                            │
│   Verified=true           No verified JWT                      │
│         │                         │                            │
│         ▼                         ▼                            │
│   Start Game              Show "Auth Required"                 │
│                              Popup Modal                       │
│                                  │                             │
│                          ┌───────┴───────┐                     │
│                          ▼               ▼                     │
│                     "Go Login"    "Go Register"                │
└──────────────────────────┼───────────────────┼─────────────────┘
                           │                   │
                           ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Server (Next.js API)                           │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  /api/register   │    │   /api/login     │                   │
│  │                  │    │                  │                   │
│  │ 1. Verify        │    │ 1. Verify        │                   │
│  │    Turnstile     │    │    Turnstile     │                   │
│  │    token → CF    │    │    token → CF    │                   │
│  │ 2. Hash password │    │ 2. Validate      │                   │
│  │ 3. INSERT user   │    │    credentials   │                   │
│  │    (verified=T)  │    │ 3. UPDATE user   │                   │
│  │ 4. Sign JWT      │    │    verified=true │                   │
│  │    (verified=T)  │    │ 4. Sign JWT      │                   │
│  │                  │    │    (verified=T)  │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                      │                             │
│           └──────────┬───────────┘                             │
│                      ▼                                         │
│           ┌──────────────────────┐                             │
│           │  JWT Cookie Set      │                             │
│           │  httpOnly, secure    │                             │
│           └──────────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Game Start Verification

*Triggered when the player presses ENTER or clicks on the game canvas.*

```mermaid
flowchart TD
    A[Player presses ENTER / clicks Start] --> B[initGame() calls /api/me]
    B --> C{Has JWT with<br/>verified: true?}
    C -->|Yes| D[Start game normally]
    C -->|No| E[Show auth prompt modal]
    E --> F[User clicks "Go Login"]
    E --> G[User clicks "Go Register"]
    F --> H[Redirect to /login]
    G --> I[Redirect to /register]
    D --> J[Game running]
```

**Implementation**: [TankGame.tsx](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/components/TankGame.tsx#L360-L375) — `initGame` is now async; it fetches `/api/me` and checks `data.verified` before proceeding.

### Step 2: Login Verification

```mermaid
flowchart TD
    A[User visits /login] --> B[Fill username & password]
    B --> C[Complete Turnstile widget]
    C --> D[Click Login]
    D --> E[POST /api/login]
    E --> F{Turnstile token<br/>present?}
    F -->|No| G[Return 403: "Verify first"]
    F -->|Yes| H[Verify token with Cloudflare]
    H --> I{Token valid?}
    I -->|No| J[Return 403: "Verification failed"]
    I -->|Yes| K[Query user from DB]
    K --> L{Credentials<br/>correct?}
    L -->|No| M[Return 401: "Wrong credentials"]
    L -->|Yes| N[UPDATE user SET verified=true]
    N --> O[Sign JWT with verified: true]
    O --> P[Set httpOnly cookie]
    P --> Q[Redirect to /]
    Q --> R[Game homepage → ENTER → play]
```

**Implementation**:
- Frontend: [login/page.tsx](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/login/page.tsx) — Turnstile widget + disabled button until verified
- Backend: [api/login/route.ts](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/api/login/route.ts) — Cloudflare siteverify + `UPDATE users SET verified=true`

### Step 3: Registration Verification

```mermaid
flowchart TD
    A[User visits /register] --> B[Fill username, password, confirm]
    B --> C[Complete Turnstile widget]
    C --> D[Click Register]
    D --> E[POST /api/register]
    E --> F{Turnstile token<br/>present?}
    F -->|No| G[Return 403: "Verify first"]
    F -->|Yes| H[Verify token with Cloudflare]
    H --> I{Token valid?}
    I -->|No| J[Return 403: "Verification failed"]
    I -->|Yes| K[Validate username & password]
    K --> L[Hash password with bcrypt]
    L --> M[INSERT INTO users<br/>verified=true]
    M --> N[Sign JWT with verified: true]
    N --> O[Set httpOnly cookie]
    O --> P[Redirect to /]
    P --> Q[Game homepage → ENTER → play]
```

**Implementation**:
- Frontend: [register/page.tsx](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/register/page.tsx) — Turnstile widget + disabled button until verified
- Backend: [api/register/route.ts](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/api/register/route.ts) — Cloudflare siteverify + `INSERT ... verified=true`

### Key Implementation Details

| Aspect | Detail |
|--------|--------|
| **JWT Payload** | Contains `{ userId, username, verified }` — the `verified` field is the gate |
| **Middleware** | Only redirects verified users away from `/login` / `/register`; **does NOT** block the game homepage |
| **Game Init** | `initGame()` is now `async` — pauses at `/api/me` check before setting `gameState='playing'` |
| **Auth Prompt** | A centered modal with "Go Login" and "Go Register" buttons, shown when verified JWT is missing |
| **Verified Badge** | Green `✓ 已验证` badge in the navbar, driven by JWT payload |
| **Turnstile Token** | One-time use, expires in 5 minutes. Validated server-side with Cloudflare siteverify API |
| **DB Field** | `users.verified BOOLEAN DEFAULT false` — ensures login also carries this state |

### Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# JWT Secret
JWT_SECRET=your-strong-random-secret-key

# Cloudflare Turnstile (for human verification)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...your-site-key
TURNSTILE_SECRET_KEY=0x4AAAA...your-secret-key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user (requires Turnstile token) |
| POST | `/api/login` | Login with human verification |
| POST | `/api/logout` | Clear session cookie |
| GET | `/api/me` | Get current user (returns `verified` status) |
| GET | `/api/game-records` | Get user game records |
| POST | `/api/game-records` | Save game record |
| GET | `/api/leaderboard` | Get top 10 leaderboard |

## Deployment (Vercel)

1. Push code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` — Your Neon PostgreSQL connection string
   - `JWT_SECRET` — A strong random string
4. Deploy

No additional configuration needed — `vercel.json` is already included.

## License

MIT