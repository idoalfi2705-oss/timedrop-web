import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Card, Btn } from '../../components/shared/UI';
import './WorkerLeave.css';

const AREAS = ['תל אביב', 'חיפה', 'ירושלים', 'רמת גן', 'פתח תקווה', 'ראשון לציון'];
const DAYS  = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];

const INITIAL_REQUESTS = [
  { id: 1, type: 'vacation', date: '2026-05-10', status: 'pending',  note: '' },
  { id: 2, type: 'sick',     date: '2026-04-28', status: 'approved', note: '' },
  { id: 3, type: 'vacation', date: '2026-04-15', status: 'rejected', note: 'יש משלוח קריטי באזורך' },
];

export default function WorkerLeave() {
  const [requests, setRequests]   = useState(INITIAL_REQUESTS);
  const [shifts, setShifts]       = useState({ ראשון: true, שני: true, שלישי: false, רביעי: true, חמישי: true, שישי: false });
  const [area, setArea]           = useState('תל אביב');
  const [newReq, setNewReq]       = useState({ type: 'vacation', date: '' });
  const [showForm, setShowForm]   = useState(false);
  const [saved, setSaved]         = useState(false);

  const submitRequest = () => {
    if (!newReq.date) return;
    setRequests(r => [...r, { id: Date.now(), ...newReq, status: 'pending', note: '' }]);
    setNewReq({ type: 'vacation', date: '' });
    setShowForm(false);
  };

  const saveShifts = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const statusMap = {
    pending:  { label: 'ממתין לאישור', color: 'yellow', icon: <Clock size={14}/> },
    approved: { label: 'אושר',         color: 'green',  icon: <CheckCircle size={14}/> },
    rejected: { label: 'נדחה',         color: 'red',    icon: <XCircle size={14}/> },
  };

  return (
    <div className="worker-leave animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>משמרות וחופשות</h1>
          <p>הגדרת ימי עבודה ובקשות היעדרות</p>
        </div>
      </div>

      {/* Weekly shifts */}
      <Card>
        <div className="wl-section-title"><Calendar size={18}/> ימי משמרת שבועיים</div>
        <div className="wl-area-row">
          <label>אזור משלוחים:</label>
          <select value={area} onChange={e => setArea(e.target.value)} className="wl-select">
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="wl-days-grid">
          {DAYS.map(day => (
            <button
              key={day}
              className={`wl-day-btn ${shifts[day] ? 'active' : ''}`}
              onClick={() => setShifts(s => ({ ...s, [day]: !s[day] }))}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="wl-save-row">
          <Btn variant="primary" size="sm" onClick={saveShifts}>
            {saved ? <><CheckCircle size={14}/> נשמר!</> : 'שמור משמרות'}
          </Btn>
          <span className="wl-save-note">השינויים יועברו למעסיק לאישור</span>
        </div>
      </Card>

      {/* Leave requests */}
      <Card>
        <div className="wl-section-top">
          <div className="wl-section-title"><Clock size={18}/> בקשות היעדרות</div>
          <Btn variant="primary" size="sm" icon={<Plus size={14}/>} onClick={() => setShowForm(s => !s)}>
            בקשה חדשה
          </Btn>
        </div>

        {showForm && (
          <div className="wl-new-form animate-fade">
            <div className="wl-form-row">
              <select
                className="wl-select"
                value={newReq.type}
                onChange={e => setNewReq(r => ({ ...r, type: e.target.value }))}
              >
                <option value="vacation">חופשה</option>
                <option value="sick">מחלה</option>
              </select>
              <input
                type="date"
                className="wl-date-input"
                value={newReq.date}
                onChange={e => setNewReq(r => ({ ...r, date: e.target.value }))}
              />
              <Btn variant="primary" size="sm" onClick={submitRequest}>שלח בקשה</Btn>
              <Btn variant="secondary" size="sm" onClick={() => setShowForm(false)}>ביטול</Btn>
            </div>
          </div>
        )}

        <div className="wl-requests-list">
          {requests.map(req => {
            const s = statusMap[req.status];
            return (
              <div key={req.id} className={`wl-request-row wl-${req.status}`}>
                <div className={`wl-status-dot wl-dot-${s.color}`}>{s.icon}</div>
                <div className="wl-req-info">
                  <div className="wl-req-type">
                    {req.type === 'vacation' ? '🌴 חופשה' : '🤒 מחלה'}
                  </div>
                  <div className="wl-req-date">{req.date}</div>
                </div>
                <div className="wl-req-status">
                  <span className={`wl-status-badge wl-badge-${s.color}`}>{s.label}</span>
                  {req.note && (
                    <div className="wl-req-note">"{req.note}"</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
