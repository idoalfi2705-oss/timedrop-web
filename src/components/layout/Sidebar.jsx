import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Package, FileText,
  Truck, BarChart2, Settings, LogOut,
  Truck as TruckIcon, Clock, ChevronRight, Bell, ShoppingBag
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'דשבורד' },
  { to: '/dashboard/clients',   icon: Users,           label: 'לקוחות' },
  { to: '/dashboard/items',     icon: ShoppingBag,     label: 'פריטים' },
  { to: '/dashboard/warehouses',icon: Package,         label: 'מחסנים' },
  { to: '/dashboard/orders',    icon: FileText,        label: 'הזמנות' },
  { to: '/dashboard/workers',   icon: Truck,           label: 'עובדים' },
  { to: '/dashboard/reports',   icon: BarChart2,       label: 'דוחות' },
  { to: '/dashboard/settings',  icon: Settings,        label: 'הגדרות' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <TruckIcon size={22} strokeWidth={1.8} />
          <Clock size={11} className="sidebar-logo-clock" />
        </div>
        {!collapsed && <span className="sidebar-logo-text">TimeDrop</span>}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)}>
          <ChevronRight size={16} className={collapsed ? 'rotated' : ''} />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.8} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.avatar}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">מעסיק</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout} title="יציאה">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
