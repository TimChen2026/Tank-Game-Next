'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// ---- 常量 ----
const TILE = 32;
const COLS = 13;
const ROWS = 13;
const MAP_W = COLS * TILE;
const MAP_H = ROWS * TILE;

const E = 0, B = 1, S = 2, W = 3, G = 4;

const LEVEL_MAP = [
  [E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,E,B,E,B,E,B,B,E,E],
  [E,E,B,B,E,B,E,B,E,B,B,E,E],
  [E,E,B,B,E,B,S,B,E,B,B,E,E],
  [E,E,B,B,E,E,E,E,E,B,B,E,E],
  [B,B,E,E,B,E,E,E,B,E,E,B,B],
  [E,E,E,E,E,B,B,B,E,E,E,E,E],
  [E,E,B,E,B,B,E,B,B,E,B,E,E],
  [E,E,B,E,E,E,E,E,E,E,B,E,E],
  [E,E,B,E,E,B,E,B,E,E,B,E,E],
  [E,E,E,E,E,B,E,B,E,E,E,E,E],
  [E,E,E,E,E,B,E,B,E,E,E,E,E],
  [E,E,E,E,E,B,E,B,E,E,E,E,E],
];

const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

const PLAYER_SPEED = 5;
const ENEMY_SPEED = 3;
const BULLET_SPEED = 16;
const MAX_ENEMIES = 12;
const TOTAL_ENEMIES = 20;
const PLAYER_LIVES = 3;
const SHOOT_COOLDOWN = 5;
const RESPAWN_TIME = 90;
const INVINCIBLE_TIME = 120;

// NES 调色板
const C = {
  black: '#000000', gray: '#7C7C7C', darkGray: '#4C4C4C', white: '#FCFCFC',
  brick: '#C84C0C', brickDark: '#A43000', steel: '#BCBCBC', steelDark: '#7C7C7C',
  water: '#0058F8', waterDark: '#003CBC', grass: '#00A800', grassDark: '#007800',
  player: '#FCFCFC', playerGun: '#BCBCBC', enemy: '#C84C0C', enemyGun: '#8C5C00',
  bullet: '#FCFCFC', base: '#FC9838', baseDead: '#7C0000', shield: '#00A800', explode: '#FC9838',
};

interface Tank {
  x: number; y: number; dir: number; isPlayer: boolean; speed: number;
  alive: boolean; shootCooldown: number; invincible: number;
  respawnTimer: number; aiTimer: number; aiShootTimer: number;
  lives?: number;
}

interface Bullet {
  x: number; y: number; w: number; h: number; dir: number; owner: 'player' | 'enemy';
}

interface Explosion {
  x: number; y: number; timer: number; big: boolean;
}

