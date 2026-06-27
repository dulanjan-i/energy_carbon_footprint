import { useState } from 'react';
import axios from 'axios';
import Graphs from './components/Graphs';
import Leaderboard from './components/Leaderboard';
import ScenarioSimulator from './components/ScenarioSimulator';
import WaermeCheck from './components/WaermeCheck';
import SmartTips from './components/SmartTips'; // ← NEW
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateFootprint = async (e) => {
    e.preventDefault();
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

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-name">EVH Tracker</div>
            <div className="brand-sub">Carbon Intelligence</div>
          </div>
        </div>

        <form onSubmit={calculateFootprint} className="sidebar-form">
          <p className="sidebar-section-label">Household Profile</p>

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

          {/* Postcode Field with instant suggestion */}
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
                background: postcodeData.zone === 'connected' ? 'rgba(32,201,151,0.08)' : postcodeData.zone === 'planned' ? 'rgba(245,158,11,0.08)' : 'rgba(96,165,250,0.08)',
                border: `1px solid ${postcodeData.zone === 'connected' ? 'rgba(32,201,151,0.2)' : postcodeData.zone === 'planned' ? 'rgba(245,158,11,0.2)' : 'rgba(96,165,250,0.2)'}`,
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: postcodeData.zone === 'connected' ? '#20c997' : postcodeData.zone === 'planned' ? '#f59e0b' : '#60a5fa',
                lineHeight: '1.4'
              }}>
                <strong>📍 {postcodeData.district}:</strong> {postcodeData.status}
              </div>
            )}
          </div>

          <button type="submit" className="calc-btn" disabled={loading}>
            {loading ? 'Calculating…' : 'Calculate Footprint'}
          </button>
        </form>

        <div className="sidebar-footer">
          <div className="footer-badge">🏆 Hackathon 2026</div>
          <p>Powered by SMARD + EVH data</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* TABS — always visible */}
        <div className="tabs">
          {['overview', 'simulator', 'heating', 'tips', 'leaderboard'].map(tab => ( // ← NEW 'tips'
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview'    && '📊 Overview'}
              {tab === 'simulator'   && '🔮 Shift Simulator'}
              {tab === 'heating'     && '🗺️ District Heating'}
              {tab === 'tips'        && '💡 Smart Tips'}  {/* ← NEW */}
              {tab === 'leaderboard' && '🏆 Leaderboard'}
            </button>
          ))}
        </div>

        {/* TAB PANELS */}
        <div className="panel">

          {activeTab === 'overview' && (
            !results ? (
              <div className="empty-state">
                <div className="empty-icon">🌱</div>
                <h2>Your energy dashboard awaits</h2>
                <p>Fill in your household profile on the left and hit Calculate to see your personalised carbon &amp; cost breakdown.</p>
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
                    <span className="kpi-value">{results.weekly_summary?.total_carbon_kg || '0'} kg</span>
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
                    <div className="card-header">
                      <span className="card-title">The EVH Smart Shift — Next 7 Days</span>
                      <span className="card-badge">Forecast</span>
                    </div>
                    {results.chart_data && <Graphs data={results.chart_data} />}
                  </div>

                  {results.smart_shift_tips && (
                    <>
                      <div className="card card-alert">
                        <div className="alert-icon">🚨</div>
                        <div className="alert-label">Peak — Avoid</div>
                        <div className="alert-time">
                          {new Date(results.smart_shift_tips.worst_time).toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="alert-sub">High cost &amp; carbon window</div>
                      </div>
                      <div className="card card-green">
                        <div className="alert-icon">🌱</div>
                        <div className="alert-label">Green Window — Shift Here</div>
                        <div className="alert-time">
                          {new Date(results.smart_shift_tips.best_time).toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="alert-sub">Cheapest &amp; cleanest slot</div>
                      </div>
                    </>
                  )}

                  <div className="card card-action">
                    <div className="card-header">
                      <span className="card-title">⚡ Smart Shift Challenge</span>
                    </div>
                    <p className="action-desc">Do your laundry during the green window and earn EVH points.</p>
                    <button className="action-btn">
                      Accept &amp; Earn 50 EVH Points 🏅
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
              <WaermeCheck />
            </div>
          )}

          {/* ← NEW TIPS TAB PANEL */}
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
              ) : results.leaderboard ? (
                <Leaderboard data={results.leaderboard} />
              ) : (
                <p className="empty-msg">No leaderboard data available.</p>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;