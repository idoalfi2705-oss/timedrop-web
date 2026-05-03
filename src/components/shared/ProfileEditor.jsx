import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, User, Phone, Mail, MapPin, Save } from 'lucide-react';
import { Btn } from './UI';
import './ProfileEditor.css';

export default function ProfileEditor({ onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    area:  user?.area  || '',
  });
  const [saved, setSaved] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal animate-fade" onClick={e => e.stopPropagation()}>
        <div className="profile-header">
          <h2>עריכת פרופיל</h2>
          <button className="profile-close" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{user?.name?.[0]}</div>
          <div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-role">{{ employer:'מעסיק', worker:'עובד שטח', client:'לקוח' }[user?.role]}</div>
          </div>
        </div>

        <div className="profile-form">
          <div className="profile-field">
            <label><User size={14}/> שם מלא</label>
            <input name="name" value={form.name} onChange={handle} placeholder="שם מלא"/>
          </div>
          <div className="profile-field">
            <label><Mail size={14}/> אימייל</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="example@email.com"/>
          </div>
          <div className="profile-field">
            <label><Phone size={14}/> טלפון</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="05X-XXXXXXX"/>
          </div>
          <div className="profile-field">
            <label><MapPin size={14}/> אזור</label>
            <input name="area" value={form.area} onChange={handle} placeholder="תל אביב, חיפה..."/>
          </div>
        </div>

        <div className="profile-footer">
          <Btn variant="secondary" size="sm" onClick={onClose}>ביטול</Btn>
          <Btn variant="primary" size="sm" icon={saved ? null : <Save size={14}/>} onClick={save}>
            {saved ? '✓ נשמר!' : 'שמור שינויים'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
