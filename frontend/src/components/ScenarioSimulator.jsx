import React, { useState, useMemo } from 'react';

// ─── Forecast data ────────────────────────────────────────────────────────────
const forecast = [{"timestamp": "2026-06-26 08:00", "price": 97.098717, "carbon": 121.62999}, {"timestamp": "2026-06-26 09:00", "price": 76.996971, "carbon": 112.622177}, {"timestamp": "2026-06-26 10:00", "price": 20.603962, "carbon": 103.260292}, {"timestamp": "2026-06-26 11:00", "price": 2.508318, "carbon": 98.452087}, {"timestamp": "2026-06-26 12:00", "price": -0.200055, "carbon": 97.463112}, {"timestamp": "2026-06-26 13:00", "price": -3.885231, "carbon": 100.189835}, {"timestamp": "2026-06-26 14:00", "price": -6.955832, "carbon": 110.785614}, {"timestamp": "2026-06-26 15:00", "price": -0.68931, "carbon": 165.038177}, {"timestamp": "2026-06-26 16:00", "price": 17.863632, "carbon": 267.683563}, {"timestamp": "2026-06-26 17:00", "price": 66.723648, "carbon": 340.636566}, {"timestamp": "2026-06-26 18:00", "price": 93.348656, "carbon": 382.537079}, {"timestamp": "2026-06-26 19:00", "price": 110.673622, "carbon": 394.158081}, {"timestamp": "2026-06-26 20:00", "price": 121.117165, "carbon": 397.360291}, {"timestamp": "2026-06-26 21:00", "price": 108.960083, "carbon": 393.416168}, {"timestamp": "2026-06-26 22:00", "price": 100.256622, "carbon": 385.910614}, {"timestamp": "2026-06-26 23:00", "price": 88.757858, "carbon": 374.081482}, {"timestamp": "2026-06-27 00:00", "price": 83.340759, "carbon": 363.296997}, {"timestamp": "2026-06-27 01:00", "price": 75.526031, "carbon": 355.296234}, {"timestamp": "2026-06-27 02:00", "price": 72.469032, "carbon": 347.398743}, {"timestamp": "2026-06-27 03:00", "price": 72.562973, "carbon": 340.633331}, {"timestamp": "2026-06-27 04:00", "price": 74.785339, "carbon": 306.662201}, {"timestamp": "2026-06-27 05:00", "price": 77.103683, "carbon": 246.98555}, {"timestamp": "2026-06-27 06:00", "price": 79.180893, "carbon": 171.089249}, {"timestamp": "2026-06-27 07:00", "price": 71.238075, "carbon": 113.757698}, {"timestamp": "2026-06-27 08:00", "price": 43.958206, "carbon": 93.419426}, {"timestamp": "2026-06-27 09:00", "price": 2.327619, "carbon": 85.26915}, {"timestamp": "2026-06-27 10:00", "price": -3.336973, "carbon": 80.164978}, {"timestamp": "2026-06-27 11:00", "price": -13.388379, "carbon": 77.817558}, {"timestamp": "2026-06-27 12:00", "price": -25.685293, "carbon": 76.962204}, {"timestamp": "2026-06-27 13:00", "price": -47.488045, "carbon": 79.437706}, {"timestamp": "2026-06-27 14:00", "price": -75.616478, "carbon": 88.574677}, {"timestamp": "2026-06-27 15:00", "price": -50.987053, "carbon": 116.616264}, {"timestamp": "2026-06-27 16:00", "price": -18.068947, "carbon": 189.628372}, {"timestamp": "2026-06-27 17:00", "price": 16.999243, "carbon": 297.076599}, {"timestamp": "2026-06-27 18:00", "price": 82.324226, "carbon": 357.382355}, {"timestamp": "2026-06-27 19:00", "price": 104.869804, "carbon": 373.879364}, {"timestamp": "2026-06-27 20:00", "price": 120.743019, "carbon": 391.155273}, {"timestamp": "2026-06-27 21:00", "price": 112.057854, "carbon": 404.5112}, {"timestamp": "2026-06-27 22:00", "price": 101.322876, "carbon": 416.862396}, {"timestamp": "2026-06-27 23:00", "price": 92.247658, "carbon": 425.474762}, {"timestamp": "2026-06-28 00:00", "price": 90.66684, "carbon": 426.137817}, {"timestamp": "2026-06-28 01:00", "price": 83.687042, "carbon": 422.868835}, {"timestamp": "2026-06-28 02:00", "price": 82.155899, "carbon": 421.401093}, {"timestamp": "2026-06-28 03:00", "price": 83.191666, "carbon": 417.798828}, {"timestamp": "2026-06-28 04:00", "price": 85.34845, "carbon": 373.678101}, {"timestamp": "2026-06-28 05:00", "price": 87.139351, "carbon": 299.756714}, {"timestamp": "2026-06-28 06:00", "price": 85.308395, "carbon": 203.001389}, {"timestamp": "2026-06-28 07:00", "price": 76.201973, "carbon": 135.354797}, {"timestamp": "2026-06-28 08:00", "price": 53.026352, "carbon": 102.867142}, {"timestamp": "2026-06-28 09:00", "price": 7.165062, "carbon": 94.323883}, {"timestamp": "2026-06-28 10:00", "price": 1.127714, "carbon": 91.067268}, {"timestamp": "2026-06-28 11:00", "price": -4.097064, "carbon": 90.444679}, {"timestamp": "2026-06-28 12:00", "price": -15.003111, "carbon": 92.544632}, {"timestamp": "2026-06-28 13:00", "price": -33.009354, "carbon": 100.752106}, {"timestamp": "2026-06-28 14:00", "price": -33.643864, "carbon": 120.678406}, {"timestamp": "2026-06-28 15:00", "price": -22.343977, "carbon": 183.421829}, {"timestamp": "2026-06-28 16:00", "price": -9.359306, "carbon": 285.999817}, {"timestamp": "2026-06-28 17:00", "price": 19.994921, "carbon": 367.292603}, {"timestamp": "2026-06-28 18:00", "price": 81.106293, "carbon": 408.568298}, {"timestamp": "2026-06-28 19:00", "price": 105.100182, "carbon": 421.676514}, {"timestamp": "2026-06-28 20:00", "price": 115.274818, "carbon": 420.261566}, {"timestamp": "2026-06-28 21:00", "price": 103.996063, "carbon": 417.741669}, {"timestamp": "2026-06-28 22:00", "price": 95.975853, "carbon": 414.751038}, {"timestamp": "2026-06-28 23:00", "price": 88.776192, "carbon": 414.815002}, {"timestamp": "2026-06-29 00:00", "price": 86.048347, "carbon": 416.013763}, {"timestamp": "2026-06-29 01:00", "price": 81.775406, "carbon": 418.811035}, {"timestamp": "2026-06-29 02:00", "price": 81.002541, "carbon": 418.423615}, {"timestamp": "2026-06-29 03:00", "price": 82.308731, "carbon": 413.309479}, {"timestamp": "2026-06-29 04:00", "price": 87.632225, "carbon": 375.605896}, {"timestamp": "2026-06-29 05:00", "price": 95.624092, "carbon": 329.647888}, {"timestamp": "2026-06-29 06:00", "price": 108.028328, "carbon": 267.388763}, {"timestamp": "2026-06-29 07:00", "price": 107.984024, "carbon": 199.088364}, {"timestamp": "2026-06-29 08:00", "price": 97.038857, "carbon": 145.896561}, {"timestamp": "2026-06-29 09:00", "price": 80.937248, "carbon": 128.553558}, {"timestamp": "2026-06-29 10:00", "price": 52.565487, "carbon": 120.591835}, {"timestamp": "2026-06-29 11:00", "price": 18.601547, "carbon": 120.291351}, {"timestamp": "2026-06-29 12:00", "price": 11.111277, "carbon": 124.700043}, {"timestamp": "2026-06-29 13:00", "price": 8.706982, "carbon": 136.067169}, {"timestamp": "2026-06-29 14:00", "price": 17.651697, "carbon": 170.228638}, {"timestamp": "2026-06-29 15:00", "price": 39.21526, "carbon": 260.964355}, {"timestamp": "2026-06-29 16:00", "price": 66.701027, "carbon": 350.04129}, {"timestamp": "2026-06-29 17:00", "price": 85.196754, "carbon": 403.798096}, {"timestamp": "2026-06-29 18:00", "price": 100.732971, "carbon": 433.546539}, {"timestamp": "2026-06-29 19:00", "price": 118.388885, "carbon": 444.014984}, {"timestamp": "2026-06-29 20:00", "price": 150.302338, "carbon": 446.573608}, {"timestamp": "2026-06-29 21:00", "price": 139.923111, "carbon": 445.297821}, {"timestamp": "2026-06-29 22:00", "price": 109.258759, "carbon": 446.731476}, {"timestamp": "2026-06-29 23:00", "price": 95.418144, "carbon": 454.845947}, {"timestamp": "2026-06-30 00:00", "price": 93.231567, "carbon": 467.030212}, {"timestamp": "2026-06-30 01:00", "price": 87.137428, "carbon": 477.298737}, {"timestamp": "2026-06-30 02:00", "price": 83.989113, "carbon": 481.406769}, {"timestamp": "2026-06-30 03:00", "price": 84.057671, "carbon": 483.143311}, {"timestamp": "2026-06-30 04:00", "price": 89.378426, "carbon": 432.390778}, {"timestamp": "2026-06-30 05:00", "price": 100.026314, "carbon": 358.034882}, {"timestamp": "2026-06-30 06:00", "price": 110.653931, "carbon": 284.574707}, {"timestamp": "2026-06-30 07:00", "price": 113.309982, "carbon": 215.862823}, {"timestamp": "2026-06-30 08:00", "price": 102.894035, "carbon": 171.199432}, {"timestamp": "2026-06-30 09:00", "price": 85.350281, "carbon": 153.354965}, {"timestamp": "2026-06-30 10:00", "price": 64.461655, "carbon": 149.65686}, {"timestamp": "2026-06-30 11:00", "price": 37.561634, "carbon": 149.309753}, {"timestamp": "2026-06-30 12:00", "price": 28.948351, "carbon": 157.863037}, {"timestamp": "2026-06-30 13:00", "price": 26.04213, "carbon": 186.499802}, {"timestamp": "2026-06-30 14:00", "price": 39.689732, "carbon": 257.147736}, {"timestamp": "2026-06-30 15:00", "price": 60.792801, "carbon": 345.423004}, {"timestamp": "2026-06-30 16:00", "price": 76.4086, "carbon": 415.046265}, {"timestamp": "2026-06-30 17:00", "price": 87.5616, "carbon": 456.467621}, {"timestamp": "2026-06-30 18:00", "price": 103.86187, "carbon": 483.213257}, {"timestamp": "2026-06-30 19:00", "price": 137.969681, "carbon": 493.564148}, {"timestamp": "2026-06-30 20:00", "price": 206.092194, "carbon": 493.970001}, {"timestamp": "2026-06-30 21:00", "price": 156.06488, "carbon": 503.856171}, {"timestamp": "2026-06-30 22:00", "price": 116.135788, "carbon": 510.481628}, {"timestamp": "2026-06-30 23:00", "price": 97.037094, "carbon": 514.628052}, {"timestamp": "2026-07-01 00:00", "price": 93.964348, "carbon": 521.394653}, {"timestamp": "2026-07-01 01:00", "price": 86.693062, "carbon": 527.895325}, {"timestamp": "2026-07-01 02:00", "price": 84.653603, "carbon": 525.514526}, {"timestamp": "2026-07-01 03:00", "price": 84.979744, "carbon": 518.600281}, {"timestamp": "2026-07-01 04:00", "price": 88.942123, "carbon": 467.118134}, {"timestamp": "2026-07-01 05:00", "price": 98.482597, "carbon": 404.839722}, {"timestamp": "2026-07-01 06:00", "price": 107.46698, "carbon": 315.858276}, {"timestamp": "2026-07-01 07:00", "price": 104.427933, "carbon": 234.449203}, {"timestamp": "2026-07-01 08:00", "price": 94.459938, "carbon": 172.486465}, {"timestamp": "2026-07-01 09:00", "price": 83.454247, "carbon": 148.777206}, {"timestamp": "2026-07-01 10:00", "price": 68.813049, "carbon": 148.878494}, {"timestamp": "2026-07-01 11:00", "price": 43.745831, "carbon": 150.818604}, {"timestamp": "2026-07-01 12:00", "price": 28.969614, "carbon": 158.992508}, {"timestamp": "2026-07-01 13:00", "price": 22.023561, "carbon": 184.365265}, {"timestamp": "2026-07-01 14:00", "price": 29.542719, "carbon": 243.425751}, {"timestamp": "2026-07-01 15:00", "price": 56.067162, "carbon": 333.694244}, {"timestamp": "2026-07-01 16:00", "price": 68.774017, "carbon": 408.962738}, {"timestamp": "2026-07-01 17:00", "price": 82.037415, "carbon": 456.201141}, {"timestamp": "2026-07-01 18:00", "price": 98.028877, "carbon": 483.820679}, {"timestamp": "2026-07-01 19:00", "price": 130.714218, "carbon": 491.94104}, {"timestamp": "2026-07-01 20:00", "price": 191.466156, "carbon": 494.311005}, {"timestamp": "2026-07-01 21:00", "price": 163.874619, "carbon": 509.299774}, {"timestamp": "2026-07-01 22:00", "price": 121.493019, "carbon": 524.375793}, {"timestamp": "2026-07-01 23:00", "price": 99.710022, "carbon": 536.275085}, {"timestamp": "2026-07-02 00:00", "price": 93.928596, "carbon": 541.239136}, {"timestamp": "2026-07-02 01:00", "price": 87.854004, "carbon": 537.837097}, {"timestamp": "2026-07-02 02:00", "price": 85.923111, "carbon": 533.382629}, {"timestamp": "2026-07-02 03:00", "price": 86.275429, "carbon": 522.171204}, {"timestamp": "2026-07-02 04:00", "price": 89.97628, "carbon": 469.524414}, {"timestamp": "2026-07-02 05:00", "price": 97.954575, "carbon": 403.522888}, {"timestamp": "2026-07-02 06:00", "price": 106.647606, "carbon": 310.549255}, {"timestamp": "2026-07-02 07:00", "price": 105.80127, "carbon": 208.269974}, {"timestamp": "2026-07-02 08:00", "price": 94.729408, "carbon": 144.776123}, {"timestamp": "2026-07-02 09:00", "price": 83.750443, "carbon": 128.770035}, {"timestamp": "2026-07-02 10:00", "price": 63.520206, "carbon": 126.573479}, {"timestamp": "2026-07-02 11:00", "price": 33.588665, "carbon": 123.944618}, {"timestamp": "2026-07-02 12:00", "price": 14.724659, "carbon": 127.360115}, {"timestamp": "2026-07-02 13:00", "price": 10.261389, "carbon": 134.594666}, {"timestamp": "2026-07-02 14:00", "price": 17.323414, "carbon": 164.737061}, {"timestamp": "2026-07-02 15:00", "price": 37.006012, "carbon": 247.325272}, {"timestamp": "2026-07-02 16:00", "price": 62.32806, "carbon": 341.469666}, {"timestamp": "2026-07-02 17:00", "price": 80.386299, "carbon": 405.253937}, {"timestamp": "2026-07-02 18:00", "price": 95.535744, "carbon": 439.351776}, {"timestamp": "2026-07-02 19:00", "price": 110.433777, "carbon": 453.791687}, {"timestamp": "2026-07-02 20:00", "price": 126.010834, "carbon": 458.18399}, {"timestamp": "2026-07-02 21:00", "price": 111.345268, "carbon": 462.283112}, {"timestamp": "2026-07-02 22:00", "price": 101.648422, "carbon": 467.316132}, {"timestamp": "2026-07-02 23:00", "price": 92.841103, "carbon": 472.544525}, {"timestamp": "2026-07-03 00:00", "price": 90.11673, "carbon": 477.051483}, {"timestamp": "2026-07-03 01:00", "price": 85.137794, "carbon": 479.885681}, {"timestamp": "2026-07-03 02:00", "price": 83.830185, "carbon": 482.991302}, {"timestamp": "2026-07-03 03:00", "price": 83.687798, "carbon": 480.778076}, {"timestamp": "2026-07-03 04:00", "price": 88.320419, "carbon": 440.957794}, {"timestamp": "2026-07-03 05:00", "price": 96.485046, "carbon": 383.446991}, {"timestamp": "2026-07-03 06:00", "price": 105.931488, "carbon": 313.317047}];

