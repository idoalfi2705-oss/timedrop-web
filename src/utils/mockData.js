// Fallback mock data used when ERPNext API is unavailable

export const mockClients = [
  { id: 'C001', name: 'מסעדת הגליל', bizName: 'מסעדת הגליל', contact: 'דוד לוי', phone: '054-1234567', area: 'תל אביב', debt: 2500, lastOrder: new Date(Date.now() - 2*86400000), rating: 4.5, totalOrders: 23 },
  { id: 'C002', name: 'קפה תמר', bizName: 'קפה תמר', contact: 'תמר כהן', phone: '052-9876543', area: 'חיפה', debt: 0, lastOrder: new Date(Date.now() - 5*86400000), rating: 4.8, totalOrders: 15 },
  { id: 'C003', name: 'מאפיית ירון', bizName: 'מאפיית ירון', contact: 'ירון ישראלי', phone: '050-5555555', area: 'ירושלים', debt: 800, lastOrder: new Date(Date.now() - 10*86400000), rating: 4.2, totalOrders: 8 },
  { id: 'C004', name: 'סופרמרקט שלי', bizName: 'סופרמרקט שלי', contact: 'שלי מזרחי', phone: '053-7777777', area: 'רמת גן', debt: 0, lastOrder: new Date(Date.now() - 1*86400000), rating: 4.7, totalOrders: 45 },
  { id: 'C005', name: 'מלון פלאזה', bizName: 'מלון פלאזה', contact: 'אברהם פלד', phone: '058-3333333', area: 'נתניה', debt: 5000, lastOrder: new Date(Date.now() - 7*86400000), rating: 3.9, totalOrders: 12 },
];

export const mockWorkers = [
  { id: 'W001', name: 'יוסי לוי',     phone: '054-1111111', area: 'תל אביב',  status: 'active',    onTime: 95, deliveries: 142, rating: 4.8, shift: 'בוקר',   leaveRequest: null },
  { id: 'W002', name: 'רחל מזרחי',    phone: '052-2222222', area: 'חיפה',     status: 'active',    onTime: 88, deliveries: 98,  rating: 4.5, shift: 'צהריים', leaveRequest: { type: 'sick', date: '2026-06-01' } },
  { id: 'W003', name: 'מוחמד דיאב',   phone: '050-3333333', area: 'ירושלים',  status: 'on-leave',  onTime: 92, deliveries: 67,  rating: 4.6, shift: 'ערב',    leaveRequest: null },
  { id: 'W004', name: 'נועה כהן',     phone: '053-4444444', area: 'רמת גן',   status: 'active',    onTime: 97, deliveries: 201, rating: 4.9, shift: 'בוקר',   leaveRequest: null },
  { id: 'W005', name: 'אבי גרין',     phone: '058-5555555', area: 'נתניה',    status: 'active',    onTime: 83, deliveries: 55,  rating: 4.2, shift: 'צהריים', leaveRequest: null },
];

