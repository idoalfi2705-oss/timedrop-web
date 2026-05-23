import React, { useState } from 'react';
import {
  CheckCircle, Circle, MapPin, Phone,
  Clock, Navigation, AlertTriangle, ChevronDown, ChevronUp, Package
} from 'lucide-react';
import { Card, Btn } from '../components/shared/UI';
import { deliveriesAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import './WorkerSchedule.css';

export default function WorkerSchedule() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(null);
  const [doneMap, setDoneMap]   = useState({});

  const { data: deliveries, loading } = useApi(() => deliveriesAPI.getToday(), []);

  const tasks = (deliveries || []).map(d => ({
    id:         d.id,
    clientName: d.clientName,
    address:    d.address || '',
    phone:      d.phone   || '',
    eta:        '',
    isStorage:  false,
    done:       doneMap[d.id] ?? d.status === 'delivered',
    items:      d.items || [],
    total:      d.total || 0,
  }));

  const toggleDone = (id) => setDoneMap(m => ({ ...m, [id]: !tasks.find(t => t.id === id)?.done }));

  const done     = tasks.filter(t => t.done).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="worker-schedule animate-fade">
      <div className="ws-header">
        <div>
          <h1>לו"ז יום – {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
          <p>שלום {user?.name}! יש לך {tasks.length} משימות היום</p>
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

      {loading && (
        <div className="ws-tasks">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12, marginBottom: 10 }}/>)}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <Card><p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px 0' }}>אין משלוחים להיום</p></Card>
      )}

      <div className="ws-tasks">
        {tasks.map((task, idx) => (
          <div key={task.id} className={`ws-task-card ${task.done ? 'done' : ''}`}>
            <div className="ws-task-header" onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
              <div className="ws-task-num">{idx + 1}</div>
              <div className="ws-task-info">
                <div className="ws-task-name">{task.clientName}</div>
                {task.address && (
                  <div className="ws-task-addr"><MapPin size={12}/> {task.address}</div>
                )}
              </div>
              <div className="ws-task-side">
                {task.eta && <span className="ws-task-time">{task.eta}</span>}
                {expanded === task.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </div>
            </div>

            {expanded === task.id && (
              <div className="ws-task-detail animate-fade">
                <div className="ws-task-actions">
                  {task.phone && (
                    <a href={`tel:${task.phone}`} className="ws-action-btn ws-call">
                      <Phone size={15}/> {task.phone}
                    </a>
                  )}
                  {task.address && (
                    <button className="ws-action-btn ws-nav" onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(task.address)}`)}>
                      <Navigation size={15}/> נווט
                    </button>
                  )}
                </div>

                {task.items.length > 0 ? (
                  <div className="ws-task-items">
                    <div className="ws-task-items-title">פריטים:</div>
                    {task.items.map((item, i) => (
                      <div key={i} className="ws-task-item-row">
                        <span>{item.name}</span>
                        <span className="ws-task-item-qty">×{item.qty}</span>
                        {item.price > 0 && <span className="ws-task-item-price">₪{item.price}</span>}
                      </div>
                    ))}
                  </div>
                ) : task.total > 0 ? (
                  <div className="ws-task-total">סה"כ: <strong>₪{task.total}</strong></div>
                ) : null}

                <div className="ws-task-footer">
                  <button
                    className={`ws-complete-btn ${task.done ? 'done' : ''}`}
                    onClick={() => toggleDone(task.id)}
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

      <Card className="ws-report-card">
        <div className="ws-report-title"><AlertTriangle size={16}/> דיווח שיבוש</div>
        <textarea className="ws-report-input" placeholder="תאר את השיבוש (פקק, תקלה, אירוע...)"/>
        <Btn variant="secondary" size="sm">שלח למעסיק</Btn>
      </Card>
    </div>
  );
}
