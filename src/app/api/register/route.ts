import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
  }
  if (username.length < 2 || username.length > 50) {
    return NextResponse.json({ error: '用户名长度需在2-50之间' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码长度至少6位' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    const user = result.rows[0];
    const token = await createToken({ userId: user.id, username: user.username });

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
