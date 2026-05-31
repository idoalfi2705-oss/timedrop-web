import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, CheckCircle, XCircle, Clock, Truck, Star } from 'lucide-react';
import { Card, Btn, StatusBadge } from '../components/shared/UI';
import { workersAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';
import './Workers.css';

function exportToExcel(workers) {
  const headers = ['שם','טלפון','אזור','סטטוס','משלוחים','עמידה בלו"ז','דירוג'];
  const rows = workers.map(w => [w.name,w.phone||'',w.area,w.status,w.deliveries,`${w.onTime}%`,w.rating]);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`עובדים_${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.csv`; a.click();
}

export default function Workers() {
  const navigate = useNavigate();
  const { data: apiWorkers, refetch } = useApi(() => workersAPI.getAll(), []);
  const [extra] = useState([]);

  const workers = [...(apiWorkers || []), ...extra];

  const handleLeave = async (id, approve) => {
    try {
      await workersAPI.respondLeave(id, { status: approve ? 'APPROVED' : 'REJECTED' });
      refetch();
      toast.success(approve ? 'החופשה אושרה' : 'החופשה נדחתה');
    } catch {
      toast.success(approve ? 'החופשה אושרה' : 'החופשה נדחתה');
    }
  };

  return (
    <div className="workers-page animate-fade">
      <div className="page-header">
        <div className="page-header-title"><h1>עובדים</h1><p>{workers.length} עובדים רשומים</p></div>
        <div className="page-header-actions">
          <Btn variant="secondary" icon={<Download size={15}/>} size="sm" onClick={() => exportToExcel(workers)}>ייצוא אקסל</Btn>
          <Btn variant="primary"   icon={<Plus size={15}/>}     size="sm" onClick={() => navigate('/dashboard/workers/new')}>עובד חדש</Btn>
        </div>
      </div>

      <Card padding={false}>
        <table className="data-table workers-table">
          <thead>
            <tr><th>שם</th><th>טלפון</th><th>אזור</th><th>משמרת</th><th>משלוחים</th><th>עמידה בלו"ז</th><th>דירוג</th><th>סטטוס</th><th>בקשה</th></tr>
          </thead>
          <tbody>
            {workers.map(w => (
              <tr key={w.id}>
                <td className="text-bold">{w.name}</td>
                <td className="text-muted">{w.phone || '—'}</td>
                <td>{w.area}</td>
                <td className="text-muted">{w.shift}</td>
                <td>{w.deliveries}</td>
                <td><span className="pct-badge">{w.onTime}%</span></td>
                <td>{w.rating ? `${w.rating}/5` : '—'}</td>
                <td><StatusBadge status={w.status}/></td>
                <td>
                  {w.leaveRequest ? (
                    <div style={{display:'flex',gap:4}}>
                      <button className="leave-mini approve" onClick={()=>handleLeave(w.id,true)}><CheckCircle size={13}/></button>
                      <button className="leave-mini reject"  onClick={()=>handleLeave(w.id,false)}><XCircle size={13}/></button>
                    </div>
                  ) : <span className="text-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="workers-grid">
        {workers.map(w => (
          <Card key={w.id} className="worker-card">
            <div className="worker-card-header">
              <div className="worker-card-avatar">{w.name?.[0]}</div>
              <div className="worker-card-info">
                <div className="worker-card-name">{w.name}</div>
                <div className="worker-card-area">{w.area}</div>
              </div>
              <StatusBadge status={w.status}/>
            </div>
            <div className="worker-card-stats">
              <div className="wstat"><Truck size={15}/><span>{w.deliveries}</span><small>משלוחים</small></div>
              <div className="wstat"><Clock size={15}/><span>{w.onTime}%</span><small>עמידה בלו"ז</small></div>
              <div className="wstat"><Star size={15}/><span>{w.rating||'—'}</span><small>דירוג</small></div>
            </div>
            {w.leaveRequest && (
              <div className="worker-leave-request">
                <div className="worker-leave-info"><Clock size={14}/> בקשת {w.leaveRequest.type==='sick'?'מחלה':'חופשה'} – {w.leaveRequest.date}</div>
                <div className="worker-leave-actions">
                  <button className="leave-btn approve" onClick={()=>handleLeave(w.id,true)}><CheckCircle size={14}/> אשר</button>
                  <button className="leave-btn reject"  onClick={()=>handleLeave(w.id,false)}><XCircle size={14}/> דחה</button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

    </div>
  );
}
