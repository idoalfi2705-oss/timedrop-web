import React, { useState, useEffect, useRef } from 'react';
import { Truck, Clock, CreditCard, Star, Phone, MapPin, CheckCircle, Package } from 'lucide-react';
import { Card, Btn } from '../components/shared/UI';
import { ordersAPI, clientsAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ClientHome.css';

const fmt = n => '₪' + n.toLocaleString('he-IL');

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function statusBadge(status) {
  if (status === 'on_the_way') return <span className="ch-status-badge ch-status-onway">בדרך</span>;
  if (status === 'delivered')  return <span className="ch-status-badge ch-status-delivered">נמסר</span>;
  return <span className="ch-status-badge ch-status-pending">ממתין</span>;
}

// ── Live Tracking Map ──────────────────────────────────────────────────────────

function LiveTrackingMap({ workerLat, workerLon, clientLat, clientLon, workerName, eta }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const intervalRef = useRef(null);
  const [liveEta, setLiveEta] = useState(null);

  useEffect(() => {
    if (mapInstance.current) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS (may already be loaded)
    const initMap = () => {
      const L   = window.L;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Fit bounds between worker and client
      const bounds = L.latLngBounds(
        [workerLat, workerLon],
        [clientLat, clientLon],
      );
      map.fitBounds(bounds, { padding: [40, 40] });

      // Client pin (red 📍)
      const clientIcon = L.divIcon({
        html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">📍</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 28],
      });
      L.marker([clientLat, clientLon], { icon: clientIcon })
        .addTo(map)
        .bindPopup('כתובת המסירה שלך');

      mapInstance.current = map;

      // Fetch OSRM route
      const url = `https://router.project-osrm.org/route/v1/driving/${workerLon},${workerLat};${clientLon},${clientLat}?overview=full&geometries=geojson`;
      fetch(url)
        .then(r => r.json())
        .then(data => {
          const route    = data.routes && data.routes[0];
          if (!route) return;

          const coords      = route.geometry.coordinates; // [lon, lat]
          const osrmDuration = route.duration; // seconds

          // Draw blue polyline
          const latLngs = coords.map(c => [c[1], c[0]]);
          L.polyline(latLngs, { color: '#1e7fe0', weight: 4, opacity: 0.8 }).addTo(map);

          // Truck marker starts at 15% along the route
          let stepIndex = Math.floor(coords.length * 0.15);

          const truckIcon = (step) => L.divIcon({
            html: `<div style="background:#1e7fe0;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🚛</div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18],
          });

          const truckMarker = L.marker(
            [coords[stepIndex][1], coords[stepIndex][0]],
            { icon: truckIcon(stepIndex) },
          ).addTo(map).bindPopup(workerName ? `${workerName} בדרך אליך` : 'העובד בדרך אליך');

          // Initial ETA
          const initialRemaining = Math.round(osrmDuration * (1 - stepIndex / coords.length) / 60);
          setLiveEta(initialRemaining);

          // Advance truck every 2 seconds
          intervalRef.current = setInterval(() => {
            stepIndex = Math.min(stepIndex + 1, coords.length - 1);
            const pos = [coords[stepIndex][1], coords[stepIndex][0]];
            truckMarker.setLatLng(pos);

            const remainingMinutes = Math.round(osrmDuration * (1 - stepIndex / coords.length) / 60);
            setLiveEta(remainingMinutes);

            if (stepIndex >= coords.length - 1) {
              clearInterval(intervalRef.current);
            }
          }, 2000);
        })
        .catch(() => {
          // Fallback: simple truck marker without route
          const truckIcon = L.divIcon({
            html: `<div style="background:#1e7fe0;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🚛</div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18],
          });
          L.marker([workerLat, workerLon], { icon: truckIcon })
            .addTo(map)
            .bindPopup(workerName ? `${workerName} בדרך אליך` : 'העובד בדרך אליך')
            .openPopup();
        });
    };

    if (window.L) {
      initMap();
    } else {
      const existing = document.querySelector('script[src*="leaflet"]');
      if (existing) {
        existing.addEventListener('load', initMap);
      } else {
        const script  = document.createElement('script');
        script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [workerLat, workerLon, clientLat, clientLon, workerName]);

  return (
    <div className="ch-map-wrap">
      <div ref={mapRef} className="ch-map-real" />
      {liveEta !== null && (
        <div className="ch-map-eta-badge">
          <Truck size={14}/>
          צפי הגעה: {liveEta} דקות
        </div>
      )}
    </div>
  );
}

// ── ClientHome ─────────────────────────────────────────────────────────────────

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(65);

  const { data: orders } = useApi(() => ordersAPI.getAll(), []);
  const list = orders || [];

  const active      = list.find(o => o.status === 'on_the_way');
  const recent      = list.filter(o => o.status === 'delivered').slice(0, 3);
  const totalSpent  = list.reduce((s, o) => s + (o.total ?? 0), 0);

  // Weekly orders (next 7 days)
  const today   = new Date(); today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today.getTime() + 7 * 86400000);
  const weekOrders = list
    .filter(o => { const d = new Date(o.date); return d >= today && d <= weekEnd; })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

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
          {(active.workerLat || active.workerLon) && (
            <LiveTrackingMap
              workerLat={active.workerLat || 32.0853}
              workerLon={active.workerLon || 34.7818}
              clientLat={32.0721}
              clientLon={34.7738}
              workerName={active.workerName}
              eta={active.eta}
            />
          )}
          <div className="ch-tracker-total">סה"כ הזמנה: <strong>{fmt(active.total ?? 0)}</strong></div>
        </Card>
      )}

      {/* ── Weekly Orders Timeline ── */}
      {weekOrders.length > 0 && (
        <Card>
          <div className="ch-section-header">
            <h2>הזמנות השבוע</h2>
          </div>
          <div className="ch-week">
            {weekOrders.map(order => {
              const d = new Date(order.date);
              return (
                <div key={order.id} className="ch-week-day">
                  <div className="ch-week-date">
                    <div className="ch-week-day-name">{DAY_NAMES[d.getDay()]}</div>
                    <div className="ch-week-day-num">{d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}</div>
                  </div>
                  <div className="ch-week-orders">
                    <div className="ch-week-order">
                      <div className="ch-order-items" style={{ flex: 1 }}>
                        {(order.items || []).slice(0, 2).map((item, i) => (
                          <span key={i} className="ch-order-item-chip">{item.name}</span>
                        ))}
                        {(order.items || []).length > 2 && (
                          <span className="ch-order-item-chip">+{order.items.length - 2}</span>
                        )}
                        {(!order.items || order.items.length === 0) && (
                          <span className="ch-order-item-chip">#{order.id}</span>
                        )}
                      </div>
                      <div className="ch-order-total">{fmt(order.total ?? 0)}</div>
                      {statusBadge(order.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
