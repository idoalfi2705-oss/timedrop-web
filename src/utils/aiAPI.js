// Frontend client for the AI agent — calls /api/ai (Vercel serverless)

const AI_ENDPOINT = '/api/ai';

// Build role-specific system prompt with injected business context
export function buildSystemPrompt(role, contextData = {}) {
  const { orders = [], workers = [], clients = [], deliveries = [] } = contextData;

  const ordersText = orders.slice(0, 15).map(o =>
    `הזמנה ${o.id}: לקוח ${o.clientName}, סכום ₪${o.total}, סטטוס: ${
      { delivered:'נמסר', pending:'ממתין', cancelled:'בוטל' }[o.status] || o.status
    }, תאריך: ${new Date(o.date).toLocaleDateString('he-IL')}`
  ).join('\n');

  const workersText = workers.slice(0, 10).map(w =>
    `עובד ${w.name}: אזור ${w.area}, ${w.deliveries} משלוחים, ${w.onTime}% עמידה בלו"ז, סטטוס: ${w.status}`
  ).join('\n');

  const clientsText = clients.slice(0, 10).map(c =>
    `לקוח ${c.name}: אזור ${c.area}, חוב ₪${c.debt}, ${c.totalOrders} הזמנות`
  ).join('\n');

  const deliveriesText = deliveries.slice(0, 10).map(d =>
    `משלוח ${d.id}: ${d.clientName}, כתובת: ${d.address}, סטטוס: ${d.status === 'delivered' ? 'נמסר' : 'ממתין'}`
  ).join('\n');

  const base = `אתה עוזר AI חכם של מערכת TimeDrop לניהול משלוחים ועסקים. תמיד ענה בעברית בצורה קצרה וברורה.
היום: ${new Date().toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}.`;

  if (role === 'employer') {
    return `${base}
אתה עוזר למנהל/מעסיק של העסק. יש לך גישה לכל נתוני העסק.

יכולות שלך:
1. מענה על שאלות על הזמנות, לקוחות ועובדים
2. זיהוי בעיות – מלאי נמוך, הזמנות תקועות, עובדים שמאחרים
3. ניתוח ביצועים ומגמות
4. המלצות על פעולות – אישור הזמנות, יצירת לקוחות חדשים
5. התראות פרואקטיביות – לקוחות שלא הזמינו כרגיל

נתוני עסק עדכניים:
--- הזמנות אחרונות ---
${ordersText || 'אין נתונים'}

--- עובדים ---
${workersText || 'אין נתונים'}

--- לקוחות ---
${clientsText || 'אין נתונים'}`;
  }

  if (role === 'worker') {
    return `${base}
אתה עוזר לעובד/שליח בשטח. עזור לו עם לוח הזמנים, ניווט ודיווח בעיות.

משלוחים להיום:
${deliveriesText || 'אין משלוחים להיום'}

יכולות שלך:
1. מידע על משלוחים ולקוחות
2. עזרה בניווט וכתובות
3. דיווח שיבושים
4. תשובות על נהלי עבודה`;
  }

  if (role === 'client') {
    return `${base}
אתה עוזר ידידותי ללקוח של TimeDrop. עזור לו לעקוב אחר הזמנות ולבצע הזמנות חדשות.

הזמנות אחרונות של הלקוח:
${ordersText || 'אין הזמנות'}

יכולות שלך:
1. מעקב אחר הזמנות קיימות
2. עזרה בביצוע הזמנה חדשה
3. מידע על מוצרים וזמני אספקה
4. מענה על שאלות חשבון`;
  }

  return base;
}

// Send a message to the AI agent
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

// Auto-analyze and return proactive alerts for the employer
export async function getProactiveAlerts(contextData) {
  const systemPrompt = buildSystemPrompt('employer', contextData);
  const messages = [{
    role: 'user',
    content: `בדוק את נתוני העסק וזהה עד 3 התראות חשובות הדורשות תשומת לב. אם אין בעיות, כתוב "הכל תקין". פורמט: • [התראה]. ענה בקצרה, עד 3 נקודות.`,
  }];
  return sendMessage(messages, systemPrompt);
}
