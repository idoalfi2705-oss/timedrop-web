import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Notifications from '../shared/Notifications';
import ProfileEditor from '../shared/ProfileEditor';
import { Search } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();

  return (
    <div className={`layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="layout-main">
        <header className="topbar">
          <div className="topbar-search">
            <Search size={16} />
            <input placeholder="חיפוש לקוח, הזמנה, מוצר..." />
          </div>
          <div className="topbar-actions">
            <Notifications />
            <div
              className="topbar-avatar"
              onClick={() => setShowProfile(true)}
              title="עריכת פרופיל"
              style={{ cursor: 'pointer' }}
            >
              {user?.avatar}
            </div>
          </div>
        </header>

        <main className="layout-content">
          <Outlet />
        </main>
      </div>

      {showProfile && <ProfileEditor onClose={() => setShowProfile(false)} />}
    </div>
  );
}
