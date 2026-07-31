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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Get current user |
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