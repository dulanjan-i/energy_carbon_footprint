import { useState } from 'react';
import axios from 'axios';
import Graphs from './components/Graphs';
import Leaderboard from './components/Leaderboard';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    householdSize: "",
    electricityBill: "",
    annualHeatingBill: "",
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateFootprint = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        householdSize: Number(formData.householdSize) || 1,
        electricityBill: Number(formData.electricityBill) || 0,
        annualHeatingBill: Number(formData.annualHeatingBill) || 0,
      };
      
      const response = await axios.post('http://localhost:5001/api/calculate', payload);
      setResults(response.data);
    } catch (error) {
      console.error("API Error:", error);
      alert("⚠️ Cannot reach the backend! Make sure your Node server is running on port 5001.");
    }
  };

  return (
    <div className="container">
      <h1>EVH Carbon Tracker</h1>
      
      <form onSubmit={calculateFootprint}>
        <div className="form-group">
          <label>Household Size (People)</label>
          <input type="number" name="householdSize" value={formData.householdSize} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Last Month Electricity Bill (€)</label>
          <input type="number" name="electricityBill" value={formData.electricityBill} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Annual Heating Bill (€)</label>
          <input type="number" name="annualHeatingBill" value={formData.annualHeatingBill} onChange={handleInputChange} required />
        </div>
        <button type="submit" className="submit-btn">Calculate My Footprint</button>
      </form>

      {results && (
        <div className="results-dashboard" style={{ marginTop: '2rem', textAlign: 'left', animation: 'fadeIn 0.4s ease-in' }}>
          
          <div style={{ background: '#102a43', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
            <h2>Your Weekly Impact</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#bcccdc' }}>Est. Cost</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>€{results.weekly_summary?.total_cost_eur || "0"}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#bcccdc' }}>Est. Emissions</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{results.weekly_summary?.total_carbon_kg || "0"} kg</p>
              </div>
            </div>
          </div>

          {results.chart_data && <Graphs data={results.chart_data} />}

          {/* THE LEADERBOARD */}
          {results.leaderboard && <Leaderboard data={results.leaderboard} />}

          {/* THE ACTION BOARD */}
          <div className="incentive-box" style={{ marginTop: '2rem', padding: '1.5rem', background: '#20c997', color: '#0b4d39', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>⚡ Smart Shift Action Board</h3>
            
            {results.smart_shift_tips && (
              <>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p><strong>🚨 P10 Peak Alert:</strong> Avoid heavy appliances around <strong>{new Date(results.smart_shift_tips.worst_time).toLocaleTimeString([], {weekday: 'short', hour: '2-digit', minute:'2-digit'})}</strong>.</p>
                </div>

                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p><strong>🌱 Green Window:</strong> Electricity is cheapest and cleanest at <strong>{new Date(results.smart_shift_tips.best_time).toLocaleTimeString([], {weekday: 'short', hour: '2-digit', minute:'2-digit'})}</strong>.</p>
                </div>
              </>
            )}

            <button className="reward-btn" style={{ width: '100%', padding: '1rem', background: '#0b4d39', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
              Commit to the Green Window & Earn 50 EVH Points
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;