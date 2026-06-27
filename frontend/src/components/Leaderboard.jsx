import React, { useMemo } from 'react';

const RANK_CONFIG = {
  1: { bg: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#FFFFFF', label: '🥇' },
  2: { bg: 'linear-gradient(135deg,#94A3B8,#64748B)', color: '#FFFFFF', label: '🥈' },
  3: { bg: 'linear-gradient(135deg,#CD7F32,#B45309)', color: '#FFFFFF', label: '🥉' },
};

export default function Leaderboard({ formData, postcodeData, challengeAccepted }) {
  const annualHeatingBill = Number(formData.annualHeatingBill) || 0;
  const electricityBill = Number(formData.electricityBill) || 0;
  const householdSize = Number(formData.householdSize) || 1;
  const zone = postcodeData?.zone || null;

  const sortedLeaderboard = useMemo(() => {
    // 1. Calculate Dula's emissions and footprint reductions
    const baseHeating = annualHeatingBill * 2.5;
    const baseElectricity = electricityBill * 12 * 0.35;
    const baseEmissions = Math.max(100, baseHeating + baseElectricity);

    let heatingEmissions = baseHeating;
    if (zone === 'connected') {
      heatingEmissions = baseHeating * 0.25; // 75% savings
    } else if (zone === 'planned') {
      heatingEmissions = baseHeating * 0.40; // 60% savings
    } else if (zone === 'individual') {
      heatingEmissions = baseHeating * 0.55; // 45% savings
    }

    const challengeBonus = challengeAccepted ? 150 : 0;
    const electricityEmissions = Math.max(0, baseElectricity - (electricityBill * 12 * 0.18 + challengeBonus));
    
    const behaviourReduction = householdSize >= 4 ? 650 : householdSize >= 2 ? 380 : 100;
    
    const userEmissions = Math.round(Math.max(100, heatingEmissions + electricityEmissions - behaviourReduction));
    const userSavings = Math.round(Math.max(0, baseEmissions - userEmissions));
    const userPct = Math.round((userSavings / baseEmissions) * 100);

    // 2. Define standard benchmark for competitors (based on household size)
    const avgHeatingPerPerson = 1000; 
    const avgElectricityPerPerson = 400;
    const standardBase = householdSize * (avgHeatingPerPerson + avgElectricityPerPerson);

    const competitors = [
      {
        id: 'u1',
        name: "An",
        emissions: Math.round(standardBase * 0.30), // 70% efficiency
        savings: Math.round(standardBase * 0.70),
        pct: 70,
        avatar: "👩🏻💻"
      },
      {
        id: 'u2',
        name: "Nikki",
        emissions: Math.round(standardBase * 0.42), // 58% efficiency
        savings: Math.round(standardBase * 0.58),
        pct: 58,
        avatar: "👩🏻"
      },
      {
        id: 'u3',
        name: "Sophie",
        emissions: Math.round(standardBase * 0.55), // 45% efficiency
        savings: Math.round(standardBase * 0.45),
        pct: 45,
        avatar: "👩🏼"
      },
      {
        id: 'u4',
        name: "Dula (You)",
        emissions: userEmissions,
        savings: userSavings,
        pct: userPct,
        avatar: "😎",
        isUser: true
      },
      {
        id: 'u5',
        name: "Felix",
        emissions: Math.round(standardBase * 0.75), // 25% efficiency
        savings: Math.round(standardBase * 0.25),
        pct: 25,
        avatar: "👨🏻"
      },
      {
        id: 'u6',
        name: "Lena",
        emissions: Math.round(standardBase * 0.88), // 12% efficiency
        savings: Math.round(standardBase * 0.12),
        pct: 12,
        avatar: "👧🏽"
      },
    ];

    // Sort ascending by emissions (lowest carbon footprint first)
    return competitors.sort((a, b) => a.emissions - b.emissions);
  }, [annualHeatingBill, electricityBill, householdSize, zone, challengeAccepted]);

  const userEntry = sortedLeaderboard.find(u => u.isUser);
  const userRank  = userEntry ? sortedLeaderboard.indexOf(userEntry) + 1 : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', marginBottom: '0.35rem' }}>
            Season Rankings
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#020617', letterSpacing: '-0.025em' }}>
            🌱 EVH Green League
          </h2>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          background: '#FFFBEB', border: '1px solid rgba(217,119,6,0.25)',
          borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: '#D97706',
        }}>
          ⏱ 2 days left
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sortedLeaderboard.map((user, index) => {
          const rank   = index + 1;
          const rankCfg = RANK_CONFIG[rank];
          const isUser = user.isUser;

          return (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.875rem 1.1rem',
              background: isUser ? '#EFF6FF' : '#FFFFFF',
              border: isUser ? '1px solid #DBEAFE' : '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}>

              {/* Rank badge */}
              <div style={{ width: '32px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                {rankCfg ? (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: rankCfg.bg, color: rankCfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800,
                    boxShadow: '0 1px 4px rgba(15,23,42,0.12)',
                  }}>
                    {rank}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{rank}</span>
                )}
              </div>

              {/* Avatar */}
              <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{user.avatar}</span>

              {/* Name + progress bar representing reduction efficiency */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isUser ? '#1B4FBB' : '#020617' }}>
                    {user.name}
                  </span>
                  {isUser && (
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.45rem',
                      background: '#EFF6FF', color: '#1B4FBB',
                      borderRadius: '999px', border: '1px solid #DBEAFE',
                    }}>You</span>
                  )}
                </div>
                <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${user.pct}%`,
                    background: isUser ? 'linear-gradient(90deg, #1B4FBB, #3B82F6)' : '#E2E8F0',
                    borderRadius: '999px', transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              {/* Score (Remaining Footprint + Saved reduction percentage) */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: isUser ? '#1B4FBB' : '#020617', letterSpacing: '-0.02em' }}>
                  {user.emissions.toLocaleString()} kgCO2
                </div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>
                  -{user.pct}% Saved
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Season stats */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', marginBottom: '0.75rem' }}>
          🏟️ Season Stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
          {[
            { label: 'Total Players',      value: sortedLeaderboard.length,                                                     unit: 'competing',     color: '#1B4FBB' },
            { label: 'Your Rank',          value: userRank ? `#${userRank}` : '—',                                             unit: userRank ? `top ${Math.round((userRank / sortedLeaderboard.length) * 100)}%` : '—', color: '#1B4FBB' },
            { label: 'CO₂ Saved Together', value: `${sortedLeaderboard.reduce((s, u) => s + u.savings, 0).toLocaleString()} kgCO2`, unit: 'this season',   color: '#16A34A' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '12px', padding: '1.1rem 1.25rem', textAlign: 'center',
              boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.5rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1E293B' }}>{stat.unit}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}