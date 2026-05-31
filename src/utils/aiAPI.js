// Frontend client for the AI agent — calls /api/ai (Vercel serverless)

const AI_ENDPOINT = '/api/ai';

export function buildSystemPrompt(role, contextData = {}) {
  const {
    orders = [], workers = [], clients = [], deliveries = [],
    workerStats = {}, employerContact = {}, pickups = [],
    clientProfile = {},
  } = contextData;

  const base = `אתה עוזר AI חכם של מערכת TimeDrop לניהול משלוחים. תמיד ענה בעברית בצורה קצרה וברורה. אל תשתמש בכוכביות (** **) לעיצוב — כתוב טקסט רגיל ונקודות (•) כשצריך לפרט.
היום: ${new Date().toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}.`;

  // ── Employer ────────────────────────────────────────────────────────────────
  if (role === 'employer') {
    const ordersText = orders.slice(0, 15).map(o =>
      `הזמנה ${o.id}: לקוח ${o.clientName} | סכום ₪${o.total} | סטטוס: ${
        { delivered:'נמסר', pending:'ממתין', cancelled:'בוטל' }[o.status] || o.status
      } | תאריך: ${new Date(o.date).toLocaleDateString('he-IL')}`
    ).join('\n');

    const workersText = workers.map(w =>
      `• ${w.name} | אזור: ${w.area} | ${w.deliveries} משלוחים | ${w.onTime}% בזמן | סטטוס: ${w.status === 'active' ? 'פעיל' : w.status}`
    ).join('\n');

    const clientsText = clients.map(c =>
      `• ${c.name} | אזור: ${c.area} | חוב: ₪${c.debt} | טלפון: ${c.phone || 'לא ידוע'}`
    ).join('\n');

    // Compute missed items: 3+ orders in days 8-30, absent last 7 days
    const DAY = 86400000;
    const now = Date.now();
    const recentItemSet = new Set();
    const olderItemFreq = {};
    orders.forEach(o => {
      const ageDays = (now - new Date(o.date).getTime()) / DAY;
      (o.items || []).forEach(it => {
        if (ageDays <= 7) recentItemSet.add(it.name);
        else if (ageDays <= 30) olderItemFreq[it.name] = (olderItemFreq[it.name] || 0) + 1;
      });
    });
    const missedList = Object.entries(olderItemFreq)
      .filter(([name, n]) => n >= 3 && !recentItemSet.has(name))
      .sort(([, a], [, b]) => b - a)
      .map(([name, n]) => `• ${name} — הוזמן ${n} פעמים בחודש שעבר, לא הוזמן ב-7 ימים האחרונים`)
      .join('\n') || '• אין פריטים שהוזמנו 3+ פעמים ונעלמו לאחרונה';

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const clientsWithDebt = clients.filter(c => c.debt > 0);

    return `${base}
אתה עוזר למנהל/מעסיק.

=== הזמנות (${orders.length} סה"כ, ${pendingOrders.length} ממתינות) ===
${ordersText || 'אין נתונים'}

=== עובדים ===
${workersText || 'אין נתונים'}

=== לקוחות (${clientsWithDebt.length} עם חוב פתוח) ===
${clientsText || 'אין נתונים'}

=== פריטים שנעלמו (הוזמנו 3+ פעמים בחודש שעבר אך לא ב-7 ימים האחרונים) ===
${missedList}

הנחיות תשובה:
- "אילו פריטים פספסתי?" — ענה בנקודות • עם שם הפריט, כמות הזמנות, והמלצה לפנות ללקוח
- "לקוחות עם חוב" — רשום כל לקוח בנקודה • עם שם + סכום חוב
- "עובדים פעילים" — רשום כל עובד פעיל בנקודה • עם שם ואזור
- "הזמנות ממתינות" — רשום כל הזמנה ממתינה בנקודה • עם מספר, לקוח וסכום`;
  }

  // ── Worker ──────────────────────────────────────────────────────────────────
  if (role === 'worker') {
    const pendingDeliveries = deliveries.filter(d => d.status !== 'delivered');
    const deliveriesText = deliveries.map(d =>
      `משלוח ${d.id} | לקוח: ${d.clientName} | כתובת: ${d.address} | שעה: ${d.arrivalTime || '—'} | טלפון לקוח: ${d.clientPhone || '—'} | סטטוס: ${d.status === 'delivered' ? 'נמסר' : 'ממתין'}`
    ).join('\n');

    const pickupsText = pickups.map(p =>
      `• ${p.name} | כתובת: ${p.address} | שעת איסוף: ${p.pickupTime || '—'}`
    ).join('\n') || '• אין איסופים היום';

    const totalMins = deliveries.reduce((s, d) => s + (d.drivingMinutes || 0), 0);
    const driveHrs  = Math.floor(totalMins / 60);
    const driveMins = totalMins % 60;
    const driveText = driveHrs > 0 ? `${driveHrs} שעות ו-${driveMins} דקות` : `${driveMins} דקות`;

    const phonesText = deliveries.map(d =>
      `• ${d.clientName} | ${d.address} | טלפון: ${d.clientPhone || '—'}`
    ).join('\n');

    return `${base}
אתה עוזר לעובד/שליח בשטח. ענה קצר וממוקד.

=== משלוחי היום (${deliveries.length} סה"כ, ${pendingDeliveries.length} ממתינים) ===
${deliveriesText || 'אין משלוחים'}

=== מחסנים לאיסוף סחורה (${pickups.length}) ===
${pickupsText}

=== נתוני החודש הנוכחי ===
שעות עבודה: ${workerStats.hoursWorked || 0}
ימי חופשה שנותרו: ${workerStats.vacationDaysRemaining || 0}
ימי חופשה שנוצלו: ${workerStats.vacationDaysUsed || 0}

=== פרטי מעסיק ===
שם: ${employerContact.name || '—'} | טלפון: ${employerContact.phone || '—'}

=== זמן נסיעה משוער ללא עצירות ===
${driveText} (${totalMins} דקות סה"כ)

=== טלפונים של לקוחות היום ===
${phonesText || 'אין'}

הנחיות תשובה:
- "כמה משלוחים פתוחים לי?" — כתוב: "יש לך ${pendingDeliveries.length} משלוחים פתוחים:" ואז פרט כל אחד בנקודה: "• מספר משלוח: [ID] | לאן: [כתובת] | שעה: [שעה]"
- "כמה שעות עבדתי החודש?" — ענה: "עבדת ${workerStats.hoursWorked || 0} שעות החודש"
- "כמה ימי חופשה יש לי?" — ענה: "נותרו לך ${workerStats.vacationDaysRemaining || 0} ימי חופשה (ניצלת ${workerStats.vacationDaysUsed || 0} ימים)"
- "כמה מחסנים אני צריך לאסוף?" — ענה עם ${pickups.length} מחסנים וכתובותיהם בנקודות
- "כמה זמן נסיעה?" — ענה: "זמן הנסיעה המשוער שלך היום הוא ${driveText} ללא עצירות"
- "טלפונים של לקוחות" — ענה בנקודות עם שם לקוח, שם חנות וטלפון
- "טלפון של המעסיק" — ענה: "המעסיק ${employerContact.name || '—'}, טלפון: ${employerContact.phone || '—'}"`;
  }

  // ── Client ──────────────────────────────────────────────────────────────────
  if (role === 'client') {
    const myOrders = orders.slice(0, 10);
    const ordersText = myOrders.map(o =>
      `הזמנה ${o.id} | תאריך: ${new Date(o.date).toLocaleDateString('he-IL')} | סכום: ₪${o.total} | סטטוס: ${
        { delivered:'נמסרה', pending:'בדרך', cancelled:'בוטלה' }[o.status] || o.status
      }`
    ).join('\n');

    const nextDelivery = clientProfile.nextDelivery;
    const debt = clientProfile.debt || 0;
    const creditLimit = clientProfile.creditLimit || 0;

    return `${base}
אתה עוזר ידידותי ללקוח.

=== הזמנות אחרונות (${myOrders.length}) ===
${ordersText || 'אין הזמנות'}

=== פרטי חשבון ===
חוב פתוח: ₪${debt}
מסגרת אשראי: ₪${creditLimit}
${nextDelivery ? `משלוח הבא: ${nextDelivery.date} בשעה ${nextDelivery.time}` : ''}

הנחיות תשובה:
- "מה סטטוס ההזמנה?" — רשום כל הזמנה בנקודה • עם מספר, תאריך וסטטוס
- "כמה חוב יש לי?" — ענה: "החוב הפתוח שלך הוא ₪${debt}"
- "מתי יגיע המשלוח?" — ${nextDelivery ? `ענה: "המשלוח הבא שלך צפוי ב-${nextDelivery.date} בשעה ${nextDelivery.time}"` : 'ענה שאין משלוח קרוב מתוזמן'}`;
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

  const activeWorkers = workers
    .filter(w => w.status === 'active')
    .map(w => w.name)
    .join(', ') || 'אין';

  const DAY = 86400000;
  const now = Date.now();
  const recentItemSet = new Set();
  const olderItemFreq = {};
  orders.forEach(o => {
    const ageDays = (now - new Date(o.date).getTime()) / DAY;
    (o.items || []).forEach(it => {
      if (ageDays <= 7) recentItemSet.add(it.name);
      else if (ageDays <= 30) olderItemFreq[it.name] = (olderItemFreq[it.name] || 0) + 1;
    });
  });
  const missedItems = Object.entries(olderItemFreq)
    .filter(([name, n]) => n >= 3 && !recentItemSet.has(name))
    .sort(([, a], [, b]) => b - a)
    .map(([name, n]) => `${name} (${n} פעמים)`)
    .join(', ') || 'אין';

  const stuckOrders = orders
    .filter(o => o.status === 'pending')
    .map(o => o.id)
    .join(', ') || 'אין';

  return Promise.resolve(
    [
      `עובדים פעילים: ${activeWorkers}`,
      `פריטים שלא הוזמנו לאחרונה: ${missedItems}`,
      `הזמנות תקועות: ${stuckOrders}`,
    ].join('\n')
  );
}
