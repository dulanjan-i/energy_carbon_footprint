import { useState } from 'react';

// Hardcoded from EVH Wärmeatlas data — Halle (Saale) postcodes
const WAERME_DATA = {
  // Connected / Available
  "06108": {
    zone: "connected",
    district: "City Center",
    status: "District Heating Available",
    distanceM: 80,
    currentEmissionsKg: 4200,
    fernwaermeEmissionsKg: 1050,
    savingsPercent: 75,
    expansionYear: "Available Now",
    tip: "Your district is directly on the existing network. Connection is possible immediately."
  },
  "06110": {
    zone: "connected",
    district: "Glaucha / South Inner City",
    status: "District Heating Available",
    distanceM: 120,
    currentEmissionsKg: 3900,
    fernwaermeEmissionsKg: 975,
    savingsPercent: 75,
    expansionYear: "Available Now",
    tip: "The heating network runs through your district. Contact your landlord about connecting."
  },
  "06112": {
    zone: "connected",
    district: "North Inner City / Paulusviertel",
    status: "District Heating Available",
    distanceM: 200,
    currentEmissionsKg: 4100,
    fernwaermeEmissionsKg: 1025,
    savingsPercent: 75,
    expansionYear: "Available Now",
    tip: "Paulusviertel is well connected. EVH district heating here already utilizes solar thermal energy."
  },
  "06114": {
    zone: "connected",
    district: "Böllberg / Wörmlitz",
    status: "District Heating Available",
    distanceM: 300,
    currentEmissionsKg: 3800,
    fernwaermeEmissionsKg: 950,
    savingsPercent: 75,
    expansionYear: "Available Now",
    tip: "Your area is close to the Dieselstraße power plant — short pipelines mean lower connection costs."
  },
  // Planned Expansion
  "06116": {
    zone: "planned",
    district: "Neustadt",
    status: "Planned Expansion",
    distanceM: 650,
    currentEmissionsKg: 4500,
    fernwaermeEmissionsKg: 1125,
    savingsPercent: 75,
    expansionYear: "Expansion by 2027",
    tip: "Neustadt is part of the 2027-2031 expansion phase. Reserving your connection now is recommended."
  },
  "06118": {
    zone: "planned",
    district: "Ammendorf / Radewell",
    status: "Planned Expansion",
    distanceM: 900,
    currentEmissionsKg: 4300,
    fernwaermeEmissionsKg: 1075,
    savingsPercent: 75,
    expansionYear: "Expansion by 2029",
    tip: "EVH plans to extend the network to your district by 2029."
  },
  "06120": {
    zone: "planned",
    district: "Heide-Nord / Blumenau",
    status: "Planned Expansion",
    distanceM: 1100,
    currentEmissionsKg: 4600,
    fernwaermeEmissionsKg: 1150,
    savingsPercent: 75,
    expansionYear: "Expansion by 2031",
    tip: "For apartment blocks in Heide-Nord, district heating is the most economical decarbonization option."
  },
  "06126": {
    zone: "planned",
    district: "Halle-South / Silberhöhe",
    status: "Planned Expansion",
    distanceM: 800,
    currentEmissionsKg: 4400,
    fernwaermeEmissionsKg: 1100,
    savingsPercent: 75,
    expansionYear: "Expansion by 2029",
    tip: "Silberhöhe is scheduled for 2029. A nearby Power-to-Heat plant will heavily reduce emissions."
  },
  // Individual Heating (Outside Network)
  "06132": {
    zone: "individual",
    district: "Lettin / Tornau",
    status: "Individual Heating Required",
    distanceM: 4200,
    currentEmissionsKg: 4800,
    fernwaermeEmissionsKg: null,
    savingsPercent: null,
    expansionYear: null,
    tip: "Your location is outside the planned network. An air-source heat pump combined with our Shift Simulator is the optimal solution."
  },
  "06179": {
    zone: "individual",
    district: "Teutschenthal (Suburbs)",
    status: "Individual Heating Required",
    distanceM: 8500,
    currentEmissionsKg: 5200,
    fernwaermeEmissionsKg: null,
    savingsPercent: null,
    expansionYear: null,
    tip: "Rural area — district heating not planned. A heat pump + solar PV + battery storage is the recommended setup."
  },
};

