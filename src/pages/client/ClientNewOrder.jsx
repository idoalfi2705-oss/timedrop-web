import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, CheckCircle, Trash2 } from 'lucide-react';
import { Card, Btn } from '../../components/shared/UI';
import './ClientNewOrder.css';

const CATALOG = [
  { id: 1, name: 'שמן זית',     unit: 'ליטר', price: 32, category: 'שמנים' },
  { id: 2, name: 'קמח לבן',     unit: 'ק"ג',  price: 18, category: 'קמחים' },
  { id: 3, name: 'סוכר',        unit: 'ק"ג',  price: 12, category: 'תבלינים' },
  { id: 4, name: 'מלח',         unit: 'ק"ג',  price: 8,  category: 'תבלינים' },
  { id: 5, name: 'גבינה לבנה',  unit: 'יח',   price: 28, category: 'מוצרי חלב' },
  { id: 6, name: 'שמן קנולה',   unit: 'ליטר', price: 22, category: 'שמנים' },
  { id: 7, name: 'קמח מלא',     unit: 'ק"ג',  price: 20, category: 'קמחים' },
  { id: 8, name: 'דבש',         unit: 'ק"ג',  price: 45, category: 'ממתקים' },
];

const CATEGORIES = ['הכל', ...new Set(CATALOG.map(p => p.category))];
const fmt = n => '₪' + n.toLocaleString('he-IL');

export default function ClientNewOrder() {
  const [cart, setCart]   = useState({});
  const [cat, setCat]     = useState('הכל');
  const [sent, setSent]   = useState(false);
  const [note, setNote]   = useState('');

  const filtered = cat === 'הכל' ? CATALOG : CATALOG.filter(p => p.category === cat);

  const setQty = (id, qty) => {
    const n = Math.max(0, Number(qty) || 0);
    if (n === 0) {
      const c = { ...cart };
      delete c[id];
      setCart(c);
    } else {
      setCart(c => ({ ...c, [id]: n }));
    }
  };

  const handleInput = (id, val) => {
    if (val === '' || val === '0') {
      const c = { ...cart };
      delete c[id];
      setCart(c);
    } else {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) setCart(c => ({ ...c, [id]: n }));
    }
  };

  const cartItems = CATALOG.filter(p => cart[p.id] > 0);
  const total = cartItems.reduce((s, p) => s + p.price * cart[p.id], 0);
  const itemCount = Object.values(cart).reduce((s, q) => s + q, 0);

  if (sent) return (
    <div className="client-new-order animate-fade">
      <Card className="cno-sent">
        <div className="cno-sent-icon"><CheckCircle size={40}/></div>
        <h2>ההזמנה נשלחה!</h2>
        <p>הצוות שלנו יאשר אותה בקרוב ותקבל עדכון.</p>
        <div className="cno-sent-summary">
          {cartItems.map(p => (
            <div key={p.id}>{p.name} × {cart[p.id]}</div>
          ))}
          <div className="cno-sent-total">סה"כ: <strong>{fmt(total)}</strong></div>
        </div>
        <Btn variant="primary" onClick={() => { setSent(false); setCart({}); }}>הזמנה חדשה</Btn>
      </Card>
    </div>
  );

  return (
    <div className="client-new-order animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>הזמנה חדשה</h1>
          <p>בחר פריטים מהקטלוג</p>
        </div>
        {itemCount > 0 && (
          <div className="cno-cart-chip">
            <ShoppingCart size={16}/> {itemCount} פריטים · {fmt(total)}
          </div>
        )}
      </div>

      <div className="cno-cats">
        {CATEGORIES.map(c => (
          <button key={c} className={`cno-cat-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="cno-layout">
        <div className="cno-catalog">
          {filtered.map(product => {
            const qty = cart[product.id] || 0;
            return (
              <Card key={product.id} className={`cno-product ${qty > 0 ? 'in-cart' : ''}`}>
                <div className="cno-product-cat">{product.category}</div>
                <div className="cno-product-name">{product.name}</div>
                <div className="cno-product-price">{fmt(product.price)} / {product.unit}</div>
                <div className="cno-qty-control">
                  <button className="cno-qty-btn minus" onClick={() => setQty(product.id, qty - 1)} disabled={qty === 0}>
                    <Minus size={14}/>
                  </button>
                  {/* שדה קלט ידני */}
                  <input
                    className="cno-qty-input"
                    type="number"
                    min="0"
                    value={qty === 0 ? '' : qty}
                    placeholder="0"
                    onChange={e => handleInput(product.id, e.target.value)}
                  />
                  <button className="cno-qty-btn plus" onClick={() => setQty(product.id, qty + 1)}>
                    <Plus size={14}/>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {cartItems.length > 0 && (
          <Card className="cno-cart">
            <div className="cno-cart-title"><ShoppingCart size={18}/> סיכום הזמנה</div>
            <div className="cno-cart-items">
              {cartItems.map(p => (
                <div key={p.id} className="cno-cart-item">
                  <div className="cno-cart-item-name">{p.name}</div>
                  <div className="cno-cart-item-qty">×{cart[p.id]}</div>
                  <div className="cno-cart-item-price">{fmt(p.price * cart[p.id])}</div>
                  <button className="cno-remove-btn" onClick={() => setQty(p.id, 0)}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>
            <div className="cno-cart-total">
              <span>סה"כ</span>
              <strong>{fmt(total)}</strong>
            </div>
            <textarea
              className="cno-note"
              placeholder="הערה לנהג (אופציונלי)..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <Btn variant="primary" className="cno-submit-btn" onClick={() => setSent(true)}>
              <ShoppingCart size={16}/> שלח הזמנה
            </Btn>
          </Card>
        )}
      </div>
    </div>
  );
}
