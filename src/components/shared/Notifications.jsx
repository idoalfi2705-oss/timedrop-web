import React, { useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Clock, Package } from 'lucide-react';
import './Notifications.css';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'warning', title: 'מלאי נמוך', message: 'קמח לבן במחסן תל אביב – נשארו 8 יח\'', time: 'לפני 5 דקות', read: false },
  { id: 2, type: 'info',    title: 'הזמנה חדשה', message: 'הזמנה #1052 התקבלה מ-מאפיית לחם הארץ', time: 'לפני 12 דקות', read: false },
  { id: 3, type: 'success', title: 'משלוח נמסר', message: 'יוסי לוי סיים את המשלוח ל-קפה ראשון', time: 'לפני 30 דקות', read: false },
  { id: 4, type: 'warning', title: 'בקשת חופשה', message: 'אורן שמעוני ביקש חופשה ל-10/05', time: 'לפני שעה', read: true },
  { id: 5, type: 'info',    title: 'עדכון מערכת', message: 'המערכת עודכנה בהצלחה לגרסה 1.1', time: 'לפני 3 שעות', read: true },
];

const ICONS = {
  warning: <AlertTriangle size={16} />,
  info:    <Clock size={16} />,
  success: <CheckCircle size={16} />,
};

const COLORS = {
  warning: 'notif-yellow',
  info:    'notif-blue',
  success: 'notif-green',
};

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markOne = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  return (
    <div className="notif-wrap">
      <button className="notif-btn" onClick={() => setOpen(o => !o)}>
        <Bell size={20} />
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      {open && (
        <>
          <div className="notif-overlay" onClick={() => setOpen(false)} />
          <div className="notif-panel animate-fade">
            <div className="notif-header">
              <span>התראות</span>
              <div className="notif-header-actions">
                {unread > 0 && <button className="notif-mark-all" onClick={markAll}>סמן הכל כנקרא</button>}
                <button className="notif-close" onClick={() => setOpen(false)}><X size={16}/></button>
              </div>
            </div>
            <div className="notif-list">
              {notifs.map(n => (
                <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markOne(n.id)}>
                  <div className={`notif-icon ${COLORS[n.type]}`}>{ICONS[n.type]}</div>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
