// Frontend client for the AI agent — calls /api/ai (Vercel serverless)

const AI_ENDPOINT = '/api/ai';

export function buildSystemPrompt(role, contextData = {}) {
  const { orders = [], workers = [], clients = [], deliveries = [] } = contextData;

  const ordersText = orders.slice(0, 15).map(o =>
    `הזמנה ${o.id}: לקוח ${o.clientName}, סכום ₪${o.total}, סטטוס: ${
      { delivered:'נמסר', pending:'ממתין', cancelled:'בוטל' }[o.status] || o.status
    }, תאריך: ${new Date(o.date).toLocaleDateString('he-IL')}`
  ).join('\n');

  const workersText = workers.slice(0, 10).map(w =>
    `עובד ${w.name}: אזור ${w.area}, ${w.deliveries} משלוחים, ${w.onTime}% עמידה, סטטוס: ${w.status}`
  ).join('\n');

  const clientsText = clients.slice(0, 10).map(c =>
    `לקוח ${c.name}: אזור ${c.area}, חוב ₪${c.debt}`
  ).join('\n');

  const deliveriesText = deliveries.slice(0, 10).map(d =>
    `משלוח ${d.id}: ${d.clientName}, ${d.address}, סטטוס: ${d.status === 'delivered' ? 'נמסר' : 'ממתין'}`
  ).join('\n');

  const base = `אתה עוזר AI חכם של מערכת TimeDrop לניהול משלוחים. תמיד ענה בעברית בצורה קצרה וברורה. אל תשתמש בכוכביות (** **) לעיצוב — פשוט כתוב טקסט רגיל.
היום: ${new Date().toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}.`;

  if (role === 'employer') {
    return `${base}
אתה עוזר למנהל/מעסיק של העסק.

נתוני עסק עדכניים:
--- הזמנות ---
${ordersText || 'אין נתונים'}

--- עובדים ---
${workersText || 'אין נתונים'}

--- לקוחות ---
${clientsText || 'אין נתונים'}`;
  }

  if (role === 'worker') {
    return `${base}
אתה עוזר לעובד/שליח בשטח.

משלוחים להיום:
${deliveriesText || 'אין משלוחים'}`;
  }

  if (role === 'client') {
    return `${base}
אתה עוזר ידידותי ללקוח.

הזמנות אחרונות:
${ordersText || 'אין הזמנות'}`;
  }

  return base;
}

export async function sendMessage(messages, systemPrompt) {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'שגיאה בתקשורת עם ה-AI');
  }
  const data = await res.json();
  return data.content;
}

// Proactive alerts — returns structured text in exact format for parsing
export async function getProactiveAlerts(contextData) {
  const systemPrompt = buildSystemPrompt('employer', contextData);

  // Compute item frequency from orders
  const itemFreq = {};
  (contextData.orders || []).forEach(o => {
    (o.items || []).forEach(item => {
      itemFreq[item.name] = (itemFreq[item.name] || 0) + 1;
    });
  });
  const freqText = Object.entries(itemFreq)
    .filter(([, n]) => n >= 3)
    .map(([name, n]) => `${name} (${n} פעמים)`)
    .join(', ') || 'אין';

  const messages = [{
    role: 'user',
    content: `נתח את נתוני העסק והחזר בדיוק בפורמט הבא, ללא כוכביות, ללא מלל נוסף:
מלאי נמוך: [שמות פריטים מופרדים בפסיק, או "אין"]
עובדים פעילים: [שמות עובדים פעילים מופרדים בפסיק]
הזמנות תקועות: [מספרי הזמנות со סטטוס ממתין מופרדים בפסיק, או "אין"]
פריט שלא הוזמן: ${freqText !== 'אין' ? freqText : 'אין (נדרשים 3+ הזמנות בחודש)'}

(פריטים עם תדירות גבוהה שחישבתי: ${freqText})`,
  }];
  return sendMessage(messages, systemPrompt);
}
