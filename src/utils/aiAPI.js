// Frontend client for the AI agent — calls /api/ai (Vercel serverless)

const AI_ENDPOINT = '/api/ai';

export function buildSystemPrompt(role, contextData = {}) {
  const {
    orders = [], workers = [], clients = [], deliveries = [],
    workerStats = {}, employerContact = {}, pickups = [],
    clientProfile = {},
  } = contextData;

  const today = new Date().toLocaleDateString('he-IL');
  const base = `עוזר AI של TimeDrop. ענה בעברית קצר וברור. השתמש בנקודות • לרשימות. ללא כוכביות. היום: ${today}.`;

  // ── Employer ────────────────────────────────────────────────────────────────
  if (role === 'employer') {
    const ordersSnap = orders.slice(0, 10).map(o =>
      `${o.id}|${o.clientName}|₪${o.total}|${{ delivered:'נמסר', pending:'ממתין', cancelled:'בוטל' }[o.status] || o.status}`
    ).join('\n');

    const workersSnap = workers.map(w =>
      `${w.name}|${w.area}|${w.status === 'active' ? 'פעיל' : 'לא פעיל'}`
    ).join('\n');

    const clientsSnap = clients.map(c =>
      `${c.name}|חוב ₪${c.debt}|טל׳ ${c.phone || '—'}`
    ).join('\n');

    // Missed items: 3+ orders days 8-30, absent last 7 days
    const DAY = 86400000;
    const now = Date.now();
    const recentSet = new Set();
    const olderFreq = {};
    orders.forEach(o => {
      const age = (now - new Date(o.date).getTime()) / DAY;
      (o.items || []).forEach(it => {
        if (age <= 7) recentSet.add(it.name);
        else if (age <= 30) olderFreq[it.name] = (olderFreq[it.name] || 0) + 1;
      });
    });
    const missed = Object.entries(olderFreq)
      .filter(([n, c]) => c >= 3 && !recentSet.has(n))
      .sort(([, a], [, b]) => b - a)
      .map(([n, c]) => `${n} (${c}×)`)
      .join(', ') || 'אין';

    const pending = orders.filter(o => o.status === 'pending').length;
    const withDebt = clients.filter(c => c.debt > 0).length;

    return `${base} תפקיד: מנהל.
הזמנות (${orders.length} סה"כ, ${pending} ממתינות):
${ordersSnap || 'אין'}
עובדים:
${workersSnap || 'אין'}
לקוחות (${withDebt} עם חוב):
${clientsSnap || 'אין'}
פריטים שנעלמו (3+ פעמים בחודש שעבר, לא הוזמנו 7 ימים): ${missed}
כשנשאלים "אילו פריטים פספסתי?" — פרט בנקודות • שם הפריט וכמות ההזמנות.
כשנשאלים על לקוחות עם חוב — פרט בנקודות. כשנשאלים על עובדים — פרט בנקודות.`;
  }

  // ── Worker ──────────────────────────────────────────────────────────────────
  if (role === 'worker') {
    const { travelTime } = contextData;
    const pending   = deliveries.filter(d => d.status !== 'delivered');
    const delivered = deliveries.filter(d => d.status === 'delivered');
    const lastDelivery = [...deliveries].sort((a, b) =>
      (b.arrivalTime || '').localeCompare(a.arrivalTime || '')
    )[0];

    const delSnap = deliveries.map(d =>
      `${d.id}|${d.clientName}|${d.address}|שעה:${d.arrivalTime || '—'}|טל׳ ${d.clientPhone || '—'}|${d.status === 'delivered' ? 'נמסר' : 'ממתין'}`
    ).join('\n');

    const pickSnap = pickups.map(p =>
      `${p.name}|${p.address}|${p.pickupTime || '—'}`
    ).join('\n') || 'אין';

    // Real OSRM travel time or fallback
    let driveStr;
    if (travelTime?.durationText) {
      driveStr = `${travelTime.durationText} (${travelTime.distanceKm} ק"מ — לפי מפה אמיתית)`;
    } else {
      const totalMins = deliveries.reduce((s, d) => s + (d.drivingMinutes || 0), 0);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      driveStr = (h > 0 ? `${h} שעות ו-${m} דקות` : `${m} דקות`) + ' (משוער)';
    }

    const shiftStart = workerStats.shiftStart || '07:30';
    const shiftEnd   = workerStats.shiftEnd   || '16:00';
    const shiftType  = workerStats.shiftType  || 'בוקר';

    return `${base} תפקיד: שליח.
משלוחים היום: ${deliveries.length} סה"כ | ${delivered.length} נמסרו | ${pending.length} ממתינים
${delSnap || 'אין'}
מחסנים (${pickups.length}): ${pickSnap}
משמרת היום: ${shiftType} | ${shiftStart}–${shiftEnd}
החודש: ${workerStats.hoursWorked || 0} שעות עבודה
חופשה: ${workerStats.vacationDaysRemaining || 0} ימים נותרו | ${workerStats.vacationDaysUsed || 0} נוצלו
מעסיק: ${employerContact.name || '—'} | טל׳ ${employerContact.phone || '—'}
זמן נסיעה כולל: ${driveStr}

כללי תשובה — ענה בדיוק לפי הנתונים:
שאלה "משלוחים פתוחים" → כתוב "${pending.length} משלוחים פתוחים:" ואז לכל אחד שורה: "• [ID] | לאן: [כתובת] | שעה: [שעה]"
שאלה "כמה שעות עבדתי" → "עבדת ${workerStats.hoursWorked || 0} שעות החודש"
שאלה "ימי חופשה" → "נותרו לך ${workerStats.vacationDaysRemaining || 0} ימי חופשה (ניצלת ${workerStats.vacationDaysUsed || 0})"
שאלה "עד מתי המשמרת" או "מתי מסיים" → "המשמרת שלך היום היא משמרת ${shiftType}, ${shiftStart}–${shiftEnd}"
שאלה "כמה מחסנים" → "${pickups.length} מחסנים:" ואז כתובת כל אחד בנקודה
שאלה "זמן נסיעה" → "${driveStr}"
שאלה "טלפונים לקוחות" → לכל לקוח שורה: "• [שם לקוח] | [שם חנות] | טל׳ [מספר]"
שאלה "טלפון מעסיק" → "המעסיק ${employerContact.name || '—'}, טל׳ ${employerContact.phone || '—'}"`;
  }

  // ── Client ──────────────────────────────────────────────────────────────────
  if (role === 'client') {
    const myOrders = orders.slice(0, 8);
    const ordSnap  = myOrders.map(o =>
      `${o.id}|${new Date(o.date).toLocaleDateString('he-IL')}|₪${o.total}|${
        { delivered:'נמסרה', pending:'בדרך', cancelled:'בוטלה' }[o.status] || o.status
      }`
    ).join('\n');

    const nd   = clientProfile.nextDelivery;
    const debt = clientProfile.debt || 0;

    return `${base} תפקיד: לקוח.
הזמנות (${myOrders.length}):
${ordSnap || 'אין'}
חוב: ₪${debt} | מסגרת: ₪${clientProfile.creditLimit || 0}
${nd ? `משלוח הבא: ${nd.date} ${nd.time}` : ''}
תשובות:
• "סטטוס הזמנה" → נקודות עם מספר, תאריך, סטטוס
• "כמה חוב" → "חוב פתוח: ₪${debt}"
• "מתי משלוח" → ${nd ? `"${nd.date} בשעה ${nd.time}"` : '"אין משלוח מתוזמן"'}`;
  }

  return base;
}

// Keywords that are answered from the internal DB — no web search needed
const DB_KEYWORDS = [
  'משלוח', 'הזמנה', 'הזמנות', 'עובד', 'עובדים', 'שעות', 'חופשה',
  'משמרת', 'לקוח', 'לקוחות', 'מחסן', 'מחסנים', 'פריט', 'מוצר',
  'טלפון', 'מעסיק', 'חוב', 'סטטוס', 'נסיעה', 'מסלול', 'פספסתי',
  'ממתין', 'נמסר', 'פתוח', 'מסיים', 'מתי',
];

// Returns search results object if web search was needed, null if DB has the answer
export async function searchIfNeeded(userMessage) {
  const msg = userMessage.toLowerCase();
  const isDbQuestion = DB_KEYWORDS.some(kw => msg.includes(kw));
  if (isDbQuestion) return null;

  try {
    const res = await fetch('/api/search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query: userMessage }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
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
