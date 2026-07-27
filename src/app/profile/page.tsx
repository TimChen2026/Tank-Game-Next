'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (!data.loggedIn) {
        setNotLoggedIn(true);
        router.push('/login');
        return;
      }
      setUsername(data.username);
      fetch('/api/game-records').then(r => r.json()).then(rData => {
        setRecords(rData.records || []);
        setLoading(false);
      });
    });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  if (notLoggedIn) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', paddingTop: 60 }}>
      {/* 导航栏 */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 44,
        background: '#0f0f23', borderBottom: '2px solid #4a4a6a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 100, fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#fc9838', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>坦克大战</span>
          <a href="/" style={{
            background: '#2a2a4a', border: '1px solid #4a4a6a', color: '#8a8aaa',
            padding: '6px 14px', fontSize: 13, fontFamily: "'Courier New', monospace",
            cursor: 'pointer', borderRadius: 3, textDecoration: 'none',
          }}>返回游戏</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#8a8aaa', fontSize: 13 }}>指挥官: <span style={{ color: '#fc9838' }}>{username}</span></span>
          <button onClick={handleLogout} style={{
            background: 'none', border: '1px solid #4a4a6a', color: '#8a8aaa',
            padding: '4px 10px', fontSize: 12, fontFamily: "'Courier New', monospace",
            cursor: 'pointer', borderRadius: 3,
          }}>退出登录</button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <div style={{
          background: '#0f0f23', border: '2px solid #4a4a6a', padding: 20,
          marginBottom: 20, borderRadius: 4,
        }}>
          <h1 style={{ color: '#fc9838', fontSize: 24, margin: '0 0 10px 0', fontFamily: "'Courier New', monospace" }}>个人中心</h1>
          <p style={{ color: '#8a8aaa', margin: 0, fontFamily: "'Courier New', monospace" }}>查看您的游戏历史记录</p>
        </div>

        <div style={{
          background: '#0f0f23', border: '2px solid #4a4a6a', borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            background: '#2a2a4a', padding: '12px 20px', borderBottom: '1px solid #4a4a6a',
          }}>
            <h2 style={{ color: '#fc9838', fontSize: 16, margin: 0, fontFamily: "'Courier New', monospace" }}>游戏记录</h2>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8a8aaa', fontFamily: "'Courier New', monospace" }}>加载中...</div>
            ) : records.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8a8aaa', fontFamily: "'Courier New', monospace" }}>暂无游戏记录</div>
            ) : (
              records.map((record) => {
                const date = new Date(record.played_at).toLocaleString('zh-CN');
                const resultClass = record.result === '通关';
                return (
                  <div key={record.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 20px', borderBottom: '1px solid #2a2a4a',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ color: '#e0e0e0', fontSize: 14, fontFamily: "'Courier New', monospace" }}>{record.scenario}</span>
                      <span style={{ color: '#6a6a8a', fontSize: 12, fontFamily: "'Courier New', monospace" }}>{date}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fc9838', fontSize: 18, fontWeight: 'bold', fontFamily: "'Courier New', monospace" }}>{record.final_score} 分</div>
                      <span style={{
                        fontSize: 12, padding: '2px 8px', borderRadius: 3, marginTop: 4, display: 'inline-block',
                        fontFamily: "'Courier New', monospace",
                        background: resultClass ? '#1a4a1a' : '#4a1a1a',
                        color: resultClass ? '#8aff8a' : '#ff6a6a',
                      }}>{record.result}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <a href="/" style={{
          display: 'inline-block', background: '#2a2a4a', border: '1px solid #4a4a6a',
          color: '#8a8aaa', padding: '8px 16px', marginTop: 20, fontSize: 14,
          cursor: 'pointer', borderRadius: 3, textDecoration: 'none',
          fontFamily: "'Courier New', monospace",
        }}>返回游戏</a>
      </div>
    </div>
  );
}
