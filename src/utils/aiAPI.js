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

// Proactive alerts — computed directly from context data, no AI call needed
export function getProactiveAlerts(contextData) {
  const { orders = [], workers = [] } = contextData;

  // Item frequency across all orders
  const itemFreq = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      itemFreq[item.name] = (itemFreq[item.name] || 0) + 1;
    });
  });

  const frequentItems = Object.entries(itemFreq)
    .filter(([, n]) => n >= 3)
    .sort(([, a], [, b]) => b - a)
    .map(([name, n]) => `${name} (${n} פעמים)`)
    .join(', ') || 'אין';

  const activeWorkers = workers
    .filter(w => w.status === 'active')
    .map(w => w.name)
    .join(', ') || 'אין';

  const stuckOrders = orders
    .filter(o => o.status === 'pending')
    .map(o => o.id)
    .join(', ') || 'אין';

  return Promise.resolve(
    [
      `עובדים פעילים: ${activeWorkers}`,
      `פריט בעל שכיחות: ${frequentItems}`,
      `הזמנות תקועות: ${stuckOrders}`,
    ].join('\n')
  );
}
