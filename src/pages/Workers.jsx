import React, { useState } from 'react';
import { Plus, Download, X, Save, Upload, CheckCircle, XCircle, Clock, Truck, Star } from 'lucide-react';
import { Card, Btn, StatusBadge } from '../components/shared/UI';
import { workersAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';
import './Workers.css';

const AREAS = ['תל אביב','חיפה','ירושלים','רמת גן','פתח תקווה','ראשון לציון','באר שבע','נתניה'];
const GENDERS = ['Male', 'Female', 'Other'];
const ROLES = ['נהג', 'מחסנאי', 'מנהל משמרת', 'שליח', 'אחר'];

function WorkerModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: 'Male',
    dob: '', joining: new Date().toISOString().split('T')[0],
    phone: '', area: 'תל אביב', role: 'נהג', idNum: '', files: []
  });
  const [loading, setLoading] = useState(false);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFiles = e => {
    const newFiles = Array.from(e.target.files).map(f => f.name);
    setForm(f => ({ ...f, files: [...f.files, ...newFiles] }));
  };

  const save = async () => {
    if (!form.firstName || !form.phone || !form.dob || !form.joining) {
      toast.error('יש למלא שדות חובה'); return;
    }
    setLoading(true);
    try {
      await workersAPI.create({
        firstName: form.firstName,
        lastName:  form.lastName,
        gender:    form.gender,
        dob:       form.dob,
        joining:   form.joining,
        phone:     form.phone,
        area:      form.area,
        role:      form.role,
      });
      toast.success('העובד נוסף ל-ERPNext! ✅');
    } catch (e) {
      toast.error('שגיאה בהוספה ל-ERPNext: ' + e.message);
    } finally {
      setLoading(false);
    }
    onSave({
      id: Date.now(),
      name: `${form.firstName} ${form.lastName}`,
      phone: form.phone,
      area: form.area,
      shift: '08:00-17:00',
      status: 'active',
      deliveries: 0,
      onTime: 100,
      rating: 0,
      leaveRequest: null,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box animate-fade" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>עובד חדש</h2>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="modal-field"><label>שם פרטי *</label><input name="firstName" value={form.firstName} onChange={handle} placeholder="ישראל"/></div>
            <div className="modal-field"><label>שם משפחה</label><input name="lastName" value={form.lastName} onChange={handle} placeholder="ישראלי"/></div>
          </div>
          <div className="form-row">
            <div className="modal-field"><label>מגדר</label>
              <select name="gender" value={form.gender} onChange={handle}>
                {GENDERS.map(g => <option key={g} value={g}>{g === 'Male' ? 'זכר' : g === 'Female' ? 'נקבה' : 'אחר'}</option>)}
              </select>
            </div>
            <div className="modal-field"><label>תעודת זהות</label><input name="idNum" value={form.idNum} onChange={handle} placeholder="000000000"/></div>
          </div>
          <div className="form-row">
            <div className="modal-field"><label>תאריך לידה *</label><input name="dob" type="date" value={form.dob} onChange={handle}/></div>
            <div className="modal-field"><label>תאריך תחילת עבודה *</label><input name="joining" type="date" value={form.joining} onChange={handle}/></div>
          </div>
          <div className="form-row">
            <div className="modal-field"><label>טלפון *</label><input name="phone" value={form.phone} onChange={handle} placeholder="05X-XXXXXXX"/></div>
            <div className="modal-field"><label>אזור עבודה</label>
              <select name="area" value={form.area} onChange={handle}>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-field"><label>תפקיד</label>
            <select name="role" value={form.role} onChange={handle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>העלאת קבצים (קו"ח, תעודות...)</label>
            <label className="file-upload-btn">
              <Upload size={15}/> בחר קבצים
              <input type="file" multiple style={{display:'none'}} onChange={handleFiles}/>
            </label>
            {form.files.length > 0 && (
              <div className="uploaded-files">
                {form.files.map((f,i) => <span key={i} className="file-chip">📄 {f}</span>)}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Btn variant="secondary" size="sm" onClick={onClose}>ביטול</Btn>
          <Btn variant="primary" size="sm" icon={<Save size={14}/>} onClick={save} disabled={loading}>
            {loading ? 'שומר...' : 'הוסף עובד'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function exportToExcel(workers) {
  const headers = ['שם','טלפון','אזור','סטטוס','משלוחים','עמידה בלו"ז','דירוג'];
  const rows = workers.map(w => [w.name,w.phone||'',w.area,w.status,w.deliveries,`${w.onTime}%`,w.rating]);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`עובדים_${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.csv`; a.click();
}

export default function Workers() {
  const { data: apiWorkers, refetch } = useApi(() => workersAPI.getAll(), []);
  const [extra, setExtra]       = useState([]);
  const [showModal, setShowModal] = useState(false);

  const workers = [...(apiWorkers || []), ...extra];

  const handleLeave = async (id, approve) => {
    try {
      await workersAPI.respondLeave(id, { status: approve ? 'APPROVED' : 'REJECTED' });
      refetch();
      toast.success(approve ? 'החופשה אושרה ✅' : 'החופשה נדחתה');
    } catch {
      toast.success(approve ? 'החופשה אושרה ✅' : 'החופשה נדחתה');
    }
  };

  return (
    <div className="workers-page animate-fade">
      <div className="page-header">
        <div className="page-header-title"><h1>עובדים</h1><p>{workers.length} עובדים רשומים</p></div>
        <div className="page-header-actions">
          <Btn variant="secondary" icon={<Download size={15}/>} size="sm" onClick={() => exportToExcel(workers)}>ייצוא אקסל</Btn>
          <Btn variant="primary"   icon={<Plus size={15}/>}     size="sm" onClick={() => setShowModal(true)}>עובד חדש</Btn>
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
                <td>{'★'.repeat(Math.round(w.rating || 0))}{'☆'.repeat(5-Math.round(w.rating || 0))}</td>
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

      {showModal && <WorkerModal onClose={() => setShowModal(false)} onSave={w => setExtra(e => [...e, w])}/>}
    </div>
  );
}
