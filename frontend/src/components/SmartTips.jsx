// src/components/SmartTips.jsx
// Personalised carbon + savings tip engine — fully client-side, no backend needed.

const TIPS_ENGINE = (formData, postcodeData) => {
  const electricityBill = Number(formData.electricityBill) || 0;
  const annualHeatingBill = Number(formData.annualHeatingBill) || 0;
  const householdSize = Number(formData.householdSize) || 1;
  const zone = postcodeData?.zone || null;

  const tips = [];

  // ─── HEATING TIPS ────────────────────────────────────────────────────
  if (zone === 'connected') {
    tips.push({
      id: 'dh-connected',
      category: 'Heating',
      priority: 'high',
      icon: '🏙️',
      title: 'Switch to EVH District Heating',
      description:
        'Your postcode is directly on the EVH network. Switching from gas to district heating cuts your annual heating CO₂ by up to 75% — the single biggest action you can take.',
      co2SavedKg: Math.round(annualHeatingBill * 2.5 * 0.75),
      eurSaved: Math.round(annualHeatingBill * 0.15),
      action: 'Check Heating Network',
      actionTab: 'heating',
    });
  }

  if (zone === 'planned') {
    tips.push({
      id: 'dh-planned',
      category: 'Heating',
      priority: 'high',
      icon: '📅',
      title: 'Pre-register for District Heating Expansion',
      description:
        'EVH is expanding to your area. By reserving your connection now you lock in subsidised connection rates and avoid paying full price when the network arrives.',
      co2SavedKg: Math.round(annualHeatingBill * 2.5 * 0.75),
      eurSaved: Math.round(annualHeatingBill * 0.12),
      action: 'Reserve Your Spot',
      actionTab: 'heating',
    });
  }

  if (zone === 'individual') {
    tips.push({
      id: 'heat-pump',
      category: 'Heating',
      priority: 'high',
      icon: '♨️',
      title: 'Install an Air-Source Heat Pump',
      description:
        'Your location is outside the district heating network. An air-source heat pump is 3× more efficient than gas and can cut heating emissions by 65% when paired with green electricity.',
      co2SavedKg: Math.round(annualHeatingBill * 2.5 * 0.65),
      eurSaved: Math.round(annualHeatingBill * 0.25),
      action: 'Request Consultation',
      actionTab: 'heating',
    });
  }

  if (annualHeatingBill > 1200) {
    tips.push({
      id: 'insulation',
      category: 'Heating',
      priority: 'high',
      icon: '🏠',
      title: 'Insulate Your Roof & Walls',
      description:
        'With a high heating bill, poor insulation is likely your biggest hidden cost. Roof insulation alone can cut heat loss by 25% and typically pays back within 4 years.',
      co2SavedKg: Math.round(annualHeatingBill * 2.5 * 0.25),
      eurSaved: Math.round(annualHeatingBill * 0.25),
      action: null,
      actionTab: null,
    });
  }

  if (annualHeatingBill > 800) {
    tips.push({
      id: 'thermostat',
      category: 'Heating',
      priority: 'medium',
      icon: '🌡️',
      title: 'Install a Smart Thermostat',
      description:
        'Lowering your thermostat by just 1°C saves ~10% on heating. A smart thermostat learns your schedule and can reduce annual heating bills by 15–20% automatically.',
      co2SavedKg: Math.round(annualHeatingBill * 2.5 * 0.15),
      eurSaved: Math.round(annualHeatingBill * 0.15),
      action: null,
      actionTab: null,
    });
  }

  // ─── ELECTRICITY TIPS ────────────────────────────────────────────────
  if (electricityBill > 60) {
    tips.push({
      id: 'shift-appliances',
      category: 'Electricity',
      priority: electricityBill > 100 ? 'high' : 'medium',
      icon: '⏰',
      title: 'Shift Appliances to Green Windows',
      description:
        'Running your washing machine, dishwasher, or EV charger during low-carbon hours (shown in the Shift Simulator) can cut your electricity carbon by up to 30% with zero lifestyle change.',
      co2SavedKg: Math.round((electricityBill * 12) * 0.18),
      eurSaved: Math.round((electricityBill * 12) * 0.12),
      action: 'Open Shift Simulator',
      actionTab: 'simulator',
    });
  }

  if (electricityBill > 80) {
    tips.push({
      id: 'solar-pv',
      category: 'Electricity',
      priority: 'medium',
      icon: '☀️',
      title: 'Install Solar PV Panels',
      description:
        'With your electricity usage level, a 5 kWp rooftop system would generate ~4,500 kWh/year — covering 60–80% of typical household demand and paying back in 7–9 years.',
      co2SavedKg: Math.round((electricityBill * 12) * 0.35),
      eurSaved: Math.round((electricityBill * 12) * 0.55),
      action: null,
      actionTab: null,
    });
  }

  if (electricityBill > 50) {
    tips.push({
      id: 'led-lighting',
      category: 'Electricity',
      priority: 'low',
      icon: '💡',
      title: 'Switch All Bulbs to LED',
      description:
        'LED bulbs use 75% less energy than incandescent. A full household switch costs under €50 and saves around €80–€120/year on electricity — a guaranteed quick win.',
      co2SavedKg: Math.round(householdSize * 35),
      eurSaved: Math.round(householdSize * 30),
      action: null,
      actionTab: null,
    });
  }

  // ─── HOUSEHOLD SIZE TIPS ─────────────────────────────────────────────
  if (householdSize >= 4) {
    tips.push({
      id: 'smart-strips',
      category: 'Behaviour',
      priority: 'low',
      icon: '🔌',
      title: 'Use Smart Power Strips',
      description:
        'Larger households have more standby devices. Smart power strips automatically cut power to devices in standby — typically saving €40–€80/year per household.',
      co2SavedKg: Math.round(householdSize * 20),
      eurSaved: Math.round(householdSize * 15),
      action: null,
      actionTab: null,
    });

    tips.push({
      id: 'shared-ev',
      category: 'Transport',
      priority: 'medium',
      icon: '🚗',
      title: 'Shared EV or Car Subscription',
      description:
        'For households of 4+, a shared EV replaces short petrol trips and eliminates one car\'s worth of fuel. Charge during green windows for near-zero transport emissions.',
      co2SavedKg: 850,
      eurSaved: 600,
      action: null,
      actionTab: null,
    });
  }

  if (householdSize >= 2) {
    tips.push({
      id: 'meal-planning',
      category: 'Behaviour',
      priority: 'low',
      icon: '🥗',
      title: 'Reduce Food Waste & Meat Consumption',
      description:
        'Food accounts for ~25% of household carbon. Cutting red meat by half and reducing food waste saves around 300–600 kg CO₂ per person per year — with no extra cost.',
      co2SavedKg: Math.round(householdSize * 350),
      eurSaved: Math.round(householdSize * 200),
      action: null,
      actionTab: null,
    });
  }

  // ─── UNIVERSAL TIPS ──────────────────────────────────────────────────
  tips.push({
    id: 'shift-sim',
    category: 'Electricity',
    priority: 'medium',
    icon: '🔮',
    title: 'Use the EVH Shift Simulator Weekly',
    description:
      'The Shift Simulator forecasts the cheapest and cleanest electricity slots for the next 7 days. Even shifting 2 loads per week can save €100–€200/year.',
    co2SavedKg: Math.round((electricityBill || 60) * 8),
    eurSaved: Math.round((electricityBill || 60) * 1.5),
    action: 'Open Shift Simulator',
    actionTab: 'simulator',
  });

  // Sort: high → medium → low, then by co2SavedKg descending
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return tips.sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority] ||
    b.co2SavedKg - a.co2SavedKg
  );
};

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY = {
  high:   { label: '🔴 High Impact',   color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  medium: { label: '🟡 Medium Impact', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  low:    { label: '🟢 Quick Win',     color: '#20c997', bg: 'rgba(32,201,151,0.08)',  border: 'rgba(32,201,151,0.2)'  },
};

const CATEGORY_COLOR = {
  Heating:     '#60a5fa',
  Electricity: '#f59e0b',
  Behaviour:   '#a78bfa',
  Transport:   '#34d399',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SmartTips({ formData, postcodeData, onTabSwitch }) {
  const hasData =
    formData &&
    (Number(formData.householdSize) > 0 ||
      Number(formData.electricityBill) > 0 ||
      Number(formData.annualHeatingBill) > 0);

  const tips = hasData ? TIPS_ENGINE(formData, postcodeData) : [];

  const totalCO2 = tips.reduce((s, t) => s + t.co2SavedKg, 0);
  const totalEur = tips.reduce((s, t) => s + t.eurSaved, 0);

  if (!hasData) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '4rem 2rem', color: '#627d98',
        textAlign: 'center', gap: '1rem',
      }}>
        <div style={{ fontSize: '3rem' }}>💡</div>
        <h3 style={{ color: '#9fb3c8', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
          Fill in your household profile to unlock personalised tips
        </h3>
        <p style={{ fontSize: '0.875rem', maxWidth: '380px', lineHeight: 1.6, margin: 0 }}>
          Enter your household size, electricity bill, heating bill, and postcode on the left — we'll instantly generate data-driven tips ranked by CO₂ and € impact.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Summary Banner ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={summaryCard('#20c997')}>
          <div style={summaryLabel}>Potential CO₂ Savings</div>
          <div style={summaryValue('#20c997')}>{totalCO2.toLocaleString()} kg</div>
          <div style={summaryUnit}>per year</div>
        </div>
        <div style={summaryCard('#60a5fa')}>
          <div style={summaryLabel}>Potential € Savings</div>
          <div style={summaryValue('#60a5fa')}>€{totalEur.toLocaleString()}</div>
          <div style={summaryUnit}>per year</div>
        </div>
        <div style={summaryCard('#f59e0b')}>
          <div style={summaryLabel}>Tips Found</div>
          <div style={summaryValue('#f59e0b')}>{tips.length}</div>
          <div style={summaryUnit}>personalised actions</div>
        </div>
      </div>

      {/* ── Tip Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {tips.map((tip, i) => {
          const pri = PRIORITY[tip.priority];
          const catColor = CATEGORY_COLOR[tip.category] || '#9fb3c8';
          return (
            <div
              key={tip.id}
              style={{
                background: '#0b1929',
                border: `1px solid ${pri.border}`,
                borderLeft: `3px solid ${pri.color}`,
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Icon + rank */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', minWidth: '2.5rem' }}>
                <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>{tip.icon}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#627d98' }}>#{i + 1}</div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={tag(catColor)}>{tip.category}</span>
                  <span style={tag(pri.color)}>{pri.label}</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f4f8', marginBottom: '0.4rem' }}>
                  {tip.title}
                </div>
                <p style={{ fontSize: '0.83rem', color: '#9fb3c8', lineHeight: 1.6, margin: 0, marginBottom: '0.9rem' }}>
                  {tip.description}
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={impactBadge('#20c997')}>🌿 Save ~{tip.co2SavedKg.toLocaleString()} kg CO₂/yr</div>
                  <div style={impactBadge('#60a5fa')}>💶 Save ~€{tip.eurSaved.toLocaleString()}/yr</div>
                  {tip.action && onTabSwitch && (
                    <button
                      onClick={() => onTabSwitch(tip.actionTab)}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.45rem 1rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${pri.color}40`,
                        borderRadius: '6px',
                        color: pri.color,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${pri.color}18`}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >
                      {tip.action} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '0.75rem', color: '#48647a', textAlign: 'center', margin: 0 }}>
        * Estimates are based on average German household data and EVH district heating CO₂ factors. Actual savings may vary.
      </p>
    </div>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const summaryCard = (color) => ({
  background: '#0b1929',
  border: `1px solid ${color}22`,
  borderRadius: '12px',
  padding: '1.1rem 1.25rem',
  textAlign: 'center',
});
const summaryLabel = { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#627d98', marginBottom: '0.4rem' };
const summaryValue = (color) => ({ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 });
const summaryUnit = { fontSize: '0.7rem', color: '#48647a', marginTop: '0.25rem' };
const tag = (color) => ({
  fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.07em', padding: '0.2rem 0.55rem',
  borderRadius: '999px', background: `${color}18`, color, border: `1px solid ${color}30`,
});
const impactBadge = (color) => ({
  fontSize: '0.78rem', fontWeight: 600, color,
  background: `${color}10`, border: `1px solid ${color}25`,
  borderRadius: '6px', padding: '0.3rem 0.7rem',
});