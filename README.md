# TimeDrop Web

מערכת ניהול משלוחים עם תמיכה ב-3 תפקידים: מעסיק, עובד, לקוח.

---

## התקנה והרצה מקומית

```bash
npm install
npm start
# http://localhost:3000
```

## משתמשי דמו לכניסה

| תפקיד | קוד ארגון | שם משתמש | סיסמא |
|--------|-----------|-----------|--------|
| מעסיק  | TD001     | david     | 1234   |
| עובד   | TD001     | yossi     | 1234   |
| לקוח   | TD001     | rachel    | 1234   |

---

## חיבור ל-ERPNext

האפליקציה מתחברת ל-ERPNext דרך Frappe REST API.  
אם אין חיבור — היא נופלת אוטומטית לנתוני Demo ללא קריסה.

### משתני סביבה

צור קובץ `.env` בשורש הפרויקט:

```env
REACT_APP_API_URL=https://your-erp.example.com
REACT_APP_API_KEY=your_api_key
REACT_APP_API_SECRET=your_api_secret
```

לקבלת API Key: ERPNext → **Settings → My Profile → API Access → Generate Keys**

### ב-Vercel (Production)

Vercel Dashboard → Project → **Settings → Environment Variables** → הוסף את 3 המשתנים → Redeploy.

---

## מפת ה-API

כל הקריאות נמצאות ב-`src/utils/api.js`.

### אימות

| פעולה | Method | Endpoint |
|-------|--------|----------|
| התחברות | POST | `/api/method/login` |

### לקוחות (`clientsAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| רשימת לקוחות | GET | `/api/resource/Customer` |
| לקוח לפי ID | GET | `/api/resource/Customer/{id}` |
| יצירת לקוח | POST | `/api/resource/Customer` |

**שדות:** `name`, `customer_name`, `mobile_no`, `territory`, `outstanding_amount`

### הזמנות (`ordersAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| רשימת הזמנות | GET | `/api/resource/Sales Order` |
| פריטי הזמנה | GET | `/api/resource/Sales Order/{id}` |
| יצירת הזמנה | POST | `/api/resource/Sales Order` |

**שדות:** `name`, `customer`, `customer_name`, `transaction_date`, `grand_total`, `status`

**מיפוי סטטוסים:**

| ERPNext | TimeDrop |
|---------|----------|
| Draft | pending |
| To Deliver | pending |
| Completed | delivered |
| Cancelled | cancelled |

### מחסנים (`warehousesAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| רשימת מחסנים | GET | `/api/resource/Warehouse` |
| מלאי מחסן | GET | `/api/resource/Bin` (filter by warehouse) |
| יצירת מחסן | POST | `/api/resource/Warehouse` |

**שדות מחסן:** `name`, `warehouse_name`, `city`  
**שדות מלאי (Bin):** `item_code`, `item_name`, `actual_qty`, `warehouse`

### פריטים (`itemsAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| רשימת פריטים | GET | `/api/resource/Item` |
| יצירת פריט | POST | `/api/resource/Item` |

**שדות:** `name`, `item_name`, `item_code`, `standard_rate`, `stock_uom`, `item_group`, `description`

### עובדים (`workersAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| רשימת עובדים | GET | `/api/resource/Employee` |
| יצירת עובד | POST | `/api/resource/Employee` |
| בקשות חופשה | GET | `/api/resource/Leave Application` |
| הגשת חופשה | POST | `/api/resource/Leave Application` |
| אישור/דחיית חופשה | PUT | `/api/resource/Leave Application/{id}` |

**שדות עובד:** `name`, `employee_name`, `cell_number`, `branch`, `status`, `designation`

### משלוחים (`deliveriesAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| משלוחי היום | GET | `/api/resource/Delivery Note` (filter by today) |
| פריטי משלוח | GET | `/api/resource/Delivery Note/{id}` |
| עדכון סטטוס | POST | `/api/resource/Delivery Note/{id}/submit` |

**שדות:** `name`, `customer_name`, `customer_address`, `posting_date`, `status`, `grand_total`

### איסופים (`pickupsAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| איסופי היום | GET | `/api/resource/Purchase Receipt` (filter by today) |

**שדות:** `name`, `supplier`, `set_warehouse`, `posting_date`

### דוחות (`reportsAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| KPI כללי | GET | `/api/resource/Sales Invoice` + `Employee` + `Bin` |
| הכנסות לפי יום | GET | `/api/resource/Sales Invoice` |
| מכירות לפי מוצר | GET | `/api/resource/Sales Order Item` |

### נתוני עובד (`workerStatsAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| נתוני חודש | GET | `/api/resource/Employee/me` |

**שדות:** `hoursWorked`, `vacationDaysRemaining`, `vacationDaysUsed`, `shiftType`, `shiftStart`, `shiftEnd`

### פרופיל לקוח (`clientProfileAPI`)

| פעולה | Method | Endpoint |
|-------|--------|----------|
| פרופיל אישי | GET | `/api/resource/Customer/me` |

**שדות:** `customer_name`, `mobile_no`, `outstanding_amount`, `credit_limit`

---

## Vercel Serverless Functions

| קובץ | נתיב | תפקיד |
|------|------|--------|
| `api/ai.js` | `/api/ai` | שיחה עם AI (Groq – Llama 3) |
| `api/search.js` | `/api/search` | חיפוש אינטרנט (Tavily) |
| `api/travel-time.js` | `/api/travel-time` | חישוב זמן נסיעה (OSRM + Nominatim) |

### משתני סביבה נוספים לפונקציות

```env
GROQ_API_KEY=your_groq_key        # AI chat — https://console.groq.com
TAVILY_API_KEY=your_tavily_key    # Web search — https://app.tavily.com
```

---

## מבנה הפרויקט

```
src/
├── components/
│   ├── layout/         # Sidebar, WorkerLayout, ClientLayout
│   └── shared/         # UI, AIChat, Chat, Notifications
├── context/            # AuthContext
├── hooks/              # useApi
├── pages/              # Dashboard, Clients, Workers, Orders, ...
└── utils/
    ├── api.js          # כל קריאות ה-ERPNext API
    ├── aiAPI.js        # AI system prompt + web search
    └── mockData.js     # נתוני Demo (fallback)
api/
├── ai.js               # Serverless: Groq AI
├── search.js           # Serverless: Tavily search
└── travel-time.js      # Serverless: OSRM routing
```

---

## Deploy ל-Vercel

```bash
npm i -g vercel
npm run build
vercel --prod
```
