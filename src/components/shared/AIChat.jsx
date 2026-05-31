import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, workersAPI, clientsAPI, deliveriesAPI } from '../../utils/api';
import { sendMessage, buildSystemPrompt, getProactiveAlerts } from '../../utils/aiAPI';
import './AIChat.css';

const QUICK_CHIPS = {
  employer: ['מה הסטטוס של העסק?', 'אילו הזמנות ממתינות?', 'מי העובד הטוב ביותר?', 'לקוחות עם חוב פתוח'],
  worker:   ['מה המשלוחים שלי היום?', 'איך להגיע ללקוח?', 'דווח על שיבוש'],
  client:   ['מה סטטוס ההזמנה שלי?', 'רוצה לבצע הזמנה חדשה', 'מתי יגיע המשלוח?'],
};

export default function AIChat() {
  const { user } = useAuth();
  const role = user?.role || 'employer';

  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts]   = useState('');
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [contextData, setContextData] = useState({});
  const messagesEndRef = useRef(null);

  // Load context data once on mount
  useEffect(() => {
    async function loadContext() {
      try {
        if (role === 'employer') {
          const [orders, workers, clients] = await Promise.all([
            ordersAPI.getAll(),
            workersAPI.getAll(),
            clientsAPI.getAll(),
          ]);
          setContextData({ orders, workers, clients });
        } else if (role === 'worker') {
          const deliveries = await deliveriesAPI.getToday();
          setContextData({ deliveries });
        } else if (role === 'client') {
          const orders = await ordersAPI.getAll();
          setContextData({ orders });
        }
      } catch { /* use empty context */ }
    }
    loadContext();
  }, [role]);

  // Proactive alerts for employer — runs once context is loaded
  useEffect(() => {
    if (role !== 'employer' || !contextData.orders) return;
    setAlertsLoading(true);
    getProactiveAlerts(contextData)
      .then(text => setAlerts(text))
      .catch(() => setAlerts(''))
      .finally(() => setAlertsLoading(false));
  }, [role, contextData.orders]); // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const systemPrompt = buildSystemPrompt(role, contextData);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg   = { role: 'user',      content };
    const nextMsgs  = [...messages, userMsg];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      const reply = await sendMessage(
        nextMsgs.map(m => ({ role: m.role, content: m.content })),
        systemPrompt,
      );
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `שגיאה: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const hasAlerts = alerts && alerts !== 'הכל תקין' && !alerts.includes('הכל תקין');
  const badgeCount = hasAlerts ? '!' : null;

  return (
    <>
      {/* FAB */}
      <button
        className={`ai-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="עוזר AI"
      >
        {open ? <X size={22}/> : <Bot size={22}/>}
        {!open && badgeCount && (
          <span className="ai-fab-badge">{badgeCount}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="ai-panel animate-fade">
          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-panel-header-icon"><Sparkles size={16}/></div>
            <div className="ai-panel-header-text">
              <h3>עוזר AI – TimeDrop</h3>
              <p>{{ employer:'מנהל', worker:'שליח', client:'לקוח' }[role] || 'משתמש'} · Llama 3 (Groq)</p>
            </div>
            <button className="ai-panel-close" onClick={() => setOpen(false)}><X size={16}/></button>
          </div>

          {/* Proactive alerts (employer only) */}
          {role === 'employer' && (
            <div className="ai-alerts-strip">
              <div className="ai-alerts-title"><Sparkles size={12}/> ניתוח אוטומטי</div>
              {alertsLoading
                ? <div className="ai-alerts-loading">מנתח נתוני עסק...</div>
                : <div className="ai-alerts-body">{alerts || 'לא זוהו בעיות'}</div>
              }
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {messages.length === 0 && (
              <div className="ai-msg assistant">
                שלום{user?.name ? ` ${user.name}` : ''}! אני עוזר ה-AI של TimeDrop. איך אוכל לעזור לך?
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="ai-msg thinking">מעבד...</div>}
            <div ref={messagesEndRef}/>
          </div>

          {/* Quick chips (shown when no messages) */}
          {messages.length === 0 && (
            <div className="ai-chips">
              {(QUICK_CHIPS[role] || []).map(chip => (
                <button key={chip} className="ai-chip" onClick={() => send(chip)}>{chip}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-input-row">
            <textarea
              rows={1}
              placeholder="שאל אותי..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="ai-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
              <Send size={15}/>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
