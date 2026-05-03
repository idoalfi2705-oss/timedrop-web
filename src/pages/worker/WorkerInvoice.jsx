import React, { useState, useRef, useEffect } from 'react';
import { FileText, Check, X, RotateCcw } from 'lucide-react';
import { Card, Btn } from '../../components/shared/UI';
import { mockWorkerDay } from '../../utils/workerMockData';
import './WorkerInvoice.css';

export default function WorkerInvoice() {
  const [selectedTask, setSelectedTask] = useState(mockWorkerDay.tasks[0]);
  const [items, setItems] = useState(selectedTask.items.map(i => ({ ...i, active: true })));
  const [signed, setSigned] = useState(false);
  const [sent, setSent] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
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
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', end);
    };
  }, []);

  const clearSig = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const toggleItem = (i) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, active: !item.active } : item));
  };

  const activeItems = items.filter(i => i.active);
  const total = activeItems.reduce((s, i) => s + i.price * i.qty, 0);

  const handleSend = () => {
    if (!signed) return;
    setSent(true);
  };

  if (sent) return (
    <div className="worker-invoice animate-fade">
      <Card className="wi-sent-card">
        <div className="wi-sent-icon"><Check size={36}/></div>
        <h2>חשבונית נשלחה!</h2>
        <p>הלקוח קיבל עותק במייל והמעסיק עודכן.</p>
        <Btn variant="primary" onClick={() => setSent(false)}>חזור</Btn>
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

      {/* Task selector */}
      <div className="wi-task-tabs">
        {mockWorkerDay.tasks.filter(t => !t.isStorage).map(t => (
          <button
            key={t.id}
            className={`wi-task-tab ${selectedTask.id === t.id ? 'active' : ''}`}
            onClick={() => { setSelectedTask(t); setItems(t.items.map(i => ({ ...i, active: true }))); setSigned(false); setSent(false); }}
          >
            {t.clientName}
          </button>
        ))}
      </div>

      <div className="wi-layout">
        {/* Invoice */}
        <Card className="wi-invoice">
          <div className="wi-invoice-header">
            <div className="wi-logo">TimeDrop</div>
            <div className="wi-invoice-meta">
              <div>חשבונית מס׳: <strong>#INV-{selectedTask.id}042</strong></div>
              <div>תאריך: <strong>{new Date().toLocaleDateString('he-IL')}</strong></div>
            </div>
          </div>

          <div className="wi-client-info">
            <div><strong>לקוח:</strong> {selectedTask.clientName}</div>
            <div><strong>כתובת:</strong> {selectedTask.address}</div>
            <div><strong>טלפון:</strong> {selectedTask.phone}</div>
          </div>

          <table className="wi-items-table">
            <thead>
              <tr><th>פריט</th><th>כמות</th><th>מחיר</th><th>סה"כ</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className={!item.active ? 'wi-item-cancelled' : ''}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>₪{item.price}</td>
                  <td>₪{item.active ? item.price * item.qty : 0}</td>
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
                <td colSpan={2}><strong>₪{total}</strong></td>
              </tr>
            </tfoot>
          </table>

          {items.some(i => !i.active) && (
            <div className="wi-missing-note">
              ⚠️ פריטים חסרים הוסרו מהחשבונית. עדכון ישלח ללקוח ולמעסיק.
            </div>
          )}
        </Card>

        {/* Signature */}
        <Card className="wi-sig-card">
          <div className="wi-sig-title">
            <FileText size={18}/> חתימת לקוח
          </div>
          <p className="wi-sig-sub">בחתימתי אני מאשר קבלת הסחורה המפורטת לעיל</p>
          <div className="wi-canvas-wrap">
            <canvas ref={canvasRef} width={400} height={160} className="wi-canvas"/>
            {!signed && <div className="wi-canvas-placeholder">חתום כאן</div>}
          </div>
          <div className="wi-sig-actions">
            <Btn variant="secondary" size="sm" icon={<RotateCcw size={14}/>} onClick={clearSig}>נקה</Btn>
            <Btn
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={!signed}
            >
              {signed ? 'שלח חשבונית' : 'ממתין לחתימה...'}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
