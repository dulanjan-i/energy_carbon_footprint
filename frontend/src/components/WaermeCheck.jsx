import { useState } from 'react';

const WAERME_DATA = {
  "06108": { zone: "connected", district: "City Center", status: "District Heating Available", distanceM: 80, currentEmissionsKg: 4200, fernwaermeEmissionsKg: 1050, savingsPercent: 75, expansionYear: "Available Now", tip: "Your district is directly on the existing network. Connection is possible immediately." },
  "06110": { zone: "connected", district: "Glaucha / South Inner City", status: "District Heating Available", distanceM: 120, currentEmissionsKg: 3900, fernwaermeEmissionsKg: 975, savingsPercent: 75, expansionYear: "Available Now", tip: "The heating network runs through your district. Contact your landlord about connecting." },
  "06112": { zone: "connected", district: "North Inner City / Paulusviertel", status: "District Heating Available", distanceM: 200, currentEmissionsKg: 4100, fernwaermeEmissionsKg: 1025, savingsPercent: 75, expansionYear: "Available Now", tip: "Paulusviertel is well connected. EVH district heating here already utilizes solar thermal energy." },
  "06114": { zone: "connected", district: "Böllberg / Wörmlitz", status: "District Heating Available", distanceM: 300, currentEmissionsKg: 3800, fernwaermeEmissionsKg: 950, savingsPercent: 75, expansionYear: "Available Now", tip: "Your area is close to the Dieselstraße power plant — short pipelines mean lower connection costs." },
  "06116": { zone: "planned", district: "Neustadt", status: "Planned Expansion", distanceM: 650, currentEmissionsKg: 4500, fernwaermeEmissionsKg: 1125, savingsPercent: 75, expansionYear: "Expansion by 2027", tip: "Neustadt is part of the 2027–2031 expansion phase. Reserving your connection now is recommended." },
  "06118": { zone: "planned", district: "Ammendorf / Radewell", status: "Planned Expansion", distanceM: 900, currentEmissionsKg: 4300, fernwaermeEmissionsKg: 1075, savingsPercent: 75, expansionYear: "Expansion by 2029", tip: "EVH plans to extend the network to your district by 2029." },
  "06120": { zone: "planned", district: "Heide-Nord / Blumenau", status: "Planned Expansion", distanceM: 1100, currentEmissionsKg: 4600, fernwaermeEmissionsKg: 1150, savingsPercent: 75, expansionYear: "Expansion by 2031", tip: "For apartment blocks in Heide-Nord, district heating is the most economical decarbonization option." },
  "06126": { zone: "planned", district: "Halle-South / Silberhöhe", status: "Planned Expansion", distanceM: 800, currentEmissionsKg: 4400, fernwaermeEmissionsKg: 1100, savingsPercent: 75, expansionYear: "Expansion by 2029", tip: "Silberhöhe is scheduled for 2029. A nearby Power-to-Heat plant will heavily reduce emissions." },
  "06132": { zone: "individual", district: "Lettin / Tornau", status: "Individual Heating Required", distanceM: 4200, currentEmissionsKg: 4800, fernwaermeEmissionsKg: null, savingsPercent: null, expansionYear: null, tip: "Your location is outside the planned network. An air-source heat pump combined with our Shift Simulator is the optimal solution." },
  "06179": { zone: "individual", district: "Teutschenthal (Suburbs)", status: "Individual Heating Required", distanceM: 8500, currentEmissionsKg: 5200, fernwaermeEmissionsKg: null, savingsPercent: null, expansionYear: null, tip: "Rural area — district heating not planned. A heat pump + solar PV + battery storage is the recommended setup." },
};

const ZONE_CONFIG = {
  connected: { label: "✅ District Heating Available", color: "#00e5a0", bg: "rgba(0,229,160,0.07)", border: "rgba(0,229,160,0.22)", cta: "Request Connection →" },
  planned:   { label: "🔜 Expansion Planned",          color: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.22)", cta: "Reserve Spot Now →" },
  individual:{ label: "⚡ Heat Pump Recommended",      color: "#3b82f6", bg: "rgba(59,130,246,0.07)", border: "rgba(59,130,246,0.22)", cta: "Request Consultation →" },
};

