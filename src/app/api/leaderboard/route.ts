import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        u.username,
        MAX(gr.final_score) as best_score,
        COUNT(gr.id) as games_played
      FROM game_records gr
      JOIN users u ON gr.user_id = u.id
      GROUP BY u.id, u.username
      ORDER BY best_score DESC
      LIMIT 10
    `);
    return NextResponse.json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.error('获取排行榜错误:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
