import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, LineChart, Legend
} from 'recharts';

// ─── Forecast data ────────────────────────────────────────────────────────────
const forecast = [{"timestamp": "2026-06-26 08:00", "price": 97.098717, "carbon": 121.62999}, {"timestamp": "2026-06-26 09:00", "price": 76.996971, "carbon": 112.622177}, {"timestamp": "2026-06-26 10:00", "price": 20.603962, "carbon": 103.260292}, {"timestamp": "2026-06-26 11:00", "price": 2.508318, "carbon": 98.452087}, {"timestamp": "2026-06-26 12:00", "price": -0.200055, "carbon": 97.463112}, {"timestamp": "2026-06-26 13:00", "price": -3.885231, "carbon": 100.189835}, {"timestamp": "2026-06-26 14:00", "price": -6.955832, "carbon": 110.785614}, {"timestamp": "2026-06-26 15:00", "price": -0.68931, "carbon": 165.038177}, {"timestamp": "2026-06-26 16:00", "price": 17.863632, "carbon": 267.683563}, {"timestamp": "2026-06-26 17:00", "price": 66.723648, "carbon": 340.636566}, {"timestamp": "2026-06-26 18:00", "price": 93.348656, "carbon": 382.537079}, {"timestamp": "2026-06-26 19:00", "price": 110.673622, "carbon": 394.158081}, {"timestamp": "2026-06-26 20:00", "price": 121.117165, "carbon": 397.360291}, {"timestamp": "2026-06-26 21:00", "price": 108.960083, "carbon": 393.416168}, {"timestamp": "2026-06-26 22:00", "price": 100.256622, "carbon": 385.910614}, {"timestamp": "2026-06-26 23:00", "price": 88.757858, "carbon": 374.081482}, {"timestamp": "2026-06-27 00:00", "price": 83.340759, "carbon": 363.296997}, {"timestamp": "2026-06-27 01:00", "price": 75.526031, "carbon": 355.296234}, {"timestamp": "2026-06-27 02:00", "price": 72.469032, "carbon": 347.398743}, {"timestamp": "2026-06-27 03:00", "price": 72.562973, "carbon": 340.633331}, {"timestamp": "2026-06-27 04:00", "price": 74.785339, "carbon": 306.662201}, {"timestamp": "2026-06-27 05:00", "price": 77.103683, "carbon": 246.98555}, {"timestamp": "2026-06-27 06:00", "price": 79.180893, "carbon": 171.089249}, {"timestamp": "2026-06-27 07:00", "price": 71.238075, "carbon": 113.757698}, {"timestamp": "2026-06-27 08:00", "price": 43.958206, "carbon": 93.419426}, {"timestamp": "2026-06-27 09:00", "price": 2.327619, "carbon": 85.26915}, {"timestamp": "2026-06-27 10:00", "price": -3.336973, "carbon": 80.164978}, {"timestamp": "2026-06-27 11:00", "price": -13.388379, "carbon": 77.817558}, {"timestamp": "2026-06-27 12:00", "price": -25.685293, "carbon": 76.962204}, {"timestamp": "2026-06-27 13:00", "price": -47.488045, "carbon": 79.437706}, {"timestamp": "2026-06-27 14:00", "price": -75.616478, "carbon": 88.574677}, {"timestamp": "2026-06-27 15:00", "price": -50.987053, "carbon": 116.616264}, {"timestamp": "2026-06-27 16:00", "price": -18.068947, "carbon": 189.628372}, {"timestamp": "2026-06-27 17:00", "price": 16.999243, "carbon": 297.076599}, {"timestamp": "2026-06-27 18:00", "price": 82.324226, "carbon": 357.382355}, {"timestamp": "2026-06-27 19:00", "price": 104.869804, "carbon": 373.879364}, {"timestamp": "2026-06-27 20:00", "price": 120.743019, "carbon": 391.155273}, {"timestamp": "2026-06-27 21:00", "price": 112.057854, "carbon": 404.5112}, {"timestamp": "2026-06-27 22:00", "price": 101.322876, "carbon": 416.862396}, {"timestamp": "2026-06-27 23:00", "price": 92.247658, "carbon": 425.474762}, {"timestamp": "2026-06-28 00:00", "price": 90.66684, "carbon": 426.137817}, {"timestamp": "2026-06-28 01:00", "price": 83.687042, "carbon": 422.868835}, {"timestamp": "2026-06-28 02:00", "price": 82.155899, "carbon": 421.401093}, {"timestamp": "2026-06-28 03:00", "price": 83.191666, "carbon": 417.798828}, {"timestamp": "2026-06-28 04:00", "price": 85.34845, "carbon": 373.678101}, {"timestamp": "2026-06-28 05:00", "price": 87.139351, "carbon": 299.756714}, {"timestamp": "2026-06-28 06:00", "price": 85.308395, "carbon": 203.001389}, {"timestamp": "2026-06-28 07:00", "price": 76.201973, "carbon": 135.354797}, {"timestamp": "2026-06-28 08:00", "price": 53.026352, "carbon": 102.867142}, {"timestamp": "2026-06-28 09:00", "price": 7.165062, "carbon": 94.323883}, {"timestamp": "2026-06-28 10:00", "price": 1.127714, "carbon": 91.067268}, {"timestamp": "2026-06-28 11:00", "price": -4.097064, "carbon": 90.444679}, {"timestamp": "2026-06-28 12:00", "price": -15.003111, "carbon": 92.544632}, {"timestamp": "2026-06-28 13:00", "price": -33.009354, "carbon": 100.752106}, {"timestamp": "2026-06-28 14:00", "price": -33.643864, "carbon": 120.678406}, {"timestamp": "2026-06-28 15:00", "price": -22.343977, "carbon": 183.421829}, {"timestamp": "2026-06-28 16:00", "price": -9.359306, "carbon": 285.999817}, {"timestamp": "2026-06-28 17:00", "price": 19.994921, "carbon": 367.292603}, {"timestamp": "2026-06-28 18:00", "price": 81.106293, "carbon": 408.568298}, {"timestamp": "2026-06-28 19:00", "price": 105.100182, "carbon": 421.676514}, {"timestamp": "2026-06-28 20:00", "price": 115.274818, "carbon": 420.261566}, {"timestamp": "2026-06-28 21:00", "price": 103.996063, "carbon": 417.741669}, {"timestamp": "2026-06-28 22:00", "price": 95.975853, "carbon": 414.751038}, {"timestamp": "2026-06-28 23:00", "price": 88.776192, "carbon": 414.815002}, {"timestamp": "2026-06-29 00:00", "price": 86.048347, "carbon": 416.013763}, {"timestamp": "2026-06-29 01:00", "price": 81.775406, "carbon": 418.811035}, {"timestamp": "2026-06-29 02:00", "price": 81.002541, "carbon": 418.423615}, {"timestamp": "2026-06-29 03:00", "price": 82.308731, "carbon": 413.309479}, {"timestamp": "2026-06-29 04:00", "price": 87.632225, "carbon": 375.605896}, {"timestamp": "2026-06-29 05:00", "price": 95.624092, "carbon": 329.647888}, {"timestamp": "2026-06-29 06:00", "price": 108.028328, "carbon": 267.388763}, {"timestamp": "2026-06-29 07:00", "price": 107.984024, "carbon": 199.088364}, {"timestamp": "2026-06-29 08:00", "price": 97.038857, "carbon": 145.896561}, {"timestamp": "2026-06-29 09:00", "price": 80.937248, "carbon": 128.553558}, {"timestamp": "2026-06-29 10:00", "price": 52.565487, "carbon": 120.591835}, {"timestamp": "2026-06-29 11:00", "price": 18.601547, "carbon": 120.291351}, {"timestamp": "2026-06-29 12:00", "price": 11.111277, "carbon": 124.700043}, {"timestamp": "2026-06-29 13:00", "price": 8.706982, "carbon": 136.067169}, {"timestamp": "2026-06-29 14:00", "price": 17.651697, "carbon": 170.228638}, {"timestamp": "2026-06-29 15:00", "price": 39.21526, "carbon": 260.964355}, {"timestamp": "2026-06-29 16:00", "price": 66.701027, "carbon": 350.04129}, {"timestamp": "2026-06-29 17:00", "price": 85.196754, "carbon": 403.798096}, {"timestamp": "2026-06-29 18:00", "price": 100.732971, "carbon": 433.546539}, {"timestamp": "2026-06-29 19:00", "price": 118.388885, "carbon": 444.014984}, {"timestamp": "2026-06-29 20:00", "price": 150.302338, "carbon": 446.573608}, {"timestamp": "2026-06-29 21:00", "price": 139.923111, "carbon": 445.297821}, {"timestamp": "2026-06-29 22:00", "price": 109.258759, "carbon": 446.731476}, {"timestamp": "2026-06-29 23:00", "price": 95.418144, "carbon": 454.845947}, {"timestamp": "2026-06-30 00:00", "price": 93.231567, "carbon": 467.030212}, {"timestamp": "2026-06-30 01:00", "price": 87.137428, "carbon": 477.298737}, {"timestamp": "2026-06-30 02:00", "price": 83.989113, "carbon": 481.406769}, {"timestamp": "2026-06-30 03:00", "price": 84.057671, "carbon": 483.143311}, {"timestamp": "2026-06-30 04:00", "price": 89.378426, "carbon": 432.390778}, {"timestamp": "2026-06-30 05:00", "price": 100.026314, "carbon": 358.034882}, {"timestamp": "2026-06-30 06:00", "price": 110.653931, "carbon": 284.574707}, {"timestamp": "2026-06-30 07:00", "price": 113.309982, "carbon": 215.862823}, {"timestamp": "2026-06-30 08:00", "price": 102.894035, "carbon": 171.199432}, {"timestamp": "2026-06-30 09:00", "price": 85.350281, "carbon": 153.354965}, {"timestamp": "2026-06-30 10:00", "price": 64.461655, "carbon": 149.65686}, {"timestamp": "2026-06-30 11:00", "price": 37.561634, "carbon": 149.309753}, {"timestamp": "2026-06-30 12:00", "price": 28.948351, "carbon": 157.863037}, {"timestamp": "2026-06-30 13:00", "price": 26.04213, "carbon": 186.499802}, {"timestamp": "2026-06-30 14:00", "price": 39.689732, "carbon": 257.147736}, {"timestamp": "2026-06-30 15:00", "price": 60.792801, "carbon": 345.423004}, {"timestamp": "2026-06-30 16:00", "price": 76.4086, "carbon": 415.046265}, {"timestamp": "2026-06-30 17:00", "price": 87.5616, "carbon": 456.467621}, {"timestamp": "2026-06-30 18:00", "price": 103.86187, "carbon": 483.213257}, {"timestamp": "2026-06-30 19:00", "price": 137.969681, "carbon": 493.564148}, {"timestamp": "2026-06-30 20:00", "price": 206.092194, "carbon": 493.970001}, {"timestamp": "2026-06-30 21:00", "price": 156.06488, "carbon": 503.856171}, {"timestamp": "2026-06-30 22:00", "price": 116.135788, "carbon": 510.481628}, {"timestamp": "2026-06-30 23:00", "price": 97.037094, "carbon": 514.628052}, {"timestamp": "2026-07-01 00:00", "price": 93.964348, "carbon": 521.394653}, {"timestamp": "2026-07-01 01:00", "price": 86.693062, "carbon": 527.895325}, {"timestamp": "2026-07-01 02:00", "price": 84.653603, "carbon": 525.514526}, {"timestamp": "2026-07-01 03:00", "price": 84.979744, "carbon": 518.600281}, {"timestamp": "2026-07-01 04:00", "price": 88.942123, "carbon": 467.118134}, {"timestamp": "2026-07-01 05:00", "price": 98.482597, "carbon": 404.839722}, {"timestamp": "2026-07-01 06:00", "price": 107.46698, "carbon": 315.858276}, {"timestamp": "2026-07-01 07:00", "price": 104.427933, "carbon": 234.449203}, {"timestamp": "2026-07-01 08:00", "price": 94.459938, "carbon": 172.486465}, {"timestamp": "2026-07-01 09:00", "price": 83.454247, "carbon": 148.777206}, {"timestamp": "2026-07-01 10:00", "price": 68.813049, "carbon": 148.878494}, {"timestamp": "2026-07-01 11:00", "price": 43.745831, "carbon": 150.818604}, {"timestamp": "2026-07-01 12:00", "price": 28.969614, "carbon": 158.992508}, {"timestamp": "2026-07-01 13:00", "price": 22.023561, "carbon": 184.365265}, {"timestamp": "2026-07-01 14:00", "price": 29.542719, "carbon": 243.425751}, {"timestamp": "2026-07-01 15:00", "price": 56.067162, "carbon": 333.694244}, {"timestamp": "2026-07-01 16:00", "price": 68.774017, "carbon": 408.962738}, {"timestamp": "2026-07-01 17:00", "price": 82.037415, "carbon": 456.201141}, {"timestamp": "2026-07-01 18:00", "price": 98.028877, "carbon": 483.820679}, {"timestamp": "2026-07-01 19:00", "price": 130.714218, "carbon": 491.94104}, {"timestamp": "2026-07-01 20:00", "price": 191.466156, "carbon": 494.311005}, {"timestamp": "2026-07-01 21:00", "price": 163.874619, "carbon": 509.299774}, {"timestamp": "2026-07-01 22:00", "price": 121.493019, "carbon": 524.375793}, {"timestamp": "2026-07-01 23:00", "price": 99.710022, "carbon": 536.275085}, {"timestamp": "2026-07-02 00:00", "price": 93.928596, "carbon": 541.239136}, {"timestamp": "2026-07-02 01:00", "price": 87.854004, "carbon": 537.837097}, {"timestamp": "2026-07-02 02:00", "price": 85.923111, "carbon": 533.382629}, {"timestamp": "2026-07-02 03:00", "price": 86.275429, "carbon": 522.171204}, {"timestamp": "2026-07-02 04:00", "price": 89.97628, "carbon": 469.524414}, {"timestamp": "2026-07-02 05:00", "price": 97.954575, "carbon": 403.522888}, {"timestamp": "2026-07-02 06:00", "price": 106.647606, "carbon": 310.549255}, {"timestamp": "2026-07-02 07:00", "price": 105.80127, "carbon": 208.269974}, {"timestamp": "2026-07-02 08:00", "price": 94.729408, "carbon": 144.776123}, {"timestamp": "2026-07-02 09:00", "price": 83.750443, "carbon": 128.770035}, {"timestamp": "2026-07-02 10:00", "price": 63.520206, "carbon": 126.573479}, {"timestamp": "2026-07-02 11:00", "price": 33.588665, "carbon": 123.944618}, {"timestamp": "2026-07-02 12:00", "price": 14.724659, "carbon": 127.360115}, {"timestamp": "2026-07-02 13:00", "price": 10.261389, "carbon": 134.594666}, {"timestamp": "2026-07-02 14:00", "price": 17.323414, "carbon": 164.737061}, {"timestamp": "2026-07-02 15:00", "price": 37.006012, "carbon": 247.325272}, {"timestamp": "2026-07-02 16:00", "price": 62.32806, "carbon": 341.469666}, {"timestamp": "2026-07-02 17:00", "price": 80.386299, "carbon": 405.253937}, {"timestamp": "2026-07-02 18:00", "price": 95.535744, "carbon": 439.351776}, {"timestamp": "2026-07-02 19:00", "price": 110.433777, "carbon": 453.791687}, {"timestamp": "2026-07-02 20:00", "price": 126.010834, "carbon": 458.18399}, {"timestamp": "2026-07-02 21:00", "price": 111.345268, "carbon": 462.283112}, {"timestamp": "2026-07-02 22:00", "price": 101.648422, "carbon": 467.316132}, {"timestamp": "2026-07-02 23:00", "price": 92.841103, "carbon": 472.544525}, {"timestamp": "2026-07-03 00:00", "price": 90.11673, "carbon": 477.051483}, {"timestamp": "2026-07-03 01:00", "price": 85.137794, "carbon": 479.885681}, {"timestamp": "2026-07-03 02:00", "price": 83.830185, "carbon": 482.991302}, {"timestamp": "2026-07-03 03:00", "price": 83.687798, "carbon": 480.778076}, {"timestamp": "2026-07-03 04:00", "price": 88.320419, "carbon": 440.957794}, {"timestamp": "2026-07-03 05:00", "price": 96.485046, "carbon": 383.446991}, {"timestamp": "2026-07-03 06:00", "price": 105.931488, "carbon": 313.317047}];

