import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (session) {
    return NextResponse.json({
      loggedIn: true,
      username: session.username,
      verified: session.verified === true, // 是否通过人机验证
    });
  }
  return NextResponse.json({ loggedIn: false });
}