export const mockOrders = [
  { id:'SO-LIVE', clientId:'C001', clientName:'מסעדת הגליל', date:new Date(), status:'on_the_way', total:1500, profit:525, workerName:'יוסי לוי', workerPhone:'054-1111111', workerLat:32.0953, workerLon:34.8018, items:[{name:'לחם כפרי',qty:10},{name:'שמן זית',qty:5}] },
  { id:'SO-F001', clientId:'C001', clientName:'מסעדת הגליל', date:new Date(Date.now()+1*86400000), status:'pending', total:1800, profit:630, items:[{name:'קפה',qty:15},{name:'סוכר',qty:3}] },
  { id:'SO-F002', clientId:'C001', clientName:'מסעדת הגליל', date:new Date(Date.now()+3*86400000), status:'pending', total:2100, profit:735, items:[{name:'שמן זית',qty:8},{name:'לחם כפרי',qty:6}] },
  { id:'SO-F003', clientId:'C001', clientName:'מסעדת הגליל', date:new Date(Date.now()+5*86400000), status:'pending', total:950,  profit:332, items:[{name:'קמח',qty:20}] },
  { id: 'SO-0001', clientId: 'C001', clientName: 'מסעדת הגליל',  date: new Date(Date.now() - 1*86400000),  status: 'delivered', total: 1250, profit: 437,  items: [{name:'לחם כפרי',qty:10,price:12},{name:'שמן זית',qty:5,price:45}] },
  { id: 'SO-0002', clientId: 'C002', clientName: 'קפה תמר',      date: new Date(Date.now() - 2*86400000),  status: 'pending',   total: 875,  profit: 306,  items: [{name:'קפה',qty:20,price:30},{name:'סוכר',qty:5,price:15}] },
  { id: 'SO-0003', clientId: 'C004', clientName: 'סופרמרקט שלי', date: new Date(),                         status: 'pending',   total: 3200, profit: 1120, items: [{name:'שמן',qty:50,price:25},{name:'קמח',qty:30,price:8}] },
  { id: 'SO-0004', clientId: 'C003', clientName: 'מאפיית ירון',  date: new Date(Date.now() - 3*86400000),  status: 'delivered', total: 640,  profit: 224,  items: [{name:'שמרים',qty:20,price:8},{name:'קמח',qty:50,price:8}] },
  { id: 'SO-0005', clientId: 'C005', clientName: 'מלון פלאזה',   date: new Date(Date.now() - 4*86400000),  status: 'cancelled', total: 2100, profit: 0,    items: [{name:'מים מינרליים',qty:100,price:3}] },
  { id: 'SO-0006', clientId: 'C001', clientName: 'מסעדת הגליל',  date: new Date(Date.now() - 5*86400000),  status: 'delivered', total: 980,  profit: 343,  items: [{name:'לחם כפרי',qty:8,price:12}] },
  { id: 'SO-0007', clientId: 'C002', clientName: 'קפה תמר',      date: new Date(Date.now() - 6*86400000),  status: 'delivered', total: 750,  profit: 262,  items: [{name:'קפה',qty:15,price:30}] },
  { id: 'SO-0008', clientId: 'C004', clientName: 'סופרמרקט שלי', date: new Date(Date.now() - 7*86400000),  status: 'delivered', total: 4100, profit: 1435, items: [{name:'שמן',qty:80,price:25}] },
  // orders from ~3-4 weeks ago — same items ordered repeatedly, creating high-frequency pattern
  { id: 'SO-0009', clientId: 'C002', clientName: 'קפה תמר',      date: new Date(Date.now() - 14*86400000), status: 'delivered', total: 648,  profit: 227,  items: [{name:'קפה',qty:12,price:30},{name:'סוכר',qty:3,price:15},{name:'חלב',qty:6,price:8}] },
  { id: 'SO-0010', clientId: 'C001', clientName: 'מסעדת הגליל',  date: new Date(Date.now() - 16*86400000), status: 'delivered', total: 1100, profit: 385,  items: [{name:'לחם כפרי',qty:9,price:12},{name:'שמן זית',qty:4,price:45}] },
  { id: 'SO-0011', clientId: 'C004', clientName: 'סופרמרקט שלי', date: new Date(Date.now() - 18*86400000), status: 'delivered', total: 3896, profit: 1364, items: [{name:'שמן',qty:70,price:25},{name:'קמח',qty:40,price:8},{name:'חלב',qty:20,price:8}] },
  { id: 'SO-0012', clientId: 'C002', clientName: 'קפה תמר',      date: new Date(Date.now() - 21*86400000), status: 'delivered', total: 972,  profit: 340,  items: [{name:'קפה',qty:18,price:30},{name:'חלב',qty:9,price:8}] },
  { id: 'SO-0013', clientId: 'C001', clientName: 'מסעדת הגליל',  date: new Date(Date.now() - 23*86400000), status: 'delivered', total: 840,  profit: 294,  items: [{name:'לחם כפרי',qty:7,price:12},{name:'שמן זית',qty:3,price:45}] },
  { id: 'SO-0014', clientId: 'C004', clientName: 'סופרמרקט שלי', date: new Date(Date.now() - 25*86400000), status: 'delivered', total: 2900, profit: 1015, items: [{name:'שמן',qty:60,price:25}] },
];

