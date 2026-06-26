const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// CRITICAL for hackathons: Allow all origins so React doesn't get blocked
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Hackathon backend is live 🚀' });
});

// The core calculation middleware (Mocked for now)
app.post('/api/calculate', (req, res) => {
    // These match the fields from your Frontend Components notes
    const { householdSize, electricityBill, annualHeatingBill } = req.body;

    // TODO: Replace with actual logic or link to An's Python model later
    // Dummy math to give the frontend something to render
    const baseCO2 = (electricityBill * 0.5) + (annualHeatingBill * 1.2);
    const total_tCO2 = (baseCO2 / householdSize) / 1000; 
    
    // Simulate the €5 incentive savings (dialing down by 1 unit)
    const deducted_tCO2 = total_tCO2 * 0.85; 

    // The sarcastic environmental point logic
    let message = "You're doing okay.";
    if (total_tCO2 > 15) {
        message = "You melted the arctic!";
    } else if (total_tCO2 < 5) {
        message = "Captain Planet, is that you?";
    }

    res.json({
        total_tCO2: total_tCO2.toFixed(2),
        deducted_tCO2: deducted_tCO2.toFixed(2),
        sarcastic_message: message,
        region_percentile: 78 // Mock leaderboard stat
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});