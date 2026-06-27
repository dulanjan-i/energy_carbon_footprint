import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Graphs({ data }) {
  if (!data || data.length === 0) return null;

  const formattedData = data.map(point => {
    const date = new Date(point.timestamp);
    return {
      ...point,
      displayTime: date.toLocaleDateString('en-GB', { weekday: 'short', hour: '2-digit' })
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{
        background: '#0c1a28', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.78rem',
        color: '#dde8f5', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        <p style={{ color: '#7a9ab8', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {Number(p.value).toFixed(4)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ height: '320px', marginTop: '0.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="displayTime"
            tick={{ fontSize: 11, fill: '#3d5872', fontFamily: 'Inter, sans-serif' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#3d5872', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#3d5872', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '16px',
              fontSize: '0.75rem',
              color: '#7a9ab8',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            name="Carbon Intensity (kg/kWh)"
            dataKey="carbon_kg_kwh"
            stroke="#00e5a0"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#00e5a0' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            name="Grid Price (€/kWh)"
            dataKey="price_eur_kwh"
            stroke="#f87171"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#f87171' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}