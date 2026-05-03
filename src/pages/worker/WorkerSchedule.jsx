import React, { useState } from 'react';
import {
  CheckCircle, Circle, MapPin, Phone, Package,
  Clock, Navigation, AlertTriangle, ChevronDown, ChevronUp, Truck
} from 'lucide-react';
import { Card, Btn, StatusBadge } from '../../components/shared/UI';
import { mockWorkerDay } from '../../utils/workerMockData';
import './WorkerSchedule.css';

export default function WorkerSchedule() {
  const [tasks, setTasks] = useState(mockWorkerDay.tasks);
  const [expanded, setExpanded] = useState(null);
  const [collected, setCollected] = useState({});

  const toggleComplete = (id) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const toggleCollect = (itemKey) => {
    setCollected(c => ({ ...c, [itemKey]: !c[itemKey] }));
  };

  const done = tasks.filter(t => t.done).length;
  const progress = Math.round((done / tasks.length) * 100);

  return (
    <div className="worker-schedule animate-fade">
      {/* Header */}
      <div className="ws-header">
        <div>
          <h1>לו"ז יום – {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
          <p>שלום {mockWorkerDay.workerName}! יש לך {tasks.length} משימות היום</p>
        </div>
        <div className="ws-progress-wrap">
          <div className="ws-progress-ring">
            <svg viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" fill="none" stroke="var(--gray-200)" strokeWidth="5"/>
              <circle cx="30" cy="30" r="24" fill="none" stroke="var(--blue-600)" strokeWidth="5"
                strokeDasharray={`${progress * 1.508} 150.8`}
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
              />
            </svg>
            <span>{progress}%</span>
          </div>
          <div className="ws-progress-text">
            <div>{done}/{tasks.length}</div>
            <small>הושלמו</small>
          </div>
        </div>
      </div>

      {/* Break time banner */}
      <div className="ws-break-banner">
        <Clock size={16}/>
        <span>הפסקה: <strong>{mockWorkerDay.breakTime}</strong></span>
        <span className="ws-break-divider">|</span>
        <span>סיום משמרת: <strong>{mockWorkerDay.endTime}</strong></span>
      </div>

      {/* Pickup from warehouses */}
      <Card>
        <div className="ws-section-title">
          <Package size={18}/>
          איסוף ממחסנים
        </div>
        {mockWorkerDay.pickups.map((pickup, pi) => (
          <div key={pi} className="ws-pickup">
            <div className="ws-pickup-header">
              <div className="ws-pickup-warehouse">
                <MapPin size={14}/>
                <strong>{pickup.warehouse}</strong>
                <span className="ws-pickup-addr">{pickup.address}</span>
              </div>
            </div>
            <div className="ws-pickup-items">
              {pickup.items.map((item, ii) => {
                const key = `${pi}-${ii}`;
                const done = collected[key];
                return (
                  <div key={ii} className={`ws-pickup-item ${done ? 'collected' : ''}`}>
                    <button className="ws-check-btn" onClick={() => toggleCollect(key)}>
                      {done ? <CheckCircle size={18} color="var(--success)"/> : <Circle size={18} color="var(--gray-300)"/>}
                    </button>
                    <span className="ws-item-name">{item.name}</span>
                    <span className="ws-item-qty">{item.qty} {item.unit}</span>
                    <span className="ws-item-loc">{item.location}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      {/* Delivery tasks */}
      <div className="ws-tasks">
        {tasks.map((task, idx) => (
          <div key={task.id} className={`ws-task-card ${task.done ? 'done' : ''} ${task.isStorage ? 'storage' : ''}`}>
            <div className="ws-task-header" onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
              <div className="ws-task-num">{idx + 1}</div>
              <div className="ws-task-info">
                <div className="ws-task-name">
                  {task.isStorage
                    ? <span className="ws-storage-badge"><Package size={12}/> אחסון למחסן</span>
                    : task.clientName
                  }
                </div>
                <div className="ws-task-addr">
                  <MapPin size={12}/> {task.address}
                </div>
              </div>
              <div className="ws-task-side">
                <span className="ws-task-time">{task.eta}</span>
                {expanded === task.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </div>
            </div>

            {expanded === task.id && (
              <div className="ws-task-detail animate-fade">
                {!task.isStorage && (
                  <div className="ws-task-actions">
                    <a href={`tel:${task.phone}`} className="ws-action-btn ws-call">
                      <Phone size={15}/> {task.phone}
                    </a>
                    <button className="ws-action-btn ws-nav" onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(task.address)}`)}>
                      <Navigation size={15}/> נווט
                    </button>
                  </div>
                )}

                <div className="ws-task-items">
                  <div className="ws-task-items-title">פריטים:</div>
                  {task.items.map((item, i) => (
                    <div key={i} className="ws-task-item-row">
                      <span>{item.name}</span>
                      <span className="ws-task-item-qty">×{item.qty}</span>
                      <span className="ws-task-item-price">₪{item.price}</span>
                      <button
                        className="ws-refuse-btn"
                        onClick={() => alert(`סירוב על ${item.name} – החשבונית תעודכן`)}
                      >
                        חסר
                      </button>
                    </div>
                  ))}
                </div>

                <div className="ws-task-total">
                  סה"כ: <strong>₪{task.items.reduce((s, i) => s + i.price * i.qty, 0)}</strong>
                </div>

                <div className="ws-task-footer">
                  <button
                    className={`ws-complete-btn ${task.done ? 'done' : ''}`}
                    onClick={() => toggleComplete(task.id)}
                  >
                    {task.done
                      ? <><CheckCircle size={16}/> הושלם</>
                      : <><Circle size={16}/> סמן כהושלם</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report disturbance */}
      <Card className="ws-report-card">
        <div className="ws-report-title">
          <AlertTriangle size={16}/> דיווח שיבוש
        </div>
        <textarea className="ws-report-input" placeholder="תאר את השיבוש (פקק, תקלה, אירוע...)"/>
        <Btn variant="secondary" size="sm">שלח למעסיק</Btn>
      </Card>
    </div>
  );
}