// ─── Helpers (1:1 port from original HTML) ────────────────────────────────────
const FLEX = 0.50, RETAIL = 0.22;
const retailP = (w) => Math.max(0, w / 1000 + RETAIL);
const norm = (v, lo, hi) => hi === lo ? 0 : (v - lo) / (hi - lo);
const fmtEur = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const signEur = (v) => v >= 0 ? `Save ${fmtEur(Math.abs(v))}` : `Pay ${fmtEur(Math.abs(v))} more`;
const signCO2 = (v) => v >= 0 ? `Reduce ${Math.abs(v).toLocaleString(undefined, {maximumFractionDigits: 2})} kgCO2` : `Increase ${Math.abs(v).toLocaleString(undefined, {maximumFractionDigits: 2})} kgCO2`;
const dateLong = (d) => new Date(`${d}T12:00`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const dateShort = (d) => new Date(`${d}T12:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const twDate = (ts) => `${dateShort(ts.slice(0, 10))}, ${ts.slice(11)}`;
const recTime = (cur, best) => cur.slice(0, 10) === best.slice(0, 10) ? best.slice(11) : `${best.slice(11)} · ${dateShort(best.slice(0, 10))}`;
const dirLbl = (d) => d === 'earlier' ? '-' : d === 'later' ? '+' : '±';
const availDates = [...new Set(forecast.map(r => r.timestamp.slice(0, 10)))];
const defaultEntry = forecast.find(r => r.timestamp.endsWith('18:00')) || forecast[0];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ScenarioTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0',
      borderRadius: '10px', padding: '0.75rem 1rem',
      fontSize: '0.76rem', boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
      minWidth: '175px',
    }}>
      <p style={{ fontWeight: 700, color: '#94A3B8', marginBottom: '0.5rem', fontSize: '0.7rem' }}>{d.label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.22rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ color: '#DC2626' }}>Price</span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>{d.price.toFixed(1)} €/MWh</span>
        </div>
        <div style={{ fontSize: '0.67rem', color: '#94A3B8', marginBottom: '0.25rem' }}>
          Range: {d.priceLow.toFixed(1)} – {d.priceHigh.toFixed(1)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ color: '#16A34A' }}>Carbon</span>
          <span style={{ fontWeight: 700, color: '#020617' }}>{d.carbon.toFixed(1)} kgCO2/MWh</span>
        </div>
        <div style={{ fontSize: '0.67rem', color: '#475569' }}>
          Range: {d.carbonLow.toFixed(1)} – {d.carbonHigh.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScenarioSimulator() {
  const [consumption, setConsumption] = useState(3500);
  const [selDate, setSelDate]         = useState(defaultEntry.timestamp.slice(0, 10));
  const [selHour, setSelHour]         = useState(defaultEntry.timestamp.slice(11, 13));
  const [direction, setDirection]     = useState('both');
  const [timeWindow, setTimeWindow]   = useState(2);
  const [priority, setPriority]       = useState(50);
  const [metric, setMetric]           = useState('carbon');
  const [impactPeriod, setImpactPeriod] = useState('annual');

  const hoursForDate = forecast.filter(r => r.timestamp.startsWith(selDate)).map(r => r.timestamp.slice(11, 13));

  const handleDateChange = (d) => {
    setSelDate(d);
    const hrs = forecast.filter(r => r.timestamp.startsWith(d)).map(r => r.timestamp.slice(11, 13));
    if (!hrs.includes(selHour)) setSelHour(hrs[0] ?? '18');
  };

  const computed = useMemo(() => {
    const ts = `${selDate} ${selHour}:00`;
    let selIdx = forecast.findIndex(r => r.timestamp === ts);
    if (selIdx < 0) selIdx = 0;
    const current = forecast[selIdx];
    const flex = consumption * FLEX;
    const cp = priority / 100, kp = 1 - cp;

    // Candidate window
    let lo = selIdx, hi = selIdx;
    if (direction === 'earlier') lo = Math.max(0, selIdx - timeWindow);
    else if (direction === 'later') hi = Math.min(forecast.length - 1, selIdx + timeWindow);
    else { lo = Math.max(0, selIdx - timeWindow); hi = Math.min(forecast.length - 1, selIdx + timeWindow); }

    const candidates = forecast.slice(lo, hi + 1).map(c => ({
      ...c,
      costSaving: flex * retailP(current.price) - flex * retailP(c.price),
      carbonReductionKg: (flex * current.carbon / 1000) - (flex * c.carbon / 1000),
    }));

    const prices = candidates.map(c => c.price), carbons = candidates.map(c => c.carbon);
    const [minP, maxP] = [Math.min(...prices), Math.max(...prices)];
    const [minC, maxC] = [Math.min(...carbons), Math.max(...carbons)];

    let best = candidates[0], bestU = -Infinity;
    candidates.forEach(c => {
      const u = kp * (1 - norm(c.price, minP, maxP)) + cp * (1 - norm(c.carbon, minC, maxC));
      if (u > bestU) { bestU = u; best = c; }
    });

    const strategy = priority === 0 ? 'Cost-only recommendation'
                   : priority === 100 ? 'Carbon-only recommendation'
                   : 'Balanced recommendation';
    const recTxt = `Move flexible electricity use from ${twDate(current.timestamp)} to ${twDate(best.timestamp)}. Search rule: ${dirLbl(direction)}${timeWindow} hours. This recommendation best matches your cost and carbon preference.`;

    // ── Chart data: 8h before selected → 24h after selected ──────────────────
    const chartStart = Math.max(0, selIdx - 8);
    const chartEnd   = Math.min(forecast.length - 1, selIdx + 24);
    const slice      = forecast.slice(chartStart, chartEnd + 1);

    const bestFcIdx   = forecast.findIndex(r => r.timestamp === best.timestamp);
    const chartSelIdx = selIdx - chartStart;
    const chartBestIdx = Math.max(0, Math.min(bestFcIdx - chartStart, slice.length - 1));
    const chartWinLo  = Math.max(0, lo - chartStart);
    const chartWinHi  = Math.min(slice.length - 1, hi - chartStart);

    const chartData = slice.map((d, i) => {
      const dist  = Math.abs((chartStart + i) - selIdx);
      // Uncertainty widens from ±6% at selected hour to ±22% at ±16h (fan chart)
      const uncert = 0.06 + dist * 0.01;
      const pDelta = Math.abs(d.price) * uncert;
      const cDelta = d.carbon * uncert * 0.75;
      return {
        idx:        i,
        label:      `${dateShort(d.timestamp.slice(0, 10))}, ${d.timestamp.slice(11, 16)}`,
        shortLabel: d.timestamp.slice(11, 16),
        midnight:   d.timestamp.slice(11, 16) === '00:00',
        price:      +d.price.toFixed(2),
        priceLow:   +(d.price - pDelta).toFixed(2),
        priceBand:  +(pDelta * 2).toFixed(2),     // width of band (always ≥ 0)
        priceHigh:  +(d.price + pDelta).toFixed(2),
        carbon:     +d.carbon.toFixed(2),
        carbonLow:  +Math.max(0, d.carbon - cDelta).toFixed(2),
        carbonBand: +(cDelta * 2).toFixed(2),
        carbonHigh: +(d.carbon + cDelta).toFixed(2),
      };
    });

    return { current, best, strategy, recTxt, chartData, chartSelIdx, chartBestIdx, chartWinLo, chartWinHi };
  }, [consumption, selDate, selHour, direction, timeWindow, priority]);

  const { current, best, strategy, recTxt, chartData, chartSelIdx, chartBestIdx, chartWinLo, chartWinHi } = computed;
  const costPos   = best.costSaving >= 0;
  const carbonPos = best.carbonReductionKg >= 0;

  const projectionData = useMemo(() => {
    const flex = consumption * FLEX;
    const avg_carbon = forecast.reduce((sum, r) => sum + r.carbon, 0) / forecast.length;
    const avg_price = forecast.reduce((sum, r) => sum + r.price, 0) / forecast.length;
    const avg_retail_price = retailP(avg_price);

    // Non-flexible annual emissions & cost
    const non_flex = consumption * (1 - FLEX);
    const non_flex_carbon = non_flex * avg_carbon / 1000;
    const non_flex_cost = non_flex * avg_retail_price;

    // User chosen annual emissions & cost
    const chosen_flex_carbon = flex * best.carbon / 1000;
    const chosen_flex_cost = flex * retailP(best.price);
    const user_annual_carbon = non_flex_carbon + chosen_flex_carbon;
    const user_annual_cost = non_flex_cost + chosen_flex_cost;

    // User baseline annual emissions & cost (if no shift)
    const base_flex_carbon = flex * current.carbon / 1000;
    const base_flex_cost = flex * retailP(current.price);
    const base_annual_carbon = non_flex_carbon + base_flex_carbon;
    const base_annual_cost = non_flex_cost + base_flex_cost;

    // Savings
    const user_annual_savings = best.costSaving;

    // Standard benchmark baseline for Halle household of this size
    const benchmark_carbon = consumption * avg_carbon / 1000;
    const benchmark_savings = flex * (retailP(current.price) - retailP(forecast.reduce((min, r) => r.price < min.price ? r : min, forecast[0]).price)); // max potential savings

    // Competitors mults (lower is better for carbon, higher is better for savings)
    const competitors = {
      an:     { name: 'An (🥇)',     carbonMult: 0.72, savingsMult: 0.90 },
      nikki:  { name: 'Nikki (🥈)',  carbonMult: 0.80, savingsMult: 0.78 },
      sophie: { name: 'Sophie (🥉)', carbonMult: 0.90, savingsMult: 0.65 },
      felix:  { name: 'Felix',       carbonMult: 1.10, savingsMult: 0.40 },
      lena:   { name: 'Lena',        carbonMult: 1.28, savingsMult: 0.15 },
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const carbonPoints = months.map((m, idx) => {
      const fraction = (idx + 1) / 12;
      return {
        month: m,
        'You':         +(user_annual_carbon * fraction).toFixed(0),
        'An (🥇)':     +(benchmark_carbon * competitors.an.carbonMult * fraction).toFixed(0),
        'Nikki (🥈)':  +(benchmark_carbon * competitors.nikki.carbonMult * fraction).toFixed(0),
        'Sophie (🥉)': +(benchmark_carbon * competitors.sophie.carbonMult * fraction).toFixed(0),
        'Felix':       +(benchmark_carbon * competitors.felix.carbonMult * fraction).toFixed(0),
        'Lena':        +(benchmark_carbon * competitors.lena.carbonMult * fraction).toFixed(0),
      };
    });

    const savingsPoints = months.map((m, idx) => {
      const fraction = (idx + 1) / 12;
      return {
        month: m,
        'You':         +Math.max(0, user_annual_savings * fraction).toFixed(0),
        'An (🥇)':     +Math.max(0, benchmark_savings * competitors.an.savingsMult * fraction).toFixed(0),
        'Nikki (🥈)':  +Math.max(0, benchmark_savings * competitors.nikki.savingsMult * fraction).toFixed(0),
        'Sophie (🥉)': +Math.max(0, benchmark_savings * competitors.sophie.savingsMult * fraction).toFixed(0),
        'Felix':       +Math.max(0, benchmark_savings * competitors.felix.savingsMult * fraction).toFixed(0),
        'Lena':        +Math.max(0, benchmark_savings * competitors.lena.savingsMult * fraction).toFixed(0),
      };
    });

    // Calculate rank
    const userCarbon = user_annual_carbon;
    const list = [
      { name: 'You', val: userCarbon },
      { name: 'An (🥇)', val: benchmark_carbon * competitors.an.carbonMult },
      { name: 'Nikki (🥈)', val: benchmark_carbon * competitors.nikki.carbonMult },
      { name: 'Sophie (🥉)', val: benchmark_carbon * competitors.sophie.carbonMult },
      { name: 'Felix', val: benchmark_carbon * competitors.felix.carbonMult },
      { name: 'Lena', val: benchmark_carbon * competitors.lena.carbonMult },
    ].sort((a, b) => a.val - b.val); // lower carbon is better

    const rank = list.findIndex(x => x.name === 'You') + 1;

    return { carbonPoints, savingsPoints, rank, user_annual_carbon, user_annual_savings };
  }, [consumption, best, current]);

  // X-axis ticks: show every 6th hour + midnight labels
  const xTicks = chartData.reduce((acc, d, i) => {
    if (i === 0 || ['00:00','06:00','12:00','18:00'].includes(d.shortLabel)) acc.push(i);
    return acc;
  }, []);
  const xFormatter = (i) => {
    const d = chartData[i];
    if (!d) return '';
    return d.midnight ? `${dateShort(computed.current.timestamp.slice(0,10)).slice(0,6)} ${d.shortLabel}` : d.shortLabel;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1B4FBB 55%, #2563EB 100%)',
        borderRadius: '18px', padding: '1.75rem 2rem',
        boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
      }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#93c5fd', margin: '0 0 0.55rem' }}>
          Energy Decision Support
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Find a better hour to use electricity
        </h1>
      </div>

      {/* ── Section 1: Inputs ─────────────────────────────────────────────── */}
      <div>
        <p style={C.sl}>1. Household and schedule inputs</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>

          <div style={C.card}>
            <label style={C.lbl}>Annual electricity consumption</label>
            <input type="number" min="1" step="1" value={consumption}
              onChange={e => setConsumption(Number(e.target.value))} style={C.inp} />
            <p style={C.note}>kWh/year</p>
          </div>

          <div style={C.card}>
            <label style={C.lbl}>Pick date</label>
            <select value={selDate} onChange={e => handleDateChange(e.target.value)} style={C.inp}>
              {availDates.map(d => <option key={d} value={d}>{dateLong(d)}</option>)}
            </select>
            <p style={C.note}>Dates are shown in English.</p>
          </div>

          <div style={C.card}>
            <label style={C.lbl}>Pick hour</label>
            <select value={selHour} onChange={e => setSelHour(e.target.value)} style={C.inp}>
              {hoursForDate.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
            <p style={C.note}>Hour-only selection, no minutes.</p>
          </div>

          <div style={C.card}>
            <label style={C.lbl}>Flexibility direction</label>
            <select value={direction} onChange={e => setDirection(e.target.value)} style={C.inp}>
              <option value="both">Earlier &amp; later (±)</option>
              <option value="earlier">Earlier only (-)</option>
              <option value="later">Later only (+)</option>
            </select>
            <p style={C.note}>Reflects what the household can realistically change.</p>
          </div>

          <div style={C.card}>
            <label style={C.lbl}>Search window</label>
            <select value={timeWindow} onChange={e => setTimeWindow(Number(e.target.value))} style={C.inp}>
              {[1,2,4,6,8,12].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
            </select>
            <p style={C.note}>Bigger windows give more savings, but require more flexibility.</p>
          </div>

          <div style={C.card}>
            <label style={C.lbl}>Priority scale</label>
            <input type="range" min="0" max="100" step="1" value={priority}
              onChange={e => setPriority(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00e5a0', cursor: 'pointer', marginTop: '0.3rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.45rem', fontSize: '0.72rem', color: '#3d5872' }}>
              <span>💰 Cost Priority</span>
              <span>🌱 Carbon Priority</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Section 2: Recommendation ─────────────────────────────────────── */}
      <div>
        <p style={C.sl}>2. Personalized recommendation</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.875rem' }}>

          <div style={C.hCard}>
            <span style={C.pill}>{strategy}</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#020617', margin: '0.7rem 0 0.2rem' }}>Recommended Time</h2>
            <div style={{ fontSize: '3.25rem', fontWeight: 800, color: '#1B4FBB', letterSpacing: '-0.04em', lineHeight: 1, margin: '0.1rem 0 0.7rem' }}>
              {recTime(current.timestamp, best.timestamp)}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#1E293B', lineHeight: 1.65, margin: 0 }}>{recTxt}</p>
          </div>

          <div style={C.hCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#020617', margin: 0 }}>
                Estimated {impactPeriod === 'annual' ? 'Annual' : 'Monthly'} Impact
              </h2>
              <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.2rem', borderRadius: '6px', gap: '0.1rem' }}>
                {[
                  { key: 'monthly', label: 'Monthly' },
                  { key: 'annual',  label: 'Annually' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setImpactPeriod(opt.key)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: impactPeriod === opt.key ? '#FFFFFF' : 'transparent',
                      color: impactPeriod === opt.key ? 'var(--accent)' : '#64748B',
                      boxShadow: impactPeriod === opt.key ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={C.stat}>
                <p style={C.statLbl}>Cost change ({impactPeriod === 'annual' ? 'yr' : 'mo'})</p>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: costPos ? '#16A34A' : '#DC2626' }}>
                  {signEur(impactPeriod === 'annual' ? best.costSaving : best.costSaving / 12)}
                </div>
              </div>
              <div style={C.stat}>
                <p style={C.statLbl}>CO₂ change ({impactPeriod === 'annual' ? 'yr' : 'mo'})</p>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: carbonPos ? '#16A34A' : '#DC2626' }}>
                  {signCO2(impactPeriod === 'annual' ? best.carbonReductionKg : best.carbonReductionKg / 12)}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: '0.875rem 0 0' }}>
              Estimated using forecast electricity prices and carbon intensity for the selected recommendation.
            </p>
          </div>

        </div>
      </div>

      {/* ── Section 3: Community Comparison & Long-Term Impact ── */}
      <div>
        <p style={C.sl}>3. Long-Term Impact &amp; Community Comparison</p>
        <div style={{ ...C.card, padding: '1.5rem' }}>
          
          {/* Header & Metric Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                12-Month Impact vs. Leaderboard Peers
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
                See how your current scheduling decision projects over a full year compared to other Halle households.
              </p>
            </div>
            
            {/* Metric Tabs */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.25rem', borderRadius: '8px', gap: '0.15rem' }}>
              <button
                onClick={() => setMetric('carbon')}
                style={{
                  padding: '0.4rem 0.85rem', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', background: metric === 'carbon' ? '#FFFFFF' : 'transparent',
                  color: metric === 'carbon' ? '#1B4FBB' : '#475569', boxShadow: metric === 'carbon' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                🌿 CO₂ Emissions
              </button>
              <button
                onClick={() => setMetric('savings')}
                style={{
                  padding: '0.4rem 0.85rem', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', background: metric === 'savings' ? '#FFFFFF' : 'transparent',
                  color: metric === 'savings' ? '#1B4FBB' : '#475569', boxShadow: metric === 'savings' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                💶 Financial Savings
              </button>
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metric === 'carbon' ? projectionData.carbonPoints : projectionData.savingsPoints} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => metric === 'carbon' ? `${v} kgCO2` : `€${v}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
                    return (
                      <div style={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: '10px', padding: '0.75rem 1rem',
                        fontSize: '0.78rem', color: '#0F172A',
                        boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
                      }}>
                        <p style={{ color: '#475569', marginBottom: '0.4rem', fontWeight: 600 }}>{label} Projection</p>
                        {sortedPayload.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', margin: '0.2rem 0', fontWeight: p.name === 'You' ? 800 : 500 }}>
                            <span style={{ color: p.color }}>{p.name}</span>
                            <span style={{ color: p.name === 'You' ? '#1B4FBB' : '#020617' }}>
                              {metric === 'carbon' ? `${p.value.toLocaleString()} kgCO2` : `€${p.value.toLocaleString()}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}
                />
                
                {/* Peer lines */}
                <Line type="monotone" name="An (🥇)" dataKey="An (🥇)" stroke="#10B981" strokeWidth={1.5} dot={false} strokeDasharray="3 3" opacity={0.7} activeDot={false} />
                <Line type="monotone" name="Nikki (🥈)" dataKey="Nikki (🥈)" stroke="#3B82F6" strokeWidth={1.5} dot={false} strokeDasharray="3 3" opacity={0.7} activeDot={false} />
                <Line type="monotone" name="Sophie (🥉)" dataKey="Sophie (🥉)" stroke="#8B5CF6" strokeWidth={1.5} dot={false} strokeDasharray="3 3" opacity={0.7} activeDot={false} />
                
                {/* User line */}
                <Line type="monotone" name="You" dataKey="You" stroke="#1B4FBB" strokeWidth={3.5} dot={{ r: 3, fill: '#1B4FBB' }} activeDot={{ r: 6 }} />
                
                <Line type="monotone" name="Felix" dataKey="Felix" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="3 3" opacity={0.7} activeDot={false} />
                <Line type="monotone" name="Lena" dataKey="Lena" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="3 3" opacity={0.7} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Impact Banner */}
          <div style={{
            marginTop: '1.5rem', padding: '1rem 1.25rem',
            background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <span style={{ fontSize: '1.75rem' }}>🏆</span>
            <div style={{ fontSize: '0.85rem', color: '#1E40AF', lineHeight: 1.5 }}>
              Your current schedule choice projects an annual carbon footprint of <strong>{projectionData.user_annual_carbon.toFixed(0)} kgCO2</strong> and <strong>€{projectionData.user_annual_savings.toFixed(0)} in savings</strong>. 
              This places you at <strong>Rank #{projectionData.rank} of 6</strong> on the energy efficiency league! 
              {projectionData.rank > 1 ? " Move the priority slider or select a cleaner hour to climb higher." : " Outstanding job! You have the cleanest profile in the community."}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ─── Style constants ──────────────────────────────────────────────────────────
const C = {
  sl:      { fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', margin: '0 0 0.75rem' },
  card:    { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' },
  hCard:   { background: '#FFFFFF', borderRadius: '12px', padding: '1.35rem 1.5rem', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', border: '1px solid #DBEAFE' },
  lbl:     { display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' },
  inp:     { width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#020617', fontFamily: 'Inter, sans-serif', fontSize: '0.98rem', outline: 'none', cursor: 'pointer' },
  note:    { margin: '0.45rem 0 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 },
  pill:    { display: 'inline-block', padding: '0.28rem 0.8rem', borderRadius: '999px', background: '#EFF6FF', color: '#1B4FBB', fontWeight: 700, fontSize: '0.85rem', border: '1px solid #DBEAFE' },
  stat:    { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.875rem 1rem' },
  statLbl: { margin: '0 0 0.45rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#475569' },
};