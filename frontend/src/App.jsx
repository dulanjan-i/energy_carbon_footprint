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
            <div className="brand-name">EVH Tracker</div>
            <div className="brand-sub">Carbon Intelligence</div>
          </div>
        </div>

        {results && renderForm(true)}


      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* TABS — Slides down once results exist */}
        {results && (
          <div className="tabs">
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
                <div className="kpi-bar">
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

                <div className="overview-grid">
                  <div className="card card-wide">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="card-title">The EVH Smart Shift — Next 7 Days</span>
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

                  <div className="card card-action">
                    <div className="card-header">
                      <span className="card-title">⚡ Smart Shift Challenge</span>
                    </div>
                    <p className="action-desc">Do your laundry during the green window and earn EVH points.</p>
                    <button 
                      className="action-btn"
                      onClick={() => setChallengeAccepted(true)}
                      disabled={challengeAccepted}
                      style={{
                        background: challengeAccepted ? '#16A34A' : 'var(--accent)',
                        cursor: challengeAccepted ? 'default' : 'pointer'
                      }}
                    >
                      {challengeAccepted ? 'Challenge Accepted! 🏅 (+50 kg CO₂)' : 'Accept & Earn 50 kg CO₂ Savings 🏅'}
                    </button>
                  </div>
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
    </div>
  );
}

export default App;