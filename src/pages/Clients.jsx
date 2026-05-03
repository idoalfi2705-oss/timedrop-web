import React, { useState } from 'react';
import { Search, Phone, MapPin, FileText, Plus, X, Save } from 'lucide-react';
import { Card, Btn, StatusBadge, SectionHeader } from '../components/shared/UI';
import { clientsAPI, ordersAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { mockClients, mockOrders } from '../utils/mockData';
import toast from 'react-hot-toast';
import './Clients.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

const CATEGORIES = ['מסעדה','קפה','מאפייה','סופרמרקט','מלון','קייטרינג','מוסד חינוכי','אחר'];

function NewClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ bizNum:'', name:'', bizName:'', phone:'', address:'', category:'מסעדה' });
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = () => {
    if (!form.name || !form.phone || !form.bizNum) { toast.error('יש למלא שדות חובה'); return; }
    onSave({ ...form, id: Date.now(), debt: 0, rating: 0, totalOrders: 0, lastOrder: new Date(), area: form.address.split(',').pop()?.trim() || 'כללי' });
    toast.success('הלקוח נשמר בהצלחה! ✅');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box animate-fade" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>לקוח חדש</h2><button className="modal-close" onClick={onClose}><X size={18}/></button></div>
        <div className="modal-body">
          <div className="form-row">
            <div className="modal-field"><label>ח.פ / ע.מ *</label><input name="bizNum" value={form.bizNum} onChange={handle} placeholder="000000000"/></div>
            <div className="modal-field"><label>שם מלא *</label><input name="name" value={form.name} onChange={handle} placeholder="ישראל ישראלי"/></div>
          </div>
          <div className="form-row">
            <div className="modal-field"><label>שם עסק</label><input name="bizName" value={form.bizName} onChange={handle} placeholder="מסעדת הגליל"/></div>
            <div className="modal-field"><label>טלפון *</label><input name="phone" value={form.phone} onChange={handle} placeholder="05X-XXXXXXX"/></div>
          </div>
          <div className="modal-field"><label>כתובת</label><input name="address" value={form.address} onChange={handle} placeholder="רחוב הרצל 1, תל אביב"/></div>
          <div className="modal-field">
            <label>קטגוריה</label>
            <select name="category" value={form.category} onChange={handle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <Btn variant="secondary" size="sm" onClick={onClose}>ביטול</Btn>
          <Btn variant="primary" size="sm" icon={<Save size={14}/>} onClick={save}>שמור לקוח</Btn>
        </div>
      </div>
    </div>
  );
}

export default function Clients() {
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [extra,     setExtra]     = useState([]);

  const { data: apiClients } = useApi(() => clientsAPI.getAll().catch(() => mockClients), []);
  const { data: clientOrders } = useApi(
    () => selected ? ordersAPI.getAll({ clientId: selected.id }).catch(() => mockOrders.filter(o=>o.clientId===selected.id)) : Promise.resolve([]),
    [selected?.id]
  );

  const clients = [...(apiClients || mockClients), ...extra];
  const list = clients.filter(c => c.name?.includes(search) || c.contact?.includes(search) || c.area?.includes(search) || c.bizName?.includes(search));

  return (
    <div className="clients-page animate-fade">
      <div className="page-header">
        <div className="page-header-title"><h1>לקוחות</h1><p>{list.length} לקוחות</p></div>
        <Btn variant="primary" icon={<Plus size={16}/>} onClick={() => setShowModal(true)}>לקוח חדש</Btn>
      </div>

      <div className="clients-layout">
        <Card className="clients-list-card" padding={false}>
          <div className="clients-search">
            <Search size={16}/>
            <input placeholder="חיפוש לקוח..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="clients-list">
            {list.map(c => (
              <div key={c.id} className={`client-item ${selected?.id===c.id?'active':''}`} onClick={()=>setSelected(c)}>
                <div className="client-avatar">{c.name?.[0]}</div>
                <div className="client-info">
                  <div className="client-name">{c.bizName || c.name}</div>
                  <div className="client-meta"><MapPin size={12}/> {c.area || c.address}</div>
                </div>
                <div className="client-side">
                  {c.debt > 0 ? <span className="client-debt">{fmt(c.debt)}</span> : <span className="client-ok">✓ מסולק</span>}
                  {c.rating > 0 && <div className="client-rating">★ {c.rating}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {selected ? (
          <div className="client-detail animate-slide">
            <Card className="client-detail-header">
              <div className="client-detail-top">
                <div className="client-detail-avatar">{selected.name?.[0]}</div>
                <div>
                  <h2>{selected.bizName || selected.name}</h2>
                  <p>{selected.contact || selected.name}</p>
                  {selected.category && <span className="category-badge">{selected.category}</span>}
                </div>
                <div className="client-detail-actions">
                  <Btn variant="secondary" size="sm" icon={<Phone size={14}/>} onClick={()=>window.open(`tel:${selected.phone}`)}>התקשר</Btn>
                  <Btn variant="primary"   size="sm" icon={<Plus size={14}/>} onClick={()=>toast.success('יצירת הזמנה – בקרוב!')}>הזמנה חדשה</Btn>
                </div>
              </div>
              <div className="client-stats-row">
                <div className="client-stat"><div className="client-stat-val">{selected.totalOrders ?? clientOrders?.length ?? 0}</div><div className="client-stat-lbl">הזמנות</div></div>
                <div className="client-stat"><div className="client-stat-val">{fmt(selected.debt ?? 0)}</div><div className="client-stat-lbl">יתרת חוב</div></div>
                <div className="client-stat"><div className="client-stat-val">★ {selected.rating ?? '—'}</div><div className="client-stat-lbl">דירוג</div></div>
                <div className="client-stat"><div className="client-stat-val">{selected.lastOrder ? new Date(selected.lastOrder).toLocaleDateString('he-IL') : '—'}</div><div className="client-stat-lbl">הזמנה אחרונה</div></div>
              </div>
            </Card>
            <Card padding={false}>
              <div style={{padding:'16px 20px 0'}}><SectionHeader title="חשבוניות" sub={`${clientOrders?.length ?? 0} הזמנות`}/></div>
              <table className="data-table">
                <thead><tr><th>#</th><th>תאריך</th><th>פריטים</th><th>סכום</th><th>רווח</th><th>סטטוס</th></tr></thead>
                <tbody>
                  {(clientOrders||[]).map(o => (
                    <tr key={o.id}>
                      <td className="order-id">#{o.id}</td>
                      <td>{new Date(o.date).toLocaleDateString('he-IL')}</td>
                      <td>{o.items?.map(i=>i.name).join(', ')}</td>
                      <td className="text-bold">{fmt(o.total)}</td>
                      <td className="text-green">{fmt(o.profit??0)}</td>
                      <td><StatusBadge status={o.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        ) : (
          <Card className="client-empty">
            <FileText size={40} className="client-empty-icon"/>
            <p>בחר לקוח לצפייה בפרטים</p>
          </Card>
        )}
      </div>

      {showModal && <NewClientModal onClose={() => setShowModal(false)} onSave={c => setExtra(e => [...e, c])}/>}
    </div>
  );
}
