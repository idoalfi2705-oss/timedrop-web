import React from 'react';
import './UI.css';

/* ── Button ── */
export function Btn({ children, variant = 'primary', size = 'md', icon, loading, className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="btn-spinner" /> : icon ? <span className="btn-icon">{icon}</span> : null}
      {children}
    </button>
  );
}

/* ── Card ── */
export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div className={`card ${padding ? 'card-padded' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ── Badge ── */
export function Badge({ children, color = 'blue' }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

/* ── Status Badge ── */
export function StatusBadge({ status }) {
  const map = {
    delivered: { label: 'נמסר',    color: 'green'  },
    pending:   { label: 'ממתין',   color: 'yellow' },
    cancelled: { label: 'בוטל',   color: 'red'    },
    active:    { label: 'פעיל',   color: 'green'  },
    sick:      { label: 'מחלה',   color: 'red'    },
    vacation:  { label: 'חופשה',  color: 'blue'   },
    low:       { label: 'מלאי נמוך', color: 'red' },
    ok:        { label: 'תקין',   color: 'green'  },
  };
  const { label, color } = map[status] || { label: status, color: 'gray' };
  return <span className={`badge badge-${color}`}>{label}</span>;
}

/* ── KPI Card ── */
export function KpiCard({ label, value, sub, icon, color = 'blue', trend }) {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`kpi-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

/* ── Section Header ── */
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── Empty State ── */
export function Empty({ icon, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
    </div>
  );
}

/* ── Avatar ── */
export function Avatar({ name, size = 'md' }) {
  const initial = name ? name[0] : '?';
  return <div className={`avatar avatar-${size}`}>{initial}</div>;
}
