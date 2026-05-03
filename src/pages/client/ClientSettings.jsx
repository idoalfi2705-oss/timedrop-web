import React, { useState } from 'react';
import { Card, Btn } from '../../components/shared/UI';
import { Bell, Shield, Save, CheckCircle } from 'lucide-react';
import './ClientSettings.css';

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

export default function ClientSettings() {
  const [saved, setSaved] = useState(false);
  const [s, setS] = useState({
    notifDelivery: true,
    notifETA:      true,
    notifInvoice:  true,
    smsUpdates:    false,
    faceId:        false,
  });

  const set = (k, v) => setS(s => ({ ...s, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="client-settings animate-fade">
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
          <SettingRow label="עדכון משלוח" sub="קבל עדכון כשהמשלוח יוצא לדרך">
            <Toggle value={s.notifDelivery} onChange={v => set('notifDelivery', v)}/>
          </SettingRow>
          <SettingRow label="צפי הגעה" sub="קבל התראה 30 דקות לפני הגעה">
            <Toggle value={s.notifETA} onChange={v => set('notifETA', v)}/>
          </SettingRow>
          <SettingRow label="חשבונית במייל" sub="קבל חשבונית לאחר כל משלוח">
            <Toggle value={s.notifInvoice} onChange={v => set('notifInvoice', v)}/>
          </SettingRow>
          <SettingRow label="עדכוני SMS" sub="קבל עדכונים גם ב-SMS">
            <Toggle value={s.smsUpdates} onChange={v => set('smsUpdates', v)}/>
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
