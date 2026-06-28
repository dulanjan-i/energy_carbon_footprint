import { useState, useMemo } from 'react';
import axios from 'axios';
import Graphs from './components/Graphs';
import Leaderboard from './components/Leaderboard';
import ScenarioSimulator from './components/ScenarioSimulator';
import WaermeCheck from './components/WaermeCheck';
import SmartTips from './components/SmartTips';
import './App.css';

const WAERME_DATA = {
  "06108": { zone: "connected", district: "City Center", status: "District Heating Available" },
  "06110": { zone: "connected", district: "Glaucha / South Inner City", status: "District Heating Available" },
  "06112": { zone: "connected", district: "North Inner City / Paulusviertel", status: "District Heating Available" },
  "06114": { zone: "connected", district: "Böllberg / Wörmlitz", status: "District Heating Available" },
  "06116": { zone: "planned", district: "Neustadt", status: "Planned Expansion (by 2027)" },
  "06118": { zone: "planned", district: "Ammendorf / Radewell", status: "Planned Expansion (by 2029)" },
  "06120": { zone: "planned", district: "Heide-Nord / Blumenau", status: "Planned Expansion (by 2031)" },
  "06126": { zone: "planned", district: "Halle-South / Silberhöhe", status: "Planned Expansion (by 2029)" },
  "06132": { zone: "individual", district: "Lettin / Tornau", status: "Heat Pump Recommended" },
  "06179": { zone: "individual", district: "Teutschenthal (Suburbs)", status: "Heat Pump Recommended" },
};

