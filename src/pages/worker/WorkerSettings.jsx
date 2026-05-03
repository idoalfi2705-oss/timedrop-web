import React, { useState } from 'react';
import { Card, Btn } from '../../components/shared/UI';
import { Bell, MapPin, Clock, Shield, Save, CheckCircle } from 'lucide-react';
import './WorkerSettings.css';

function Toggle({ value, onChange }) {
  return (
    <button className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <div className="toggle-thumb" />
    </button>
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

export default function WorkerSettings() {
  const [saved, setSaved] = useState(false);
  const [s, setS] = useState({
    notifShift:   true,
    notifLeave:   true,
    notifDelay:   true,
    navApp:       'waze',
    autoLocation: true,
    faceId:       false,
  });

  const set = (k, v) => setS(s => ({ ...s, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="worker-settings animate-fade">
      <div className="page-header">
        <div className="page-header-title">
          <h1>הגדרות</h1>
          <p>הגדרות אישיות</p>
        </div>
        <Btn variant="primary" icon={saved ? <CheckCircle size={16}/> : <Save size={16}/>} onClick={save}>
          {saved ? 'נשמר!' : 'שמור'}
        </Btn>
      </div>

      <div className="settings-grid">
        <Card>
          <div className="settings-section-title"><Bell size={18}/> התראות</div>
          <SettingRow label="התראת משמרת" sub="קבל התראה לפני תחילת משמרת">
            <Toggle value={s.notifShift} onChange={v => set('notifShift', v)}/>
          </SettingRow>
          <SettingRow label="עדכון בקשת חופשה" sub="קבל עדכון על אישור/דחיית בקשה">
            <Toggle value={s.notifLeave} onChange={v => set('notifLeave', v)}/>
          </SettingRow>
          <SettingRow label={'חריגה מלו"ז'} sub="קבל התראה אם אתה מאחר">
            <Toggle value={s.notifDelay} onChange={v => set('notifDelay', v)}/>
          </SettingRow>
        </Card>

        <Card>
          <div className="settings-section-title"><MapPin size={18}/> ניווט</div>
          <SettingRow label="אפליקציית ניווט מועדפת">
            <select className="setting-select" value={s.navApp} onChange={e => set('navApp', e.target.value)}>
              <option value="waze">Waze</option>
              <option value="google">Google Maps</option>
              <option value="apple">Apple Maps</option>
            </select>
          </SettingRow>
          <SettingRow label="שיתוף מיקום אוטומטי" sub="שתף מיקום בזמן משמרת">
            <Toggle value={s.autoLocation} onChange={v => set('autoLocation', v)}/>
          </SettingRow>
        </Card>

        <Card>
          <div className="settings-section-title"><Shield size={18}/> אבטחה</div>
          <SettingRow label="כניסה עם זיהוי פנים">
            <Toggle value={s.faceId} onChange={v => set('faceId', v)}/>
          </SettingRow>
        </Card>
      </div>
    </div>
  );
}
