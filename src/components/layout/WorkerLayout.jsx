import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays, FileText, Clock,
  Truck, LogOut, ChevronRight, AlertOctagon, Settings
} from 'lucide-react';
import Notifications from '../shared/Notifications';
import ProfileEditor from '../shared/ProfileEditor';
import './WorkerLayout.css';

const NAV = [
  { to: '/worker',           icon: CalendarDays, label: 'לו"ז יומי',       end: true },
  { to: '/worker/invoice',   icon: FileText,     label: 'חשבוניות'  },
  { to: '/worker/leave',     icon: Clock,        label: 'משמרות וחופשות' },
  { to: '/worker/settings',  icon: Settings,     label: 'הגדרות' },
];

export default function WorkerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className={`worker-layout ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="worker-sidebar">
        <div className="ws-logo">
          <div className="ws-logo-icon"><Truck size={20}/></div>
          {!collapsed && <span>TimeDrop</span>}
          <button className="ws-collapse" onClick={() => setCollapsed(c => !c)}>
            <ChevronRight size={15} className={collapsed ? 'rotated' : ''}/>
          </button>
        </div>

        <nav className="ws-nav">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `ws-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} strokeWidth={1.8}/>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Emergency */}
        <div className="ws-emergency">
          <button className="ws-emergency-btn" onClick={() => window.open('tel:101')}>
            <AlertOctagon size={16}/>
            {!collapsed && 'חירום'}
          </button>
        </div>

        <div className="ws-footer">
          {!collapsed && (
            <div className="ws-user">
              <div
                className="ws-user-avatar"
                onClick={() => setShowProfile(true)}
                style={{ cursor: 'pointer' }}
              >
                {user?.avatar}
              </div>
              <div>
                <div className="ws-user-name">{user?.name}</div>
                <div className="ws-user-role">עובד שטח</div>
              </div>
            </div>
          )}
          <button className="ws-logout" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={17}/>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="worker-main">
        {/* Topbar */}
        <header className="worker-topbar">
          <div className="worker-topbar-title">TimeDrop</div>
          <div className="worker-topbar-actions">
            <Notifications />
            <div
              className="worker-topbar-avatar"
              onClick={() => setShowProfile(true)}
              title="עריכת פרופיל"
            >
              {user?.avatar}
            </div>
          </div>
        </header>
        <div className="worker-content">
          <Outlet/>
        </div>
      </main>

      {showProfile && <ProfileEditor onClose={() => setShowProfile(false)} />}
    </div>
  );
}
