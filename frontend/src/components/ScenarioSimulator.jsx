import React, { useState, useMemo } from 'react';

const forecast = [{"timestamp": "2026-06-26 08:00", "price": 97.098717, "carbon": 121.62999}, {"timestamp": "2026-06-26 09:00", "price": 76.996971, "carbon": 112.622177}, {"timestamp": "2026-06-26 10:00", "price": 20.603962, "carbon": 103.260292}, {"timestamp": "2026-06-26 11:00", "price": 2.508318, "carbon": 98.452087}, {"timestamp": "2026-06-26 12:00", "price": -0.200055, "carbon": 97.463112}, {"timestamp": "2026-06-26 13:00", "price": -3.885231, "carbon": 100.189835}, {"timestamp": "2026-06-26 14:00", "price": -6.955832, "carbon": 110.785614}, {"timestamp": "2026-06-26 15:00", "price": -0.68931, "carbon": 165.038177}, {"timestamp": "2026-06-26 16:00", "price": 17.863632, "carbon": 267.683563}, {"timestamp": "2026-06-26 17:00", "price": 66.723648, "carbon": 340.636566}, {"timestamp": "2026-06-26 18:00", "price": 93.348656, "carbon": 382.537079}, {"timestamp": "2026-06-26 19:00", "price": 110.673622, "carbon": 394.158081}, {"timestamp": "2026-06-26 20:00", "price": 121.117165, "carbon": 397.360291}, {"timestamp": "2026-06-26 21:00", "price": 108.960083, "carbon": 393.416168}, {"timestamp": "2026-06-26 22:00", "price": 100.256622, "carbon": 385.910614}, {"timestamp": "2026-06-26 23:00", "price": 88.757858, "carbon": 374.081482}, {"timestamp": "2026-06-27 00:00", "price": 83.340759, "carbon": 363.296997}, {"timestamp": "2026-06-27 01:00", "price": 75.526031, "carbon": 355.296234}, {"timestamp": "2026-06-27 02:00", "price": 72.469032, "carbon": 347.398743}, {"timestamp": "2026-06-27 03:00", "price": 72.562973, "carbon": 340.633331}, {"timestamp": "2026-06-27 04:00", "price": 74.785339, "carbon": 306.662201}, {"timestamp": "2026-06-27 05:00", "price": 77.103683, "carbon": 246.98555}, {"timestamp": "2026-06-27 06:00", "price": 79.180893, "carbon": 171.089249}, {"timestamp": "2026-06-27 07:00", "price": 71.238075, "carbon": 113.757698}, {"timestamp": "2026-06-27 08:00", "price": 43.958206, "carbon": 93.419426}, {"timestamp": "2026-06-27 09:00", "price": 2.327619, "carbon": 85.26915}, {"timestamp": "2026-06-27 10:00", "price": -3.336973, "carbon": 80.164978}, {"timestamp": "2026-06-27 11:00", "price": -13.388379, "carbon": 77.817558}, {"timestamp": "2026-06-27 12:00", "price": -25.685293, "carbon": 76.962204}, {"timestamp": "2026-06-27 13:00", "price": -47.488045, "carbon": 79.437706}, {"timestamp": "2026-06-27 14:00", "price": -75.616478, "carbon": 88.574677}, {"timestamp": "2026-06-27 15:00", "price": -50.987053, "carbon": 116.616264}, {"timestamp": "2026-06-27 16:00", "price": -18.068947, "carbon": 189.628372}, {"timestamp": "2026-06-27 17:00", "price": 16.999243, "carbon": 297.076599}, {"timestamp": "2026-06-27 18:00", "price": 82.324226, "carbon": 357.382355}, {"timestamp": "2026-06-27 19:00", "price": 104.869804, "carbon": 373.879364}, {"timestamp": "2026-06-27 20:00", "price": 120.743019, "carbon": 391.155273}, {"timestamp": "2026-06-27 21:00", "price": 112.057854, "carbon": 404.5112}, {"timestamp": "2026-06-27 22:00", "price": 101.322876, "carbon": 416.862396}, {"timestamp": "2026-06-27 23:00", "price": 92.247658, "carbon": 425.474762}, {"timestamp": "2026-06-28 00:00", "price": 90.66684, "carbon": 426.137817}, {"timestamp": "2026-06-28 01:00", "price": 83.687042, "carbon": 422.868835}, {"timestamp": "2026-06-28 02:00", "price": 82.155899, "carbon": 421.401093}, {"timestamp": "2026-06-28 03:00", "price": 83.191666, "carbon": 417.798828}, {"timestamp": "2026-06-28 04:00", "price": 85.34845, "carbon": 373.678101}, {"timestamp": "2026-06-28 05:00", "price": 87.139351, "carbon": 299.756714}, {"timestamp": "2026-06-28 06:00", "price": 85.308395, "carbon": 203.001389}, {"timestamp": "2026-06-28 07:00", "price": 76.201973, "carbon": 135.354797}, {"timestamp": "2026-06-28 08:00", "price": 53.026352, "carbon": 102.867142}, {"timestamp": "2026-06-28 09:00", "price": 7.165062, "carbon": 94.323883}, {"timestamp": "2026-06-28 10:00", "price": 1.127714, "carbon": 91.067268}, {"timestamp": "2026-06-28 11:00", "price": -4.097064, "carbon": 90.444679}, {"timestamp": "2026-06-28 12:00", "price": -15.003111, "carbon": 92.544632}, {"timestamp": "2026-06-28 13:00", "price": -33.009354, "carbon": 100.752106}, {"timestamp": "2026-06-28 14:00", "price": -33.643864, "carbon": 120.678406}, {"timestamp": "2026-06-28 15:00", "price": -22.343977, "carbon": 183.421829}, {"timestamp": "2026-06-28 16:00", "price": -9.359306, "carbon": 285.999817}, {"timestamp": "2026-06-28 17:00", "price": 19.994921, "carbon": 367.292603}, {"timestamp": "2026-06-28 18:00", "price": 81.106293, "carbon": 408.568298}, {"timestamp": "2026-06-28 19:00", "price": 105.100182, "carbon": 421.676514}, {"timestamp": "2026-06-28 20:00", "price": 115.274818, "carbon": 420.261566}, {"timestamp": "2026-06-28 21:00", "price": 103.996063, "carbon": 417.741669}, {"timestamp": "2026-06-28 22:00", "price": 95.975853, "carbon": 414.751038}, {"timestamp": "2026-06-28 23:00", "price": 88.776192, "carbon": 414.815002}, {"timestamp": "2026-06-29 00:00", "price": 86.048347, "carbon": 416.013763}, {"timestamp": "2026-06-29 01:00", "price": 81.775406, "carbon": 418.811035}, {"timestamp": "2026-06-29 02:00", "price": 81.002541, "carbon": 418.423615}, {"timestamp": "2026-06-29 03:00", "price": 82.308731, "carbon": 413.309479}, {"timestamp": "2026-06-29 04:00", "price": 87.632225, "carbon": 375.605896}, {"timestamp": "2026-06-29 05:00", "price": 95.624092, "carbon": 329.647888}, {"timestamp": "2026-06-29 06:00", "price": 108.028328, "carbon": 267.388763}, {"timestamp": "2026-06-29 07:00", "price": 107.984024, "carbon": 199.088364}, {"timestamp": "2026-06-29 08:00", "price": 97.038857, "carbon": 145.896561}, {"timestamp": "2026-06-29 09:00", "price": 80.937248, "carbon": 128.553558}, {"timestamp": "2026-06-29 10:00", "price": 52.565487, "carbon": 120.591835}, {"timestamp": "2026-06-29 11:00", "price": 18.601547, "carbon": 120.291351}, {"timestamp": "2026-06-29 12:00", "price": 11.111277, "carbon": 124.700043}, {"timestamp": "2026-06-29 13:00", "price": 8.706982, "carbon": 136.067169}, {"timestamp": "2026-06-29 14:00", "price": 17.651697, "carbon": 170.228638}, {"timestamp": "2026-06-29 15:00", "price": 39.21526, "carbon": 260.964355}, {"timestamp": "2026-06-29 16:00", "price": 66.701027, "carbon": 350.04129}, {"timestamp": "2026-06-29 17:00", "price": 85.196754, "carbon": 403.798096}, {"timestamp": "2026-06-29 18:00", "price": 100.732971, "carbon": 433.546539}, {"timestamp": "2026-06-29 19:00", "price": 118.388885, "carbon": 444.014984}, {"timestamp": "2026-06-29 20:00", "price": 150.302338, "carbon": 446.573608}, {"timestamp": "2026-06-29 21:00", "price": 139.923111, "carbon": 445.297821}, {"timestamp": "2026-06-29 22:00", "price": 109.258759, "carbon": 446.731476}, {"timestamp": "2026-06-29 23:00", "price": 95.418144, "carbon": 454.845947}, {"timestamp": "2026-06-30 00:00", "price": 93.231567, "carbon": 467.030212}, {"timestamp": "2026-06-30 01:00", "price": 87.137428, "carbon": 477.298737}, {"timestamp": "2026-06-30 02:00", "price": 83.989113, "carbon": 481.406769}, {"timestamp": "2026-06-30 03:00", "price": 84.057671, "carbon": 483.143311}, {"timestamp": "2026-06-30 04:00", "price": 89.378426, "carbon": 432.390778}, {"timestamp": "2026-06-30 05:00", "price": 100.026314, "carbon": 358.034882}, {"timestamp": "2026-06-30 06:00", "price": 110.653931, "carbon": 284.574707}, {"timestamp": "2026-06-30 07:00", "price": 113.309982, "carbon": 215.862823}, {"timestamp": "2026-06-30 08:00", "price": 102.894035, "carbon": 171.199432}, {"timestamp": "2026-06-30 09:00", "price": 85.350281, "carbon": 153.354965}, {"timestamp": "2026-06-30 10:00", "price": 64.461655, "carbon": 149.65686}, {"timestamp": "2026-06-30 11:00", "price": 37.561634, "carbon": 149.309753}, {"timestamp": "2026-06-30 12:00", "price": 28.948351, "carbon": 157.863037}, {"timestamp": "2026-06-30 13:00", "price": 26.04213, "carbon": 186.499802}, {"timestamp": "2026-06-30 14:00", "price": 39.689732, "carbon": 257.147736}, {"timestamp": "2026-06-30 15:00", "price": 60.792801, "carbon": 345.423004}, {"timestamp": "2026-06-30 16:00", "price": 76.4086, "carbon": 415.046265}, {"timestamp": "2026-06-30 17:00", "price": 87.5616, "carbon": 456.467621}, {"timestamp": "2026-06-30 18:00", "price": 103.86187, "carbon": 483.213257}, {"timestamp": "2026-06-30 19:00", "price": 137.969681, "carbon": 493.564148}, {"timestamp": "2026-06-30 20:00", "price": 206.092194, "carbon": 493.970001}, {"timestamp": "2026-06-30 21:00", "price": 156.06488, "carbon": 503.856171}, {"timestamp": "2026-06-30 22:00", "price": 116.135788, "carbon": 510.481628}, {"timestamp": "2026-06-30 23:00", "price": 97.037094, "carbon": 514.628052}, {"timestamp": "2026-07-01 00:00", "price": 93.964348, "carbon": 521.394653}, {"timestamp": "2026-07-01 01:00", "price": 86.693062, "carbon": 527.895325}, {"timestamp": "2026-07-01 02:00", "price": 84.653603, "carbon": 525.514526}, {"timestamp": "2026-07-01 03:00", "price": 84.979744, "carbon": 518.600281}, {"timestamp": "2026-07-01 04:00", "price": 88.942123, "carbon": 467.118134}, {"timestamp": "2026-07-01 05:00", "price": 98.482597, "carbon": 404.839722}, {"timestamp": "2026-07-01 06:00", "price": 107.46698, "carbon": 315.858276}, {"timestamp": "2026-07-01 07:00", "price": 104.427933, "carbon": 234.449203}, {"timestamp": "2026-07-01 08:00", "price": 94.459938, "carbon": 172.486465}, {"timestamp": "2026-07-01 09:00", "price": 83.454247, "carbon": 148.777206}, {"timestamp": "2026-07-01 10:00", "price": 68.813049, "carbon": 148.878494}, {"timestamp": "2026-07-01 11:00", "price": 43.745831, "carbon": 150.818604}, {"timestamp": "2026-07-01 12:00", "price": 28.969614, "carbon": 158.992508}, {"timestamp": "2026-07-01 13:00", "price": 22.023561, "carbon": 184.365265}, {"timestamp": "2026-07-01 14:00", "price": 29.542719, "carbon": 243.425751}, {"timestamp": "2026-07-01 15:00", "price": 56.067162, "carbon": 333.694244}, {"timestamp": "2026-07-01 16:00", "price": 68.774017, "carbon": 408.962738}, {"timestamp": "2026-07-01 17:00", "price": 82.037415, "carbon": 456.201141}, {"timestamp": "2026-07-01 18:00", "price": 98.028877, "carbon": 483.820679}, {"timestamp": "2026-07-01 19:00", "price": 130.714218, "carbon": 491.94104}, {"timestamp": "2026-07-01 20:00", "price": 191.466156, "carbon": 494.311005}, {"timestamp": "2026-07-01 21:00", "price": 163.874619, "carbon": 509.299774}, {"timestamp": "2026-07-01 22:00", "price": 121.493019, "carbon": 524.375793}, {"timestamp": "2026-07-01 23:00", "price": 99.710022, "carbon": 536.275085}, {"timestamp": "2026-07-02 00:00", "price": 93.928596, "carbon": 541.239136}, {"timestamp": "2026-07-02 01:00", "price": 87.854004, "carbon": 537.837097}, {"timestamp": "2026-07-02 02:00", "price": 85.923111, "carbon": 533.382629}, {"timestamp": "2026-07-02 03:00", "price": 86.275429, "carbon": 522.171204}, {"timestamp": "2026-07-02 04:00", "price": 89.97628, "carbon": 469.524414}, {"timestamp": "2026-07-02 05:00", "price": 97.954575, "carbon": 403.522888}, {"timestamp": "2026-07-02 06:00", "price": 106.647606, "carbon": 310.549255}, {"timestamp": "2026-07-02 07:00", "price": 105.80127, "carbon": 208.269974}, {"timestamp": "2026-07-02 08:00", "price": 94.729408, "carbon": 144.776123}, {"timestamp": "2026-07-02 09:00", "price": 83.750443, "carbon": 128.770035}, {"timestamp": "2026-07-02 10:00", "price": 63.520206, "carbon": 126.573479}, {"timestamp": "2026-07-02 11:00", "price": 33.588665, "carbon": 123.944618}, {"timestamp": "2026-07-02 12:00", "price": 14.724659, "carbon": 127.360115}, {"timestamp": "2026-07-02 13:00", "price": 10.261389, "carbon": 134.594666}, {"timestamp": "2026-07-02 14:00", "price": 17.323414, "carbon": 164.737061}, {"timestamp": "2026-07-02 15:00", "price": 37.006012, "carbon": 247.325272}, {"timestamp": "2026-07-02 16:00", "price": 62.32806, "carbon": 341.469666}, {"timestamp": "2026-07-02 17:00", "price": 80.386299, "carbon": 405.253937}, {"timestamp": "2026-07-02 18:00", "price": 95.535744, "carbon": 439.351776}, {"timestamp": "2026-07-02 19:00", "price": 110.433777, "carbon": 453.791687}, {"timestamp": "2026-07-02 20:00", "price": 126.010834, "carbon": 458.18399}, {"timestamp": "2026-07-02 21:00", "price": 111.345268, "carbon": 462.283112}, {"timestamp": "2026-07-02 22:00", "price": 101.648422, "carbon": 467.316132}, {"timestamp": "2026-07-02 23:00", "price": 92.841103, "carbon": 472.544525}, {"timestamp": "2026-07-03 00:00", "price": 90.11673, "carbon": 477.051483}, {"timestamp": "2026-07-03 01:00", "price": 85.137794, "carbon": 479.885681}, {"timestamp": "2026-07-03 02:00", "price": 83.830185, "carbon": 482.991302}, {"timestamp": "2026-07-03 03:00", "price": 83.687798, "carbon": 480.778076}, {"timestamp": "2026-07-03 04:00", "price": 88.320419, "carbon": 440.957794}, {"timestamp": "2026-07-03 05:00", "price": 96.485046, "carbon": 383.446991}, {"timestamp": "2026-07-03 06:00", "price": 105.931488, "carbon": 313.317047}];

