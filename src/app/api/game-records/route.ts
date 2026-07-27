import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const { scenario, final_score, result } = await request.json();

  if (!scenario || final_score === undefined || !result) {
    return NextResponse.json({ error: '缺少游戏记录字段' }, { status: 400 });
  }

  try {
    await pool.query(
      'INSERT INTO game_records (user_id, scenario, final_score, result) VALUES ($1, $2, $3, $4)',
      [session.userId, scenario, final_score, result]
    );
    return NextResponse.json({ success: true, message: '游戏记录已保存' });
  } catch (err) {
    console.error('保存游戏记录错误:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const result = await pool.query(
      'SELECT id, scenario, final_score, result, played_at FROM game_records WHERE user_id = $1 ORDER BY played_at DESC LIMIT 50',
      [session.userId]
    );
    return NextResponse.json({ success: true, records: result.rows });
  } catch (err) {
    console.error('获取游戏记录错误:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
