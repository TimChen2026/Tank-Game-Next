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

## API 接口

| 方法 | 接口 | 说明 |
|------|------|------|
| POST | `/api/register` | 注册新用户 |
| POST | `/api/login` | 登录 |
| POST | `/api/logout` | 登出 |
| GET | `/api/me` | 获取当前用户信息 |
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