export const mockWarehouses = [
  { id: 'WH001', name: 'מחסן מרכזי', location: 'תל אביב', items: 142, capacity: 500, alerts: 3 },
  { id: 'WH002', name: 'מחסן צפון',  location: 'חיפה',    items: 87,  capacity: 300, alerts: 1 },
  { id: 'WH003', name: 'מחסן דרום',  location: 'באר שבע', items: 55,  capacity: 200, alerts: 0 },
];

export const mockStock = {
  WH001: [
    { id: 1, warehouseId:'WH001', name:'לחם כפרי',      sku:'ITEM001', qty:150, min:50,  unit:'יח\'',  location:'A1' },
    { id: 2, warehouseId:'WH001', name:'שמן זית',        sku:'ITEM002', qty:12,  min:30,  unit:'ליטר', location:'A2' },
    { id: 3, warehouseId:'WH001', name:'קפה',            sku:'ITEM003', qty:200, min:40,  unit:'100ג\'',location:'B1' },
    { id: 4, warehouseId:'WH001', name:'קמח',            sku:'ITEM004', qty:300, min:100, unit:'ק"ג',  location:'B2' },
    { id: 5, warehouseId:'WH001', name:'שמן קנולה',      sku:'ITEM005', qty:8,   min:25,  unit:'ליטר', location:'B3' },
  ],
  WH002: [
    { id: 6, warehouseId:'WH002', name:'מים מינרליים',  sku:'ITEM006', qty:500, min:100, unit:'בקבוק',location:'A1' },
    { id: 7, warehouseId:'WH002', name:'מיצים',         sku:'ITEM007', qty:80,  min:50,  unit:'ליטר', location:'A2' },
  ],
  WH003: [
    { id: 8, warehouseId:'WH003', name:'שמרים',         sku:'ITEM008', qty:60,  min:20,  unit:'יח\'',  location:'A1' },
  ],
};

export const mockItems = [
  { id:'ITEM001', sku:'ITEM001', name:'לחם כפרי',      description:'לחם כפרי טרי',           price:12,  unit:'יח\'',  category:'מאפים',    qty:150, supplier:'מאפיית הגדול' },
  { id:'ITEM002', sku:'ITEM002', name:'שמן זית',        description:'שמן זית כתית מעולה',     price:45,  unit:'ליטר', category:'שמנים',    qty:12,  supplier:'אגרכם' },
  { id:'ITEM003', sku:'ITEM003', name:'קפה',            description:'קפה טחון איכותי',        price:30,  unit:'100ג\'',category:'משקאות',   qty:200, supplier:'רסטה קפה' },
  { id:'ITEM004', sku:'ITEM004', name:'קמח',            description:'קמח לבן',                price:8,   unit:'ק"ג',  category:'יבשים',    qty:300, supplier:'גלילית' },
  { id:'ITEM005', sku:'ITEM005', name:'שמן קנולה',      description:'שמן קנולה למאכל',        price:25,  unit:'ליטר', category:'שמנים',    qty:8,   supplier:'אגרכם' },
  { id:'ITEM006', sku:'ITEM006', name:'מים מינרליים',   description:'מים מינרליים 1.5L',      price:3,   unit:'בקבוק',category:'משקאות',   qty:500, supplier:'נביעות' },
];

