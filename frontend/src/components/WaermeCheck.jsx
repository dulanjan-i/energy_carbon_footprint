import React, { useState, useEffect, useMemo } from 'react';

const WAERME_DATA = {
  "06108": { zone: "connected",  district: "City Center",                  status: "District Heating Available", distanceM: 80,   currentEmissionsKg: 4200, fernwaermeEmissionsKg: 1050, savingsPercent: 75, expansionYear: "Available Now",      tip: "Your district is directly on the existing network. Connection is possible immediately." },
  "06110": { zone: "connected",  district: "Glaucha / South Inner City",   status: "District Heating Available", distanceM: 120,  currentEmissionsKg: 3900, fernwaermeEmissionsKg: 975,  savingsPercent: 75, expansionYear: "Available Now",      tip: "The heating network runs through your district. Contact your landlord about connecting." },
  "06112": { zone: "connected",  district: "North Inner City / Paulusviertel", status: "District Heating Available", distanceM: 200, currentEmissionsKg: 4100, fernwaermeEmissionsKg: 1025, savingsPercent: 75, expansionYear: "Available Now",  tip: "Paulusviertel is well connected. EVH district heating here already utilizes solar thermal energy." },
  "06114": { zone: "connected",  district: "Böllberg / Wörmlitz",          status: "District Heating Available", distanceM: 300,  currentEmissionsKg: 3800, fernwaermeEmissionsKg: 950,  savingsPercent: 75, expansionYear: "Available Now",      tip: "Your area is close to the Dieselstraße power plant — short pipelines mean lower connection costs." },
  "06116": { zone: "planned",    district: "Neustadt",                     status: "Planned Expansion",          distanceM: 600,  currentEmissionsKg: 4500, fernwaermeEmissionsKg: 1125, savingsPercent: 75, expansionYear: "Expansion by 2027", tip: "EVH will connect larger blocks in Neustadt by 2027. Early pre-registration is open." },
  "06118": { zone: "planned",    district: "Ammendorf / Radewell",         status: "Planned Expansion",          distanceM: 900,  currentEmissionsKg: 4300, fernwaermeEmissionsKg: 1075, savingsPercent: 75, expansionYear: "Expansion by 2029", tip: "EVH plans to extend the network to your district by 2029." },
  "06120": { zone: "planned",    district: "Heide-Nord / Blumenau",        status: "Planned Expansion",          distanceM: 1100, currentEmissionsKg: 4600, fernwaermeEmissionsKg: 1150, savingsPercent: 75, expansionYear: "Expansion by 2031", tip: "For apartment blocks in Heide-Nord, district heating is the most economical decarbonisation option." },
  "06126": { zone: "planned",    district: "Halle-South / Silberhöhe",     status: "Planned Expansion",          distanceM: 800,  currentEmissionsKg: 4400, fernwaermeEmissionsKg: 1100, savingsPercent: 75, expansionYear: "Expansion by 2029", tip: "Silberhöhe is scheduled for 2029. A nearby Power-to-Heat plant will heavily reduce emissions." },
  "06132": { zone: "individual", district: "Lettin / Tornau",              status: "Individual Heating Required", distanceM: 4200, currentEmissionsKg: 4800, fernwaermeEmissionsKg: null, savingsPercent: null, expansionYear: null,               tip: "Your location is outside the planned network. An air-source heat pump combined with our Smart Energy Planner is the optimal solution." },
  "06179": { zone: "individual", district: "Teutschenthal (Suburbs)",      status: "Individual Heating Required", distanceM: 8500, currentEmissionsKg: 5200, fernwaermeEmissionsKg: null, savingsPercent: null, expansionYear: null,               tip: "Rural area — district heating not planned. A heat pump + solar PV + battery storage is the recommended setup." },
};

const POSTCODE_COORDS = {
  "06108": { lat: 51.4826, lng: 11.9698 },
  "06110": { lat: 51.4746, lng: 11.9634 },
  "06112": { lat: 51.4925, lng: 11.9745 },
  "06114": { lat: 51.4590, lng: 11.9540 },
  "06116": { lat: 51.4800, lng: 11.9160 },
  "06118": { lat: 51.4300, lng: 11.9860 },
  "06120": { lat: 51.5130, lng: 11.9320 },
  "06126": { lat: 51.4420, lng: 11.9800 },
  "06132": { lat: 51.5230, lng: 11.9120 },
  "06179": { lat: 51.4450, lng: 11.8100 },
};

