import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  // ==================== 1. 人机验证（Turnstile）====================
  // 从请求体中拿到前端传来的 Turnstile token
  const { turnstileToken, username, email, password } = await request.json();

  // 如果没有 token，直接拒绝
  if (!turnstileToken) {
    return NextResponse.json({ error: '请先完成人机验证' }, { status: 403 });
  }

  // 去 Cloudflare 验证这个 token 是不是真的
  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  });

  const verifyResult = await verifyResponse.json();

  // 如果验证失败，直接拒绝
  if (!verifyResult.success) {
    return NextResponse.json({ error: '人机验证失败' }, { status: 403 });
  }

  // ==================== 2. 参数校验 ====================
  if (!username || !password || !email) {
    return NextResponse.json({ error: '用户名、邮箱和密码不能为空' }, { status: 400 });
  }
  if (username.length < 2 || username.length > 50) {
    return NextResponse.json({ error: '用户名长度需在2-50之间' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码长度至少6位' }, { status: 400 });
  }
  // 简单的邮箱格式校验
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
  }

  // ==================== 3. 写入数据库（人机验证已通过，记录 verified=true）====================
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, verified) VALUES ($1, $2, $3, true) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    // 签发带 verified 标记的 JWT
    const token = await createToken({ userId: user.id, username: user.username, verified: true });

    // ==================== 4. 注册成功后发送欢迎邮件（失败不影响注册）====================
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.error('欢迎邮件发送失败：', emailError);
      // 不 throw，不影响注册流程
    }

    const response = NextResponse.json({ success: true, username: user.username });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
    }
    console.error('注册错误:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
