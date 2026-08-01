# 坦克大战 (Tank Game Next)

经典 NES 风格网页坦克大战游戏，基于 **Next.js** 构建，灵感源自经典的《Battle City》。支持 Vercel 一键部署。

![Tank Game](https://img.shields.io/badge/version-1.0.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 游戏特色

- **经典玩法** — 原汁原味的 NES 坦克大战，13×13 网格地图
- **多种地形** — 可破坏的砖墙、不可破坏的钢墙、水域、草丛和基地
- **敌人 AI** — 敌人坦克自主移动与射击
- **用户系统** — 注册、登录、游戏记录、排行榜
- **移动端支持** — 虚拟方向键和射击按钮
- **音效** — 通过 Web Audio API 实现的经典方波音效
- **视觉效果** — 动态光束背景、像素级渲染、护盾和爆炸特效

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript 5 |
| 数据库 | PostgreSQL (Neon) |
| 认证 | JWT (jose) |
| 密码加密 | bcryptjs |
| 样式 | CSS-in-JS + CSS 变量 |
| 部署 | Vercel |

## 项目结构

```
src/
├── app/
│   ├── api/                  # REST API 路由
│   │   ├── register/         # 用户注册
│   │   ├── login/            # 用户登录
│   │   ├── logout/           # 用户登出
│   │   ├── me/               # 当前用户信息
│   │   ├── game-records/     # 游戏记录保存/查询
│   │   └── leaderboard/      # 排行榜 TOP 10
│   ├── login/                # 登录页面
│   ├── register/             # 注册页面
│   ├── profile/              # 个人中心页面
│   ├── page.tsx              # 游戏主页面
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   ├── TankGame.tsx          # 核心游戏引擎 (Canvas)
│   ├── NavBar.tsx            # 导航栏 + 排行榜
│   └── BeamsBackground.tsx   # 动态光束背景
├── lib/
│   ├── db.ts                 # 数据库连接池
│   └── auth.ts               # JWT 令牌管理
scripts/
└── init-db.js                # 数据库表初始化
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库（推荐使用 [Neon](https://neon.tech)）

### 1. 克隆并安装依赖

```bash
git clone https://github.com/TimChen2026/Tank-Game-Next.git
cd Tank-Game-Next
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
JWT_SECRET=your-strong-random-secret-key
```

### 3. 初始化数据库

```bash
npm run init-db
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始游戏。

### 5. 生产构建

```bash
npm run build
npm start
```

## 操作说明

| 操作 | 键盘 | 手机 |
|------|------|------|
| 上移 | `W` / `↑` | 方向键 ▲ |
| 下移 | `S` / `↓` | 方向键 ▼ |
| 左移 | `A` / `←` | 方向键 ◄ |
| 右移 | `D` / `→` | 方向键 ► |
| 射击 | `Space` | 射击按钮 🔥 |
| 开始 / 重新开始 | `Enter` / 点击画布 | 点击画布 |

- 消灭全部 **20 辆敌人坦克** 获胜
- 保护你的 **基地（鹰旗）**，它位于底部中央
- 你拥有 **3 条命**，复活时带有短暂无敌时间

## 认证系统

### 架构概述

游戏采用**三层验证**体系，确保只有通过人机验证的用户才能开始游戏：

1. **中间件层** — 轻量级页面路由控制（不拦截游戏首页，无压迫感）
2. **游戏开始层** — 玩家按 ENTER/点击开始时，检查 JWT 中的 `verified` 字段
3. **API 层** — 注册/登录时，服务端验证 Turnstile 人机验证 token

### 数据流

```
┌──────────────────────────────────────────────────────────────────┐
│                      客户端（浏览器）                              │
│                                                                  │
│  ┌──────────┐    ┌───────────┐    ┌────────────┐                │
│  │ 注册页面  │    │  登录页面  │    │  游戏主页   │                │
│  └────┬─────┘    └────┬──────┘    └─────┬──────┘                │
│       │               │                 │                        │
│       │  Turnstile    │  Turnstile      │  按 ENTER / 点击开始   │
│       │  人机验证     │  人机验证        │                        │
│       ▼               ▼                 ▼                        │
│  ┌──────────────────────────────────────────────┐                │
│  │        TankGame.initGame()                   │                │
│  │  调用 /api/me → 检查 verified JWT            │                │
│  └────────────────────┬────────────────────────┘                │
│                       │                                          │
│          ┌────────────┴────────────┐                             │
│          ▼                         ▼                             │
│    Verified=true         无 verified JWT                         │
│          │                         │                             │
│          ▼                         ▼                             │
│    开始游戏              弹出"需要验证"提示窗                     │
│                                   │                              │
│                           ┌───────┴───────┐                      │
│                           ▼               ▼                      │
│                      "去登录"        "去注册"                     │
└───────────────────────────┼───────────────────┼─────────────────┘
                            │                   │
                            ▼                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    服务端（Next.js API）                          │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │  /api/register   │    │   /api/login     │                    │
│  │                  │    │                  │                    │
│  │ 1. 验证Turnstile │    │ 1. 验证Turnstile │                    │
│  │    token → Cloud │    │    token → Cloud │                    │
│  │ 2. 加密密码      │    │ 2. 验证用户名密码 │                    │
│  │ 3. INSERT用户    │    │ 3. UPDATE用户     │                    │
│  │    (verified=T)  │    │    verified=true  │                    │
│  │ 4. 签发JWT       │    │ 4. 签发JWT        │                    │
│  │    (verified=T)  │    │    (verified=T)   │                    │
│  └────────┬─────────┘    └────────┬──────────┘                    │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      ▼                                          │
│           ┌──────────────────────┐                              │
│           │ 设置 JWT Cookie      │                              │
│           │ httpOnly, secure     │                              │
│           └──────────────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

### 第一步：游戏开始验证

*玩家按 ENTER 或点击游戏画布时触发。*

```mermaid
flowchart TD
    A[玩家按 ENTER / 点击开始] --> B[initGame() 调用 /api/me]
    B --> C{JWT 中<br/>verified: true?}
    C -->|是| D[正常开始游戏]
    C -->|否| E[弹出"需要验证"提示窗]
    E --> F[用户点击"去登录"]
    E --> G[用户点击"去注册"]
    F --> H[跳转到 /login]
    G --> I[跳转到 /register]
    D --> J[游戏运行中]
```

**实现文件**：[TankGame.tsx](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/components/TankGame.tsx#L360-L375) — `initGame` 改为 async，先调用 `/api/me` 检查 `data.verified`，通过后才开始游戏。

### 第二步：登录验证流程

```mermaid
flowchart TD
    A[用户访问 /login] --> B[填写用户名和密码]
    B --> C[完成 Turnstile 人机验证]
    C --> D[点击登录按钮]
    D --> E[POST /api/login]
    E --> F{Turnstile token<br/>是否存在?}
    F -->|否| G[返回 403: "请先完成人机验证"]
    F -->|是| H[向 Cloudflare 验证 token]
    H --> I{Token 有效?}
    I -->|否| J[返回 403: "人机验证失败"]
    I -->|是| K[从数据库查询用户]
    K --> L{用户名密码<br/>正确?}
    L -->|否| M[返回 401: "用户名或密码错误"]
    L -->|是| N[UPDATE users SET verified=true]
    N --> O[签发 JWT，携带 verified: true]
    O --> P[设置 httpOnly cookie]
    P --> Q[跳转到游戏首页 /]
    Q --> R[按 ENTER → 开始游戏]
```

**实现文件**：
- 前端：[login/page.tsx](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/login/page.tsx) — 集成 Turnstile 组件，验证完成前按钮禁用
- 后端：[api/login/route.ts](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/api/login/route.ts) — 调用 Cloudflare siteverify 验证 token，通过后更新数据库并签发 JWT

### 第三步：注册验证流程

```mermaid
flowchart TD
    A[用户访问 /register] --> B[填写用户名、密码、确认密码]
    B --> C[完成 Turnstile 人机验证]
    C --> D[点击注册按钮]
    D --> E[POST /api/register]
    E --> F{Turnstile token<br/>是否存在?}
    F -->|否| G[返回 403: "请先完成人机验证"]
    F -->|是| H[向 Cloudflare 验证 token]
    H --> I{Token 有效?}
    I -->|否| J[返回 403: "人机验证失败"]
    I -->|是| K[校验用户名和密码格式]
    K --> L[bcrypt 加密密码]
    L --> M[INSERT INTO users<br/>verified=true]
    M --> N[签发 JWT，携带 verified: true]
    N --> O[设置 httpOnly cookie]
    O --> P[跳转到游戏首页 /]
    P --> Q[按 ENTER → 开始游戏]
```

**实现文件**：
- 前端：[register/page.tsx](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/register/page.tsx) — 集成 Turnstile 组件，验证完成前按钮禁用
- 后端：[api/register/route.ts](file:///d:/5%20Test/Idea%20To%20Business/Tank%20Game%20Next/src/app/api/register/route.ts) — 调用 Cloudflare siteverify 验证 token，通过后创建用户并签发 JWT

### 关键实现细节

| 项目 | 说明 |
|------|------|
| **JWT 载荷** | 包含 `{ userId, username, verified }`，`verified` 字段是游戏入口的门禁 |
| **中间件** | 只在已验证用户访问 `/login`/`/register` 时重定向到首页；**不拦截**游戏主页 |
| **游戏开始** | `initGame()` 改为 async，调用 `/api/me` 检查通过后才设置 `gameState='playing'` |
| **验证提示** | 居中弹窗模式，包含"去登录"和"去注册"两个按钮，无验证时弹出 |
| **已验证徽章** | 导航栏绿色"✓ 已验证"徽章，由 JWT 载荷驱动 |
| **Turnstile Token** | 一次性使用，5 分钟过期。服务端通过 Cloudflare siteverify API 验证 |
| **数据库字段** | `users.verified BOOLEAN DEFAULT false` — 确保登录时也能正确携带 verified 状态 |

### 环境变量说明

```env
# 数据库连接（Neon PostgreSQL）
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# JWT 密钥
JWT_SECRET=your-strong-random-secret-key

# Cloudflare Turnstile 人机验证
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...你的站点密钥
TURNSTILE_SECRET_KEY=0x4AAAA...你的密钥
```

## API 接口

| 方法 | 接口 | 说明 |
|------|------|------|
| POST | `/api/register` | 注册新用户（需携带 Turnstile token） |
| POST | `/api/login` | 登录（含人机验证） |
| POST | `/api/logout` | 登出 |
| GET | `/api/me` | 获取当前用户信息（返回 `verified` 状态） |
| GET | `/api/game-records` | 获取用户游戏记录 |
| POST | `/api/game-records` | 保存游戏记录 |
| GET | `/api/leaderboard` | 获取排行榜 TOP 10 |

## Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入仓库
3. 添加环境变量：
   - `DATABASE_URL` — Neon PostgreSQL 连接字符串
   - `JWT_SECRET` — 强随机字符串
4. 部署

无需额外配置 — `vercel.json` 已包含在内。

## 许可证

MIT