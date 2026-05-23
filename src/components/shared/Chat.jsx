import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

const ALL_CONTACTS = {
  employer: [
    { id: 2, name: 'יוסי לוי',   avatar: 'י', role: 'worker',   roleLabel: 'עובד' },
    { id: 3, name: 'רחל מזרחי',  avatar: 'ר', role: 'client',   roleLabel: 'לקוח' },
  ],
  worker: [
    { id: 1, name: 'דוד כהן',    avatar: 'ד', role: 'employer', roleLabel: 'מעסיק' },
    { id: 3, name: 'רחל מזרחי',  avatar: 'ר', role: 'client',   roleLabel: 'לקוח' },
  ],
  client: [
    { id: 1, name: 'דוד כהן',    avatar: 'ד', role: 'employer', roleLabel: 'מעסיק' },
    { id: 2, name: 'יוסי לוי',   avatar: 'י', role: 'worker',   roleLabel: 'עובד' },
  ],
};

const AUTO_REPLIES = ['קיבלתי, תודה!', 'בסדר, אעדכן אותך.', 'מצוין!', 'נבדוק ונחזור אליך.'];

export default function Chat() {
  const { user } = useAuth();
  const [open, setOpen]               = useState(false);
  const [active, setActive]           = useState(null);
  const [messages, setMessages]       = useState({});
  const [input, setInput]             = useState('');
  const [unread, setUnread]           = useState({});
  const bottomRef = useRef(null);

  const contacts = ALL_CONTACTS[user?.role] || [];

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, active]);

  const openConversation = (contact) => {
    setActive(contact);
    setUnread(u => ({ ...u, [contact.id]: false }));
  };

  const send = () => {
    if (!input.trim() || !active) return;
    const msg = { text: input.trim(), from: 'me', time: new Date() };
    setMessages(prev => ({ ...prev, [active.id]: [...(prev[active.id] || []), msg] }));
    setInput('');
    setTimeout(() => {
      const reply = { text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], from: 'them', time: new Date() };
      setMessages(prev => ({ ...prev, [active.id]: [...(prev[active.id] || []), reply] }));
      if (!open || active?.id !== active?.id) {
        setUnread(u => ({ ...u, [active.id]: true }));
      }
    }, 900);
  };

  const totalUnread = Object.values(unread).filter(Boolean).length;
  const currentMsgs = active ? (messages[active.id] || []) : [];

  if (!user) return null;

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(o => !o)}>
        <MessageCircle size={24} />
        {totalUnread > 0 && <span className="chat-fab-badge">{totalUnread}</span>}
      </button>

      {open && (
        <div className="chat-panel" dir="rtl">
          <div className="chat-header">
            {active ? (
              <>
                <button className="chat-back" onClick={() => setActive(null)}>
                  <ChevronLeft size={18} />
                </button>
                <div className="chat-avatar sm">{active.avatar}</div>
                <div>
                  <div className="chat-name">{active.name}</div>
                  <div className="chat-role-label">{active.roleLabel}</div>
                </div>
              </>
            ) : (
              <span>הודעות</span>
            )}
            <button className="chat-close" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {!active ? (
            <div className="chat-contacts">
              {contacts.map(c => (
                <div key={c.id} className="chat-contact-row" onClick={() => openConversation(c)}>
                  <div className="chat-avatar lg">{c.avatar}</div>
                  <div className="chat-contact-info">
                    <div className="chat-name">{c.name}</div>
                    <div className="chat-role-label">{c.roleLabel}</div>
                  </div>
                  {unread[c.id] && <div className="chat-dot" />}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="chat-messages">
                {currentMsgs.length === 0 && <div className="chat-empty">התחל שיחה...</div>}
                {currentMsgs.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.from}`}>
                    <div className="chat-bubble-text">{m.text}</div>
                    <div className="chat-bubble-time">
                      {m.time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="chat-input-row">
                <button className="chat-send" onClick={send}><Send size={16} /></button>
                <input
                  className="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="הקלד הודעה..."
                  dir="rtl"
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
