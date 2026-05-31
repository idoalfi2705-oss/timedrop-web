import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, MapPin, FileText, Plus } from 'lucide-react';
import { Card, Btn, StatusBadge, SectionHeader } from '../components/shared/UI';
import { clientsAPI, ordersAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';
import './Clients.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

export default function Clients() {
  const navigate = useNavigate();
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [extra]                 = useState([]);

  const { data: apiClients } = useApi(() => clientsAPI.getAll(), []);
  const { data: clientOrders } = useApi(
    () => selected ? ordersAPI.getAll({ clientId: selected.id }) : Promise.resolve([]),
    [selected?.id]
  );

  const clients = [...(apiClients || []), ...extra];
  const list = clients.filter(c => c.name?.includes(search) || c.contact?.includes(search) || c.area?.includes(search) || c.bizName?.includes(search));

  return (
    <div className="clients-page animate-fade">
      <div className="page-header">
        <div className="page-header-title"><h1>לקוחות</h1><p>{list.length} לקוחות</p></div>
        <Btn variant="primary" icon={<Plus size={16}/>} onClick={() => navigate('/dashboard/clients/new')}>לקוח חדש</Btn>
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
                  {c.debt > 0 ? <span className="client-debt">{fmt(c.debt)}</span> : <span className="client-ok">מסולק</span>}
                  {c.rating > 0 && <div className="client-rating">{c.rating}</div>}
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
                <div className="client-stat"><div className="client-stat-val">{selected.rating ?? '—'}</div><div className="client-stat-lbl">דירוג</div></div>
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

    </div>
  );
}
