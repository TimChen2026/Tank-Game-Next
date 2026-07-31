# Operating Instructions — Tank Game Next

## 1. Getting Started

### 1.1 Accessing the Game

- **Local development**: Run `npm run dev` then open `http://localhost:3000`
- **Production**: Deploy to Vercel and visit your deployment URL

### 1.2 Main Menu

When you first load the game, you will see the main menu screen featuring:

- Game title "坦克大战" (Tank Battle)
- Subtitle "BATTLE CITY"
- "Press ENTER or click to start" prompt
- Keyboard controls hint (WASD / Arrow keys + Space)
- Mobile hint

### 1.3 Starting the Game

Press **Enter** or **click/tap** the game canvas to start.

---

## 2. Game Controls

### 2.1 Keyboard Controls

| Action | Key |
|--------|-----|
| Move Up | `W` or `↑` (Up Arrow) |
| Move Down | `S` or `↓` (Down Arrow) |
| Move Left | `A` or `←` (Left Arrow) |
| Move Right | `D` or `→` (Right Arrow) |
| Shoot | `Space` |
| Start / Restart | `Enter` |

### 2.2 Mobile Controls (Touchscreen)

When playing on a phone or tablet, virtual controls appear automatically at the bottom of the screen:

- **D-pad** (left side): 4 directional buttons (▲ ▼ ◄ ►)
- **Fire button** (right side): Red circular button 🔥

> **Note**: Mobile controls are hidden in landscape mode on small screens (height < 500px) for better gameplay experience.

---

## 3. Gameplay

### 3.1 Objective

- **Win condition**: Destroy all **20 enemy tanks**
- **Lose condition**: Your base (eagle flag) is destroyed, or you lose all **3 lives**

### 3.2 Map Tiles

| Tile | Appearance | Description |
|------|-----------|-------------|
| Empty | Black | Passable open space |
| Brick | Brown brick pattern | Destructible by bullets |
| Steel | Gray metallic | Indestructible by bullets |
| Water | Blue wavy | Impassable (blocks tanks) |
| Grass | Green | Passable, hides tanks underneath |
| Base | Orange eagle | Your base — must protect |

### 3.3 Player

- **Lives**: 3 total (displayed in the top-left HUD)
- **Invincibility**: Upon respawn, your tank is invincible for a short period (flashing shield effect)
- **Bullet limit**: Can have up to 2 bullets on screen at once

### 3.4 Enemies

- **Total**: 20 enemy tanks
- **Max on screen**: 12
- **Spawn points**: Top-left, top-center, top-right of the map
- **AI behavior**: Enemies move randomly, change direction when hitting obstacles, and shoot periodically

### 3.5 HUD Information

The top of the game screen displays a dark bar with:

- **Lives** (left): Remaining lives
- **Enemies** (center): Remaining enemy count
- **Score** (right): Current score (100 points per enemy destroyed)

---

## 4. Game States

### 4.1 Menu State

Initial screen showing the game title and start instructions.

### 4.2 Playing State

The active game — control your tank, destroy enemies, and protect the base.

### 4.3 Game Over

Triggered when:
- The base (eagle) is destroyed
- All 3 lives are lost

The "GAME OVER" screen shows your final score. Press **Enter** or **click** to restart.

### 4.4 Victory

Triggered when all 20 enemy tanks are destroyed. The "VICTORY" screen shows your score. Press **Enter** or **click** to restart.

---

## 5. User System

### 5.1 Registration

1. Click **"注册"** (Register) in the top-right navigation bar
2. Enter a username (2-50 characters) and password (minimum 6 characters)
3. Confirm password and click **"注册"** (Register)
4. Upon successful registration, you are automatically logged in and redirected to the game

### 5.2 Login

1. Click **"登录"** (Login) in the top-right navigation bar
2. Enter your username and password
3. Click **"登录"** (Login)
4. On success, you are redirected to the game

### 5.3 Logout

Click **"退出登录"** (Logout) in the top-right navigation bar.

### 5.4 Profile

1. Click **"个人中心"** (Profile) in the navigation bar
2. View your game history table with scenario, score, result, and date
3. Click **"返回游戏"** to go back

---

## 6. Leaderboard

Click **"排行榜"** (Leaderboard) in the navigation bar to open the leaderboard modal.

The leaderboard shows the Top 10 players ranked by highest score, including:
- Rank (with gold/silver/bronze highlights)
- Username (commander name)
- Best score
- Games played

---

## 7. Game Records

Game records are automatically saved when you win or lose (only if logged in).

- Records are saved to the database via `/api/game-records`
- You can view your history in the **Profile** page
- Each record includes: scenario, final score, result (通关/失败), and play time

---

## 8. Administration

### 8.1 Database Initialization

```bash
npm run init-db
```

This creates the `users` and `game_records` tables in your PostgreSQL database.

### 8.2 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT token signing |

### 8.3 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run init-db` | Initialize database tables |

---

## 9. Troubleshooting

### 9.1 Canvas Not Rendering

- Ensure your browser supports HTML5 Canvas
- Try refreshing the page
- Check the browser console for errors

### 9.2 Login/Registration Errors

- Ensure the database is properly initialized
- Verify that `DATABASE_URL` is correctly configured
- Check that the Neon database is accessible

### 9.3 Game Performance Issues

- Close other browser tabs to free resources
- Reduce browser zoom level
- Disable hardware acceleration in browser settings if needed

### 9.4 Mobile Controls Not Showing

- Ensure you are using a touchscreen device
- Try portrait orientation (landscape mode hides controls on very small screens)
- Refresh the page

---

## 10. Technical Notes

- The game uses a 60fps requestAnimationFrame loop
- Map rendering is pixel-based with `image-rendering: pixelated` CSS
- Audio uses Web Audio API (OscillatorNode) — no external audio files needed
- Authentication is handled via HTTP-only cookies with JWT
- Database queries use parameterized statements to prevent SQL injection