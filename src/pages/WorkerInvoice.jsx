import React, { useState, useRef, useEffect } from 'react';
import { FileText, Check, X, RotateCcw } from 'lucide-react';
import { Card, Btn } from '../components/shared/UI';
import { deliveriesAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import './WorkerInvoice.css';

export default function WorkerInvoice() {
  const { data: deliveries, loading } = useApi(() => deliveriesAPI.getToday(), []);
  const tasks = (deliveries || []).filter(d => d.status !== 'delivered');

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [items, setItems]             = useState([]);
  const [signed, setSigned]           = useState(false);
  const [sent, setSent]               = useState(false);
  const canvasRef = useRef(null);
  const drawing   = useRef(false);

  const selectedTask = tasks[selectedIdx] || null;

  useEffect(() => {
    if (selectedTask?.items) {
      setItems(selectedTask.items.map(i => ({ ...i, active: true })));
    } else {
      setItems([]);
    }
    setSigned(false);
    setSent(false);
  }, [selectedIdx, deliveries]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e) => {
      const rect  = canvas.getBoundingClientRect();
      const touch = e.touches?.[0];
      return {
        x: ((touch?.clientX ?? e.clientX) - rect.left) * (canvas.width / rect.width),
        y: ((touch?.clientY ?? e.clientY) - rect.top)  * (canvas.height / rect.height),
      };
    };

    const start = (e) => { e.preventDefault(); drawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const draw  = (e) => { e.preventDefault(); if (!drawing.current) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const end   = ()  => { drawing.current = false; setSigned(true); };

    canvas.addEventListener('mousedown',  start);
    canvas.addEventListener('mousemove',  draw);
    canvas.addEventListener('mouseup',    end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove',  draw,  { passive: false });
    canvas.addEventListener('touchend',   end);
    return () => {
      canvas.removeEventListener('mousedown',  start);
      canvas.removeEventListener('mousemove',  draw);
      canvas.removeEventListener('mouseup',    end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove',  draw);
      canvas.removeEventListener('touchend',   end);
    };
  }, [selectedTask]);

  const clearSig = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const toggleItem = (i) => setItems(items.map((item, idx) => idx === i ? { ...item, active: !item.active } : item));

  const activeItems = items.filter(i => i.active);
  const total       = activeItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);

  if (loading) return (
    <div className="worker-invoice animate-fade">
      <div className="skeleton" style={{ height: 200, borderRadius: 12 }}/>
    </div>
  );

  if (sent) return (
    <div className="worker-invoice animate-fade">
      <Card className="wi-sent-card">
        <div className="wi-sent-icon"><Check size={36}/></div>
        <h2>חשבונית נשלחה!</h2>
        <p>הלקוח קיבל עותק במייל והמעסיק עודכן.</p>
        <Btn variant="primary" onClick={() => { setSent(false); setSigned(false); }}>חזור</Btn>
      </Card>
    </div>
  );

  if (tasks.length === 0) return (
    <div className="worker-invoice animate-fade">
      <Card className="wi-sent-card">
        <FileText size={40} style={{ color: 'var(--gray-300)', marginBottom: 12 }}/>
        <h2>אין משלוחים פעילים</h2>
        <p style={{ color: 'var(--gray-400)' }}>כל המשלוחים להיום הושלמו.</p>
      </Card>
    </div>
  );

  return (
    <div className="worker-invoice animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>חשבונית ממסירה</h1>
          <p>בחר משלוח, סמן פריטים וקבל חתימה</p>
        </div>
      </div>

      <div className="wi-task-tabs">
        {tasks.map((t, i) => (
          <button
            key={t.id}
            className={`wi-task-tab ${selectedIdx === i ? 'active' : ''}`}
            onClick={() => setSelectedIdx(i)}
          >
            {t.clientName}
          </button>
        ))}
      </div>

      {selectedTask && (
        <div className="wi-layout">
          <Card className="wi-invoice">
            <div className="wi-invoice-header">
              <div className="wi-logo">TimeDrop</div>
              <div className="wi-invoice-meta">
                <div>הזמנה: <strong>#{selectedTask.id}</strong></div>
                <div>תאריך: <strong>{new Date().toLocaleDateString('he-IL')}</strong></div>
              </div>
            </div>

            <div className="wi-client-info">
              <div><strong>לקוח:</strong> {selectedTask.clientName}</div>
              {selectedTask.address && <div><strong>כתובת:</strong> {selectedTask.address}</div>}
            </div>

            {items.length > 0 ? (
              <table className="wi-items-table">
                <thead>
                  <tr><th>פריט</th><th>כמות</th><th>מחיר</th><th>סה"כ</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className={!item.active ? 'wi-item-cancelled' : ''}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>₪{item.price || 0}</td>
                      <td>₪{item.active ? (item.price || 0) * (item.qty || 0) : 0}</td>
                      <td>
                        <button className={`wi-toggle-item ${item.active ? 'active' : 'cancelled'}`} onClick={() => toggleItem(i)}>
                          {item.active ? <X size={14}/> : <Check size={14}/>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}><strong>סה"כ לתשלום</strong></td>
                    <td colSpan={2}><strong>₪{total || selectedTask.total || 0}</strong></td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div style={{ padding: '16px 0', color: 'var(--gray-500)' }}>
                סה"כ הזמנה: <strong>₪{selectedTask.total || 0}</strong>
              </div>
            )}

            {items.some(i => !i.active) && (
              <div className="wi-missing-note">פריטים חסרים הוסרו מהחשבונית. עדכון ישלח ללקוח ולמעסיק.</div>
            )}
          </Card>

          <Card className="wi-sig-card">
            <div className="wi-sig-title"><FileText size={18}/> חתימת לקוח</div>
            <p className="wi-sig-sub">בחתימתי אני מאשר קבלת הסחורה המפורטת לעיל</p>
            <div className="wi-canvas-wrap">
              <canvas ref={canvasRef} width={400} height={160} className="wi-canvas"/>
              {!signed && <div className="wi-canvas-placeholder">חתום כאן</div>}
            </div>
            <div className="wi-sig-actions">
              <Btn variant="secondary" size="sm" icon={<RotateCcw size={14}/>} onClick={clearSig}>נקה</Btn>
              <Btn variant="primary" size="sm" onClick={() => signed && setSent(true)} disabled={!signed}>
                {signed ? 'שלח חשבונית' : 'ממתין לחתימה...'}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