const _today = new Date().toISOString().split('T')[0];
export const mockDeliveries = [
  { id:'DN-0001', clientName:'מסעדת הגליל',  clientPhone:'054-1234567', address:'רחוב הרצל 10, תל אביב',          date:_today, status:'delivered', total:1250, arrivalTime:'08:30', drivingMinutes:18, items:[{name:'לחם כפרי',qty:10},{name:'שמן זית',qty:5}] },
  { id:'DN-0002', clientName:'קפה תמר',      clientPhone:'052-9876543', address:'שדרות רוטשילד 5, תל אביב',       date:_today, status:'delivered', total:875,  arrivalTime:'09:15', drivingMinutes:12, items:[{name:'קפה',qty:20},{name:'סוכר',qty:5}] },
  { id:'DN-0003', clientName:'סופרמרקט שלי', clientPhone:'053-7777777', address:'רחוב אבן גבירול 20, רמת גן',     date:_today, status:'pending',   total:3200, arrivalTime:'10:30', drivingMinutes:22, items:[{name:'שמן',qty:50},{name:'קמח',qty:30}] },
  { id:'DN-0004', clientName:'מלון פלאזה',   clientPhone:'058-3333333', address:'רחוב הרצוג 8, נתניה',            date:_today, status:'pending',   total:1800, arrivalTime:'12:00', drivingMinutes:35, items:[{name:'מים מינרליים',qty:100},{name:'מיצים',qty:24}] },
  { id:'DN-0005', clientName:'מאפיית ירון',  clientPhone:'050-5555555', address:'רחוב יפו 33, ירושלים',           date:_today, status:'pending',   total:640,  arrivalTime:'14:00', drivingMinutes:50, items:[{name:'שמרים',qty:20},{name:'קמח',qty:50}] },
  { id:'DN-0006', clientName:'מסעדת הים',    clientPhone:'054-9988776', address:'טיילת הציר 5, תל אביב',          date:_today, status:'pending',   total:2100, arrivalTime:'15:00', drivingMinutes:20, items:[{name:'שמן זית',qty:10},{name:'לחם כפרי',qty:15}] },
];

export const mockWorkerMonthStats = {
  hoursWorked:           84,
  vacationDaysRemaining: 12,
  vacationDaysUsed:       3,
  shiftType:             'בוקר',
  shiftStart:            '07:30',
  shiftEnd:              '16:00',
};

export const mockEmployerContact = {
  name:    'דוד כהן',
  company: 'TimeDrop',
  phone:   '052-1234567',
  email:   'david@timedrop.co.il',
};

export const mockTodayPickups = [
  { id:'WH001', name:'מחסן מרכזי', address:'רחוב הברזל 14, תל אביב',   pickupTime:'07:45', items:[{name:'לחם כפרי',qty:25},{name:'שמן זית',qty:10}] },
  { id:'WH002', name:'מחסן צפון',  address:'רחוב גיסין 10, פתח תקווה', pickupTime:'08:30', items:[{name:'קפה',qty:35},{name:'סוכר',qty:8}] },
];

export const mockClientProfile = {
  id:              'C001',
  name:            'מסעדת הגליל',
  contact:         'דוד לוי',
  phone:           '054-1234567',
  debt:            2500,
  creditLimit:     10000,
  vacationDays:    0,
  nextDelivery:    { date: new Date().toISOString().split('T')[0], time: '09:30', id: 'DN-0001' },
  lat:             32.0721,
  lon:             34.7738,
};

export const mockLeaveRequests = [
  { id:'LV001', user:{ name:'רחל מזרחי' }, type:'SICK', date:'2026-06-01' },
];

export const mockKpi = {
  todayRevenue:    12500,
  monthRevenue:    245000,
  pendingOrders:   3,
  activeWorkers:   4,
  lowStockItems:   2,
  avgDeliveryTime: 38,
};

export const mockRevenueData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const h = Math.round(3000 + Math.random() * 4000);
  return {
    date: `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`,
    הכנסות: h,
    רווח:   Math.round(h * 0.35),
  };
});

export const mockProductsData = [
  { name:'קפה',           כמות:1200, הכנסה:36000, רווח:12600 },
  { name:'שמן זית',       כמות:420,  הכנסה:18900, רווח:6615  },
  { name:'קמח',           כמות:2000, הכנסה:16000, רווח:5600  },
  { name:'לחם כפרי',      כמות:850,  הכנסה:10200, רווח:3570  },
  { name:'מים מינרליים',  כמות:3000, הכנסה:9000,  רווח:3150  },
];
