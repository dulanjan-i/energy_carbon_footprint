const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Paths to An's forecast artifacts
const PRICE_FILE = path.join(__dirname, '../outputs/price_xgboost_next_week_forecast.csv');
const CARBON_FILE = path.join(__dirname, '../outputs/carbon_intensity_xgboost_next_week_forecast.csv');

// Helper to read CSVs synchronously for the hackathon (in production, use async streams)
const readForecastData = async () => {
    return new Promise((resolve, reject) => { // Added reject
        const forecast = [];
        
        const priceStream = fs.createReadStream(PRICE_FILE);
        
        // This will instantly tell us if the path is wrong
        priceStream.on('error', (error) => {
            console.error("❌ CRITICAL: Cannot find Price CSV at", PRICE_FILE);
            reject(error); 
        });

        priceStream
            .pipe(csv())
            .on('data', (data) => {
                forecast.push({
                    timestamp: data.timestamp,
                    price_kwh: parseFloat(data['predicted_price(€/MWh)']) / 1000, 
                });
            })
            .on('end', () => {
                let i = 0;
                const carbonStream = fs.createReadStream(CARBON_FILE);
                
                carbonStream.on('error', (error) => {
                    console.error("❌ CRITICAL: Cannot find Carbon CSV at", CARBON_FILE);
                    reject(error);
                });

                carbonStream
                    .pipe(csv())
                    .on('data', (data) => {
                        if (forecast[i]) {
                            forecast[i].carbon_kwh = parseFloat(data['predicted_carbon_intensity_kgco2_per_mwh']) / 1000;
                        }
                        i++;
                    })
                    .on('end', () => resolve(forecast));
            });
    });
};

app.post('/api/calculate', async (req, res) => {
    // 1. Python-style diagnostic log
    console.log("🟢 [BACKEND] Request received from React:", req.body); 

    const { householdSize, electricityBill } = req.body;
    const estimatedMonthlyKwh = electricityBill / 0.30; 
    const weeklyKwh = estimatedMonthlyKwh / 4;
    const hourlyBaselineKwh = weeklyKwh / 168; 

    try {
        console.log("🟡 [BACKEND] Reading forecast CSVs...");
        const forecastData = await readForecastData();      

        let totalBaselineCost = 0;
        let totalBaselineCarbon = 0;
        let bestHour = forecastData[0];
        let worstHour = forecastData[0];

        const chartData = forecastData.map(hour => {
            const cost = hourlyBaselineKwh * hour.price_kwh;
            const carbon = hourlyBaselineKwh * hour.carbon_kwh;
            
            totalBaselineCost += cost;
            totalBaselineCarbon += carbon;

            if (hour.price_kwh > worstHour.price_kwh) worstHour = hour;
            if (hour.carbon_kwh < bestHour.carbon_kwh) bestHour = hour;

            return {
                timestamp: hour.timestamp,
                baseline_kwh: hourlyBaselineKwh,
                price_eur_kwh: hour.price_kwh,
                carbon_kg_kwh: hour.carbon_kwh,
                hour_cost: cost,
                hour_carbon: carbon
            };
        });

        const userScore = Math.round(1800 - (totalBaselineCarbon * 2));

        const mockLeaderboard = [
        { id: 'u1', name: "An",         points: 1820, avatar: "👩🏻‍💻" },
        { id: 'u2', name: "Nikki",      points: 1650, avatar: "👩🏻" },
        { id: 'u3', name: "Sophie",     points: 1480, avatar: "👩🏼‍🏫" },
        { id: 'u4', name: "Dula (You)", points: userScore, avatar: "😎", isUser: true },
        { id: 'u5', name: "Felix",      points: 1200, avatar: "👨🏻‍🦱" },
        { id: 'u6', name: "Lena",       points: 900,  avatar: "👧🏽" },
        ];

        const sortedLeaderboard = mockLeaderboard.sort((a, b) => b.points - a.points);

        console.log("🔵 [BACKEND] Sending payload to React!");
        res.json({
            weekly_summary: {
                total_kwh: weeklyKwh.toFixed(2),
                total_cost_eur: totalBaselineCost.toFixed(2),
                total_carbon_kg: totalBaselineCarbon.toFixed(2)
            },
            smart_shift_tips: {
                best_time: bestHour.timestamp,
                worst_time: worstHour.timestamp,
                peak_price: worstHour.price_kwh.toFixed(3),
                green_carbon: bestHour.carbon_kwh.toFixed(3)
            },
            chart_data: chartData, 
            leaderboard: sortedLeaderboard
        });

    } catch (error) {
        console.error("Failed:", error);
        res.status(500).json({ error: "Server crashed." });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));