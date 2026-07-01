import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Graphs({ data }) {
  const formattedData = useMemo(() => {
    if (!data) return [];
    return data.map(point => {
      const date = new Date(point.timestamp);
      return {
        ...point,
        displayTime: date.toLocaleDateString('en-GB', { 
          weekday: data.length > 24 ? 'short' : undefined, 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    });
  }, [data]);

  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        fontSize: '0.78rem',
        color: '#020617',
        boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
      }}>
        <p style={{ color: '#475569', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => {
          const isPrice = p.name.includes('Price');
          return (
            <p key={i} style={{ color: p.color, fontWeight: 700, margin: '0.15rem 0' }}>
              {p.name}: {isPrice ? `€${Number(p.value).toFixed(3)}` : `${Number(p.value).toFixed(2)} kgCO2`} /kWh
            </p>
          );
        })}
      </div>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        justifyContent: 'center', 
        listStyle: 'none', 
        padding: '16px 0 0', 
        margin: 0, 
        fontSize: '0.75rem', 
        fontFamily: 'Inter, sans-serif' 
      }}>
        {payload.map((entry, index) => {
          const isCarbon = entry.value.includes('Carbon');
          const tooltipText = isCarbon 
            ? "How clean or dirty the electricity is. High intensity means it's made from coal/gas, while low intensity means it's from wind/solar." 
            : "How much electricity costs right now per kilowatt-hour. This changes throughout the day based on supply and demand.";
          
          return (
            <li 
              key={`item-${index}`} 
              className="tooltip-container" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'help' }}
            >
              <span style={{ 
                width: 9, 
                height: 9, 
                borderRadius: '50%', 
                backgroundColor: entry.color, 
                display: 'inline-block' 
              }} />
              <span style={{ color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                {entry.value}
                <span className="info-icon" style={{ width: '12px', height: '12px', fontSize: '8px', marginLeft: '4px' }}>i</span>
              </span>
              <span className="tooltip-text" style={{ bottom: '150%', width: '220px' }}>{tooltipText}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ height: '320px', marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="displayTime"
            tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={formattedData.length > 72 ? 60 : 35}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          <Line
            yAxisId="left"
            type="monotone"
            name="Carbon Intensity (kgCO2/kWh)"
            dataKey="carbon_kg_kwh"
            stroke="#16A34A"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#16A34A' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            name="Grid Price (€/kWh)"
            dataKey="price_eur_kwh"
            stroke="#1B4FBB"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#1B4FBB' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}