import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, workersAPI, clientsAPI, deliveriesAPI } from '../../utils/api';
import { sendMessage, buildSystemPrompt, getProactiveAlerts } from '../../utils/aiAPI';
import './AIChat.css';

const QUICK_CHIPS = {
  employer: ['אילו פריטים פספסתי?', 'מה הסטטוס של העסק?', 'אילו הזמנות ממתינות?', 'לקוחות עם חוב פתוח'],
  worker:   ['מה המשלוחים שלי היום?', 'איך להגיע ללקוח?', 'דווח על שיבוש'],
  client:   ['מה סטטוס ההזמנה שלי?', 'רוצה לבצע הזמנה חדשה', 'מתי יגיע המשלוח?'],
};

// Render structured alert lines with bold labels
function AlertLines({ text }) {
  if (!text) return <span className="ai-alerts-loading">לא זוהו בעיות</span>;
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div className="ai-alerts-body">
      {lines.map((line, i) => {
        const colon = line.indexOf(':');
        if (colon === -1) return <div key={i} className="ai-alert-line">• {line}</div>;
        const label = line.slice(0, colon);
        const value = line.slice(colon + 1).trim();
        if (!value || value === 'אין') return null;
        return (
          <div key={i} className="ai-alert-line">
            <strong>{label}:</strong> {value}
          </div>
        );
      })}
    </div>
  );
}

// Parse **bold** in AI responses
function MsgText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : p
      )}
    </>
  );
}

export default function AIChat() {
  const { user } = useAuth();
  const role = user?.role || 'employer';

  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [alerts, setAlerts]     = useState('');
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [contextData, setContextData]     = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadContext() {
      try {
        if (role === 'employer') {
          const [orders, workers, clients] = await Promise.all([
            ordersAPI.getAll(), workersAPI.getAll(), clientsAPI.getAll(),
          ]);
          setContextData({ orders, workers, clients });
        } else if (role === 'worker') {
          const deliveries = await deliveriesAPI.getToday();
          setContextData({ deliveries });
        } else {
          const orders = await ordersAPI.getAll();
          setContextData({ orders });
        }
      } catch { /* use empty context */ }
    }
    loadContext();
  }, [role]);

  useEffect(() => {
    if (role !== 'employer' || !contextData.orders) return;
    setAlertsLoading(true);
    getProactiveAlerts(contextData)
      .then(text => setAlerts(text))
      .catch(() => setAlerts(''))
      .finally(() => setAlertsLoading(false));
  }, [role, contextData.orders]); // eslint-disable-line

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const systemPrompt = buildSystemPrompt(role, contextData);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    const userMsg  = { role: 'user', content };
    const nextMsgs = [...messages, userMsg];
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

  const clearMessages = () => setMessages([]);

  const roleLabel = { employer:'מנהל', worker:'שליח', client:'לקוח' }[role] || 'משתמש';

  return (
    <>
      {/* FAB — rectangular right half of dock */}
      <button
        className={`ai-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="עוזר AI"
      >
        {open ? <X size={20}/> : <Bot size={20}/>}
        <span className="ai-fab-label">AI</span>
      </button>

      {open && (
        <div className="ai-panel animate-fade">
          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-panel-header-icon"><Bot size={16}/></div>
            <div className="ai-panel-header-text">
              <h3>עוזר AI – TimeDrop</h3>
              <p>{roleLabel} · Llama 3 (Groq)</p>
            </div>
            <div className="ai-header-actions">
              {messages.length > 0 && (
                <button className="ai-panel-close" onClick={clearMessages} title="חזור לשאלות">
                  <RotateCcw size={14}/>
                </button>
              )}
              <button className="ai-panel-close" onClick={() => setOpen(false)}><X size={16}/></button>
            </div>
          </div>

          {/* Proactive alerts (employer only) */}
          {role === 'employer' && (
            <div className="ai-alerts-strip">
              <div className="ai-alerts-title"><Sparkles size={12}/> ניתוח אוטומטי</div>
              {alertsLoading
                ? <div className="ai-alerts-loading">מנתח נתוני עסק...</div>
                : <AlertLines text={alerts}/>
              }
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {messages.length === 0 && (
              <div className="ai-msg assistant">
                <div className="ai-msg-icon"><Bot size={13}/></div>
                <div className="ai-msg-text">
                  שלום{user?.name ? ` ${user.name}` : ''}! אני עוזר ה-AI של TimeDrop. איך אוכל לעזור?
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                {m.role === 'assistant' && <div className="ai-msg-icon"><Bot size={13}/></div>}
                <div className="ai-msg-text"><MsgText text={m.content}/></div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg assistant">
                <div className="ai-msg-icon"><Bot size={13}/></div>
                <div className="ai-msg-text thinking">מעבד...</div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Quick chips (always visible when no messages) */}
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