const ZONE_CONFIG = {
  connected: {
    label: "✅ District Heating Available",
    color: "#20c997",
    bg: "rgba(32,201,151,0.08)",
    border: "rgba(32,201,151,0.3)",
    cta: "Request Connection →",
  },
  planned: {
    label: "🔜 Expansion Planned",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    cta: "Reserve Spot Now →",
  },
  individual: {
    label: "⚡ Heat Pump Recommended",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.3)",
    cta: "Request Consultation →",
  },
};

export default function WaermeCheck() {
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleCheck = () => {
    const trimmed = postcode.trim();
    if (WAERME_DATA[trimmed]) {
      setResult(WAERME_DATA[trimmed]);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const zone = result ? ZONE_CONFIG[result.zone] : null;

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      background: '#0b1929',
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.07)',
      color: 'white',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#627d98', marginBottom: '0.4rem' }}>
          🗺️ EVH Heating Network Check
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f4f8', marginBottom: '0.3rem' }}>
          Is District Heating near you?
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#627d98', lineHeight: 1.5 }}>
          Enter your postal code to check if your building can connect to the EVH network.
        </p>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input
          type="text"
          value={postcode}
          onChange={e => { setPostcode(e.target.value); setResult(null); setNotFound(false); }}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          placeholder="e.g. 06108"
          maxLength={5}
          style={{
            flex: 1,
            padding: '0.65rem 1rem',
            background: '#112236',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#f0f4f8',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <button
          onClick={handleCheck}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #20c997, #1992d4)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Check
        </button>
      </div>

      {/* Not found */}
      {notFound && (
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', color: '#627d98', fontSize: '0.85rem' }}>
          No data found for postal code <strong style={{ color: '#9fb3c8' }}>{postcode}</strong>. Supported Halle (Saale) codes: 06108, 06110, 06112, 06114, 06116, 06118, 06120, 06126, 06132, 06179.
        </div>
      )}

      {/* Result */}
      {result && zone && (
        <div style={{
          padding: '1.25rem',
          background: zone.bg,
          border: `1px solid ${zone.border}`,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
        }}>
          {/* Zone badge + district */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#627d98' }}>
                {result.district}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: zone.color, marginTop: '0.2rem' }}>
                {zone.label}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#627d98' }}>Network Distance</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f4f8' }}>
                {result.distanceM < 1000 ? `~${result.distanceM} m` : `~${(result.distanceM/1000).toFixed(1)} km`}
              </div>
            </div>
          </div>

          {/* Emissions comparison — only for connected/planned */}
          {result.zone !== 'individual' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#627d98', marginBottom: '0.3rem' }}>Current (Gas)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171' }}>{result.currentEmissionsKg.toLocaleString()}</div>
                <div style={{ fontSize: '0.68rem', color: '#627d98' }}>kg CO₂/yr</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#627d98', marginBottom: '0.3rem' }}>With District Heat</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#20c997' }}>{result.fernwaermeEmissionsKg.toLocaleString()}</div>
                <div style={{ fontSize: '0.68rem', color: '#627d98' }}>kg CO₂/yr</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#627d98', marginBottom: '0.3rem' }}>Savings</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#20c997' }}>-{result.savingsPercent}%</div>
                <div style={{ fontSize: '0.68rem', color: '#627d98' }}>CO₂</div>
              </div>
            </div>
          )}

          {/* Expansion year pill */}
          {result.expansionYear && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', color: zone.color }}>
                📅 {result.expansionYear}
              </span>
            </div>
          )}

          {/* Tip */}
          <p style={{ fontSize: '0.83rem', color: '#9fb3c8', lineHeight: 1.6, margin: 0 }}>
            {result.tip}
          </p>

          {/* CTA */}
          <button style={{
            padding: '0.65rem',
            background: zone.color,
            border: 'none',
            borderRadius: '8px',
            color: result.zone === 'connected' ? '#0b4d39' : '#0b1929',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            width: '100%',
          }}>
            {zone.cta}
          </button>
        </div>
      )}
    </div>
  );
}