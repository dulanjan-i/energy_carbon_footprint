import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Graphs({ data }) {
  if (!data || data.length === 0) return null;

  // Format the timestamps so they look clean on the X-axis
  const formattedData = data.map(point => {
    const date = new Date(point.timestamp);
    return {
      ...point,
      displayTime: date.toLocaleDateString('en-GB', { weekday: 'short', hour: '2-digit' })
    };
  });

  return (
    <div style={{ height: '350px', marginTop: '2rem', background: 'white', padding: '1rem', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '1rem', color: '#102a43', textAlign: 'center' }}>The EVH Smart Shift (Next 7 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="displayTime" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            interval="preserveStartEnd" 
            minTickGap={50}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
          <Line 
            yAxisId="left"
            type="monotone" 
            name="Grid Price (€/kWh)" 
            dataKey="price_eur_kwh" 
            stroke="#ff4757" 
            strokeWidth={3} 
            dot={false} 
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            name="Carbon Intensity (kg/kWh)" 
            dataKey="carbon_kg_kwh" 
            stroke="#2ed573" 
            strokeWidth={3} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}