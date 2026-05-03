import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { Card, StatusBadge } from '../components/shared/UI';
import { ordersAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { mockOrders } from '../utils/mockData';
import './Orders.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

function exportToExcel(orders) {
  const headers = ['#', 'לקוח', 'תאריך', 'פריטים', 'סכום', 'רווח', 'סטטוס'];
  const STATUS = { delivered: 'נמסר', pending: 'ממתין', cancelled: 'בוטל' };
  const rows = orders.map(o => [
    o.id,
    o.clientName,
    new Date(o.date).toLocaleDateString('he-IL'),
    o.items?.map(i => `${i.name} ×${i.qty}`).join(', ') || '',
    o.total,
    o.profit ?? 0,
    STATUS[o.status] || o.status,
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `הזמנות_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Orders() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  const { data: orders, loading } = useApi(
    () => ordersAPI.getAll({ fromDate, toDate }).catch(() => mockOrders),
    [fromDate, toDate]
  );

  const list = (orders || mockOrders).filter(o => {
    const matchSearch = o.clientName?.includes(search) || String(o.id).includes(search);
    const matchStatus = status === 'all' || o.status === status;
    return matchSearch && matchStatus;
  });

  const total  = list.reduce((s, o) => s + (o.total  ?? 0), 0);
  const profit = list.reduce((s, o) => s + (o.profit ?? 0), 0);

  return (
    <div className="orders-page animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>הזמנות</h1>
          <p>{list.length} הזמנות | סה"כ {fmt(total)} | רווח {fmt(profit)}</p>
        </div>
        <button className="export-btn" onClick={() => exportToExcel(list)}>
          <Download size={16}/> ייצוא לאקסל
        </button>
      </div>

      <Card className="orders-filters">
        <div className="orders-search">
          <Search size={16}/>
          <input placeholder="חיפוש..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="orders-dates">
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="date-input"/>
          <input type="date" value={toDate}   onChange={e=>setToDate(e.target.value)}   className="date-input"/>
        </div>
        <div className="status-filters">
          {['all','delivered','pending','cancelled'].map(s => (
            <button key={s} className={`status-filter-btn ${status===s?'active':''}`} onClick={()=>setStatus(s)}>
              {{ all:'הכל', delivered:'נמסר', pending:'ממתין', cancelled:'בוטל' }[s]}
            </button>
          ))}
        </div>
      </Card>

      <Card padding={false}>
        <table className="data-table orders-table">
          <thead>
            <tr><th>#</th><th>לקוח</th><th>תאריך</th><th>פריטים</th><th>סכום</th><th>רווח</th><th>סטטוס</th></tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length:5}).map((_,i)=><tr key={i}><td colSpan={7}><div className="skeleton" style={{height:36,margin:'4px 0'}}/></td></tr>)
              : list.map(o => (
                <tr key={o.id}>
                  <td className="order-id">#{o.id}</td>
                  <td className="text-bold">{o.clientName}</td>
                  <td className="text-muted">{new Date(o.date).toLocaleDateString('he-IL')}</td>
                  <td>{o.items?.map(i=>`${i.name} ×${i.qty}`).join(', ')}</td>
                  <td className="text-bold">{fmt(o.total)}</td>
                  <td style={{color:'var(--success)',fontWeight:600}}>{fmt(o.profit??0)}</td>
                  <td><StatusBadge status={o.status}/></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </Card>
    </div>
  );
}
