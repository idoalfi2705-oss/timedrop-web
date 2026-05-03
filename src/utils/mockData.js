import { subDays, format } from 'date-fns';

export const mockClients = [
  { id: 1, name: 'מאפיית לחם הארץ', contact: 'אבי שרון', phone: '054-1234567', area: 'תל אביב', debt: 2400, lastOrder: subDays(new Date(), 3), rating: 4.8, totalOrders: 142 },
  { id: 2, name: 'מסעדת הגליל',    contact: 'מרים נאסר', phone: '052-9876543', area: 'חיפה',    debt: 0,    lastOrder: subDays(new Date(), 1), rating: 5.0, totalOrders: 87  },
  { id: 3, name: 'סופר כרמל',      contact: 'רון ברק',   phone: '050-5551234', area: 'ירושלים', debt: 8700, lastOrder: subDays(new Date(), 7), rating: 3.9, totalOrders: 203 },
  { id: 4, name: 'מלון ים תיכון',  contact: 'שרה גולד',  phone: '053-7778899', area: 'אילת',    debt: 1200, lastOrder: subDays(new Date(), 2), rating: 4.5, totalOrders: 56  },
  { id: 5, name: 'קפה ראשון',      contact: 'יעל דוד',   phone: '054-3334455', area: 'רמת גן',  debt: 0,    lastOrder: subDays(new Date(), 0), rating: 4.7, totalOrders: 31  },
];

export const mockWorkers = [
  { id: 1, name: 'משה אברהם', phone: '052-1112233', area: 'תל אביב', status: 'active',  onTime: 94, deliveries: 18, rating: 4.8, shift: '07:00-16:00', leaveRequest: null },
  { id: 2, name: 'אורן שמעוני', phone: '054-4445566', area: 'חיפה',    status: 'active',  onTime: 88, deliveries: 12, rating: 4.3, shift: '08:00-17:00', leaveRequest: { type: 'vacation', date: format(subDays(new Date(), -2), 'yyyy-MM-dd') } },
  { id: 3, name: 'חן לביא',    phone: '050-7778899', area: 'ירושלים', status: 'sick',    onTime: 97, deliveries: 0,  rating: 4.9, shift: 'לא פעיל',    leaveRequest: { type: 'sick', date: format(new Date(), 'yyyy-MM-dd') } },
  { id: 4, name: 'נועה ריבלין', phone: '053-0001122', area: 'רמת גן',  status: 'active',  onTime: 91, deliveries: 9,  rating: 4.6, shift: '09:00-18:00', leaveRequest: null },
];

export const mockWarehouses = [
  { id: 1, name: 'מחסן תל אביב',  location: 'רחוב הברזל 12, ת"א', items: 142, capacity: 200, alerts: 3, image: null },
  { id: 2, name: 'מחסן חיפה',    location: 'רחוב הנמל 5, חיפה',    items: 87,  capacity: 150, alerts: 0, image: null },
  { id: 3, name: 'מחסן ירושלים', location: 'תעשייה הארגמן 8, י-ם',  items: 203, capacity: 250, alerts: 1, image: null },
];

export const mockWarehouseItems = [
  { id: 1, warehouseId: 1, name: 'שמן זית',     sku: 'OIL-001', qty: 45,  min: 20, location: 'מדף A3', unit: 'ליטר' },
  { id: 2, warehouseId: 1, name: 'קמח לבן',     sku: 'FLR-001', qty: 8,   min: 30, location: 'מדף B1', unit: 'ק"ג' },
  { id: 3, warehouseId: 1, name: 'סוכר',        sku: 'SUG-001', qty: 120, min: 40, location: 'מדף B2', unit: 'ק"ג' },
  { id: 4, warehouseId: 1, name: 'מלח',         sku: 'SLT-001', qty: 5,   min: 15, location: 'מדף C1', unit: 'ק"ג' },
  { id: 5, warehouseId: 2, name: 'שמן זית',     sku: 'OIL-001', qty: 30,  min: 20, location: 'מדף A1', unit: 'ליטר' },
  { id: 6, warehouseId: 2, name: 'גבינה לבנה',  sku: 'CHS-001', qty: 22,  min: 10, location: 'מדף C3', unit: 'יח' },
  { id: 7, warehouseId: 3, name: 'קמח לבן',     sku: 'FLR-001', qty: 60,  min: 30, location: 'מדף A2', unit: 'ק"ג' },
];

// Generate orders for last 30 days
export const mockOrders = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  clientId: (i % 5) + 1,
  clientName: mockClients[i % 5].name,
  date: subDays(new Date(), Math.floor(i / 2)),
  items: [
    { name: 'שמן זית', qty: Math.ceil(Math.random() * 10 + 1), price: 32, cost: 22 },
    { name: 'קמח לבן', qty: Math.ceil(Math.random() * 5 + 1),  price: 18, cost: 11 },
  ],
  status: ['delivered', 'delivered', 'delivered', 'pending', 'cancelled'][i % 5],
  workerId: (i % 4) + 1,
  total: Math.round((Math.random() * 800 + 200) * 10) / 10,
  profit: Math.round((Math.random() * 300 + 80) * 10) / 10,
}));

// Revenue by day for chart
export const revenueByDay = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'dd/MM'),
  הכנסות: Math.round(Math.random() * 4000 + 1500),
  רווח: Math.round(Math.random() * 1500 + 500),
}));

export const ordersByProduct = [
  { name: 'שמן זית',    כמות: 234, הכנסה: 7488,  רווח: 2340 },
  { name: 'קמח לבן',   כמות: 189, הכנסה: 3402,  רווח: 1323 },
  { name: 'סוכר',      כמות: 145, הכנסה: 1885,  רווח: 580  },
  { name: 'מלח',       כמות: 88,  הכנסה: 616,   רווח: 264  },
  { name: 'גבינה לבנה', כמות: 67,  הכנסה: 2345,  רווח: 804  },
];

export const kpiData = {
  todayRevenue:    12480,
  monthRevenue:    287340,
  pendingOrders:   7,
  activeWorkers:   3,
  lowStockItems:   4,
  avgDeliveryTime: 38,
};
