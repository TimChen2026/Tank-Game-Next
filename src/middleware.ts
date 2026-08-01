import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tank-game-secret-key-change-in-production'
);

// ==================== 中间件：页面访问控制 ====================
// 游戏首页 / 对所有用户开放（用户可以看到游戏菜单）
// 只有已通过人机验证的用户访问注册/登录页时，才重定向到游戏首页
// 游戏开始的验证在 TankGame 组件中按 ENTER/点击开始时进行
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 从 cookie 中读取 token
  const token = request.cookies.get('token')?.value;

  let isLoggedIn = false;
  let isVerified = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      isLoggedIn = true;
      isVerified = payload.verified === true;
    } catch {
      isLoggedIn = false;
      isVerified = false;
    }
  }

  // 已通过人机验证的用户访问注册/登录页 → 直接进游戏
  if (isLoggedIn && isVerified && (pathname === '/register' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 匹配规则：拦截首页、注册页、登录页
export const config = {
  matcher: ['/', '/register', '/login'],
};
