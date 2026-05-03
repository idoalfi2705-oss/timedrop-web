import React, { useState } from 'react';
import { Package, AlertTriangle, MapPin, Plus, X } from 'lucide-react';
import { Card, Btn, SectionHeader, StatusBadge } from '../components/shared/UI';
import { warehousesAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { mockWarehouses, mockWarehouseItems } from '../utils/mockData';
import './Warehouses.css';

function AddWarehouseModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', location: '', capacity: '' });
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = () => {
    if (!form.name || !form.location) return;
    onAdd({ ...form, id: Date.now(), items: 0, alerts: 0, capacity: Number(form.capacity) || 100 });
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box animate-fade" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>הוסף מחסן חדש</h2>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div className="modal-field"><label>שם מחסן</label><input name="name" value={form.name} onChange={handle} placeholder="מחסן תל אביב"/></div>
          <div className="modal-field"><label>כתובת</label><input name="location" value={form.location} onChange={handle} placeholder="רחוב הברזל 12, תל אביב"/></div>
          <div className="modal-field"><label>קיבולת מקסימלית</label><input name="capacity" type="number" value={form.capacity} onChange={handle} placeholder="200"/></div>
        </div>
        <div className="modal-footer">
          <Btn variant="secondary" size="sm" onClick={onClose}>ביטול</Btn>
          <Btn variant="primary"   size="sm" onClick={submit}>הוסף מחסן</Btn>
        </div>
      </div>
    </div>
  );
}

export default function Warehouses() {
  const { data: apiWarehouses } = useApi(() => warehousesAPI.getAll().catch(() => mockWarehouses), []);
  const [extra, setExtra]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);

  const warehouses = [...(apiWarehouses || mockWarehouses), ...extra];

  const { data: stock } = useApi(
    () => selected ? warehousesAPI.getStock(selected.id).catch(() => mockWarehouseItems.filter(i=>i.warehouseId===selected.id)) : Promise.resolve([]),
    [selected?.id]
  );
  const items    = stock || (selected ? mockWarehouseItems.filter(i=>i.warehouseId===selected.id) : []);
  const lowStock = items.filter(i => i.qty < i.min || i.isLow);

  return (
    <div className="warehouses-page animate-fade">
      <div className="page-header">
        <div className="page-header-title"><h1>מחסנים</h1><p>{warehouses.length} מחסנים פעילים</p></div>
        <Btn variant="primary" icon={<Plus size={16}/>} onClick={() => setShowAdd(true)}>הוסף מחסן</Btn>
      </div>

      <div className="warehouse-cards">
        {warehouses.map(w => (
          <div key={w.id} className={`warehouse-card ${selected?.id===w.id?'active':''}`} onClick={()=>setSelected(w)}>
            <div className="warehouse-card-header">
              <Package size={20}/>
              <span className="warehouse-name">{w.name}</span>
              {w.alerts > 0 && <span className="warehouse-alert-badge"><AlertTriangle size={12}/> {w.alerts}</span>}
            </div>
            <div className="warehouse-card-meta"><MapPin size={12}/> {w.location}</div>
            <div className="warehouse-capacity">
              <div className="warehouse-capacity-bar">
                <div className="warehouse-capacity-fill" style={{width:`${Math.min(((w.items||0)/(w.capacity||100))*100,100)}%`}}/>
              </div>
              <span>{w.items ?? 0} / {w.capacity ?? 100} פריטים</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="warehouse-detail animate-slide">
          <div className="warehouse-detail-header">
            <Card className="warehouse-info-card">
              <div className="warehouse-info-top">
                <div><h2>{selected.name}</h2><p><MapPin size={13}/> {selected.location}</p></div>
              </div>
            </Card>
            {lowStock.length > 0 && (
              <Card className="warehouse-alerts-card">
                <SectionHeader title="התראות מלאי נמוך"/>
                {lowStock.map(i => (
                  <div key={i.id} className="stock-alert">
                    <AlertTriangle size={14} className="stock-alert-icon"/>
                    <div><div className="stock-alert-name">{i.name}</div><div className="stock-alert-qty">נשאר: {i.qty} (מינימום: {i.min || i.minQty})</div></div>
                    <Btn variant="primary" size="sm">הזמן</Btn>
                  </div>
                ))}
              </Card>
            )}
          </div>
          <Card padding={false}>
            <div style={{padding:'16px 20px 0'}}>
              <SectionHeader title="מלאי" sub={`${items.length} פריטים`} action={<Btn variant="primary" size="sm" icon={<Plus size={14}/>}>הוסף פריט</Btn>}/>
            </div>
            <table className="data-table warehouse-table">
              <thead><tr><th>שם פריט</th><th>SKU</th><th>כמות</th><th>מינימום</th><th>מיקום</th><th>סטטוס</th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id ?? i.sku}>
                    <td className="text-bold">{i.name}</td>
                    <td className="text-muted">{i.sku}</td>
                    <td>{i.qty ?? i.tbalance} {i.unit}</td>
                    <td className="text-muted">{i.min ?? i.minQty}</td>
                    <td>{i.location}</td>
                    <td><StatusBadge status={(i.qty ?? i.tbalance) < (i.min ?? i.minQty ?? 0) ? 'low' : 'ok'}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {showAdd && <AddWarehouseModal onClose={() => setShowAdd(false)} onAdd={w => setExtra(e => [...e, w])}/>}
    </div>
  );
}
