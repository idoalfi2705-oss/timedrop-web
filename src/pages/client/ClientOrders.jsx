import React, { useState } from 'react';
import { FileText, Star, Download, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import { Card, Btn } from '../../components/shared/UI';
import { mockClientOrders } from '../../utils/clientMockData';
import './ClientOrders.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

const STATUS = {
  delivered:   { label: 'נמסר',       color: 'green',  icon: <CheckCircle size={14}/> },
  on_the_way:  { label: 'בדרך אליך',  color: 'blue',   icon: <Clock size={14}/> },
  pending:     { label: 'ממתין',       color: 'yellow', icon: <Clock size={14}/> },
  cancelled:   { label: 'בוטל',       color: 'red',    icon: null },
};

export default function ClientOrders() {
  const [expanded, setExpanded] = useState(null);
  const [ratings, setRatings]   = useState({});
  const [hover, setHover]       = useState({});

  const rate = (orderId, stars) => {
    setRatings(r => ({ ...r, [orderId]: stars }));
  };

  return (
    <div className="client-orders animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>ההזמנות שלי</h1>
          <p>{mockClientOrders.length} הזמנות</p>
        </div>
      </div>

      <div className="co-list">
        {mockClientOrders.map(order => {
          const s = STATUS[order.status];
          const isOpen = expanded === order.id;
          const myRating = ratings[order.id] ?? order.rating;

          return (
            <Card key={order.id} className={`co-card ${order.status === 'on_the_way' ? 'co-active' : ''}`} padding={false}>
              {/* Header row */}
              <div className="co-header" onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div className={`co-status-dot co-dot-${s.color}`}>{s.icon}</div>
                <div className="co-info">
                  <div className="co-id">{order.id}</div>
                  <div className="co-date">{order.date.toLocaleDateString('he-IL')}
                    {order.deliveredAt && ` · נמסר ב-${order.deliveredAt}`}
                    {order.eta && ` · צפי ${order.eta}`}
                  </div>
                </div>
                <div className="co-chips">
                  <span className={`co-status-badge co-badge-${s.color}`}>{s.label}</span>
                </div>
                <div className="co-total">{fmt(order.total)}</div>
                {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </div>

              {/* Expanded invoice */}
              {isOpen && (
                <div className="co-detail animate-fade">
                  {/* Items */}
                  <table className="co-items-table">
                    <thead>
                      <tr><th>פריט</th><th>כמות</th><th>מחיר</th><th>סה"כ</th></tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{fmt(item.price)}</td>
                          <td className="co-item-total">{fmt(item.price * item.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}><strong>סה"כ</strong></td>
                        <td className="co-item-total"><strong>{fmt(order.total)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="co-detail-footer">
                    {/* Worker */}
                    <div className="co-worker-info">
                      <div className="co-worker-avatar">{order.workerName[0]}</div>
                      <span>{order.workerName}</span>
                    </div>

                    {/* Rating */}
                    {order.status === 'delivered' && (
                      <div className="co-rating-wrap">
                        <span className="co-rating-label">דרג את המשלוח:</span>
                        <div className="co-stars">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              className={`co-star ${star <= (hover[order.id] ?? myRating ?? 0) ? 'filled' : ''}`}
                              onMouseEnter={() => setHover(h => ({ ...h, [order.id]: star }))}
                              onMouseLeave={() => setHover(h => ({ ...h, [order.id]: null }))}
                              onClick={() => rate(order.id, star)}
                            >★</button>
                          ))}
                        </div>
                        {myRating && <span className="co-rated-badge">תודה!</span>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="co-actions">
                      <Btn variant="secondary" size="sm" icon={<Download size={14}/>}>
                        הורד חשבונית
                      </Btn>
                      {order.status === 'delivered' && (
                        <Btn variant="primary" size="sm" icon={<FileText size={14}/>}
                          onClick={() => alert('הזמנה חוזרת נשלחה!')}>
                          הזמן שוב
                        </Btn>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