const S = {
  wrap: {
    display: 'flex', flexDirection: 'column', gap: '1.25rem',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    marginBottom: '0.25rem',
  },
  headerTitle: {
    fontSize: '1.1rem', fontWeight: 800, color: '#dde8f5', letterSpacing: '-0.02em',
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.875rem',
  },
  controlCard: {
    background: '#101f31',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '1rem 1.1rem',
  },
  controlLabel: {
    display: 'block', marginBottom: '0.55rem',
    fontSize: '0.68rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#3d5872',
  },
  select: {
    width: '100%', padding: '0.5rem 0.7rem',
    background: '#07111d', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '7px', color: '#dde8f5',
    fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
    outline: 'none', cursor: 'pointer',
    marginBottom: '0.5rem',
  },
  rangeRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.68rem', color: '#3d5872', marginTop: '0.35rem',
  },
  resultBanner: {
    background: 'linear-gradient(135deg, rgba(0,229,160,0.12), rgba(59,130,246,0.08))',
    border: '1px solid rgba(0,229,160,0.22)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  resultTitle: {
    fontSize: '0.62rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.12em',
    color: '#3d5872', marginBottom: '0.4rem',
  },
  resultShift: {
    fontSize: '1.5rem', fontWeight: 800,
    color: '#00e5a0', letterSpacing: '-0.025em', marginBottom: '0.25rem',
  },
  resultSub: {
    fontSize: '0.82rem', color: '#7a9ab8', marginBottom: '1.25rem',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem',
  },
  statCard: (positive) => ({
    background: positive ? 'rgba(0,229,160,0.08)' : 'rgba(248,113,113,0.08)',
    border: `1px solid ${positive ? 'rgba(0,229,160,0.2)' : 'rgba(248,113,113,0.2)'}`,
    borderRadius: '10px', padding: '1rem 1.25rem',
  }),
  statLabel: {
    fontSize: '0.62rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#3d5872', marginBottom: '0.4rem',
  },
  statValue: (positive, color) => ({
    fontSize: '1.6rem', fontWeight: 800,
    color: color || (positive ? '#00e5a0' : '#f87171'),
    letterSpacing: '-0.025em', lineHeight: 1,
  }),
  projectionGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem',
  },
  projCard: {
    background: '#101f31',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', padding: '1.25rem',
    textAlign: 'center',
  },
  projLabel: {
    fontSize: '0.6rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#3d5872', marginBottom: '0.5rem',
  },
  projValue: (color) => ({
    fontSize: '1.4rem', fontWeight: 800,
    color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.25rem',
  }),
  projSub: { fontSize: '0.7rem', color: '#3d5872' },
};