const ZONE_CONFIG = {
  connected:  { label: "✅ District Heating Available", color: "#16A34A", bg: "#F0FDF4", border: "rgba(22,163,74,0.22)",   cta: "Request Connection →"    },
  planned:    { label: "⏳ Planned Expansion Area",     color: "#D97706", bg: "#FFFBEB", border: "rgba(217,119,6,0.22)",   cta: "Pre-Register Interest →" },
  individual: { label: "ℹ️ Individual System Required", color: "#1B4FBB", bg: "#EFF6FF", border: "rgba(27,79,187,0.22)",   cta: "View Heat Pump Tips →"   },
};

const DID_YOU_KNOW = [
  { stat: "75%",      icon: "🏙️", desc: "District heating cuts household heating emissions by up to 75% compared to gas boilers." },
  { stat: "3x More",  icon: "⚡", desc: "Modern heat pumps deliver 3 units of heat for every 1 unit of electricity they consume." },
  { stat: "Zero-CO₂", icon: "🌱", desc: "EVH's goal is to transition the entire heating network to 100% renewable energy by 2040." },
];

export default function WaermeCheck({ postcode, onPostcodeChange }) {
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Handle auto check on postcode load
  useEffect(() => {
    if (postcode && postcode.trim().length === 5) {
      const match = WAERME_DATA[postcode.trim()];
      if (match) {
        setResult(match);
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    } else {
      setResult(null);
      setNotFound(false);
    }
  }, [postcode]);

  const handleCheck = () => {
    if (postcode && postcode.trim()) {
      const match = WAERME_DATA[postcode.trim()];
      if (match) {
        setResult(match);
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    }
  };

  const zone = result ? ZONE_CONFIG[result.zone] : null;

  // Dynamically calculate the official SWH map URL
  const mapUrl = useMemo(() => {
    let lat = 51.4776;
    let lng = 11.9651;
    let zoom = 12;

    const cleanPostcode = postcode ? postcode.trim() : "";
    if (result && POSTCODE_COORDS[cleanPostcode]) {
      const coords = POSTCODE_COORDS[cleanPostcode];
      lat = coords.lat;
      lng = coords.lng;
      zoom = 14;
    }

    return `https://swh.de/fwa/#${zoom}/${lat}/${lng}`;
  }, [result, postcode]);

  const T = {
    sectionLabel: { fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', marginBottom: '0.35rem' },
    card:  { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' },
    title: { fontSize: '1.45rem', fontWeight: 800, color: '#020617', letterSpacing: '-0.025em', marginBottom: '0.35rem' },
    body:  { fontSize: '0.95rem', color: '#1E293B', lineHeight: 1.65 },
    muted: { fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div>
        <p style={T.sectionLabel}>🗺️ EVH Heating Options Check</p>
        <h2 style={T.title}>Are Heating Options near you?</h2>
        <p style={T.body}>Enter your Halle (Saale) postal code to check connection options.</p>
      </div>

      {/* Split layout: inputs/stats on the left, map on the right */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
        
        {/* Left Side: Form and Calculations */}
        <div style={{ flex: 1.2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Search bar */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '10px', overflow: 'hidden',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}>
              <input
                type="text"
                value={postcode}
                onChange={e => {
                  if (onPostcodeChange) onPostcodeChange(e.target.value);
                }}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                placeholder="e.g. 06108"
                maxLength={5}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#020617', fontFamily: 'Inter, sans-serif',
                  fontSize: '0.95rem', fontWeight: 500, padding: '0.7rem 1rem',
                }}
              />
            </div>
            <button
              onClick={handleCheck}
              style={{
                padding: '0.7rem 1.5rem',
                background: '#1B4FBB', border: 'none', borderRadius: '10px',
                color: '#FFFFFF', fontFamily: 'Inter, sans-serif',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(27,79,187,0.22)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1741A6'}
              onMouseLeave={e => e.currentTarget.style.background = '#1B4FBB'}
            >
              Check
            </button>
          </div>

          {/* Not found message */}
          {notFound && (
            <div style={{ padding: '1rem', background: '#FFFBEB', border: '1px solid rgba(217,119,6,0.2)', borderRadius: '10px', color: '#1E293B', fontSize: '0.82rem' }}>
              No data for <strong style={{ color: '#020617' }}>{postcode}</strong>. Supported: 06108, 06110, 06112, 06114, 06116, 06118, 06120, 06126, 06132, 06179
            </div>
          )}

          {/* Result Card */}
          {result && zone ? (
            <div style={{ 
              background: zone.bg, 
              border: `1px solid ${zone.border}`, 
              borderRadius: '14px', 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.1rem', 
              boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
              flex: 1 
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.3rem' }}>
                    {result.district}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: zone.color }}>{zone.label}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.2rem' }}>Network Distance</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#020617' }}>
                    {result.distanceM < 1000 ? `~${result.distanceM} m` : `~${(result.distanceM / 1000).toFixed(1)} km`}
                  </div>
                </div>
              </div>

              {result.zone !== 'individual' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { label: 'Current (Gas)',      value: result.currentEmissionsKg.toLocaleString(), unit: 'kgCO2/yr', color: '#DC2626' },
                    { label: 'With District Heat', value: result.fernwaermeEmissionsKg.toLocaleString(), unit: 'kgCO2/yr', color: '#16A34A' },
                    { label: 'Savings',            value: `-${result.savingsPercent}%`, unit: 'CO₂ reduction', color: '#16A34A' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                      <div style={{ fontSize: '0.82rem', color: '#1E293B', marginTop: '0.2rem' }}>{s.unit}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.expansionYear && (
                <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.28rem 0.8rem', borderRadius: '999px', background: 'rgba(255,255,255,0.7)', color: zone.color, border: `1px solid ${zone.border}`, display: 'inline-block', width: 'fit-content' }}>
                  📅 {result.expansionYear}
                </span>
              )}

              <p style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.7, margin: 0 }}>{result.tip}</p>

              <button
                style={{
                  padding: '0.75rem', background: zone.color === '#D97706' ? '#B45309' : zone.color,
                  border: 'none', borderRadius: '9px', color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                  cursor: 'pointer', width: '100%', transition: 'opacity 0.15s',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.12)', marginTop: 'auto'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {zone.cta}
              </button>
            </div>
          ) : (
            /* Placeholder result card if no postcode matches yet */
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px',
              padding: '2.5rem 1.5rem', textAlign: 'center', color: '#475569',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem', flex: 1, minHeight: '260px', boxShadow: '0 1px 3px rgba(15,23,42,0.05)'
            }}>
              <span style={{ fontSize: '2.2rem' }}>🔍</span>
              <p style={{ fontWeight: 700, color: '#020617', margin: 0, fontSize: '0.95rem' }}>No Postcode Selected</p>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '280px' }}>
                Enter your postal code above to inspect connection distance, emissions tables, and savings.
              </p>
            </div>
          )}

        </div>

        {/* Right Side: Official SWH Map Iframe */}
        <div style={{ flex: 1.5, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <p style={T.sectionLabel}>🗺️ HALLE (SAALE) NETWORK MAP</p>
          <div style={{ 
            background: '#FFFFFF', 
            border: '1px solid #E2E8F0', 
            borderRadius: '14px', 
            overflow: 'hidden', 
            height: '100%', 
            minHeight: '380px',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
            position: 'relative'
          }}>
            <iframe 
              src={mapUrl}
              title="SWH District Heating Map"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '380px',
                border: 'none',
                display: 'block'
              }}
              allow="geolocation"
            />
          </div>
        </div>

      </div>

      {/* Did You Know */}
      <div style={{ marginTop: '0.5rem' }}>
        <p style={{ ...T.sectionLabel, marginBottom: '0.75rem' }}>💡 Did You Know?</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
          {DID_YOU_KNOW.map(item => (
            <div key={item.stat} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}>{item.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1B4FBB', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
                {item.stat}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1E293B', lineHeight: 1.55 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}