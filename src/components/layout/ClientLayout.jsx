import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, ShoppingCart, LogOut, Truck, Clock, Settings } from 'lucide-react';
import ProfileEditor from '../shared/ProfileEditor';
import './ClientLayout.css';

const NAV = [
  { to: '/client',           icon: LayoutDashboard, label: 'ראשי',       end: true },
  { to: '/client/orders',    icon: FileText,        label: 'הזמנות שלי' },
  { to: '/client/new',       icon: ShoppingCart,    label: 'הזמנה חדשה' },
  { to: '/client/settings',  icon: Settings,        label: 'הגדרות' },
];

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="client-layout">
      {/* Top nav bar */}
      <header className="cl-topbar">
        <div className="cl-logo">
          <div className="cl-logo-icon"><Truck size={18}/><Clock size={10} className="cl-logo-clock"/></div>
          <span>TimeDrop</span>
        </div>
        <nav className="cl-nav">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `cl-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} strokeWidth={1.8}/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="cl-user">
          <div className="cl-user-avatar" onClick={() => setShowProfile(true)} style={{cursor:'pointer'}}>{user?.avatar}</div>
          <span className="cl-user-name">{user?.name}</span>
          <button className="cl-logout" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={17}/>
          </button>
        </div>
      </header>

      <main className="cl-main">
        <div className="cl-content">
          <Outlet/>
        </div>
      </main>
      {showProfile && <ProfileEditor onClose={() => setShowProfile(false)} />}
    </div>
  );
}