export default function TankGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<string>('menu');
  const mapRef = useRef<number[][]>([]);
  const playerRef = useRef<Tank | null>(null);
  const enemiesRef = useRef<Tank[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const enemiesKilledRef = useRef(0);
  const enemiesSpawnedRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const baseAliveRef = useRef(true);
  const keysRef = useRef<Record<string, boolean>>({});
  const mobileDirRef = useRef(-1);
  const mobileFireRef = useRef(false);
  const frameCountRef = useRef(0);
  const recordSavedRef = useRef(false);
  const isLoggedInRef = useRef(false);
  const animFrameRef = useRef<number>(0);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const notifTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'warning' | 'error') => {
    setNotification({ message, type });
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setNotification(null), 5000);
  }, []);

  const setIsLoggedIn = useCallback((v: boolean) => { isLoggedInRef.current = v; }, []);

  // 检查登录状态
  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      isLoggedInRef.current = data.loggedIn === true;
    });
  }, []);

  // 保存游戏记录
  const saveGameRecord = useCallback(async (result: string) => {
    if (recordSavedRef.current) return;
    recordSavedRef.current = true;
    const finalScore = enemiesKilledRef.current * 100;
    const scenario = '经典关卡';
    if (isLoggedInRef.current) {
      try {
        const res = await fetch('/api/game-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario, final_score: finalScore, result }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('您的游戏记录已经保存', 'success');
        } else {
          showNotification('保存记录失败: ' + (data.error || '未知错误'), 'error');
        }
      } catch {
        showNotification('网络错误，记录未保存', 'error');
      }
    } else {
      showNotification('登录后可保存你的游戏记录', 'warning');
    }
  }, [showNotification]);

  // 游戏逻辑函数（使用 ref，无需依赖）
  const cloneMap = useCallback(() => LEVEL_MAP.map(r => r.slice()), []);
  const tileAt = useCallback((col: number, row: number) => {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return S;
    return mapRef.current[row][col];
  }, []);
  const isBlocking = useCallback((tile: number) => tile === B || tile === S || tile === W, []);
  const destroyTile = useCallback((col: number, row: number) => {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    if (mapRef.current[row][col] === B) mapRef.current[row][col] = E;
  }, []);

  const canMoveTo = useCallback((t: Tank, nx: number, ny: number) => {
    if (nx < 0 || ny < 0 || nx + TILE > MAP_W || ny + TILE > MAP_H) return false;
    const c1 = Math.floor(nx / TILE), r1 = Math.floor(ny / TILE);
    const c2 = Math.floor((nx + TILE - 1) / TILE), r2 = Math.floor((ny + TILE - 1) / TILE);
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (isBlocking(tileAt(c, r))) return false;
      }
    }
    const allTanks = playerRef.current && playerRef.current.alive ? [playerRef.current, ...enemiesRef.current] : [...enemiesRef.current];
    for (const other of allTanks) {
      if (other === t || !other.alive) continue;
      if (nx < other.x + TILE && nx + TILE > other.x && ny < other.y + TILE && ny + TILE > other.y) return false;
    }
    if (baseAliveRef.current) {
      const bx = 6 * TILE, by = 12 * TILE;
      if (nx < bx + TILE && nx + TILE > bx && ny < by + TILE && ny + TILE > by) return false;
    }
    return true;
  }, [tileAt, isBlocking]);

  const snapToGrid = useCallback((t: Tank) => {
    if (t.dir === UP || t.dir === DOWN) t.x = Math.round(t.x / TILE) * TILE;
    else t.y = Math.round(t.y / TILE) * TILE;
  }, []);

  const moveTank = useCallback((t: Tank, dir: number) => {
    if (t.dir !== dir) { t.dir = dir; snapToGrid(t); }
    const nx = t.x + DX[dir] * t.speed;
    const ny = t.y + DY[dir] * t.speed;
    if (canMoveTo(t, nx, ny)) { t.x = nx; t.y = ny; }
  }, [canMoveTo, snapToGrid]);

  // 音效
  let audioCtxRef = useRef<AudioContext | null>(null);
  const getAudio = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return audioCtxRef.current;
  }, []);
  const playSound = useCallback((freq: number, dur: number, type: OscillatorType = 'square') => {
    try {
      const a = getAudio();
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = 0.08;
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime + dur);
    } catch {}
  }, [getAudio]);

  const shoot = useCallback((tank: Tank) => {
    if (tank.shootCooldown > 0) return;
    const myBullets = bulletsRef.current.filter(b => b.owner === (tank.isPlayer ? 'player' : 'enemy'));
    const maxB = tank.isPlayer ? 2 : 1;
    if (myBullets.length >= maxB) return;
    const cx = tank.x + TILE / 2, cy = tank.y + TILE / 2;
    const size = 6;
    let bx = 0, by = 0;
    if (tank.dir === UP) { bx = cx - size / 2; by = tank.y - size; }
    if (tank.dir === DOWN) { bx = cx - size / 2; by = tank.y + TILE; }
    if (tank.dir === LEFT) { bx = tank.x - size; by = cy - size / 2; }
    if (tank.dir === RIGHT) { bx = tank.x + TILE; by = cy - size / 2; }
    bulletsRef.current.push({ x: bx, y: by, w: size, h: size, dir: tank.dir, owner: tank.isPlayer ? 'player' : 'enemy' });
    tank.shootCooldown = SHOOT_COOLDOWN;
    playSound(800, 0.08);
  }, [playSound]);

  const createExplosion = useCallback((x: number, y: number, big: boolean) => {
    explosionsRef.current.push({ x, y, timer: big ? 20 : 12, big });
  }, []);

  const rectsOverlap = useCallback((a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }, []);

  const updateBullets = useCallback(() => {
    const bullets = bulletsRef.current;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += DX[b.dir] * BULLET_SPEED;
      b.y += DY[b.dir] * BULLET_SPEED;

      if (b.x < -b.w || b.y < -b.h || b.x > MAP_W || b.y > MAP_H) {
        bullets.splice(i, 1); continue;
      }

      const c1 = Math.floor(b.x / TILE), r1 = Math.floor(b.y / TILE);
      const c2 = Math.floor((b.x + b.w - 1) / TILE), r2 = Math.floor((b.y + b.h - 1) / TILE);
      let hitWall = false;
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const tile = tileAt(c, r);
          if (tile === B) { destroyTile(c, r); hitWall = true; playSound(300, 0.1); }
          else if (tile === S) { hitWall = true; playSound(300, 0.1); }
        }
      }
      if (hitWall) { createExplosion(b.x, b.y, false); bullets.splice(i, 1); continue; }

      if (baseAliveRef.current) {
        const baseRect = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE };
        if (rectsOverlap(b, baseRect)) {
          baseAliveRef.current = false;
          createExplosion(6 * TILE, 12 * TILE, true);
          playSound(120, 0.25, 'sawtooth');
          bullets.splice(i, 1);
          gameStateRef.current = 'gameover';
          playSound(100, 0.8, 'sawtooth');
          saveGameRecord('失败');
          continue;
        }
      }

      if (b.owner === 'player') {
        for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
          const en = enemiesRef.current[j];
          if (!en.alive) continue;
          if (rectsOverlap(b, { x: en.x, y: en.y, w: TILE, h: TILE })) {
            en.alive = false;
            createExplosion(en.x, en.y, true);
            playSound(120, 0.25, 'sawtooth');
            enemiesKilledRef.current++;
            bullets.splice(i, 1);
            if (enemiesKilledRef.current >= TOTAL_ENEMIES) {
              gameStateRef.current = 'victory';
              saveGameRecord('通关');
            }
            break;
          }
        }
      }

      if (b.owner === 'enemy' && playerRef.current && playerRef.current.alive) {
        if (rectsOverlap(b, { x: playerRef.current.x, y: playerRef.current.y, w: TILE, h: TILE })) {
          if (playerRef.current.invincible <= 0) {
            playerRef.current.alive = false;
            createExplosion(playerRef.current.x, playerRef.current.y, true);
            playSound(120, 0.25, 'sawtooth');
            playerRef.current.lives!--;
            if (playerRef.current.lives! <= 0) {
              gameStateRef.current = 'gameover';
              playSound(100, 0.8, 'sawtooth');
              saveGameRecord('失败');
            } else {
              playerRef.current.respawnTimer = RESPAWN_TIME;
            }
          }
          bullets.splice(i, 1);
          continue;
        }
      }

      for (let j = bullets.length - 1; j >= 0; j--) {
        if (i === j || i >= bullets.length) continue;
        const b2 = bullets[j];
        if (b.owner !== b2.owner && rectsOverlap(b, b2)) {
          createExplosion(b.x, b.y, false);
          bullets.splice(Math.max(i, j), 1);
          bullets.splice(Math.min(i, j), 1);
          i = -1;
          break;
        }
      }
      if (i < 0) continue;
    }
  }, [tileAt, destroyTile, createExplosion, rectsOverlap, playSound, saveGameRecord]);

  const updateEnemyAI = useCallback((en: Tank) => {
    en.aiTimer--;
    en.aiShootTimer--;
    if (en.aiTimer <= 0) {
      en.dir = Math.floor(Math.random() * 4);
      en.aiTimer = 60 + Math.floor(Math.random() * 120);
      snapToGrid(en);
    }
    const nx = en.x + DX[en.dir] * en.speed;
    const ny = en.y + DY[en.dir] * en.speed;
    if (canMoveTo(en, nx, ny)) { en.x = nx; en.y = ny; }
    else { en.dir = Math.floor(Math.random() * 4); en.aiTimer = 60 + Math.floor(Math.random() * 60); snapToGrid(en); }
    if (en.aiShootTimer <= 0) { shoot(en); en.aiShootTimer = 40 + Math.floor(Math.random() * 60); }
  }, [canMoveTo, snapToGrid, shoot]);

  const spawnEnemy = useCallback(() => {
    if (enemiesSpawnedRef.current >= TOTAL_ENEMIES) return;
    const aliveCount = enemiesRef.current.filter(e => e.alive).length;
    if (aliveCount >= MAX_ENEMIES) return;
    const spawnCols = [0, 6, 12];
    const col = spawnCols[enemiesSpawnedRef.current % 3];
    const row = 0;
    const sx = col * TILE, sy = row * TILE;
    const allTanks = playerRef.current && playerRef.current.alive ? [playerRef.current, ...enemiesRef.current] : [...enemiesRef.current];
    let blocked = false;
    for (const t of allTanks) {
      if (!t.alive) continue;
      if (sx < t.x + TILE && sx + TILE > t.x && sy < t.y + TILE && sy + TILE > t.y) { blocked = true; break; }
    }
    if (blocked) return;
    const en: Tank = { x: col * TILE, y: row * TILE, dir: DOWN, isPlayer: false, speed: ENEMY_SPEED, alive: true, shootCooldown: 0, invincible: 0, respawnTimer: 0, aiTimer: 60, aiShootTimer: 30 + Math.floor(Math.random() * 60) };
    enemiesRef.current.push(en);
    enemiesSpawnedRef.current++;
    createExplosion(sx, sy, false);
  }, [createExplosion]);

  const respawnPlayer = useCallback(() => {
    const p = playerRef.current!;
    p.x = 4 * TILE; p.y = 12 * TILE; p.dir = UP; p.alive = true;
    p.invincible = INVINCIBLE_TIME; p.shootCooldown = 0;
  }, []);

  const initGame = useCallback(() => {
    mapRef.current = cloneMap();
    mapRef.current[11][5] = B; mapRef.current[11][6] = B; mapRef.current[11][7] = B;
    mapRef.current[12][5] = B; mapRef.current[12][7] = B;
    playerRef.current = { x: 4 * TILE, y: 12 * TILE, dir: UP, isPlayer: true, speed: PLAYER_SPEED, alive: true, shootCooldown: 0, invincible: INVINCIBLE_TIME, respawnTimer: 0, aiTimer: 0, aiShootTimer: 0, lives: PLAYER_LIVES };
    enemiesRef.current = [];
    bulletsRef.current = [];
    explosionsRef.current = [];
    enemiesKilledRef.current = 0;
    enemiesSpawnedRef.current = 0;
    spawnTimerRef.current = 60;
    baseAliveRef.current = true;
    recordSavedRef.current = false;
    gameStateRef.current = 'playing';
  }, [cloneMap]);

  // 绘制函数
  const drawTile = useCallback((ctx: CanvasRenderingContext2D, col: number, row: number, tile: number, frameCount: number) => {
    const x = col * TILE, y = row * TILE;
    if (tile === B) {
      ctx.fillStyle = C.brick; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = C.brickDark;
      for (let br = 0; br < 4; br++) for (let bc = 0; bc < 4; bc++) {
        const bx = x + bc * 8, by = y + br * 8;
        if ((br + bc) % 2 === 0) { ctx.fillRect(bx, by, 8, 1); ctx.fillRect(bx, by, 1, 8); }
      }
    } else if (tile === S) {
      ctx.fillStyle = C.steel; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = C.steelDark;
      ctx.fillRect(x, y, TILE, 2); ctx.fillRect(x, y, 2, TILE);
      ctx.fillRect(x + TILE - 2, y, 2, TILE); ctx.fillRect(x, y + TILE - 2, TILE, 2);
      ctx.fillRect(x + 8, y + 8, 16, 2); ctx.fillRect(x + 8, y + 22, 16, 2);
    } else if (tile === W) {
      ctx.fillStyle = C.water; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = C.waterDark;
      const waveOff = Math.sin(frameCount * 0.05 + col) * 3;
      for (let i = 0; i < 3; i++) ctx.fillRect(x, y + 8 + i * 10 + waveOff, TILE, 2);
    }
  }, []);

  const drawGrass = useCallback((ctx: CanvasRenderingContext2D, col: number, row: number) => {
    const x = col * TILE, y = row * TILE;
    ctx.fillStyle = C.grass; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = C.grassDark;
    for (let i = 0; i < 8; i++) {
      const gx = x + (i % 4) * 8 + 2, gy = y + Math.floor(i / 4) * 16 + 2;
      ctx.fillRect(gx, gy, 4, 12);
    }
  }, []);

  const drawBase = useCallback((ctx: CanvasRenderingContext2D) => {
    const x = 6 * TILE, y = 12 * TILE;
    if (baseAliveRef.current) {
      ctx.fillStyle = C.base; ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
      ctx.fillStyle = C.black; ctx.fillRect(x + 8, y + 8, TILE - 16, TILE - 16);
      ctx.fillStyle = C.base;
      ctx.fillRect(x + 10, y + 6, 12, 4);
      ctx.fillRect(x + 14, y + 6, 4, 20);
      ctx.fillRect(x + 8, y + 14, 16, 4);
      ctx.fillRect(x + 10, y + 22, 4, 4);
      ctx.fillRect(x + 18, y + 22, 4, 4);
    } else {
      ctx.fillStyle = C.baseDead; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = C.darkGray; ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
    }
  }, []);

  const drawTank = useCallback((ctx: CanvasRenderingContext2D, t: Tank) => {
    if (!t.alive) return;
    const { x, y, dir, isPlayer, invincible } = t;
    const bodyColor = isPlayer ? C.player : C.enemy;
    const gunColor = isPlayer ? C.playerGun : C.enemyGun;
    if (invincible > 0 && Math.floor(invincible / 4) % 2 === 0) ctx.globalAlpha = 0.5;
    ctx.fillStyle = C.darkGray;
    if (dir === UP || dir === DOWN) { ctx.fillRect(x, y, 8, TILE); ctx.fillRect(x + TILE - 8, y, 8, TILE); }
    else { ctx.fillRect(x, y, TILE, 8); ctx.fillRect(x, y + TILE - 8, TILE, 8); }
    ctx.fillStyle = bodyColor; ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
    ctx.fillStyle = gunColor;
    const cx = x + TILE / 2, cy = y + TILE / 2;
    if (dir === UP) ctx.fillRect(cx - 3, y, 6, TILE / 2);
    if (dir === DOWN) ctx.fillRect(cx - 3, cy, 6, TILE / 2);
    if (dir === LEFT) ctx.fillRect(x, cy - 3, TILE / 2, 6);
    if (dir === RIGHT) ctx.fillRect(cx, cy - 3, TILE / 2, 6);
    if (invincible > 0) { ctx.strokeStyle = C.shield; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4); }
    ctx.globalAlpha = 1;
  }, []);

  const drawBullet = useCallback((ctx: CanvasRenderingContext2D, b: Bullet) => {
    ctx.fillStyle = C.bullet; ctx.fillRect(b.x, b.y, b.w, b.h);
  }, []);

  const drawExplosion = useCallback((ctx: CanvasRenderingContext2D, e: Explosion) => {
    const cx = e.x + (e.big ? TILE / 2 : 3), cy = e.y + (e.big ? TILE / 2 : 3);
    const progress = 1 - e.timer / (e.big ? 20 : 12);
    const r = (e.big ? TILE * 0.8 : TILE * 0.3) * (progress < 0.5 ? progress * 2 : 2 - progress * 2);
    ctx.fillStyle = progress < 0.5 ? C.explode : C.white;
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2); ctx.fill();
  }, []);

  const drawHUD = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, MAP_W, 20);
    ctx.fillStyle = C.white; ctx.font = '12px monospace';
    ctx.textAlign = 'left'; ctx.fillText('生命: ' + (playerRef.current ? playerRef.current.lives : 0), 4, 14);
    ctx.textAlign = 'center'; ctx.fillText('敌人: ' + (TOTAL_ENEMIES - enemiesKilledRef.current), MAP_W / 2, 14);
    ctx.textAlign = 'right'; ctx.fillText('得分: ' + enemiesKilledRef.current * 100, MAP_W - 4, 14);
  }, []);

  const drawMenu = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.fillStyle = C.black; ctx.fillRect(0, 0, MAP_W, MAP_H);
    ctx.fillStyle = C.white; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
    ctx.fillText('坦克大战', MAP_W / 2, MAP_H / 2 - 60);
    ctx.font = '14px monospace'; ctx.fillStyle = C.brick;
    ctx.fillText('BATTLE CITY', MAP_W / 2, MAP_H / 2 - 30);
    ctx.fillStyle = C.white; ctx.font = '14px monospace';
    if (Math.floor(frameCount / 30) % 2 === 0) ctx.fillText('按 ENTER 或点击开始', MAP_W / 2, MAP_H / 2 + 30);
    ctx.font = '11px monospace'; ctx.fillStyle = C.gray;
    ctx.fillText('WASD/方向键 移动 | 空格 射击', MAP_W / 2, MAP_H / 2 + 70);
    ctx.fillText('手机端使用虚拟按键', MAP_W / 2, MAP_H / 2 + 90);
  }, []);

  const drawGameOver = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, MAP_W, MAP_H);
    ctx.fillStyle = C.enemy; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', MAP_W / 2, MAP_H / 2 - 10);
    ctx.fillStyle = C.white; ctx.font = '14px monospace';
    ctx.fillText('得分: ' + enemiesKilledRef.current * 100, MAP_W / 2, MAP_H / 2 + 20);
    if (Math.floor(frameCount / 30) % 2 === 0) ctx.fillText('按 ENTER 重新开始', MAP_W / 2, MAP_H / 2 + 50);
  }, []);

  const drawVictory = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, MAP_W, MAP_H);
    ctx.fillStyle = C.base; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center';
    ctx.fillText('胜利!', MAP_W / 2, MAP_H / 2 - 10);
    ctx.fillStyle = C.white; ctx.font = '14px monospace';
    ctx.fillText('得分: ' + enemiesKilledRef.current * 100, MAP_W / 2, MAP_H / 2 + 20);
    if (Math.floor(frameCount / 30) % 2 === 0) ctx.fillText('按 ENTER 重新开始', MAP_W / 2, MAP_H / 2 + 50);
  }, []);

  // 游戏循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const wrapper = containerRef.current;
      if (!wrapper) return;
      const maxW = wrapper.clientWidth;
      const maxH = wrapper.clientHeight;
      const scale = Math.min(maxW / MAP_W, maxH / MAP_H);
      canvas.width = MAP_W;
      canvas.height = MAP_H;
      canvas.style.width = (MAP_W * scale) + 'px';
      canvas.style.height = (MAP_H * scale) + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Enter' || e.code === 'Space') {
        const gs = gameStateRef.current;
        if (gs === 'menu' || gs === 'gameover' || gs === 'victory') { initGame(); e.preventDefault(); }
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const handleCanvasClick = () => {
      const gs = gameStateRef.current;
      if (gs === 'menu' || gs === 'gameover' || gs === 'victory') initGame();
    };
    canvas.addEventListener('click', handleCanvasClick);

    function update() {
      frameCountRef.current++;
      if (gameStateRef.current !== 'playing') return;

      const player = playerRef.current;
      if (player && player.alive) {
        const keys = keysRef.current;
        const md = mobileDirRef.current;
        if (keys['ArrowUp'] || keys['KeyW'] || md === UP) moveTank(player, UP);
        if (keys['ArrowDown'] || keys['KeyS'] || md === DOWN) moveTank(player, DOWN);
        if (keys['ArrowLeft'] || keys['KeyA'] || md === LEFT) moveTank(player, LEFT);
        if (keys['ArrowRight'] || keys['KeyD'] || md === RIGHT) moveTank(player, RIGHT);
        if (keys['Space'] || mobileFireRef.current) shoot(player);
        if (player.shootCooldown > 0) player.shootCooldown--;
        if (player.invincible > 0) player.invincible--;
      }

      if (player && !player.alive && (player.lives ?? 0) > 0) {
        player.respawnTimer--;
        if (player.respawnTimer <= 0) respawnPlayer();
      }

      for (const en of enemiesRef.current) {
        if (!en.alive) continue;
        updateEnemyAI(en);
        if (en.shootCooldown > 0) en.shootCooldown--;
      }

      spawnTimerRef.current--;
      if (spawnTimerRef.current <= 0) { spawnEnemy(); spawnTimerRef.current = 120; }

      enemiesRef.current = enemiesRef.current.filter(e => e.alive || e.respawnTimer > 0);
      updateBullets();

      for (let i = explosionsRef.current.length - 1; i >= 0; i--) {
        explosionsRef.current[i].timer--;
        if (explosionsRef.current[i].timer <= 0) explosionsRef.current.splice(i, 1);
      }
    }

    function render() {
      if (!ctx) return;
      const fc = frameCountRef.current;
      ctx.fillStyle = C.black; ctx.fillRect(0, 0, MAP_W, MAP_H);

      if (gameStateRef.current === 'menu') { drawMenu(ctx, fc); return; }

      const map = mapRef.current;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (map[r][c] !== G) drawTile(ctx, c, r, map[r][c], fc); }
      drawBase(ctx);
      enemiesRef.current.forEach(en => drawTank(ctx, en));
      if (playerRef.current && playerRef.current.alive) drawTank(ctx, playerRef.current);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (map[r][c] === G) drawGrass(ctx, c, r); }
      bulletsRef.current.forEach(b => drawBullet(ctx, b));
      explosionsRef.current.forEach(e => drawExplosion(ctx, e));
      drawHUD(ctx);

      if (gameStateRef.current === 'gameover') drawGameOver(ctx, fc);
      if (gameStateRef.current === 'victory') drawVictory(ctx, fc);
    }

    function gameLoop() {
      update();
      render();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleCanvasClick);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initGame, moveTank, shoot, updateEnemyAI, spawnEnemy, respawnPlayer, updateBullets, drawTile, drawGrass, drawBase, drawTank, drawBullet, drawExplosion, drawHUD, drawMenu, drawGameOver, drawVictory]);

  // 移动端触控
  const handleDirStart = useCallback((dir: number) => {
    mobileDirRef.current = dir;
    const gs = gameStateRef.current;
    if (gs === 'menu' || gs === 'gameover' || gs === 'victory') initGame();
  }, [initGame]);

  const handleDirEnd = useCallback((dir: number) => {
    if (mobileDirRef.current === dir) mobileDirRef.current = -1;
  }, []);

  const handleFireStart = useCallback(() => {
    mobileFireRef.current = true;
    const gs = gameStateRef.current;
    if (gs === 'menu' || gs === 'gameover' || gs === 'victory') initGame();
  }, [initGame]);

  const handleFireEnd = useCallback(() => {
    mobileFireRef.current = false;
  }, []);

  return (
    <>
      <div id="game-wrapper" style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2,
        paddingTop: 46,
      }}>
        <div ref={containerRef} id="game-container" style={{
          width: '100%', flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden', minHeight: 0,
        }}>
          <canvas ref={canvasRef} id="gameCanvas" />
        </div>
        <div id="mobile-controls" style={{
          display: 'none', width: '100%', padding: '8px 16px 16px',
          background: '#0f0f23', justifyContent: 'space-between',
          alignItems: 'center', flexShrink: 0,
        }}>
          <div id="dpad" style={{ position: 'relative', width: 140, height: 140 }}>
            <button className="dpad-btn" onClick={() => handleDirStart(UP)} onTouchStart={(e) => { e.preventDefault(); handleDirStart(UP); }} onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(UP); }} onMouseLeave={() => handleDirEnd(UP)} onMouseUp={() => handleDirEnd(UP)} style={{ position: 'absolute', width: 46, height: 46, background: '#2a2a4a', color: '#8a8aaa', border: '2px solid #4a4a6a', borderRadius: 8, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', top: 0, left: '50%', transform: 'translateX(-50%)' }}>▲</button>
            <button className="dpad-btn" onClick={() => handleDirStart(DOWN)} onTouchStart={(e) => { e.preventDefault(); handleDirStart(DOWN); }} onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(DOWN); }} onMouseLeave={() => handleDirEnd(DOWN)} onMouseUp={() => handleDirEnd(DOWN)} style={{ position: 'absolute', width: 46, height: 46, background: '#2a2a4a', color: '#8a8aaa', border: '2px solid #4a4a6a', borderRadius: 8, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>▼</button>
            <button className="dpad-btn" onClick={() => handleDirStart(LEFT)} onTouchStart={(e) => { e.preventDefault(); handleDirStart(LEFT); }} onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(LEFT); }} onMouseLeave={() => handleDirEnd(LEFT)} onMouseUp={() => handleDirEnd(LEFT)} style={{ position: 'absolute', width: 46, height: 46, background: '#2a2a4a', color: '#8a8aaa', border: '2px solid #4a4a6a', borderRadius: 8, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', top: '50%', left: 0, transform: 'translateY(-50%)' }}>◄</button>
            <button className="dpad-btn" onClick={() => handleDirStart(RIGHT)} onTouchStart={(e) => { e.preventDefault(); handleDirStart(RIGHT); }} onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(RIGHT); }} onMouseLeave={() => handleDirEnd(RIGHT)} onMouseUp={() => handleDirEnd(RIGHT)} style={{ position: 'absolute', width: 46, height: 46, background: '#2a2a4a', color: '#8a8aaa', border: '2px solid #4a4a6a', borderRadius: 8, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', top: '50%', right: 0, transform: 'translateY(-50%)' }}>►</button>
          </div>
          <button id="btn-fire" onClick={handleFireStart} onTouchStart={(e) => { e.preventDefault(); handleFireStart(); }} onTouchEnd={(e) => { e.preventDefault(); handleFireEnd(); }} onMouseUp={handleFireEnd} onMouseLeave={handleFireEnd} style={{
            width: 70, height: 70, background: '#6a2a2a', color: '#fc9838',
            border: '3px solid #c84c0c', borderRadius: '50%', fontSize: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>🔥</button>
        </div>
      </div>

      {/* 移动端虚拟按键CSS */}
      <style>{`
        @media (max-width: 768px), (hover: none) and (pointer: coarse) {
          #mobile-controls { display: flex !important; }
        }
        @media (max-height: 500px) and (orientation: landscape) {
          #mobile-controls { display: none !important; }
        }
        @media (max-width: 420px) {
          #dpad { width: 120px !important; height: 120px !important; }
          .dpad-btn { width: 40px !important; height: 40px !important; font-size: 16px !important; }
          #btn-fire { width: 60px !important; height: 60px !important; font-size: 24px !important; }
          #mobile-controls { padding: 4px 12px 8px !important; }
        }
      `}</style>

      {/* 通知 */}
      {notification && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 4, fontFamily: "'Courier New', monospace",
          fontSize: 14, zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          background: notification.type === 'success' ? '#1a4a1a' : notification.type === 'warning' ? '#4a3a1a' : '#4a1a1a',
          border: `2px solid ${notification.type === 'success' ? '#4a8a4a' : notification.type === 'warning' ? '#8a6a2a' : '#8a2a2a'}`,
          color: notification.type === 'success' ? '#8aff8a' : notification.type === 'warning' ? '#fc9838' : '#ff6a6a',
        }}>
          {notification.message}
        </div>
      )}
    </>
  );
}
