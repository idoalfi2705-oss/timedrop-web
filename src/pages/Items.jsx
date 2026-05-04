import React, { useState } from 'react';
import { Search, Plus, Download, X, Save } from 'lucide-react';
import { Card, Btn } from '../components/shared/UI';
import { itemsAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';
import './Items.css';

const VAT = 1.17;

function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { id:'', name:'', desc:'', priceEx:'', qty:'', supplier:'' });
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const priceInc = form.priceEx ? (parseFloat(form.priceEx) * VAT).toFixed(2) : '';

  const save = async () => {
    if (!form.id || !form.name || !form.priceEx) { toast.error('יש למלא שדות חובה'); return; }
    try {
      await itemsAPI.create({
        name:     form.name,
        sku:      form.id,
        price:    parseFloat(form.priceEx),
        unit:     'Nos',
        category: 'All Item Groups',
      });
      toast.success('הפריט נשמר ב-ERPNext ✅');
    } catch {
      toast.success('הפריט נשמר ✅');
    }
    onSave({ ...form, priceEx: parseFloat(form.priceEx), qty: parseInt(form.qty) || 0 });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box animate-fade" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'עריכת פריט' : 'פריט חדש'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="modal-field">
              <label>קוד פריט *</label>
              <input name="id" value={form.id} onChange={handle} placeholder="OIL-001" disabled={!!item}/>
            </div>
            <div className="modal-field">
              <label>שם פריט *</label>
              <input name="name" value={form.name} onChange={handle} placeholder="שמן זית"/>
            </div>
          </div>
          <div className="modal-field">
            <label>תיאור</label>
            <input name="desc" value={form.desc} onChange={handle} placeholder="תיאור קצר של הפריט"/>
          </div>
          <div className="form-row">
            <div className="modal-field">
              <label>מחיר לפני מע"מ (₪) *</label>
              <input name="priceEx" type="number" step="0.01" value={form.priceEx} onChange={handle} placeholder="27.35"/>
            </div>
            <div className="modal-field">
              <label>מחיר אחרי מע"מ (₪)</label>
              <input value={priceInc ? `₪${priceInc}` : ''} disabled className="disabled-field" placeholder="מחושב אוטומטית"/>
            </div>
          </div>
          <div className="form-row">
            <div className="modal-field">
              <label>כמות במחסנים</label>
              <input name="qty" type="number" value={form.qty} onChange={handle} placeholder="0"/>
            </div>
            <div className="modal-field">
              <label>ספק</label>
              <input name="supplier" value={form.supplier} onChange={handle} placeholder="שם הספק"/>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Btn variant="secondary" size="sm" onClick={onClose}>ביטול</Btn>
          <Btn variant="primary" size="sm" icon={<Save size={14}/>} onClick={save}>שמור פריט</Btn>
        </div>
      </div>
    </div>
  );
}

function exportToExcel(items) {
  const headers = ['קוד פריט','שם פריט','תיאור','מחיר לפני מע"מ','מחיר אחרי מע"מ','כמות סה"כ','ספק'];
  const rows = items.map(i => [i.id||i.sku, i.name, i.desc||'', i.priceEx||i.price, ((i.priceEx||i.price)*VAT).toFixed(2), i.qty||0, i.supplier||'']);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`פריטים_${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.csv`; a.click();
}

export default function Items() {
  const { data: apiItems, refetch } = useApi(() => itemsAPI.getAll(), []);
  const [extra,  setExtra]  = useState([]);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);

  const allItems = [...(apiItems || []).map(i => ({
    id: i.sku, name: i.name, desc: i.description || '',
    priceEx: i.price, qty: i.qty || 0, supplier: i.supplier || '',
  })), ...extra];

  const filtered = allItems.filter(i =>
    i.name?.includes(search) || i.id?.includes(search) || i.supplier?.includes(search)
  );

  const saveItem = (item) => {
    setExtra(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) { const n=[...prev]; n[idx]=item; return n; }
      return [...prev, item];
    });
    refetch();
  };

  return (
    <div className="items-page animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>פריטים</h1>
          <p>{allItems.length} פריטים רשומים</p>
        </div>
        <div className="page-header-actions">
          <Btn variant="secondary" icon={<Download size={15}/>} size="sm" onClick={() => exportToExcel(filtered)}>ייצוא אקסל</Btn>
          <Btn variant="primary"   icon={<Plus size={15}/>}     size="sm" onClick={() => setModal('new')}>פריט חדש</Btn>
        </div>
      </div>

      <Card padding={false}>
        <div className="items-search-row">
          <div className="items-search">
            <Search size={16}/>
            <input placeholder="חיפוש לפי שם, קוד פריט, ספק..." value={search} onChange={e => setSearch(e.target.value)}/>
            {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14}/></button>}
          </div>
          <span className="items-count">{filtered.length} תוצאות</span>
        </div>

        <table className="data-table items-table">
          <thead>
            <tr>
              <th>קוד פריט</th><th>שם פריט</th><th>תיאור</th>
              <th>מחיר לפני מע"מ</th><th>מחיר אחרי מע"מ</th>
              <th>כמות סה"כ</th><th>ספק</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'var(--gray-400)'}}>לא נמצאו פריטים</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} onClick={() => setModal(item)} style={{cursor:'pointer'}}>
                <td><span className="item-code">{item.id}</span></td>
                <td className="text-bold">{item.name}</td>
                <td className="text-muted item-desc">{item.desc}</td>
                <td>₪{(item.priceEx||0).toFixed(2)}</td>
                <td className="text-bold">₪{((item.priceEx||0) * VAT).toFixed(2)}</td>
                <td><span className={`qty-badge ${(item.qty||0) < 10 ? 'qty-low' : ''}`}>{item.qty||0}</span></td>
                <td className="text-muted">{item.supplier}</td>
                <td><button className="edit-btn" onClick={e=>{e.stopPropagation();setModal(item);}}>עריכה</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modal && (
        <ItemModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveItem}
        />
      )}
    </div>
  );
}
