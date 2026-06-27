import React from 'react';

const RANK_CONFIG = {
  1: { bg: 'linear-gradient(135deg,#ffd700,#f59e0b)', color: '#431a00', label: '🥇' },
  2: { bg: 'linear-gradient(135deg,#c0c8d4,#94a3b8)', color: '#1a2233', label: '🥈' },
  3: { bg: 'linear-gradient(135deg,#cd7f32,#b45309)', color: '#2a1200', label: '🥉' },
};

export default function Leaderboard({ data }) {
  if (!data || data.length === 0) return null;

  const userEntry = data.find(u => u.isUser);
  const userRank = userEntry ? data.indexOf(userEntry) + 1 : null;
  const topScore = data[0]?.points || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d5872', marginBottom: '0.35rem' }}>
            Season Rankings
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dde8f5', letterSpacing: '-0.025em' }}>
            🌱 EVH Green League
          </h2>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b',
        }}>
          ⏱ 2 days left
        </div>
      </div>

      {/* Leaderboard list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data.map((user, index) => {
          const rank = index + 1;
          const rankCfg = RANK_CONFIG[rank];
          const pct = Math.round((user.points / topScore) * 100);
          const isUser = user.isUser;

          return (
            <div key={user.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1.1rem',
              background: isUser
                ? 'linear-gradient(135deg, rgba(0,229,160,0.08), rgba(59,130,246,0.06))'
                : '#101f31',
              border: isUser
                ? '1px solid rgba(0,229,160,0.25)'
                : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              transition: 'border-color 0.15s',
            }}>
              {/* Rank badge */}
              <div style={{ width: '32px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                {rankCfg ? (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: rankCfg.bg, color: rankCfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800,
                  }}>
                    {rank}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3d5872' }}>{rank}</span>
                )}
              </div>

              {/* Avatar */}
              <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{user.avatar}</span>

              {/* Name + XP bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{
                    fontSize: '0.875rem', fontWeight: 700,
                    color: isUser ? '#00e5a0' : '#dde8f5',
                  }}>
                    {user.name}
                  </span>
                  {isUser && (
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.45rem',
                      background: 'rgba(0,229,160,0.15)', color: '#00e5a0',
                      borderRadius: '999px', border: '1px solid rgba(0,229,160,0.25)',
                    }}>You</span>
                  )}
                </div>
                {/* XP progress bar */}
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: isUser
                      ? 'linear-gradient(90deg, #00e5a0, #3b82f6)'
                      : 'rgba(255,255,255,0.15)',
                    borderRadius: '999px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: '1rem', fontWeight: 800,
                  color: isUser ? '#00e5a0' : '#dde8f5',
                  letterSpacing: '-0.02em',
                }}>
                  {user.points.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#3d5872', textTransform: 'uppercase', letterSpacing: '0.08em' }}>XP</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Season stats — fills whitespace */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d5872', marginBottom: '0.75rem' }}>
          🏟️ Season Stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
          {[
            { label: 'Total Players', value: data.length, unit: 'competing', color: '#3b82f6' },
            { label: 'Your Rank', value: userRank ? `#${userRank}` : '—', unit: `top ${userRank ? Math.round((userRank / data.length) * 100) : '—'}%`, color: '#00e5a0' },
            { label: 'CO₂ Saved Together', value: `${(data.reduce((s, u) => s + u.points, 0) * 0.12).toFixed(0)} kg`, unit: 'this season', color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#101f31',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3d5872', marginBottom: '0.5rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#3d5872' }}>{stat.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}