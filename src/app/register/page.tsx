'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
      } else {
        setError(data.error || '注册失败');
      }
    } catch {
      setError('网络错误，请重试');
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#1a1a2e',
    }}>
      <div style={{
        background: '#0f0f23', border: '3px solid #4a4a6a', padding: '32px 28px',
        width: '100%', maxWidth: 380, borderRadius: 4,
      }}>
        <h1 style={{ textAlign: 'center', color: '#fc9838', fontSize: 28, letterSpacing: 6, marginBottom: 4, fontFamily: "'Courier New', monospace" }}>坦克大战</h1>
        <h2 style={{ textAlign: 'center', color: '#8a8aaa', fontSize: 16, marginBottom: 24, fontFamily: "'Courier New', monospace" }}>注册</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#8a8aaa', fontSize: 13, fontFamily: "'Courier New', monospace" }}>用户名</label>
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              required autoComplete="username" placeholder="2-50个字符" minLength={2} maxLength={50}
              style={{
                background: '#1a1a2e', border: '2px solid #4a4a6a', color: '#e0e0e0',
                padding: '10px 12px', fontSize: 15, fontFamily: "'Courier New', monospace",
                borderRadius: 3, outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#8a8aaa', fontSize: 13, fontFamily: "'Courier New', monospace" }}>密码</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required autoComplete="new-password" placeholder="至少6位" minLength={6}
              style={{
                background: '#1a1a2e', border: '2px solid #4a4a6a', color: '#e0e0e0',
                padding: '10px 12px', fontSize: 15, fontFamily: "'Courier New', monospace",
                borderRadius: 3, outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#8a8aaa', fontSize: 13, fontFamily: "'Courier New', monospace" }}>确认密码</label>
            <input
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required autoComplete="new-password" placeholder="再次输入密码"
              style={{
                background: '#1a1a2e', border: '2px solid #4a4a6a', color: '#e0e0e0',
                padding: '10px 12px', fontSize: 15, fontFamily: "'Courier New', monospace",
                borderRadius: 3, outline: 'none',
              }}
            />
          </div>
          <div style={{ color: '#e74c3c', fontSize: 13, minHeight: 18, fontFamily: "'Courier New', monospace" }}>{error}</div>
          <button type="submit" style={{
            background: '#6a4a1a', color: '#fc9838', border: '2px solid #c84c0c',
            padding: 12, fontSize: 16, fontFamily: "'Courier New', monospace",
            fontWeight: 'bold', letterSpacing: 4, cursor: 'pointer', borderRadius: 3,
          }}>注册</button>
        </form>
        <p style={{ textAlign: 'center', color: '#6a6a8a', fontSize: 13, marginTop: 20, fontFamily: "'Courier New', monospace" }}>
          已有账号？<a href="/login" style={{ color: '#fc9838', textDecoration: 'none' }}>去登录</a>
        </p>
      </div>
    </div>
  );
}
