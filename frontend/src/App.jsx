import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // Initialized as empty strings to fix the undeletable zero bug
  const [formData, setFormData] = useState({
    householdSize: "",
    electricityBill: "",
    annualHeatingBill: "",
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value // Keep as string during typing
    });
  };

  const calculateFootprint = async (e) => {
    e.preventDefault();
    try {
      // Convert to numbers only when sending to the backend
      const payload = {
        householdSize: Number(formData.householdSize) || 1,
        electricityBill: Number(formData.electricityBill) || 0,
        annualHeatingBill: Number(formData.annualHeatingBill) || 0,
      };
      
      const response = await axios.post('/api/calculate', payload);
      setResults(response.data);
    } catch (error) {
      console.error("API Error:", error);
      alert("⚠️ Cannot reach the backend! Make sure your Node server is running on port 5001 in a separate terminal.");
    }
  };

  return (
    <div className="container">
      <h1>EVH Carbon Tracker</h1>
      
      <form onSubmit={calculateFootprint}>
        <div className="form-group">
          <label>Household Size (People)</label>
          <input 
            type="number" 
            name="householdSize" 
            value={formData.householdSize} 
            onChange={handleInputChange} 
            placeholder="e.g. 2"
            required
          />
        </div>

        <div className="form-group">
          <label>Last Month Electricity Bill (€)</label>
          <input 
            type="number" 
            name="electricityBill" 
            value={formData.electricityBill} 
            onChange={handleInputChange} 
            placeholder="e.g. 60"
            required
          />
        </div>

        <div className="form-group">
          <label>Annual Heating Bill (€)</label>
          <input 
            type="number" 
            name="annualHeatingBill" 
            value={formData.annualHeatingBill} 
            onChange={handleInputChange} 
            placeholder="e.g. 1200"
            required
          />
        </div>

        <button type="submit" className="submit-btn">Calculate My Footprint</button>
      </form>

      {results && (
        <div className="results-dashboard">
          <h2>Your Score</h2>
          <p className="sarcastic-message">"{results.sarcastic_message}"</p>
          <p className="stat">Total: <strong>{results.total_tCO2} tCO₂</strong></p>
          <p className="stat">You are in the top <strong>{results.region_percentile}%</strong> of Halle.</p>
          
          <div className="incentive-box">
            <h3>Take Action!</h3>
            <p>Your heating use is above average. Dial your thermostat down by 1 unit to reduce your footprint to {results.deducted_tCO2} tCO₂.</p>
            <button className="reward-btn">Commit & Earn €5 EVH Credit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;