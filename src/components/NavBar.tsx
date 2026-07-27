'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const [user, setUser] = useState<{ loggedIn: boolean; username?: string } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{ username: string; best_score: number; games_played: number }>>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => setUser(data));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser({ loggedIn: false });
    router.refresh();
  };

  const openLeaderboard = async () => {
    setShowLeaderboard(true);
    setLbLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch {
      setLeaderboard([]);
    }
    setLbLoading(false);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 44,
        background: '#0f0f23', borderBottom: '2px solid #4a4a6a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 100, fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#fc9838', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>坦克大战</span>
          <button onClick={openLeaderboard} style={{
            background: '#2a2a4a', border: '1px solid #4a4a6a', color: '#8a8aaa',
            padding: '6px 14px', fontSize: 13, fontFamily: "'Courier New', monospace",
            cursor: 'pointer', borderRadius: 3,
          }}>排行榜</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {user?.loggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="/profile" style={{ color: '#8a8aaa', fontSize: 14, textDecoration: 'none' }}>个人中心</a>
              <span style={{ color: '#8a8aaa', fontSize: 13 }}>指挥官: <span style={{ color: '#fc9838' }}>{user.username}</span></span>
              <button onClick={handleLogout} style={{
                background: 'none', border: '1px solid #4a4a6a', color: '#8a8aaa',
                padding: '4px 10px', fontSize: 12, fontFamily: "'Courier New', monospace",
                cursor: 'pointer', borderRadius: 3,
              }}>退出登录</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="/login" style={{ color: '#8a8aaa', fontSize: 14, textDecoration: 'none' }}>登录</a>
              <a href="/register" style={{
                background: '#6a4a1a', border: '1px solid #c84c0c', color: '#fc9838',
                padding: '6px 14px', fontSize: 13, fontFamily: "'Courier New', monospace",
                textDecoration: 'none', borderRadius: 3,
              }}>注册</a>
            </div>
          )}
        </div>
      </nav>

      {/* 排行榜弹窗 */}
      {showLeaderboard && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowLeaderboard(false); }} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: '#0f0f23', border: '3px solid #4a4a6a', borderRadius: 4,
            width: '90%', maxWidth: 500, maxHeight: '80vh', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #4a4a6a',
            }}>
              <h2 style={{ color: '#fc9838', fontSize: 20, fontFamily: "'Courier New', monospace", margin: 0 }}>排行榜 TOP 10</h2>
              <button onClick={() => setShowLeaderboard(false)} style={{
                background: 'none', border: 'none', color: '#8a8aaa', fontSize: 28,
                cursor: 'pointer', padding: 0, lineHeight: 1,
              }}>&times;</button>
            </div>
            <div style={{ padding: lbLoading ? '40px 20px' : '0', textAlign: lbLoading ? 'center' : undefined, color: '#8a8aaa' }}>
              {lbLoading ? '加载中...' : (
                leaderboard.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8a8aaa' }}>暂无排行数据</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Courier New', monospace" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px 12px', background: '#2a2a4a', color: '#8a8aaa', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #4a4a6a' }}>排名</th>
                        <th style={{ padding: '10px 12px', background: '#2a2a4a', color: '#8a8aaa', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #4a4a6a' }}>指挥官</th>
                        <th style={{ padding: '10px 12px', background: '#2a2a4a', color: '#8a8aaa', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #4a4a6a' }}>最高分</th>
                        <th style={{ padding: '10px 12px', background: '#2a2a4a', color: '#8a8aaa', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #4a4a6a' }}>场次</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #1a1a2e' }}>
                          <td style={{ padding: '10px 12px', color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#8a8aaa', fontWeight: 'bold', textAlign: 'center' }}>{index + 1}</td>
                          <td style={{ padding: '10px 12px', color: '#fc9838', textAlign: 'center' }}>{item.username}</td>
                          <td style={{ padding: '10px 12px', color: '#8aff8a', fontWeight: 'bold', textAlign: 'center' }}>{item.best_score}</td>
                          <td style={{ padding: '10px 12px', color: '#6a6a8a', fontSize: 12, textAlign: 'center' }}>{item.games_played}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
