import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, X } from 'lucide-react';
import { Card, Btn } from '../components/shared/UI';
import { itemsAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import './Items.css';

const VAT = 1.17;

function exportToExcel(items) {
  const headers = ['קוד פריט','שם פריט','תיאור','מחיר לפני מע"מ','מחיר אחרי מע"מ','כמות סה"כ','ספק'];
  const rows = items.map(i => [i.id||i.sku, i.name, i.desc||'', i.priceEx||i.price, ((i.priceEx||i.price)*VAT).toFixed(2), i.qty||0, i.supplier||'']);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`פריטים_${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.csv`; a.click();
}

export default function Items() {
  const navigate = useNavigate();
  const { data: apiItems, refetch } = useApi(() => itemsAPI.getAll(), []);
  const [extra]  = useState([]);
  const [search, setSearch] = useState('');

  const allItems = [...(apiItems || []).map(i => ({
    id: i.sku, name: i.name, desc: i.description || '',
    priceEx: i.price, qty: i.qty || 0, supplier: i.supplier || '',
  })), ...extra];

  const filtered = allItems.filter(i =>
    i.name?.includes(search) || i.id?.includes(search) || i.supplier?.includes(search)
  );


  return (
    <div className="items-page animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>פריטים</h1>
          <p>{allItems.length} פריטים רשומים</p>
        </div>
        <div className="page-header-actions">
          <Btn variant="secondary" icon={<Download size={15}/>} size="sm" onClick={() => exportToExcel(filtered)}>ייצוא אקסל</Btn>
          <Btn variant="primary"   icon={<Plus size={15}/>}     size="sm" onClick={() => navigate('/dashboard/items/new')}>פריט חדש</Btn>
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
              <tr key={item.id}>
                <td><span className="item-code">{item.id}</span></td>
                <td className="text-bold">{item.name}</td>
                <td className="text-muted item-desc">{item.desc}</td>
                <td>₪{(item.priceEx||0).toFixed(2)}</td>
                <td className="text-bold">₪{((item.priceEx||0) * VAT).toFixed(2)}</td>
                <td><span className={`qty-badge ${(item.qty||0) < 10 ? 'qty-low' : ''}`}>{item.qty||0}</span></td>
                <td className="text-muted">{item.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