const DID_YOU_KNOW = [
  { icon: '🏙️', stat: '~40%', desc: 'of Halle buildings already on EVH network' },
  { icon: '🌿', stat: '75%',  desc: 'less CO₂ vs gas heating with district heat' },
  { icon: '☀️', stat: '2031', desc: 'target: 65% renewable energy in district heat' },
];

export default function WaermeCheck() {
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleCheck = () => {
    const trimmed = postcode.trim();
    if (WAERME_DATA[trimmed]) { setResult(WAERME_DATA[trimmed]); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };

  const zone = result ? ZONE_CONFIG[result.zone] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d5872', marginBottom: '0.35rem' }}>
          🗺️ EVH Heating Network Check
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dde8f5', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
          Is District Heating near you?
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#7a9ab8', lineHeight: 1.6 }}>
          Enter your Halle (Saale) postal code to check connection options.
        </p>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: '#101f31', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '10px', overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}>
          <input
            type="text"
            value={postcode}
            onChange={e => { setPostcode(e.target.value); setResult(null); setNotFound(false); }}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            placeholder="e.g. 06108"
            maxLength={5}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#dde8f5', fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem', fontWeight: 500, padding: '0.7rem 1rem',
            }}
          />
        </div>
        <button
          onClick={handleCheck}
          style={{
            padding: '0.7rem 1.4rem',
            background: 'linear-gradient(135deg, #00e5a0, #00c48a)',
            border: 'none', borderRadius: '10px', color: '#012b1a',
            fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '0.85rem',
            cursor: 'pointer', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Check
        </button>
      </div>

      {/* Not found */}
      {notFound && (
        <div style={{ padding: '1rem', background: '#101f31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: '#7a9ab8', fontSize: '0.82rem' }}>
          No data for <strong style={{ color: '#dde8f5' }}>{postcode}</strong>. Supported codes: 06108, 06110, 06112, 06114, 06116, 06118, 06120, 06126, 06132, 06179
        </div>
      )}

      {/* Result card */}
      {result && zone && (
        <div style={{ background: zone.bg, border: `1px solid ${zone.border}`, borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3d5872', marginBottom: '0.3rem' }}>
                {result.district}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: zone.color }}>{zone.label}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.62rem', color: '#3d5872', marginBottom: '0.2rem' }}>Network Distance</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dde8f5' }}>
                {result.distanceM < 1000 ? `~${result.distanceM} m` : `~${(result.distanceM/1000).toFixed(1)} km`}
              </div>
            </div>
          </div>

          {result.zone !== 'individual' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Current (Gas)', value: result.currentEmissionsKg.toLocaleString(), unit: 'kg CO₂/yr', color: '#f87171' },
                { label: 'With District Heat', value: result.fernwaermeEmissionsKg.toLocaleString(), unit: 'kg CO₂/yr', color: '#00e5a0' },
                { label: 'Savings', value: `-${result.savingsPercent}%`, unit: 'CO₂', color: '#00e5a0' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '9px', padding: '0.9rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: '#3d5872', marginBottom: '0.35rem', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: '0.62rem', color: '#3d5872', marginTop: '0.2rem' }}>{s.unit}</div>
                </div>
              ))}
            </div>
          )}

          {result.expansionYear && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', color: zone.color, display: 'inline-block' }}>
              📅 {result.expansionYear}
            </span>
          )}

          <p style={{ fontSize: '0.82rem', color: '#9fb3c8', lineHeight: 1.65, margin: 0 }}>{result.tip}</p>

          <button style={{
            padding: '0.7rem', background: zone.color, border: 'none',
            borderRadius: '9px', color: result.zone === 'connected' ? '#012b1a' : '#07111d',
            fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', width: '100%',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {zone.cta}
          </button>
        </div>
      )}

      {/* Did You Know — fills whitespace always */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d5872', marginBottom: '0.75rem' }}>
          💡 Did You Know?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
          {DID_YOU_KNOW.map(item => (
            <div key={item.stat} style={{
              background: '#101f31', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}>{item.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00e5a0', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
                {item.stat}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7a9ab8', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}