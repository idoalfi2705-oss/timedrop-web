import React, { useState } from 'react';
import { Card, Btn } from '../components/shared/UI';
import { Bell, Clock, Truck, Shield, Building, Save, CheckCircle } from 'lucide-react';
import './Settings.css';

function SettingSection({ icon, title, children }) {
  return (
    <Card className="settings-section">
      <div className="settings-section-title">
        {icon} {title}
      </div>
      {children}
    </Card>
  );
}

function SettingRow({ label, sub, children }) {
  return (
    <div className="setting-row">
      <div className="setting-info">
        <div className="setting-label">{label}</div>
        {sub && <div className="setting-sub">{sub}</div>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <div className="toggle-thumb" />
    </button>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [s, setS] = useState({
    // התראות
    notifLeave:    true,
    notifOrder:    true,
    notifStock:    true,
    notifDelay:    true,
    // לוגיסטיקה
    breakTime:     '12:30',
    endTime:       '16:00',
    deliveryDay:   'ראשון',
    // אבטחה
    twoFactor:     false,
    faceId:        false,
    // כללי
    orgName:       'TimeDrop',
    orgCode:       'TD001',
    timezone:      'ישראל (UTC+3)',
  });

  const set = (key, val) => setS(s => ({ ...s, [key]: val }));
  const saveAll = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="settings-page animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>הגדרות</h1>
          <p>ניהול הגדרות המערכת</p>
        </div>
        <Btn variant="primary" icon={saved ? <CheckCircle size={16}/> : <Save size={16}/>} onClick={saveAll}>
          {saved ? 'נשמר!' : 'שמור הכל'}
        </Btn>
      </div>

      <div className="settings-grid">
        {/* ארגון */}
        <SettingSection icon={<Building size={18}/>} title="פרטי ארגון">
          <SettingRow label="שם הארגון">
            <input className="setting-input" value={s.orgName} onChange={e => set('orgName', e.target.value)}/>
          </SettingRow>
          <SettingRow label="קוד ארגון" sub="לא ניתן לשינוי">
            <input className="setting-input" value={s.orgCode} disabled/>
          </SettingRow>
          <SettingRow label="אזור זמן">
            <select className="setting-select" value={s.timezone} onChange={e => set('timezone', e.target.value)}>
              <option>ישראל (UTC+3)</option>
              <option>אירופה (UTC+1)</option>
              <option>ארה"ב מזרח (UTC-5)</option>
            </select>
          </SettingRow>
        </SettingSection>

        {/* לוגיסטיקה */}
        <SettingSection icon={<Truck size={18}/>} title="הגדרות לוגיסטיקה">
          <SettingRow label="שעת הפסקה" sub={'תוצג בלו"ז היומי של עובדים'}>
            <input className="setting-input setting-input-sm" type="time" value={s.breakTime} onChange={e => set('breakTime', e.target.value)}/>
          </SettingRow>
          <SettingRow label="שעת סיום משמרת">
            <input className="setting-input setting-input-sm" type="time" value={s.endTime} onChange={e => set('endTime', e.target.value)}/>
          </SettingRow>
          <SettingRow label="יום הגדרת משמרות" sub="היום שבו עובדים מגדירים משמרות שבועיות">
            <select className="setting-select" value={s.deliveryDay} onChange={e => set('deliveryDay', e.target.value)}>
              {['ראשון','שני','שלישי','רביעי','חמישי','שישי'].map(d => <option key={d}>{d}</option>)}
            </select>
          </SettingRow>
        </SettingSection>

        {/* התראות */}
        <SettingSection icon={<Bell size={18}/>} title="התראות">
          <SettingRow label="בקשות חופשה/מחלה" sub="קבל התראה כשעובד מגיש בקשה">
            <Toggle value={s.notifLeave} onChange={v => set('notifLeave', v)}/>
          </SettingRow>
          <SettingRow label="הזמנה חדשה" sub="קבל התראה על כל הזמנה חדשה">
            <Toggle value={s.notifOrder} onChange={v => set('notifOrder', v)}/>
          </SettingRow>
          <SettingRow label="מלאי נמוך" sub="קבל התראה כשמוצר מגיע לכמות מינימלית">
            <Toggle value={s.notifStock} onChange={v => set('notifStock', v)}/>
          </SettingRow>
          <SettingRow label={'חריגה מלו"ז'} sub="קבל התראה כשעובד לא עומד בזמנים">
            <Toggle value={s.notifDelay} onChange={v => set('notifDelay', v)}/>
          </SettingRow>
        </SettingSection>

        {/* אבטחה */}
        <SettingSection icon={<Shield size={18}/>} title="אבטחה">
          <SettingRow label="אימות דו-שלבי (2FA)" sub="מומלץ מאוד למעסיקים">
            <Toggle value={s.twoFactor} onChange={v => set('twoFactor', v)}/>
          </SettingRow>
          <SettingRow label="כניסה עם זיהוי פנים" sub="Face ID / Touch ID">
            <Toggle value={s.faceId} onChange={v => set('faceId', v)}/>
          </SettingRow>
        </SettingSection>
      </div>
    </div>
  );
}
