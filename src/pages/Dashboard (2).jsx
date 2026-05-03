import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, ShoppingCart, Clock, AlertTriangle, Truck, Plus, FileText, Package, X } from 'lucide-react';
import { KpiCard, Card, SectionHeader, StatusBadge, Btn } from '../components/shared/UI';
import { ordersAPI, workersAPI } from '../utils/api';
import { useApi, useMutation } from '../hooks/useApi';
import { kpiData, revenueByDay, ordersByProduct, mockOrders, mockWorkers, mockWarehouseItems } from '../utils/mockData';
import toast from 'react-hot-toast';
import './Dashboard.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>)}
    </div>
  );
};

const renderBarNum = (props) => {
  const { x, y, width, height, index } = props;
  if (width < 20) return <text x={x+width+5} y={y+height/2} fill="#1e7fe0" dominantBaseline="middle" style={{fontSize:11,fontFamily:'Heebo',fontWeight:700}}>{index+1}</text>;
  return <text x={x+8} y={y+height/2} fill="#fff" dominantBaseline="middle" style={{fontSize:11,fontFamily:'Heebo',fontWeight:700}}>{index+1}</text>;
};

// Drawer component
function Drawer({ title, onClose, children }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer animate-slide">
        <div className="drawer-header">
          <h2>{title}</h2>
          <button className="drawer-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [period,  setPeriod]  = useState('month');
  const [drawer,  setDrawer]  = useState(null); // 'revenue' | 'profit' | 'orders' | 'workers' | 'stock'
  const navigate = useNavigate();

  const { data: leaveRequests, refetch: refetchLeave } = useApi(() => workersAPI.getLeaveRequests().catch(() => []), []);
  const { data: orders, loading: ordersLoading } = useApi(() => ordersAPI.getAll().catch(() => mockOrders), []);
  const { mutate: respondLeave } = useMutation(({ id, status }) => workersAPI.respondLeave(id, { status }));

  const handleLeave = async (id, approve) => {
    try { await respondLeave({ id, status: approve ? 'APPROVED' : 'REJECTED' }); refetchLeave(); toast.success(approve ? 'אושר ✅' : 'נדחה'); } catch {}
  };

  const filteredData = useMemo(() => {
    if (period === 'day')  return revenueByDay.slice(-1);
    if (period === 'week') return revenueByDay.slice(-7);
    if (period === 'year') return revenueByDay;
    return revenueByDay.slice(-30);
  }, [period]);

  const displayOrders = orders || mockOrders;
  const pending       = displayOrders.filter(o => o.status === 'pending');
  const periodRevenue = filteredData.reduce((s,d) => s+d.הכנסות, 0);
  const periodProfit  = filteredData.reduce((s,d) => s+d.רווח, 0);
  const periodLabel   = { day:'היום', week:'השבוע', month:'החודש', year:'השנה' }[period];
  const lowStock      = mockWarehouseItems.filter(i => i.qty < i.min);
  const activeWorkers = mockWorkers.filter(w => w.status === 'active');

  return (
    <div className="dashboard animate-fade">
      <div className="page-header">
        <div className="page-header-title"><h1>דשבורד</h1><p>ברוך הבא! הנה סיכום פעילות העסק שלך</p></div>
        <div className="page-header-actions">
          <Btn variant="secondary" size="sm" icon={<FileText size={15}/>} onClick={() => navigate('/dashboard/orders')}>כל ההזמנות</Btn>
          <Btn variant="secondary" size="sm" icon={<Package size={15}/>}  onClick={() => navigate('/dashboard/items')}>פריט חדש</Btn>
          <Btn variant="primary"   size="sm" icon={<Plus size={15}/>}     onClick={() => navigate('/dashboard/clients')}>לקוח חדש</Btn>
          <div className="period-tabs">
            {['day','week','month','year'].map(p => (
              <button key={p} className={`period-tab ${period===p?'active':''}`} onClick={()=>setPeriod(p)}>
                {{ day:'יום', week:'שבוע', month:'חודש', year:'שנה' }[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(leaveRequests?.length > 0 || pending.length > 0) && (
        <div className="alerts-bar">
          {leaveRequests?.map(r => (
            <div key={r.id} className="alert-chip alert-yellow">
              <AlertTriangle size={14}/>
              <span>{r.user?.name} ביקש {r.type==='SICK'?'מחלה':'חופשה'}</span>
              <div className="alert-actions">
                <button className="alert-btn approve" onClick={()=>handleLeave(r.id,true)}>אשר</button>
                <button className="alert-btn reject"  onClick={()=>handleLeave(r.id,false)}>דחה</button>
              </div>
            </div>
          ))}
          {pending.length > 0 && (
            <div className="alert-chip alert-blue" style={{cursor:'pointer'}} onClick={()=>setDrawer('orders')}>
              <Clock size={14}/><span>{pending.length} הזמנות ממתינות – לחץ לפירוט</span>
            </div>
          )}
        </div>
      )}

      {/* KPIs – לחיצה פותחת פירוט */}
      <div className="kpi-grid">
        <KpiCard label={`הכנסות – ${periodLabel}`} value={fmt(periodRevenue)} icon={<TrendingUp size={22}/>}    color="blue"   trend={12} onClick={() => setDrawer('revenue')}/>
        <KpiCard label={`רווח – ${periodLabel}`}   value={fmt(periodProfit)}  icon={<ShoppingCart size={22}/>}  color="green"  trend={8}  onClick={() => setDrawer('profit')}/>
        <KpiCard label="הזמנות פתוחות"             value={pending.length}     icon={<Clock size={22}/>}         color="yellow"            onClick={() => setDrawer('orders')}/>
        <KpiCard label="עובדים פעילים"             value={`${activeWorkers.length}/4`} icon={<Truck size={22}/>} color="blue"             onClick={() => setDrawer('workers')}/>
        <KpiCard label="מלאי נמוך"                 value={lowStock.length}    icon={<AlertTriangle size={22}/>} color="red"   sub="לחץ לצפייה" onClick={() => setDrawer('stock')}/>
        <KpiCard label="זמן משלוח ממוצע"           value={`${kpiData.avgDeliveryTime} דק'`} icon={<Clock size={22}/>} color="green" trend={-5}/>
      </div>

      {/* Charts */}
      <div className="charts-row">
        <Card className="chart-card chart-large">
          <SectionHeader title="הכנסות ורווח" sub={`${filteredData.length} ימים`}/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={filteredData} margin={{top:5,right:5,left:0,bottom:0}}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e7fe0" stopOpacity={0.15}/><stop offset="95%" stopColor="#1e7fe0" stopOpacity={0}/></linearGradient>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{fontSize:11,fontFamily:'Heebo'}} tickLine={false}/>
              <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`₪${(v/1000).toFixed(0)}K`} width={45}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="הכנסות" stroke="#1e7fe0" strokeWidth={2} fill="url(#gR)"/>
              <Area type="monotone" dataKey="רווח"   stroke="#10b981" strokeWidth={2} fill="url(#gP)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card chart-small">
          <SectionHeader title="מכירות לפי מוצר"/>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByProduct} layout="vertical" margin={{top:0,right:10,left:8,bottom:0}}>
              <XAxis type="number" tick={{fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`₪${v}`}/>
              <YAxis type="category" dataKey="name" tick={false} tickLine={false} width={8}/>
              <Tooltip formatter={v=>fmt(v)}/>
              <Bar dataKey="הכנסה" fill="#1e7fe0" radius={[0,4,4,0]} label={renderBarNum} isAnimationActive={false}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="mini-legend">
            {ordersByProduct.map((p,i) => (
              <div key={i} className="mini-legend-item">
                <span className="mini-num">{i+1}</span>
                <span className="mini-name">{p.name}</span>
                <span className="mini-val">{fmt(p.הכנסה)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom */}
      <div className="bottom-row">
        <Card className="table-card" padding={false}>
          <div style={{padding:'20px 24px 0'}}>
            <SectionHeader title="הזמנות אחרונות" action={<Btn variant="ghost" size="sm" onClick={()=>navigate('/dashboard/orders')}>צפה בכולן</Btn>}/>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>#</th><th>לקוח</th><th>תאריך</th><th>סכום</th><th>רווח</th><th>סטטוס</th></tr></thead>
              <tbody>
                {displayOrders.slice(0,8).map(o => (
                  <tr key={o.id} style={{cursor:'pointer'}} onClick={()=>navigate('/dashboard/orders')}>
                    <td className="order-id">#{o.id}</td>
                    <td>{o.clientName}</td>
                    <td className="text-muted">{new Date(o.date).toLocaleDateString('he-IL')}</td>
                    <td className="text-bold">{fmt(o.total)}</td>
                    <td className="text-green">{fmt(o.profit??0)}</td>
                    <td><StatusBadge status={o.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="workers-card">
          <SectionHeader title="סטטוס עובדים" action={<Btn variant="ghost" size="sm" onClick={()=>navigate('/dashboard/workers')}>נהל</Btn>}/>
          <div className="workers-list">
            {mockWorkers.map(w => (
              <div key={w.id} className="worker-row" style={{cursor:'pointer'}} onClick={()=>navigate('/dashboard/workers')}>
                <div className="worker-avatar">{w.name[0]}</div>
                <div className="worker-info"><div className="worker-name">{w.name}</div><div className="worker-meta">{w.area} · {w.shift}</div></div>
                <div className="worker-stats"><span className="worker-deliveries">{w.deliveries} משלוחים</span><StatusBadge status={w.status}/></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Drawers */}
      {drawer === 'revenue' && (
        <Drawer title={`פירוט הכנסות – ${periodLabel}`} onClose={() => setDrawer(null)}>
          <div className="drawer-summary">
            <div className="drawer-stat"><div className="drawer-stat-val">{fmt(periodRevenue)}</div><div className="drawer-stat-lbl">סה"כ הכנסות</div></div>
            <div className="drawer-stat"><div className="drawer-stat-val">{fmt(periodProfit)}</div><div className="drawer-stat-lbl">רווח</div></div>
            <div className="drawer-stat"><div className="drawer-stat-val">{Math.round((periodProfit/periodRevenue)*100)}%</div><div className="drawer-stat-lbl">אחוז רווח</div></div>
          </div>
          <table className="data-table">
            <thead><tr><th>תאריך</th><th>הכנסות</th><th>רווח</th></tr></thead>
            <tbody>{filteredData.slice(-10).map((d,i)=><tr key={i}><td>{d.date}</td><td className="text-bold">{fmt(d.הכנסות)}</td><td className="text-green">{fmt(d.רווח)}</td></tr>)}</tbody>
          </table>
        </Drawer>
      )}

      {drawer === 'profit' && (
        <Drawer title={`פירוט רווח – ${periodLabel}`} onClose={() => setDrawer(null)}>
          <div className="drawer-summary">
            <div className="drawer-stat"><div className="drawer-stat-val">{fmt(periodProfit)}</div><div className="drawer-stat-lbl">רווח סה"כ</div></div>
            <div className="drawer-stat"><div className="drawer-stat-val">{Math.round((periodProfit/periodRevenue)*100)}%</div><div className="drawer-stat-lbl">מסה"כ הכנסות</div></div>
          </div>
          <table className="data-table">
            <thead><tr><th>מוצר</th><th>הכנסה</th><th>רווח</th><th>%</th></tr></thead>
            <tbody>{ordersByProduct.map((p,i)=><tr key={i}><td className="text-bold">{p.name}</td><td>{fmt(p.הכנסה)}</td><td className="text-green">{fmt(p.רווח)}</td><td>{Math.round((p.רווח/p.הכנסה)*100)}%</td></tr>)}</tbody>
          </table>
        </Drawer>
      )}

      {drawer === 'orders' && (
        <Drawer title="הזמנות ממתינות לאישור" onClose={() => setDrawer(null)}>
          {pending.length === 0
            ? <p style={{color:'var(--gray-400)',textAlign:'center',padding:'40px'}}>אין הזמנות ממתינות 🎉</p>
            : <table className="data-table">
                <thead><tr><th>#</th><th>לקוח</th><th>תאריך</th><th>סכום</th><th>פעולה</th></tr></thead>
                <tbody>{pending.map(o=><tr key={o.id}><td className="order-id">#{o.id}</td><td className="text-bold">{o.clientName}</td><td>{new Date(o.date).toLocaleDateString('he-IL')}</td><td>{fmt(o.total)}</td><td><button className="alert-btn approve" onClick={()=>toast.success('הזמנה אושרה!')}>אשר</button></td></tr>)}</tbody>
              </table>
          }
        </Drawer>
      )}

      {drawer === 'workers' && (
        <Drawer title="עובדים פעילים" onClose={() => setDrawer(null)}>
          <table className="data-table">
            <thead><tr><th>שם</th><th>אזור</th><th>משמרת</th><th>משלוחים</th><th>עמידה</th></tr></thead>
            <tbody>{activeWorkers.map(w=><tr key={w.id}><td className="text-bold">{w.name}</td><td>{w.area}</td><td>{w.shift}</td><td>{w.deliveries}</td><td>{w.onTime}%</td></tr>)}</tbody>
          </table>
        </Drawer>
      )}

      {drawer === 'stock' && (
        <Drawer title="מלאי נמוך" onClose={() => setDrawer(null)}>
          {lowStock.length === 0
            ? <p style={{color:'var(--gray-400)',textAlign:'center',padding:'40px'}}>אין מלאי נמוך 🎉</p>
            : <table className="data-table">
                <thead><tr><th>פריט</th><th>כמות</th><th>מינימום</th><th>מיקום</th><th></th></tr></thead>
                <tbody>{lowStock.map(i=>(
                  <tr key={i.id}>
                    <td className="text-bold">{i.name}</td>
                    <td style={{color:'var(--danger)',fontWeight:700}}>{i.qty}</td>
                    <td>{i.min}</td>
                    <td>{i.location}</td>
                    <td><button className="alert-btn approve" onClick={()=>toast.success(`הוזמן ${i.name} ✅`)}>הזמן</button></td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </Drawer>
      )}
    </div>
  );
}
