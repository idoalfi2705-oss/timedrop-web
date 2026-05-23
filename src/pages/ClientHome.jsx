import React, { useState, useEffect, useRef } from 'react';
import { Truck, Clock, CreditCard, Star, Phone, MapPin, CheckCircle, Package } from 'lucide-react';
import { Card, Btn } from '../components/shared/UI';
import { ordersAPI, clientsAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ClientHome.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

function DeliveryMap({ lat, lng }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      map.setView([lat, lng], 14);
      const truckIcon = L.divIcon({
        html: `<div style="background:#1e7fe0;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🚛</div>`,
        className: '', iconSize: [36, 36], iconAnchor: [18, 18],
      });
      L.marker([lat, lng], { icon: truckIcon }).addTo(map).bindPopup('העובד נמצא כאן').openPopup();
      mapInstance.current = map;
    };
    document.head.appendChild(script);
  }, [lat, lng]);

  return <div ref={mapRef} className="ch-map-real" />;
}

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(65);

  const { data: orders } = useApi(() => ordersAPI.getAll(), []);
  const list = orders || [];

  const active = list.find(o => o.status === 'on_the_way');
  const recent = list.filter(o => o.status === 'delivered').slice(0, 3);
  const totalSpent = list.reduce((s, o) => s + (o.total ?? 0), 0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setProgress(p => Math.min(p + 0.5, 99)), 2000);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="client-home animate-fade">
      <div className="ch-welcome">
        <div>
          <h1>שלום, {user?.name} 👋</h1>
          <p>{user?.orgCode}</p>
        </div>
        <Btn variant="primary" icon={<Package size={16}/>} onClick={() => navigate('/client/new')}>
          הזמנה חדשה
        </Btn>
      </div>

      <div className="ch-stats">
        <div className="ch-stat">
          <Package size={20}/>
          <div>
            <div className="ch-stat-val">{list.length}</div>
            <div className="ch-stat-lbl">הזמנות סה"כ</div>
          </div>
        </div>
        <div className="ch-stat">
          <CreditCard size={20}/>
          <div>
            <div className="ch-stat-val">{fmt(totalSpent)}</div>
            <div className="ch-stat-lbl">סה"כ רכישות</div>
          </div>
        </div>
        <div className="ch-stat">
          <CheckCircle size={20}/>
          <div>
            <div className="ch-stat-val">{list.filter(o => o.status === 'delivered').length}</div>
            <div className="ch-stat-lbl">הזמנות שנמסרו</div>
          </div>
        </div>
        <div className="ch-stat">
          <Clock size={20}/>
          <div>
            <div className="ch-stat-val">{list.filter(o => o.status === 'pending').length}</div>
            <div className="ch-stat-lbl">ממתינות</div>
          </div>
        </div>
      </div>

      {active && (
        <Card className="ch-tracker">
          <div className="ch-tracker-header">
            <div className="ch-tracker-pulse"><Truck size={20}/></div>
            <div>
              <div className="ch-tracker-title">משלוח בדרך אליך!</div>
              <div className="ch-tracker-sub">הזמנה #{active.id}{active.eta ? ` · צפי הגעה: ${active.eta}` : ''}</div>
            </div>
            {active.workerPhone && (
              <a href={`tel:${active.workerPhone}`} className="ch-call-btn">
                <Phone size={16}/> {active.workerName || 'עובד'}
              </a>
            )}
          </div>
          <div className="ch-progress-track">
            <div className="ch-progress-fill" style={{ width: `${progress}%` }}>
              <div className="ch-truck-icon"><Truck size={14}/></div>
            </div>
          </div>
          <div className="ch-progress-labels">
            <span>יצא מהמחסן</span><span>בדרך</span><span>הגיע</span>
          </div>
          {(active.workerLat || active.workerLng) && (
            <DeliveryMap lat={active.workerLat || 32.0853} lng={active.workerLng || 34.7818} />
          )}
          <div className="ch-tracker-total">סה"כ הזמנה: <strong>{fmt(active.total ?? 0)}</strong></div>
        </Card>
      )}

      <Card>
        <div className="ch-section-header">
          <h2>הזמנות אחרונות</h2>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/client/orders')}>כל ההזמנות</Btn>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '24px 0' }}>אין הזמנות שנמסרו עדיין</p>
        ) : (
          <div className="ch-orders-list">
            {recent.map(order => (
              <div key={order.id} className="ch-order-row">
                <div className="ch-order-icon"><CheckCircle size={18} color="var(--success)"/></div>
                <div className="ch-order-info">
                  <div className="ch-order-id">#{order.id}</div>
                  <div className="ch-order-date">{order.date ? new Date(order.date).toLocaleDateString('he-IL') : '—'}</div>
                </div>
                {order.items?.length > 0 && (
                  <div className="ch-order-items">
                    {order.items.slice(0, 2).map((i, idx) => (
                      <span key={idx} className="ch-order-item-chip">{i.name}</span>
                    ))}
                    {order.items.length > 2 && <span className="ch-order-item-chip">+{order.items.length - 2}</span>}
                  </div>
                )}
                <div className="ch-order-total">{fmt(order.total ?? 0)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
