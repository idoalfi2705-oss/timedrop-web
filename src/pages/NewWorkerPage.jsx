import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Save, Upload } from 'lucide-react';
import { Btn } from '../components/shared/UI';
import { workersAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './FormPage.css';

const AREAS   = ['תל אביב','חיפה','ירושלים','רמת גן','פתח תקווה','ראשון לציון','באר שבע','נתניה'];
const GENDERS = [{ val:'Male',label:'זכר' },{ val:'Female',label:'נקבה' },{ val:'Other',label:'אחר' }];
const ROLES   = ['נהג','מחסנאי','מנהל משמרת','שליח','אחר'];

const INIT = {
  firstName:'', lastName:'', gender:'Male', idNum:'',
  dob:'', joining: new Date().toISOString().split('T')[0],
  phone:'', area:'תל אביב', role:'נהג', files:[],
};

export default function NewWorkerPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INIT);
  const [loading, setLoading] = useState(false);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const addFiles = e => setForm(f => ({ ...f, files: [...f.files, ...Array.from(e.target.files).map(x => x.name)] }));

  const save = async () => {
    if (!form.firstName || !form.phone || !form.dob || !form.joining) {
      toast.error('יש למלא שדות חובה'); return;
    }
    setLoading(true);
    try {
      await workersAPI.create(form);
      toast.success('העובד נוסף בהצלחה!');
      navigate('/dashboard/workers');
    } catch (e) {
      toast.error('שגיאה: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page animate-fade">
      <button className="form-page-back" onClick={() => navigate('/dashboard/workers')}>
        <ChevronRight size={16}/> חזרה לעובדים
      </button>
      <h1 className="form-page-title">עובד חדש</h1>
      <p className="form-page-sub">מלא את הפרטים ולחץ "הוסף עובד" להוספה ל-ERPNext</p>

      <div className="form-section">
        <div className="form-section-title">פרטים אישיים</div>
        <div className="form-grid">
          <div className="fp-field">
            <label>שם פרטי *</label>
            <input name="firstName" value={form.firstName} onChange={handle} placeholder="ישראל"/>
          </div>
          <div className="fp-field">
            <label>שם משפחה</label>
            <input name="lastName" value={form.lastName} onChange={handle} placeholder="ישראלי"/>
          </div>
          <div className="fp-field">
            <label>מגדר</label>
            <select name="gender" value={form.gender} onChange={handle}>
              {GENDERS.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
            </select>
          </div>
          <div className="fp-field">
            <label>תעודת זהות</label>
            <input name="idNum" value={form.idNum} onChange={handle} placeholder="000000000"/>
          </div>
          <div className="fp-field">
            <label>תאריך לידה *</label>
            <input name="dob" type="date" value={form.dob} onChange={handle}/>
          </div>
          <div className="fp-field">
            <label>תאריך תחילת עבודה *</label>
            <input name="joining" type="date" value={form.joining} onChange={handle}/>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">פרטי עבודה</div>
        <div className="form-grid">
          <div className="fp-field">
            <label>טלפון *</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="05X-XXXXXXX"/>
          </div>
          <div className="fp-field">
            <label>אזור עבודה</label>
            <select name="area" value={form.area} onChange={handle}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="fp-field span2">
            <label>תפקיד</label>
            <select name="role" value={form.role} onChange={handle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">מסמכים</div>
        <label className="file-upload-area">
          <Upload size={18} style={{ marginBottom: 4 }}/>
          <div>לחץ להעלאת קבצים (קו"ח, תעודות...)</div>
          <input type="file" multiple style={{ display:'none' }} onChange={addFiles}/>
        </label>
        {form.files.length > 0 && (
          <div className="file-chips">
            {form.files.map((f, i) => <span key={i} className="file-chip-fp">📄 {f}</span>)}
          </div>
        )}
      </div>

      <div className="form-page-footer">
        <Btn variant="primary" icon={<Save size={15}/>} onClick={save} disabled={loading}>
          {loading ? 'שומר...' : 'הוסף עובד'}
        </Btn>
        <Btn variant="secondary" onClick={() => navigate('/dashboard/workers')}>ביטול</Btn>
      </div>
    </div>
  );
}