// ─── Helpers (ported 1:1 from HTML) ──────────────────────────────────────────
const FLEXIBLE_RATIO = 0.50;
const RETAIL_ADDER = 0.22;

function retailPrice(wholesale) { return Math.max(0, wholesale / 1000 + RETAIL_ADDER); }
function normalize(v, min, max) { return max === min ? 0 : (v - min) / (max - min); }
function formatEuro(v) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v); }
function signedEuro(v) { return v >= 0 ? `Save ${formatEuro(Math.abs(v))}` : `Pay ${formatEuro(Math.abs(v))} more`; }
function signedCarbon(v) { return v >= 0 ? `Reduce ${Math.abs(v).toFixed(2)} t CO₂` : `Increase ${Math.abs(v).toFixed(2)} t CO₂`; }
function dateLong(d) { return new Date(`${d}T12:00`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
function dateShort(d) { return new Date(`${d}T12:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
function timeWithDate(ts) { return `${dateShort(ts.slice(0, 10))}, ${ts.slice(11)}`; }
function recommendedTime(curr, best) {
  return curr.slice(0, 10) === best.slice(0, 10)
    ? best.slice(11)
    : `${best.slice(11)} · ${dateShort(best.slice(0, 10))}`;
}
function dirLabel(d) { return d === 'earlier' ? '-' : d === 'later' ? '+' : '±'; }

// ─── Component ────────────────────────────────────────────────────────────────
const availableDates = [...new Set(forecast.map(r => r.timestamp.slice(0, 10)))];
const defaultEntry = forecast.find(r => r.timestamp.endsWith('18:00')) || forecast[0];

export default function ScenarioSimulator() {
  const [consumption, setConsumption]   = useState(3500);
  const [selDate, setSelDate]           = useState(defaultEntry.timestamp.slice(0, 10));
  const [selHour, setSelHour]           = useState(defaultEntry.timestamp.slice(11, 13));
  const [direction, setDirection]       = useState('both');
  const [timeWindow, setTimeWindow]     = useState(2);
  const [priority, setPriority]         = useState(50);

  const hoursForDate = forecast.filter(r => r.timestamp.startsWith(selDate)).map(r => r.timestamp.slice(11, 13));

  const handleDateChange = (d) => {
    setSelDate(d);
    const hrs = forecast.filter(r => r.timestamp.startsWith(d)).map(r => r.timestamp.slice(11, 13));
    if (!hrs.includes(selHour)) setSelHour(hrs[0] ?? '18');
  };

  const result = useMemo(() => {
    const ts = `${selDate} ${selHour}:00`;
    let idx = forecast.findIndex(r => r.timestamp === ts);
    if (idx < 0) idx = 0;
    const current = forecast[idx];
    const flex = consumption * FLEXIBLE_RATIO;
    const cp = priority / 100, kp = 1 - cp;

    let lo = idx, hi = idx;
    if (direction === 'earlier') lo = Math.max(0, idx - timeWindow);
    else if (direction === 'later') hi = Math.min(forecast.length - 1, idx + timeWindow);
    else { lo = Math.max(0, idx - timeWindow); hi = Math.min(forecast.length - 1, idx + timeWindow); }

    const candidates = forecast.slice(lo, hi + 1).map(c => ({
      ...c,
      costSaving: flex * retailPrice(current.price) - flex * retailPrice(c.price),
      carbonReductionKg: (flex * current.carbon / 1000) - (flex * c.carbon / 1000),
    }));

    const prices  = candidates.map(c => c.price);
    const carbons = candidates.map(c => c.carbon);
    const [minP, maxP] = [Math.min(...prices),  Math.max(...prices)];
    const [minC, maxC] = [Math.min(...carbons), Math.max(...carbons)];

    let best = candidates[0], bestU = -Infinity;
    candidates.forEach(c => {
      const u = kp * (1 - normalize(c.price, minP, maxP)) + cp * (1 - normalize(c.carbon, minC, maxC));
      if (u > bestU) { bestU = u; best = c; }
    });

    const strategy = priority === 0 ? 'Cost-only recommendation'
                   : priority === 100 ? 'Carbon-only recommendation'
                   : 'Balanced recommendation';

    return { current, best, strategy };
  }, [consumption, selDate, selHour, direction, timeWindow, priority]);

  const { current, best, strategy } = result;
  const costPos   = best.costSaving >= 0;
  const carbonPos = best.carbonReductionKg >= 0;
  const recText   = `Move flexible electricity use from ${timeWithDate(current.timestamp)} to ${timeWithDate(best.timestamp)}. Search rule: ${dirLabel(direction)}${timeWindow} hours. This recommendation best matches your cost and carbon preference.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #07111d 0%, #1e3a8a 52%, #064e3b 100%)',
        borderRadius: '18px', padding: '1.75rem 2rem',
        boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
      }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#93c5fd', margin: '0 0 0.6rem' }}>
          Energy Decision Support
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Find a better hour to use electricity
        </h1>
      </div>

      {/* ── Section 1: Inputs ── */}
      <div>
        <p style={css.sectionLabel}>1. Household and schedule inputs</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>

          <div style={css.card}>
            <label style={css.label}>Annual electricity consumption</label>
            <input
              type="number" min="1" step="1" value={consumption}
              onChange={e => setConsumption(Number(e.target.value))}
              style={css.input}
            />
            <p style={css.note}>kWh/year</p>
          </div>

          <div style={css.card}>
            <label style={css.label}>Pick date</label>
            <select value={selDate} onChange={e => handleDateChange(e.target.value)} style={css.input}>
              {availableDates.map(d => <option key={d} value={d}>{dateLong(d)}</option>)}
            </select>
            <p style={css.note}>Dates are shown in English.</p>
          </div>

          <div style={css.card}>
            <label style={css.label}>Pick hour</label>
            <select value={selHour} onChange={e => setSelHour(e.target.value)} style={css.input}>
              {hoursForDate.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
            <p style={css.note}>Hour-only selection, no minutes.</p>
          </div>

          <div style={css.card}>
            <label style={css.label}>Flexibility direction</label>
            <select value={direction} onChange={e => setDirection(e.target.value)} style={css.input}>
              <option value="both">Earlier &amp; later (±)</option>
              <option value="earlier">Earlier only (-)</option>
              <option value="later">Later only (+)</option>
            </select>
            <p style={css.note}>Reflects what the household can realistically change.</p>
          </div>

          <div style={css.card}>
            <label style={css.label}>Search window</label>
            <select value={timeWindow} onChange={e => setTimeWindow(Number(e.target.value))} style={css.input}>
              {[1,2,4,6,8,12].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
            </select>
            <p style={css.note}>Bigger windows give more savings, but require more flexibility.</p>
          </div>

          <div style={css.card}>
            <label style={css.label}>Priority scale</label>
            <input
              type="range" min="0" max="100" step="1" value={priority}
              onChange={e => setPriority(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00e5a0', cursor: 'pointer', marginTop: '0.35rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.72rem', color: '#3d5872' }}>
              <span>💰 Cost Priority</span>
              <span>🌱 Carbon Priority</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Section 2: Recommendation ── */}
      <div>
        <p style={css.sectionLabel}>2. Personalized recommendation</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.875rem' }}>

          {/* Left */}
          <div style={css.highlightCard}>
            <span style={css.pill}>{strategy}</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#dde8f5', margin: '0.75rem 0 0.25rem' }}>
              Recommended Time
            </h2>
            <div style={{ fontSize: '3.25rem', fontWeight: 800, color: '#00e5a0', letterSpacing: '-0.04em', lineHeight: 1, margin: '0.1rem 0 0.75rem' }}>
              {recommendedTime(current.timestamp, best.timestamp)}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#7a9ab8', lineHeight: 1.65, margin: 0 }}>
              {recText}
            </p>
          </div>

          {/* Right */}
          <div style={css.highlightCard}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#dde8f5', margin: '0 0 0.875rem' }}>
              Estimated Annual Impact
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={css.impactStat}>
                <p style={css.impactLabel}>Cost change</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: costPos ? '#00e5a0' : '#f87171' }}>
                  {signedEuro(best.costSaving)}
                </div>
              </div>
              <div style={css.impactStat}>
                <p style={css.impactLabel}>CO₂ change</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: carbonPos ? '#00e5a0' : '#f87171' }}>
                  {signedCarbon(best.carbonReductionKg / 1000)}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#7a9ab8', lineHeight: 1.6, margin: '0.875rem 0 0' }}>
              Estimated using forecast electricity prices and carbon intensity for the selected recommendation.
            </p>
          </div>

        </div>
      </div>

      {/* ── Section 3: Comparison table ── */}
      <div>
        <p style={css.sectionLabel}>3. Forecast comparison</p>
        <div style={{ ...css.card, padding: '1.25rem 1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#dde8f5', margin: '0 0 1rem' }}>
            Selected Hour vs Recommended Hour
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['Metric', 'Selected Hour', 'Recommended Hour'].map(h => (
                  <th key={h} style={css.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={css.td}>Time</td>
                <td style={css.td}>{timeWithDate(current.timestamp)}</td>
                <td style={css.td}>{timeWithDate(best.timestamp)}</td>
              </tr>
              <tr>
                <td style={css.td}>Forecast wholesale price</td>
                <td style={css.td}>{current.price.toFixed(2)} €/MWh</td>
                <td style={{ ...css.td, fontWeight: 700, color: best.price <= current.price ? '#00e5a0' : '#f87171' }}>
                  {best.price.toFixed(2)} €/MWh
                </td>
              </tr>
              <tr>
                <td style={{ ...css.td, border: 'none' }}>Carbon intensity</td>
                <td style={{ ...css.td, border: 'none' }}>{current.carbon.toFixed(2)} kgCO₂/MWh</td>
                <td style={{ ...css.td, border: 'none', fontWeight: 700, color: best.carbon <= current.carbon ? '#00e5a0' : '#f87171' }}>
                  {best.carbon.toFixed(2)} kgCO₂/MWh
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ─── Style objects ────────────────────────────────────────────────────────────
const css = {
  sectionLabel: {
    fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: '#3d5872', margin: '0 0 0.75rem',
  },
  card: {
    background: '#101f31',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '1.1rem 1.25rem',
  },
  highlightCard: {
    background: '#101f31',
    borderRadius: '14px',
    padding: '1.35rem 1.5rem',
    boxShadow: '0 0 0 1px rgba(0,229,160,0.22), 0 0 0 1px rgba(59,130,246,0.12)',
  },
  label: {
    display: 'block', marginBottom: '0.5rem',
    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#3d5872',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '0.6rem 0.75rem',
    background: '#07111d',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '8px',
    color: '#dde8f5',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.88rem',
    outline: 'none',
    cursor: 'pointer',
  },
  note: {
    margin: '0.45rem 0 0',
    fontSize: '0.72rem', color: '#3d5872', lineHeight: 1.5,
  },
  pill: {
    display: 'inline-block', padding: '0.3rem 0.8rem',
    borderRadius: '999px',
    background: 'rgba(0,229,160,0.12)',
    color: '#00e5a0',
    fontWeight: 700, fontSize: '0.75rem',
    border: '1px solid rgba(0,229,160,0.28)',
  },
  impactStat: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '0.875rem 1rem',
  },
  impactLabel: {
    margin: '0 0 0.45rem',
    fontSize: '0.6rem', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.09em',
    color: '#3d5872',
  },
  th: {
    padding: '0.6rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    textAlign: 'left',
    fontSize: '0.62rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.09em',
    color: '#3d5872',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    color: '#dde8f5',
    fontSize: '0.85rem',
  },
};