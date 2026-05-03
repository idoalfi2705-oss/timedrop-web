import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Truck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ orgCode: 'TD001', username: 'david', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.orgCode || !form.username || !form.password) {
      toast.error('יש למלא את כל השדות');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`ברוך הבא, ${user.name}!`);
      if (user.role === 'worker') navigate('/worker');
      else if (user.role === 'client') navigate('/client');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-card animate-fade">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Truck size={28} strokeWidth={1.8} />
            <Clock size={14} className="login-logo-clock" />
          </div>
          <span className="login-logo-text">TimeDrop</span>
        </div>

        <h1 className="login-title">כניסה למערכת</h1>
        <p className="login-sub">ניהול לוגיסטיקה ומשלוחים חכם</p>

        <form onSubmit={submit} className="login-form">
          <div className="login-field">
            <label>קוד ארגון</label>
            <input
              name="orgCode"
              value={form.orgCode}
              onChange={handle}
              placeholder="לדוגמה: TD001"
              autoComplete="off"
            />
          </div>

          <div className="login-field">
            <label>שם משתמש</label>
            <input
              name="username"
              value={form.username}
              onChange={handle}
              placeholder="שם משתמש"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label>סיסמא</label>
            <div className="login-pass-wrap">
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="login-pass-toggle" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'כניסה למערכת'}
          </button>
        </form>

        <div className="login-demo">
          <p>משתמשי דמו:</p>
          <div className="login-demo-chips">
            <button onClick={() => setForm({ orgCode: 'TD001', username: 'david',  password: '1234' })}>מעסיק</button>
            <button onClick={() => setForm({ orgCode: 'TD001', username: 'yossi',  password: '1234' })}>עובד</button>
            <button onClick={() => setForm({ orgCode: 'TD001', username: 'rachel', password: '1234' })}>לקוח</button>
          </div>
        </div>
      </div>
    </div>
  );
}
