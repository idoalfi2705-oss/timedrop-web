import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Save } from 'lucide-react';
import { Btn } from '../components/shared/UI';
import { clientsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './FormPage.css';

const CATEGORIES = ['מסעדה','קפה','מאפייה','סופרמרקט','מלון','קייטרינג','מוסד חינוכי','אחר'];
const AREAS = ['תל אביב','חיפה','ירושלים','רמת גן','פתח תקווה','ראשון לציון','באר שבע','נתניה','אחר'];

const INIT = { bizNum:'', name:'', bizName:'', phone:'', email:'', address:'', area:'תל אביב', category:'מסעדה', notes:'' };

export default function NewClientPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INIT);
  const [loading, setLoading] = useState(false);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!form.name || !form.phone || !form.bizNum) {
      toast.error('יש למלא שדות חובה'); return;
    }
    setLoading(true);
    try {
      await clientsAPI.create({
        name:    form.bizName || form.name,
        phone:   form.phone,
        area:    form.area,
      });
      toast.success('הלקוח נוסף ל-ERPNext! ✅');
      navigate('/dashboard/clients');
    } catch (e) {
      toast.error('שגיאה: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page animate-fade">
      <button className="form-page-back" onClick={() => navigate('/dashboard/clients')}>
        <ChevronRight size={16}/> חזרה ללקוחות
      </button>
      <h1 className="form-page-title">לקוח חדש</h1>
      <p className="form-page-sub">הוסף לקוח חדש למערכת ול-ERPNext</p>

      <div className="form-section">
        <div className="form-section-title">פרטי עסק</div>
        <div className="form-grid">
          <div className="fp-field">
            <label>ח.פ / ע.מ *</label>
            <input name="bizNum" value={form.bizNum} onChange={handle} placeholder="000000000"/>
          </div>
          <div className="fp-field">
            <label>שם איש קשר *</label>
            <input name="name" value={form.name} onChange={handle} placeholder="ישראל ישראלי"/>
          </div>
          <div className="fp-field">
            <label>שם עסק</label>
            <input name="bizName" value={form.bizName} onChange={handle} placeholder="מסעדת הגליל"/>
          </div>
          <div className="fp-field">
            <label>קטגוריה</label>
            <select name="category" value={form.category} onChange={handle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">פרטי התקשרות</div>
        <div className="form-grid">
          <div className="fp-field">
            <label>טלפון *</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="05X-XXXXXXX"/>
          </div>
          <div className="fp-field">
            <label>אימייל</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="info@business.co.il"/>
          </div>
          <div className="fp-field span2">
            <label>כתובת</label>
            <input name="address" value={form.address} onChange={handle} placeholder="רחוב הרצל 1, תל אביב"/>
          </div>
          <div className="fp-field">
            <label>אזור</label>
            <select name="area" value={form.area} onChange={handle}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">הערות</div>
        <div className="fp-field">
          <textarea name="notes" value={form.notes} onChange={handle}
            placeholder="הערות נוספות על הלקוח..." rows={3}
            style={{ resize: 'vertical' }}/>
        </div>
      </div>

      <div className="form-page-footer">
        <Btn variant="primary" icon={<Save size={15}/>} onClick={save} disabled={loading}>
          {loading ? 'שומר...' : 'הוסף לקוח'}
        </Btn>
        <Btn variant="secondary" onClick={() => navigate('/dashboard/clients')}>ביטול</Btn>
      </div>
    </div>
  );
}
