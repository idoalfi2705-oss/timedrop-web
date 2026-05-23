import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Save } from 'lucide-react';
import { Btn } from '../components/shared/UI';
import { itemsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './FormPage.css';

const VAT = 1.17;
const CATEGORIES = ['מזון','שתייה','חלב וגבינות','ירקות ופירות','בשר ודגים','מוצרי ניקוי','אחר'];
const UNITS = ['יח\'','ק"ג','ליטר','קרטון','שקית','מארז'];

const INIT = { sku:'', name:'', desc:'', priceEx:'', unit:"יח'", category:'מזון', supplier:'' };

export default function NewItemPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INIT);
  const [loading, setLoading] = useState(false);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const priceInc = form.priceEx ? (parseFloat(form.priceEx) * VAT).toFixed(2) : '';

  const save = async () => {
    if (!form.sku || !form.name || !form.priceEx) {
      toast.error('יש למלא שדות חובה'); return;
    }
    setLoading(true);
    try {
      await itemsAPI.create({
        name:     form.name,
        sku:      form.sku,
        price:    parseFloat(form.priceEx),
        unit:     form.unit,
        category: form.category,
      });
      toast.success('הפריט נשמר ב-ERPNext ✅');
      navigate('/dashboard/items');
    } catch (e) {
      toast.error('שגיאה: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page animate-fade">
      <button className="form-page-back" onClick={() => navigate('/dashboard/items')}>
        <ChevronRight size={16}/> חזרה לפריטים
      </button>
      <h1 className="form-page-title">פריט חדש</h1>
      <p className="form-page-sub">הוסף פריט חדש למלאי ו-ERPNext</p>

      <div className="form-section">
        <div className="form-section-title">פרטי הפריט</div>
        <div className="form-grid">
          <div className="fp-field">
            <label>קוד פריט (SKU) *</label>
            <input name="sku" value={form.sku} onChange={handle} placeholder="OIL-001"/>
          </div>
          <div className="fp-field">
            <label>שם פריט *</label>
            <input name="name" value={form.name} onChange={handle} placeholder="שמן זית"/>
          </div>
          <div className="fp-field span2">
            <label>תיאור</label>
            <input name="desc" value={form.desc} onChange={handle} placeholder="תיאור קצר של הפריט"/>
          </div>
          <div className="fp-field">
            <label>קטגוריה</label>
            <select name="category" value={form.category} onChange={handle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fp-field">
            <label>יחידת מידה</label>
            <select name="unit" value={form.unit} onChange={handle}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">תמחור</div>
        <div className="form-grid">
          <div className="fp-field">
            <label>מחיר לפני מע"מ (₪) *</label>
            <input name="priceEx" type="number" step="0.01" value={form.priceEx} onChange={handle} placeholder="27.35"/>
          </div>
          <div className="fp-field">
            <label>מחיר אחרי מע"מ (₪)</label>
            <input value={priceInc ? `₪${priceInc}` : ''} disabled className="computed" placeholder="מחושב אוטומטית"/>
            <span className="fp-vat-note">כולל מע"מ 17%</span>
          </div>
          <div className="fp-field">
            <label>ספק</label>
            <input name="supplier" value={form.supplier} onChange={handle} placeholder="שם הספק"/>
          </div>
        </div>
      </div>

      <div className="form-page-footer">
        <Btn variant="primary" icon={<Save size={15}/>} onClick={save} disabled={loading}>
          {loading ? 'שומר...' : 'שמור פריט'}
        </Btn>
        <Btn variant="secondary" onClick={() => navigate('/dashboard/items')}>ביטול</Btn>
      </div>
    </div>
  );
}