export default function ScenarioSimulator() {
  const [annualConsumption, setAnnualConsumption] = useState(3500);
  const [selectedDate, setSelectedDate] = useState(forecast[0].timestamp.slice(0, 10));
  const [selectedHour, setSelectedHour] = useState("18");
  const [direction, setDirection] = useState("both");
  const [timeWindow, setTimeWindow] = useState(2);
  const [priority, setPriority] = useState(50);

  const flexibleRatio = 0.50;
  const retailAdderEurPerKwh = 0.22;

  const availableDates = [...new Set(forecast.map(row => row.timestamp.slice(0, 10)))];
  const availableHours = forecast
    .filter(row => row.timestamp.startsWith(selectedDate))
    .map(row => row.timestamp.slice(11, 13));

  const results = useMemo(() => {
    const selectedTimestamp = `${selectedDate} ${selectedHour}:00`;
    let selectedIndex = forecast.findIndex(row => row.timestamp === selectedTimestamp);
    if (selectedIndex === -1) selectedIndex = 0;
    const current = forecast[selectedIndex];
    const flexibleAnnualEnergy = annualConsumption * flexibleRatio;
    const carbonPriority = priority / 100;
    const costPriority = 1 - carbonPriority;
    let startIndex = selectedIndex, endIndex = selectedIndex;
    if (direction === "earlier") startIndex = Math.max(0, selectedIndex - timeWindow);
    else if (direction === "later") endIndex = Math.min(forecast.length - 1, selectedIndex + timeWindow);
    else { startIndex = Math.max(0, selectedIndex - timeWindow); endIndex = Math.min(forecast.length - 1, selectedIndex + timeWindow); }
    const candidates = forecast.slice(startIndex, endIndex + 1);
    const candidatesWithImpact = candidates.map(candidate => {
      const currentCost = flexibleAnnualEnergy * Math.max(0, current.price / 1000 + retailAdderEurPerKwh);
      const candidateCost = flexibleAnnualEnergy * Math.max(0, candidate.price / 1000 + retailAdderEurPerKwh);
      const costSaving = currentCost - candidateCost;
      const carbonReductionKg = (flexibleAnnualEnergy * current.carbon / 1000) - (flexibleAnnualEnergy * candidate.carbon / 1000);
      return { ...candidate, costSaving, carbonReductionKg };
    });
    const prices = candidatesWithImpact.map(c => c.price);
    const carbons = candidatesWithImpact.map(c => c.carbon);
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const minC = Math.min(...carbons), maxC = Math.max(...carbons);
    const normalize = (val, min, max) => (max === min ? 0 : (val - min) / (max - min));
    let best = candidatesWithImpact[0], bestUtility = -Infinity;
    candidatesWithImpact.forEach(candidate => {
      const utility = (costPriority * (1 - normalize(candidate.price, minP, maxP))) + (carbonPriority * (1 - normalize(candidate.carbon, minC, maxC)));
      if (utility > bestUtility) { bestUtility = utility; best = candidate; }
    });
    return { current, best };
  }, [annualConsumption, selectedDate, selectedHour, direction, timeWindow, priority]);

  const costPos = results.best.costSaving > 0;
  const carbonPos = results.best.carbonReductionKg > 0;

  const priorityLabel = priority < 33 ? '💰 Cost' : priority > 66 ? '🌱 Carbon' : '⚖️ Balanced';

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <span style={{ fontSize: '1.4rem' }}>🔮</span>
        <span style={S.headerTitle}>Shift Simulator</span>
      </div>

      {/* Controls */}
      <div style={S.controlsGrid}>
        {/* Start Time */}
        <div style={S.controlCard}>
          <label style={S.controlLabel}>Start Time</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...S.select, flex: 2, marginBottom: 0 }}>
              {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={selectedHour} onChange={e => setSelectedHour(e.target.value)} style={{ ...S.select, flex: 1, marginBottom: 0 }}>
              {availableHours.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
        </div>

        {/* Flexibility */}
        <div style={S.controlCard}>
          <label style={S.controlLabel}>Flexibility Window</label>
          <select value={direction} onChange={e => setDirection(e.target.value)} style={S.select}>
            <option value="both">± Earlier &amp; Later</option>
            <option value="earlier">- Earlier Only</option>
            <option value="later">+ Later Only</option>
          </select>
          <select value={timeWindow} onChange={e => setTimeWindow(Number(e.target.value))} style={{ ...S.select, marginBottom: 0 }}>
            <option value={2}>2 Hours</option>
            <option value={4}>4 Hours</option>
            <option value={8}>8 Hours</option>
          </select>
        </div>

        {/* Consumption */}
        <div style={S.controlCard}>
          <label style={S.controlLabel}>Annual Consumption — {annualConsumption.toLocaleString()} kWh</label>
          <input type="range" min="500" max="10000" step="100" value={annualConsumption}
            onChange={e => setAnnualConsumption(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00e5a0', cursor: 'pointer' }} />
          <div style={S.rangeRow}><span>500 kWh</span><span>10,000 kWh</span></div>
        </div>

        {/* Priority */}
        <div style={S.controlCard}>
          <label style={S.controlLabel}>Optimise for — {priorityLabel}</label>
          <input type="range" min="0" max="100" value={priority}
            onChange={e => setPriority(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00e5a0', cursor: 'pointer' }} />
          <div style={S.rangeRow}><span>💰 Cost</span><span>🌱 Carbon</span></div>
        </div>
      </div>

      {/* Result banner */}
      <div style={S.resultBanner}>
        <div style={S.resultTitle}>Optimal Shift Found</div>
        <div style={S.resultShift}>
          {results.current.timestamp.slice(11, 16)} → {results.best.timestamp.slice(11, 16)}
        </div>
        <div style={S.resultSub}>
          Shift your flexible load from {results.current.timestamp.slice(11, 16)} to {results.best.timestamp.slice(11, 16)} to maximise your impact.
        </div>
        <div style={S.statsRow}>
          <div style={S.statCard(costPos)}>
            <div style={S.statLabel}>Annual Savings</div>
            <div style={S.statValue(costPos)}>
              {costPos ? '+' : ''}€{results.best.costSaving.toFixed(2)}
            </div>
          </div>
          <div style={S.statCard(carbonPos)}>
            <div style={S.statLabel}>Carbon Reduction</div>
            <div style={S.statValue(carbonPos, carbonPos ? '#00e5a0' : '#f87171')}>
              {carbonPos ? '-' : '+'}{Math.abs(results.best.carbonReductionKg / 1000).toFixed(2)} tCO₂
            </div>
          </div>
        </div>
      </div>

      {/* Projection row — fills whitespace */}
      <div>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d5872', marginBottom: '0.75rem' }}>
          📈 Projected Impact if You Act
        </div>
        <div style={S.projectionGrid}>
          <div style={S.projCard}>
            <div style={S.projLabel}>Weekly</div>
            <div style={S.projValue('#3b82f6')}>
              €{Math.abs(results.best.costSaving / 52).toFixed(2)}
            </div>
            <div style={S.projSub}>saved per week</div>
            <div style={{ marginTop: '0.75rem', ...S.projValue('#00e5a0'), fontSize: '1rem' }}>
              {Math.abs(results.best.carbonReductionKg / 52).toFixed(1)} kg
            </div>
            <div style={S.projSub}>CO₂ per week</div>
          </div>
          <div style={S.projCard}>
            <div style={S.projLabel}>Monthly</div>
            <div style={S.projValue('#3b82f6')}>
              €{Math.abs(results.best.costSaving / 12).toFixed(2)}
            </div>
            <div style={S.projSub}>saved per month</div>
            <div style={{ marginTop: '0.75rem', ...S.projValue('#00e5a0'), fontSize: '1rem' }}>
              {Math.abs(results.best.carbonReductionKg / 12).toFixed(1)} kg
            </div>
            <div style={S.projSub}>CO₂ per month</div>
          </div>
          <div style={S.projCard}>
            <div style={S.projLabel}>Annual</div>
            <div style={S.projValue('#3b82f6')}>
              €{Math.abs(results.best.costSaving).toFixed(2)}
            </div>
            <div style={S.projSub}>saved per year</div>
            <div style={{ marginTop: '0.75rem', ...S.projValue('#00e5a0'), fontSize: '1rem' }}>
              {Math.abs(results.best.carbonReductionKg).toFixed(0)} kg
            </div>
            <div style={S.projSub}>CO₂ per year</div>
          </div>
        </div>
      </div>
    </div>
  );
}