function App() {
  const [formData, setFormData] = useState({
    householdSize: "",
    electricityBill: "",
    annualHeatingBill: "",
    postcode: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [viewType, setViewType] = useState('24h'); // '24h' | '3d' | '7d'
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loginForm, setLoginForm] = useState({ customerId: 'EVH-847291-H', password: '••••••••' });
  const [showToast, setShowToast] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateFootprint = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        householdSize: Number(formData.householdSize) || 1,
        electricityBill: Number(formData.electricityBill) || 0,
        annualHeatingBill: Number(formData.annualHeatingBill) || 0,
        postcode: formData.postcode,
      };
      const response = await axios.post('http://localhost:5001/api/calculate', payload);
      setResults(response.data);
      setChallengeAccepted(false);
      setActiveTab('overview');
    } catch (error) {
      console.error("API Error:", error);
      alert("⚠️ Cannot reach the backend! Make sure your Node server is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  const postcodeData = formData.postcode ? WAERME_DATA[formData.postcode.trim()] : null;

  // Slice chart data based on selected window range (all hourly resolution)
  const slicedChartData = useMemo(() => {
    if (!results?.chart_data) return [];
    if (viewType === '24h') return results.chart_data.slice(0, 24);
    if (viewType === '3d') return results.chart_data.slice(0, 72);
    return results.chart_data; // '7d' shows the full 168 hours
  }, [results, viewType]);

  // Find local best/worst carbon and price hours in the active time window
  const tipsSummary = useMemo(() => {
    if (slicedChartData.length === 0) {
      return { bestCarbon: null, worstCarbon: null, bestPrice: null, worstPrice: null };
    }
    const worstC = slicedChartData.reduce((max, p) => p.carbon_kg_kwh > max.carbon_kg_kwh ? p : max, slicedChartData[0]);
    const bestC = slicedChartData.reduce((min, p) => p.carbon_kg_kwh < min.carbon_kg_kwh ? p : min, slicedChartData[0]);
    const worstP = slicedChartData.reduce((max, p) => p.price_eur_kwh > max.price_eur_kwh ? p : max, slicedChartData[0]);
    const bestP = slicedChartData.reduce((min, p) => p.price_eur_kwh < min.price_eur_kwh ? p : min, slicedChartData[0]);
    return { worstCarbon: worstC, bestCarbon: bestC, worstPrice: worstP, bestPrice: bestP };
  }, [slicedChartData]);

  const renderForm = (isSidebar) => {
    return (
      <form onSubmit={calculateFootprint} className={isSidebar ? "sidebar-form" : "onboarding-form"}>
        <p className={isSidebar ? "sidebar-section-label" : "onboarding-section-label"}>Household Profile</p>

        <div className="field">
          <label>Household Size</label>
          <div className="input-wrap">
            <input
              type="number"
              name="householdSize"
              value={formData.householdSize}
              onChange={handleInputChange}
              placeholder="e.g. 3"
              required
            />
            <span className="input-unit">people</span>
          </div>
        </div>

        <div className="field">
          <label>Last Month Electricity Bill</label>
          <div className="input-wrap">
            <span className="input-prefix">€</span>
            <input
              type="number"
              name="electricityBill"
              value={formData.electricityBill}
              onChange={handleInputChange}
              placeholder="e.g. 60"
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Annual Heating Bill</label>
          <div className="input-wrap">
            <span className="input-prefix">€</span>
            <input
              type="number"
              name="annualHeatingBill"
              value={formData.annualHeatingBill}
              onChange={handleInputChange}
              placeholder="e.g. 1500"
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Postcode (Halle)</label>
          <div className="input-wrap">
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              placeholder="e.g. 06108"
              maxLength={5}
              required
            />
          </div>
          {postcodeData && (
            <div style={{
              marginTop: '0.6rem',
              padding: '0.65rem 0.8rem',
              background: postcodeData.zone === 'connected' ? '#F0FDF4' : postcodeData.zone === 'planned' ? '#FFFBEB' : '#EFF6FF',
              border: `1px solid ${postcodeData.zone === 'connected' ? 'rgba(22,163,74,0.25)' : postcodeData.zone === 'planned' ? 'rgba(217,119,6,0.25)' : 'rgba(27,79,187,0.25)'}`,
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: postcodeData.zone === 'connected' ? '#16A34A' : postcodeData.zone === 'planned' ? '#D97706' : '#1B4FBB',
              lineHeight: '1.4'
            }}>
              <strong>📍 {postcodeData.district}:</strong> {postcodeData.status}
            </div>
          )}
        </div>

        <button type="submit" className="calc-btn" disabled={loading}>
          {loading ? 'Calculating…' : isSidebar ? 'Recalculate' : 'Calculate Footprint'}
        </button>
      </form>
    );
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR — Slides in once results exist */}
      <aside className={`sidebar ${!results ? 'sidebar-hidden' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-name">Energie von Heute</div>
            <div className="brand-sub">Carbon Intelligence</div>
          </div>
        </div>

        {results && renderForm(true)}

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem 1.2rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <polygon points="2,19 18,3 22,17" fill="#E11D48" />
            </svg>
            <div style={{ fontSize: '0.72rem', color: 'var(--txt-3)', lineHeight: '1.2' }}>
              <span style={{ display: 'block', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--txt-3)' }}>Powered by</span>
              <strong style={{ color: 'var(--txt)', fontWeight: 800 }}>SWH.</strong> EVH Meine Energie
            </div>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--txt-3)', borderTop: '1px solid var(--border)', paddingTop: '0.45rem', marginTop: '0.15rem' }}>
            Developed by <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>TTT</strong>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* TABS — Slides down once results exist */}
        {results && (
          <div className="tabs" style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['overview', 'simulator', 'heating', 'tips', 'leaderboard'].map(tab => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'overview'    && '📊 Overview'}
                  {tab === 'simulator'   && '🔮 Smart Energy Planner'}
                  {tab === 'heating'     && '🗺️ Heating Options'}
                  {tab === 'tips'        && '💡 Smart Tips'}
                  {tab === 'leaderboard' && '🏆 Leaderboard'}
                </button>
              ))}
            </div>

            {/* Customer Portal Login / Profile Widget */}
            {isLoggedIn ? (
              <div className="profile-widget-container" style={{ position: 'relative', marginLeft: 'auto', zIndex: 110 }}>
                <button 
                  className="profile-widget" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '20px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => { if (!showProfileDropdown) e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg viewBox="0 0 32 32" width="22" height="22" style={{ flexShrink: 0, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <defs>
                      <linearGradient id="toniGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="60%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <path d="M 8 16 C 4 14 3 10 2 9 C 3 8 4 9 5 10 C 6 11 8 13 8 14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M 24 16 C 28 14 29 10 30 9 C 29 8 28 9 27 10 C 26 11 24 13 24 14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M 8 6 L 8 24 C 8 27, 24 27, 24 24 L 24 6 Z" fill="url(#toniGrad)" />
                    <ellipse cx="16" cy="6" rx="8" ry="2" fill="#DC2626" />
                    <ellipse cx="12.5" cy="12" rx="2" ry="2.8" fill="#FFFFFF" />
                    <circle cx="13" cy="12" r="0.9" fill="#000000" />
                    <ellipse cx="19.5" cy="12" rx="2" ry="2.8" fill="#FFFFFF" />
                    <circle cx="19" cy="12" r="0.9" fill="#000000" />
                    <path d="M 10.5 8 Q 12.5 7 14.5 9" stroke="#000000" strokeWidth="0.8" fill="none" />
                    <path d="M 21.5 8 Q 19.5 7 17.5 9" stroke="#000000" strokeWidth="0.8" fill="none" />
                    <circle cx="16" cy="15" r="1.1" fill="#3B82F6" />
                    <path d="M 12 17.5 Q 16 23 20 17.5 C 19 21.5 13 21.5 12 17.5 Z" fill="#000000" />
                    <path d="M 14.5 19.8 Q 16 21 17.5 19.8" stroke="#EF4444" strokeWidth="1.5" fill="none" />
                  </svg>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--txt)' }}>Dula</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--txt-3)', transform: showProfileDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', marginLeft: '2px' }}>▼</span>
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown" style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    width: '260px',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-3)' }}>SWH Customer Portal</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--txt)', marginTop: '0.2rem' }}>Dula Wijenayake</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--txt-3)' }}>Account ID: EVH-847291-H</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--txt-2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tariff Plan:</span>
                        <strong style={{ color: 'var(--accent)' }}>Green Flex</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>EVH Balance:</span>
                        <strong style={{ color: 'var(--success)' }}>€48.50 Credit</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsLoggedIn(false);
                        setShowProfileDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        background: 'var(--danger-dim)',
                        border: '1px solid rgba(220,38,38,0.2)',
                        borderRadius: '6px',
                        color: 'var(--danger)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-dim)'}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="login-btn"
                onClick={() => setShowLoginModal(true)}
                style={{
                  marginLeft: 'auto',
                  padding: '0.45rem 1.15rem',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(27,79,187,0.2)',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1741A6'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Sign In
              </button>
            )}
          </div>
        )}

        {/* TAB PANELS */}
        <div className="panel">

          {activeTab === 'overview' && (
            !results ? (
              <div className="onboarding-container">
                <div className="onboarding-card">
                  <div className="onboarding-header">
                    <span className="onboarding-icon">⚡</span>
                    <h2>EVH Carbon Tracker</h2>
                    <p>Enter your energy details to build your live community dashboard, heating network connection checker, and smart tips.</p>
                  </div>
                  {renderForm(false)}
                </div>
              </div>
            ) : (
              <>
                <div className="overview-grid">
                  {tipsSummary.bestCarbon && tipsSummary.worstCarbon && tipsSummary.bestPrice && tipsSummary.worstPrice && (
                    <>
                      {/* Card 1: Peak Carbon */}
                      <div className="card card-alert">
                        <div className="alert-icon">🚨</div>
                        <div className="alert-label tooltip-container">
                          {viewType === '24h' ? 'Peak Carbon Hour' : viewType === '3d' ? 'Peak Carbon (3D)' : 'Peak Carbon (7D)'}
                          <span className="info-icon">i</span>
                          <span className="tooltip-text">The hour in this window when electricity is the dirtiest. Avoid running heavy appliances like washing machines now!</span>
                        </div>
                        <div className="alert-time">
                          {new Date(tipsSummary.worstCarbon.timestamp).toLocaleTimeString([], { 
                            weekday: viewType === '24h' ? undefined : 'short',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="alert-sub" style={{ fontWeight: 700, color: 'var(--danger)' }}>
                          {Math.round(tipsSummary.worstCarbon.carbon_kg_kwh * 1000)} kgCO2/MWh
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--txt-2)', marginTop: '0.2rem' }}>
                          Cost: €{tipsSummary.worstCarbon.price_eur_kwh.toFixed(3)}/kWh
                        </div>
                      </div>

                      {/* Card 2: Green Carbon */}
                      <div className="card card-green">
                        <div className="alert-icon">🌱</div>
                        <div className="alert-label tooltip-container">
                          {viewType === '24h' ? 'Green Carbon Hour' : viewType === '3d' ? 'Green Carbon (3D)' : 'Green Carbon (7D)'}
                          <span className="info-icon">i</span>
                          <span className="tooltip-text">The hour in this window when electricity is cleanest (lots of wind/solar power). Run your appliances now to cut pollution!</span>
                        </div>
                        <div className="alert-time">
                          {new Date(tipsSummary.bestCarbon.timestamp).toLocaleTimeString([], { 
                            weekday: viewType === '24h' ? undefined : 'short',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="alert-sub" style={{ fontWeight: 700, color: 'var(--success)' }}>
                          {Math.round(tipsSummary.bestCarbon.carbon_kg_kwh * 1000)} kgCO2/MWh
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--txt-2)', marginTop: '0.2rem' }}>
                          Cost: €{tipsSummary.bestCarbon.price_eur_kwh.toFixed(3)}/kWh
                        </div>
                      </div>

                      {/* Card 3: Peak Price */}
                      <div className="card card-warning">
                        <div className="alert-icon">💰</div>
                        <div className="alert-label tooltip-container">
                          {viewType === '24h' ? 'Peak Price Hour' : viewType === '3d' ? 'Peak Price (3D)' : 'Peak Price (7D)'}
                          <span className="info-icon">i</span>
                          <span className="tooltip-text">The hour in this window when electricity is the most expensive to buy. Avoid using heavy power now to protect your wallet!</span>
                        </div>
                        <div className="alert-time">
                          {new Date(tipsSummary.worstPrice.timestamp).toLocaleTimeString([], { 
                            weekday: viewType === '24h' ? undefined : 'short',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="alert-sub" style={{ fontWeight: 700, color: 'var(--warning)' }}>
                          €{tipsSummary.worstPrice.price_eur_kwh.toFixed(3)}/kWh
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--txt-2)', marginTop: '0.2rem' }}>
                          CO₂: {Math.round(tipsSummary.worstPrice.carbon_kg_kwh * 1000)} kg/MWh
                        </div>
                      </div>

                      {/* Card 4: Cheapest Price */}
                      <div className="card card-info">
                        <div className="alert-icon">🔌</div>
                        <div className="alert-label tooltip-container">
                          {viewType === '24h' ? 'Cheapest Hour' : viewType === '3d' ? 'Cheapest Hour (3D)' : 'Cheapest Hour (7D)'}
                          <span className="info-icon">i</span>
                          <span className="tooltip-text">The hour in this window when electricity is cheapest (or even free!). Turn on your devices now to save money!</span>
                        </div>
                        <div className="alert-time">
                          {new Date(tipsSummary.bestPrice.timestamp).toLocaleTimeString([], { 
                            weekday: viewType === '24h' ? undefined : 'short',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="alert-sub" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                          €{tipsSummary.bestPrice.price_eur_kwh.toFixed(3)}/kWh
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--txt-2)', marginTop: '0.2rem' }}>
                          CO₂: {Math.round(tipsSummary.bestPrice.carbon_kg_kwh * 1000)} kg/MWh
                        </div>
                      </div>
                    </>
                  )}

                  {/* Main Graph Card */}
                  <div className="card card-wide">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="card-title">
                        The EVH Smart Shift — Next {viewType === '24h' ? '24 Hours' : viewType === '3d' ? '3 Days' : '7 Days'}
                      </span>
                      <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.25rem', borderRadius: '8px', gap: '0.15rem' }}>
                        {[
                          { key: '24h', label: '24 Hours' },
                          { key: '3d',  label: '3 Days' },
                          { key: '7d',  label: '7 Days' }
                        ].map(type => (
                          <button
                            key={type.key}
                            onClick={() => setViewType(type.key)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: viewType === type.key ? '#FFFFFF' : 'transparent',
                              color: viewType === type.key ? 'var(--accent)' : '#64748B',
                              boxShadow: viewType === type.key ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {slicedChartData.length > 0 && <Graphs data={slicedChartData} />}
                  </div>
                </div>

                <div className="kpi-bar" style={{ marginTop: '1.25rem' }}>
                  <div className="kpi">
                    <span className="kpi-label">Weekly Cost</span>
                    <span className="kpi-value">€{results.weekly_summary?.total_cost_eur || '0'}</span>
                  </div>
                  <div className="kpi-divider" />
                  <div className="kpi">
                    <span className="kpi-label">Weekly Emissions</span>
                    <span className="kpi-value">{results.weekly_summary?.total_carbon_kg || '0'} kgCO2</span>
                  </div>
                  <div className="kpi-divider" />
                  <div className="kpi">
                    <span className="kpi-label">Household Size</span>
                    <span className="kpi-value">{formData.householdSize} people</span>
                  </div>
                  <div className="kpi-divider" />
                  <div className="kpi">
                    <span className="kpi-label">Status</span>
                    <span className="kpi-value kpi-badge">✅ Live</span>
                  </div>
                </div>

                {/* Smart Shift Challenge (Clickbait) at the bottom */}
                <div className="card card-action" style={{ marginTop: '1.25rem' }}>
                  <div className="card-header">
                    <span className="card-title">⚡ Smart Shift Challenge</span>
                  </div>
                  <p className="action-desc">Do your laundry during the green window and earn EVH points.</p>
                  <button 
                    className="action-btn"
                    onClick={() => {
                      setChallengeAccepted(true);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 5000);
                    }}
                    disabled={challengeAccepted}
                    style={{
                      background: challengeAccepted ? '#16A34A' : 'var(--accent)',
                      cursor: challengeAccepted ? 'default' : 'pointer'
                    }}
                  >
                    {challengeAccepted ? 'Challenge Accepted! 🏅 (+50 EVH Points)' : 'Accept & Earn 50 EVH Points 🏅'}
                  </button>
                </div>
              </>
            )
          )}

          {activeTab === 'simulator' && (
            <div className="simulator-wrap">
              <ScenarioSimulator />
            </div>
          )}

          {activeTab === 'heating' && (
            <div className="heating-wrap">
              <WaermeCheck 
                postcode={formData.postcode} 
                onPostcodeChange={(val) => setFormData(prev => ({ ...prev, postcode: val }))} 
                annualHeatingBill={Number(formData.annualHeatingBill) || 0}
              />
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="tips-wrap">
              <SmartTips
                formData={formData}
                postcodeData={postcodeData}
                onTabSwitch={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="leaderboard-wrap">
              {!results ? (
                <p className="empty-msg">Please calculate your footprint first to view the leaderboard.</p>
              ) : (
                <Leaderboard 
                  formData={formData} 
                  postcodeData={postcodeData} 
                  challengeAccepted={challengeAccepted}
                />
              )}
            </div>
          )}

        </div>
      </main>

      {/* Dynamic Dummy Login Modal Portal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            width: '360px',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🔐</span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--txt)', marginTop: '0.5rem', marginBottom: '0.2rem' }}>SWH Portal Login</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--txt-3)', margin: 0 }}>Access your EVH Customer Portal</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="field">
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--txt-2)' }}>Customer ID</label>
                <div className="input-wrap">
                  <input 
                    type="text" 
                    value={loginForm.customerId} 
                    onChange={e => setLoginForm({...loginForm, customerId: e.target.value})}
                    style={{ fontSize: '0.9rem', padding: '0.55rem 0.65rem', border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
              <div className="field">
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--txt-2)' }}>Password</label>
                <div className="input-wrap">
                  <input 
                    type="password" 
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    style={{ fontSize: '0.9rem', padding: '0.55rem 0.65rem', border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => setShowLoginModal(false)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsLoggedIn(true);
                  setShowLoginModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1741A6'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#FFFFFF',
          border: '1px solid #16A34A',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          padding: '1.1rem 1.5rem',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          maxWidth: '380px'
        }}>
          <span style={{ fontSize: '1.8rem' }}>🏆</span>
          <div>
            <div style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.9rem', marginBottom: '0.15rem' }}>Leaderboard Rank Up!</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--txt-2)', lineHeight: 1.45 }}>
              You just climbed the leaderboard rankings past Nikki and Sophie! <strong style={{ color: 'var(--accent)' }}>(+50 EVH Points)</strong>
            </div>
          </div>
          <button 
            onClick={() => setShowToast(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--txt-3)',
              fontSize: '1.15rem',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              fontWeight: 'bold',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;