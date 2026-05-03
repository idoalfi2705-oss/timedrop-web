# TimeDrop Web – Dashboard מעסיק

## התקנה והרצה מקומית

```bash
# התקנת תלויות
npm install

# הרצה מקומית
npm start
# האפליקציה תיפתח על http://localhost:3000
```

## משתמשי דמו לכניסה

| תפקיד | קוד ארגון | שם משתמש | סיסמא |
|--------|-----------|-----------|--------|
| מעסיק  | TD001     | david     | 1234   |
| עובד   | TD001     | yossi     | 1234   |
| לקוח   | TD001     | rachel    | 1234   |

## Deploy ל-Vercel

```bash
# התקנת Vercel CLI
npm i -g vercel

# Build ו-deploy
npm run build
vercel --prod
```

## מבנה הפרויקט

```
src/
├── components/
│   ├── layout/       # Sidebar, Layout, Topbar
│   └── shared/       # UI components (Button, Card, Badge...)
├── context/          # AuthContext
├── pages/            # Dashboard, Clients, Warehouses, Orders, Workers, Reports
└── utils/            # mockData (יוחלף ב-API אמיתי)
```

## שלב הבא – חיבור ל-Backend

1. צור קובץ `.env`:
```
REACT_APP_API_URL=https://your-api.com
```

2. החלף את `mockData.js` בקריאות API אמיתיות לפריוריטי
3. עדכן את `AuthContext.jsx` לאימות מול שרת אמיתי
