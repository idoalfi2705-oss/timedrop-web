import React, { useState, useEffect, useRef } from 'react';
import { Truck, Clock, CreditCard, Star, Phone, MapPin, CheckCircle, Package } from 'lucide-react';
import { Card, Btn } from '../../components/shared/UI';
import { mockClientPortal, mockClientOrders } from '../../utils/clientMockData';
import { useNavigate } from 'react-router-dom';
import './ClientHome.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

// מפה אמיתית עם Leaflet (ללא API key)
function DeliveryMap({ lat, lng }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    // טוען Leaflet דינמית
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);
      map.setView([lat, lng], 14);

      // אייקון משאית
      const truckIcon = L.divIcon({
        html: `<div style="
          background:#1e7fe0;
          width:36px;height:36px;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          font-size:18px;
        ">🚛</div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([lat, lng], { icon: truckIcon })
        .addTo(map)
        .bindPopup('העובד נמצא כאן')
        .openPopup();

      mapInstance.current = map;
    };
    document.head.appendChild(script);
  }, [lat, lng]);

  return <div ref={mapRef} className="ch-map-real" />;
}

export default function ClientHome() {
  const navigate = useNavigate();
  const active = mockClientOrders.find(o => o.status === 'on_the_way');
  const [progress, setProgress] = useState(65);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setProgress(p => Math.min(p + 0.5, 99)), 2000);
    return () => clearInterval(t);
  }, [active]);

  const recent = mockClientOrders.filter(o => o.status === 'delivered').slice(0, 3);
  const totalSpent = mockClientOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="client-home animate-fade">
      <div className="ch-welcome">
        <div>
          <h1>שלום, {mockClientPortal.name} 👋</h1>
          <p>{mockClientPortal.businessName}</p>
        </div>
        <Btn variant="primary" icon={<Package size={16}/>} onClick={() => navigate('/client/new')}>
          הזמנה חדשה
        </Btn>
      </div>

      <div className="ch-stats">
        <div className="ch-stat">
          <CreditCard size={20}/>
          <div>
            <div className="ch-stat-val" style={{ color: mockClientPortal.debt > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {fmt(mockClientPortal.debt)}
            </div>
            <div className="ch-stat-lbl">יתרת חוב</div>
          </div>
        </div>
        <div className="ch-stat">
          <Package size={20}/>
          <div>
            <div className="ch-stat-val">{mockClientOrders.length}</div>
            <div className="ch-stat-lbl">הזמנות סה"כ</div>
          </div>
        </div>
        <div className="ch-stat">
          <Star size={20}/>
          <div>
            <div className="ch-stat-val">{mockClientPortal.rating} ★</div>
            <div className="ch-stat-lbl">דירוג שלך</div>
          </div>
        </div>
        <div className="ch-stat">
          <CreditCard size={20}/>
          <div>
            <div className="ch-stat-val">{fmt(totalSpent)}</div>
            <div className="ch-stat-lbl">סה"כ רכישות</div>
          </div>
        </div>
      </div>

      {active && (
        <Card className="ch-tracker">
          <div className="ch-tracker-header">
            <div className="ch-tracker-pulse"><Truck size={20}/></div>
            <div>
              <div className="ch-tracker-title">משלוח בדרך אליך!</div>
              <div className="ch-tracker-sub">הזמנה {active.id} · צפי הגעה: <strong>{active.eta}</strong></div>
            </div>
            <a href={`tel:${active.workerPhone}`} className="ch-call-btn">
              <Phone size={16}/> {active.workerName}
            </a>
          </div>

          <div className="ch-progress-track">
            <div className="ch-progress-fill" style={{ width: `${progress}%` }}>
              <div className="ch-truck-icon"><Truck size={14}/></div>
            </div>
          </div>
          <div className="ch-progress-labels">
            <span>יצא מהמחסן</span>
            <span>בדרך</span>
            <span>הגיע</span>
          </div>

          {/* מפה אמיתית עם Leaflet */}
          <DeliveryMap lat={active.workerLat || 32.0853} lng={active.workerLng || 34.7818} />

          <div className="ch-tracker-items">
            {active.items.map((item, i) => (
              <div key={i} className="ch-tracker-item">
                <Package size={14}/> {item.name} × {item.qty}
              </div>
            ))}
          </div>
          <div className="ch-tracker-total">סה"כ הזמנה: <strong>{fmt(active.total)}</strong></div>
        </Card>
      )}

      <Card>
        <div className="ch-section-header">
          <h2>הזמנות אחרונות</h2>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/client/orders')}>כל ההזמנות</Btn>
        </div>
        <div className="ch-orders-list">
          {recent.map(order => (
            <div key={order.id} className="ch-order-row">
              <div className="ch-order-icon"><CheckCircle size={18} color="var(--success)"/></div>
              <div className="ch-order-info">
                <div className="ch-order-id">{order.id}</div>
                <div className="ch-order-date">{order.date.toLocaleDateString('he-IL')} · {order.deliveredAt}</div>
              </div>
              <div className="ch-order-items">
                {order.items.slice(0, 2).map((i, idx) => (
                  <span key={idx} className="ch-order-item-chip">{i.name}</span>
                ))}
                {order.items.length > 2 && <span className="ch-order-item-chip">+{order.items.length - 2}</span>}
              </div>
              <div className="ch-order-total">{fmt(order.total)}</div>
              {order.rating && (
                <div className="ch-order-rating">{'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
