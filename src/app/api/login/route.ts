import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  // ==================== 1. 人机验证（Turnstile）====================
  const { turnstileToken, username, password } = await request.json();

  // 如果没有 token，直接拒绝
  if (!turnstileToken) {
    return NextResponse.json({ error: '请先完成人机验证' }, { status: 403 });
  }

  // 去 Cloudflare 验证这个 token 是否有效
  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  });

  const verifyResult = await verifyResponse.json();

  // 如果人机验证失败，直接拒绝
  if (!verifyResult.success) {
    return NextResponse.json({ error: '人机验证失败' }, { status: 403 });
  }

  // ==================== 2. 参数校验 ====================
  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
  }

  // ==================== 3. 查询用户 + 验证密码 ====================
  try {
    const result = await pool.query(
      'SELECT id, username, password, verified FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // ==================== 4. 人机验证已通过，更新数据库 verified=true ====================
    // 老用户可能 verified=false，登录时人机验证通过后补上
    if (user.verified !== true) {
      await pool.query('UPDATE users SET verified = true WHERE id = $1', [user.id]);
    }

    // ==================== 5. 签发带 verified 的 JWT ====================
    const token = await createToken({
      userId: user.id,
      username: user.username,
      verified: true,
    });

    const response = NextResponse.json({ success: true, username: user.username });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('登录错误:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
