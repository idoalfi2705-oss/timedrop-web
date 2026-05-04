import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, SectionHeader } from '../components/shared/UI';
import { reportsAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import './Reports.css';

const COLORS = ['#1e7fe0','#10b981','#f59e0b','#ef4444','#8b5cf6'];
const fmt = n => '₪' + n.toLocaleString('he-IL');

const renderLegend = ({ payload }) => {
  const total = payload.reduce((s, p) => s + (p.payload?.value || 0), 0);
  return (
    <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'8px 16px', marginTop:8 }}>
      {payload.map((entry, i) => {
        const pct = total > 0 ? Math.round((entry.payload.value / total) * 100) : 0;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontFamily:'Heebo', color:'#555' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:entry.color, flexShrink:0 }}/>
            <span>{entry.value} – {pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

const renderBarLabel = (props) => {
  const { x, y, width, height, index } = props;
  if (width < 20) {
    return <text x={x + width + 6} y={y + height / 2} fill="#1e7fe0" dominantBaseline="middle" style={{ fontSize: 12, fontFamily: 'Heebo', fontWeight: 700 }}>{index + 1}</text>;
  }
  return <text x={x + 8} y={y + height / 2} fill="#fff" dominantBaseline="middle" style={{ fontSize: 12, fontFamily: 'Heebo', fontWeight: 700 }}>{index + 1}</text>;
};

export default function Reports() {
  const { data: revenueData }  = useApi(() => reportsAPI.getRevenueByDay(30), []);
  const { data: productsData } = useApi(() => reportsAPI.getOrdersByProduct(), []);

  const revenueByDay  = revenueData  || [];
  const ordersByProduct = productsData || [];
  const pieData = ordersByProduct.map(p => ({ name: p.name, value: p.הכנסה }));

  return (
    <div className="reports-page animate-fade">
      <div className="page-header">
        <div className="page-header-title"><h1>דוחות</h1><p>ניתוח עסקי מלא</p></div>
      </div>

      <div className="reports-grid">
        <Card>
          <SectionHeader title="הכנסות לפי יום" sub="30 הימים האחרונים"/>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByDay.slice(-14)} margin={{top:5,right:10,left:10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{fontSize:10,fontFamily:'Heebo'}} tickLine={false}/>
              <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`₪${(v/1000).toFixed(0)}K`} width={45}/>
              <Tooltip formatter={v=>fmt(v)}/>
              <Legend wrapperStyle={{fontFamily:'Heebo',fontSize:12,paddingTop:8}}/>
              <Bar dataKey="הכנסות" fill="#1e7fe0" radius={[4,4,0,0]}/>
              <Bar dataKey="רווח"   fill="#10b981" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader title="חלוקת הכנסות לפי מוצר"/>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" outerRadius={100} dataKey="value" label={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)}/>
                <Legend content={renderLegend}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{textAlign:'center',padding:'60px 0',color:'var(--gray-400)'}}>אין נתונים להצגה</div>
          )}
        </Card>
      </div>

      {ordersByProduct.length > 0 && (
        <>
          <Card>
            <SectionHeader title="מכירות לפי מוצר"/>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ordersByProduct} layout="vertical" margin={{top:0,right:20,left:10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`₪${v}`}/>
                <YAxis type="category" dataKey="name" tick={false} tickLine={false} width={8}/>
                <Tooltip formatter={v=>fmt(v)}/>
                <Bar dataKey="הכנסה" fill="#1e7fe0" radius={[0,6,6,0]} label={renderBarLabel} isAnimationActive={false}/>
              </BarChart>
            </ResponsiveContainer>
            <div className="bar-legend">
              {ordersByProduct.map((p, i) => (
                <div key={i} className="bar-legend-item">
                  <span className="bar-legend-num">{i + 1}</span>
                  <span className="bar-legend-name">{p.name}</span>
                  <span className="bar-legend-val">{fmt(p.הכנסה)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={false}>
            <div style={{padding:'16px 20px 0'}}>
              <SectionHeader title="פירוט לפי מוצר"/>
            </div>
            <table className="data-table reports-table">
              <thead>
                <tr><th>מוצר</th><th>כמות</th><th>הכנסה</th><th>רווח</th><th>אחוז רווח</th></tr>
              </thead>
              <tbody>
                {ordersByProduct.map((p,i) => (
                  <tr key={i}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
                        <span className="text-bold">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.כמות}</td>
                    <td className="text-bold">{fmt(p.הכנסה)}</td>
                    <td style={{color:'var(--success)',fontWeight:600}}>{fmt(p.רווח)}</td>
                    <td><span className="pct-badge">{p.הכנסה > 0 ? Math.round((p.רווח/p.הכנסה)*100) : 0}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
