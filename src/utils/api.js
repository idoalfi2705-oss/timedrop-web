// src/utils/api.js
// חיבור ל-ERPNext דרך Frappe REST API

import {
  mockClients,
  mockOrders,
  mockWorkers,
  mockWarehouses,
  mockWarehouseItems,
  kpiData,
  revenueByDay,
  ordersByProduct,
} from './mockData';
import { mockClientOrders } from './clientMockData';
import { mockWorkerDay }    from './workerMockData';

const BASE_URL   = process.env.REACT_APP_API_URL;
const API_KEY    = process.env.REACT_APP_API_KEY;
const API_SECRET = process.env.REACT_APP_API_SECRET;

// ── Helper ───────────────────────────────────────────────────────────────────

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `token ${API_KEY}:${API_SECRET}`,
  };
}

async function req(method, endpoint, body = null, params = {}) {
  let url = `${BASE_URL}${endpoint}`;
  if (Object.keys(params).length) url += '?' + new URLSearchParams(params).toString();
  const res = await fetch(url, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.exc || 'שגיאת שרת');
  return data;
}

const fGet  = (ep, p) => req('GET',  ep, null, p || {});
const fPost = (ep, b) => req('POST', ep, b);
const fPut  = (ep, b) => req('PUT',  ep, b);

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async ({ orgCode, username, password }) => {
    const res = await fetch(`${BASE_URL}/api/method/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usr: username, pwd: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('פרטי התחברות שגויים');
    return {
      token: `${API_KEY}:${API_SECRET}`,
      user:  { name: data.full_name, role: 'employer', orgCode },
    };
  },
};

// ── Clients ───────────────────────────────────────────────────────────────────

export const clientsAPI = {
  getAll: async () => {
    try {
      const data = await fGet('/api/resource/Customer', {
        fields: JSON.stringify(['name','customer_name','mobile_no','territory','outstanding_amount']),
        limit:  100,
      });
      return (data.data || []).map(c => ({
        id:          c.name,
        name:        c.customer_name,
        contact:     c.customer_name,
        phone:       c.mobile_no || '',
        area:        c.territory || 'ישראל',
        debt:        c.outstanding_amount || 0,
        lastOrder:   new Date(),
        rating:      4.5,
        totalOrders: 0,
      }));
    } catch {
      return mockClients;
    }
  },

  getById: async (id) => {
    try {
      const data = await fGet(`/api/resource/Customer/${encodeURIComponent(id)}`);
      const c = data.data;
      return {
        id:    c.name,
        name:  c.customer_name,
        phone: c.mobile_no || '',
        area:  c.territory || 'ישראל',
        debt:  c.outstanding_amount || 0,
      };
    } catch {
      return mockClients.find(c => c.id === id) || mockClients[0];
    }
  },

  create: async (client) => {
    try {
      const data = await fPost('/api/resource/Customer', {
        customer_name: client.name,
        customer_type: 'Company',
        mobile_no:     client.phone,
        territory:     client.area || 'ישראל',
      });
      return data.data;
    } catch (e) {
      throw new Error('שגיאה ביצירת לקוח: ' + e.message);
    }
  },
};

// ── Orders ────────────────────────────────────────────────────────────────────

function mapStatus(s) {
  return ({ Draft:'pending', 'To Deliver':'pending', Completed:'delivered', Cancelled:'cancelled' })[s] || 'pending';
}

export const ordersAPI = {
  getAll: async (params = {}) => {
    try {
      const filters = [];
      if (params.status)   filters.push(['status',   '=', params.status]);
      if (params.clientId) filters.push(['customer', '=', params.clientId]);
      const data = await fGet('/api/resource/Sales Order', {
        fields:   JSON.stringify(['name','customer','customer_name','transaction_date','grand_total','status']),
        limit:    100,
        order_by: 'transaction_date desc',
        ...(filters.length ? { filters: JSON.stringify(filters) } : {}),
      });
      return (data.data || []).map(o => ({
        id:         o.name,
        clientId:   o.customer,
        clientName: o.customer_name,
        date:       new Date(o.transaction_date),
        status:     mapStatus(o.status),
        total:      o.grand_total || 0,
        profit:     Math.round((o.grand_total || 0) * 0.35),
        workerId:   null,
      }));
    } catch {
      const list = mockOrders;
      if (params.clientId) return list.filter(o => o.clientId === params.clientId);
      return list;
    }
  },

  getItems: async (id) => {
    try {
      const data = await fGet(`/api/resource/Sales Order/${encodeURIComponent(id)}`);
      return (data.data?.items || []).map(i => ({
        name:  i.item_name,
        qty:   i.qty,
        price: i.rate,
        cost:  i.rate * 0.65,
      }));
    } catch {
      return mockOrders.find(o => o.id === id)?.items || [];
    }
  },

  create: async (order) => {
    try {
      const data = await fPost('/api/resource/Sales Order', {
        customer:         order.clientId,
        transaction_date: new Date().toISOString().split('T')[0],
        delivery_date:    order.deliveryDate || new Date().toISOString().split('T')[0],
        items: (order.items || []).map(i => ({
          item_code: i.sku || i.name,
          qty:       i.qty,
          rate:      i.price,
        })),
      });
      return data.data;
    } catch (e) {
      throw new Error('שגיאה ביצירת הזמנה: ' + e.message);
    }
  },
};

// ── Warehouses ────────────────────────────────────────────────────────────────

export const warehousesAPI = {
  getAll: async () => {
    try {
      const data = await fGet('/api/resource/Warehouse', {
        fields: JSON.stringify(['name','warehouse_name','city']),
        limit:  50,
      });
      return (data.data || []).map(w => ({
        id:       w.name,
        name:     w.warehouse_name,
        location: w.city || '',
        items:    0,
        capacity: 200,
        alerts:   0,
      }));
    } catch {
      return mockWarehouses;
    }
  },

  getStock: async (warehouseId) => {
    try {
      const data = await fGet('/api/resource/Bin', {
        fields:  JSON.stringify(['item_code','item_name','actual_qty','warehouse']),
        filters: JSON.stringify([['warehouse', '=', warehouseId]]),
        limit:   200,
      });
      return (data.data || []).map((b, i) => ({
        id:          i + 1,
        warehouseId: warehouseId,
        name:        b.item_name || b.item_code,
        sku:         b.item_code,
        qty:         b.actual_qty || 0,
        min:         20,
        unit:        'יח\'',
        location:    '',
      }));
    } catch {
      return mockWarehouseItems.filter(i => i.warehouseId === warehouseId);
    }
  },
};

// ── Items ─────────────────────────────────────────────────────────────────────

export const itemsAPI = {
  getAll: async () => {
    try {
      const data = await fGet('/api/resource/Item', {
        fields: JSON.stringify(['name','item_name','item_code','standard_rate','stock_uom','item_group']),
        limit:  200,
      });
      return (data.data || []).map(i => ({
        id:       i.name,
        name:     i.item_name,
        sku:      i.item_code,
        price:    i.standard_rate || 0,
        unit:     i.stock_uom || 'יח\'',
        category: i.item_group || 'כללי',
      }));
    } catch {
      return [];
    }
  },

  create: async (item) => {
    try {
      const data = await fPost('/api/resource/Item', {
        item_name:     item.name,
        item_code:     item.sku || item.name,
        standard_rate: item.price,
        stock_uom:     item.unit || 'Nos',
        item_group:    item.category || 'All Item Groups',
        is_stock_item: 1,
      });
      return data.data;
    } catch (e) {
      throw new Error('שגיאה ביצירת פריט: ' + e.message);
    }
  },
};

// ── Workers ───────────────────────────────────────────────────────────────────

export const workersAPI = {
  getAll: async () => {
    try {
      const data = await fGet('/api/resource/Employee', {
        fields: JSON.stringify(['name','employee_name','cell_number','branch','status','designation']),
        limit:  100,
      });
      return (data.data || []).map(e => ({
        id:           e.name,
        name:         e.employee_name,
        phone:        e.cell_number || '',
        area:         e.branch || '',
        status:       e.status === 'Active' ? 'active' : 'inactive',
        onTime:       90,
        deliveries:   0,
        rating:       4.5,
        shift:        e.designation || '',
        leaveRequest: null,
      }));
    } catch {
      return mockWorkers;
    }
  },

  getLeaveRequests: async () => {
    try {
      const data = await fGet('/api/resource/Leave Application', {
        fields:  JSON.stringify(['name','employee','employee_name','leave_type','from_date','status']),
        filters: JSON.stringify([['status', '=', 'Open']]),
        limit:   20,
      });
      return (data.data || []).map(r => ({
        id:   r.name,
        user: { name: r.employee_name },
        type: r.leave_type === 'Sick Leave' ? 'SICK' : 'VACATION',
        date: r.from_date,
      }));
    } catch {
      return mockWorkers
        .filter(w => w.leaveRequest)
        .map(w => ({
          id:   w.id,
          user: { name: w.name },
          type: w.leaveRequest.type === 'sick' ? 'SICK' : 'VACATION',
          date: w.leaveRequest.date,
        }));
    }
  },

  submitLeave: async (leaveData) => {
    try {
      const data = await fPost('/api/resource/Leave Application', {
        employee:   leaveData.employeeId,
        leave_type: leaveData.type === 'sick' ? 'Sick Leave' : 'Casual Leave',
        from_date:  leaveData.fromDate,
        to_date:    leaveData.toDate || leaveData.fromDate,
        status:     'Open',
      });
      return data.data;
    } catch (e) {
      throw new Error('שגיאה בשליחת בקשה: ' + e.message);
    }
  },

  respondLeave: async (id, { status }) => {
    try {
      const data = await fPut(`/api/resource/Leave Application/${encodeURIComponent(id)}`, {
        status: status === 'APPROVED' ? 'Approved' : 'Rejected',
      });
      return data.data;
    } catch {
      return { success: true };
    }
  },
};

// ── Deliveries ────────────────────────────────────────────────────────────────

export const deliveriesAPI = {
  getToday: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await fGet('/api/resource/Delivery Note', {
        fields:  JSON.stringify(['name','customer_name','posting_date','status','grand_total']),
        filters: JSON.stringify([['posting_date', '=', today]]),
        limit:   50,
      });
      return (data.data || []).map(d => ({
        id:         d.name,
        clientName: d.customer_name,
        date:       d.posting_date,
        status:     d.status === 'Submitted' ? 'delivered' : 'pending',
        total:      d.grand_total,
      }));
    } catch {
      return mockWorkerDay.tasks.map((t, i) => ({
        id:         i + 1,
        clientName: t.clientName,
        date:       new Date().toISOString().split('T')[0],
        status:     t.done ? 'delivered' : 'pending',
        total:      (t.items || []).reduce((s, it) => s + it.price * it.qty, 0),
      }));
    }
  },

  updateStatus: async (id, { status }) => {
    try {
      if (status === 'delivered') {
        await fPost(`/api/resource/Delivery Note/${encodeURIComponent(id)}/submit`, {});
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  },
};

// ── Reports / KPI ─────────────────────────────────────────────────────────────

export const reportsAPI = {
  getKpi: async () => {
    try {
      const today        = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const todayStr     = today.toISOString().split('T')[0];

      const [monthInv, todayInv, pending, lowStock] = await Promise.all([
        fGet('/api/resource/Sales Invoice', {
          fields:  JSON.stringify(['grand_total']),
          filters: JSON.stringify([['posting_date','>=',firstOfMonth],['docstatus','=',1]]),
          limit:   500,
        }),
        fGet('/api/resource/Sales Invoice', {
          fields:  JSON.stringify(['grand_total']),
          filters: JSON.stringify([['posting_date','=',todayStr],['docstatus','=',1]]),
          limit:   100,
        }),
        fGet('/api/resource/Sales Order', {
          fields:  JSON.stringify(['name']),
          filters: JSON.stringify([['status','in',['Draft','To Deliver']]]),
          limit:   100,
        }),
        fGet('/api/resource/Bin', {
          fields:  JSON.stringify(['item_code','actual_qty']),
          filters: JSON.stringify([['actual_qty','<',20]]),
          limit:   50,
        }),
      ]);

      return {
        todayRevenue:    (todayInv.data || []).reduce((s, i) => s + (i.grand_total || 0), 0),
        monthRevenue:    (monthInv.data || []).reduce((s, i) => s + (i.grand_total || 0), 0),
        pendingOrders:   (pending.data  || []).length,
        activeWorkers:   mockWorkers.filter(w => w.status === 'active').length,
        lowStockItems:   (lowStock.data  || []).length,
        avgDeliveryTime: 38,
      };
    } catch {
      return kpiData;
    }
  },

  getRevenueByDay: async (days = 30) => {
    try {
      const dates = Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        return d.toISOString().split('T')[0];
      });
      const data = await fGet('/api/resource/Sales Invoice', {
        fields:  JSON.stringify(['posting_date','grand_total']),
        filters: JSON.stringify([
          ['posting_date','>=', dates[0]],
          ['posting_date','<=', dates[dates.length - 1]],
          ['docstatus','=',1],
        ]),
        limit: 1000,
      });
      const byDate = {};
      (data.data || []).forEach(inv => {
        const d = inv.posting_date;
        if (!byDate[d]) byDate[d] = { הכנסות: 0, רווח: 0 };
        byDate[d].הכנסות += inv.grand_total || 0;
        byDate[d].רווח   += (inv.grand_total || 0) * 0.35;
      });
      return dates.map(d => ({
        date:    d.slice(5).replace('-', '/'),
        הכנסות: Math.round(byDate[d]?.הכנסות || 0),
        רווח:   Math.round(byDate[d]?.רווח   || 0),
      }));
    } catch {
      return revenueByDay;
    }
  },

  getOrdersByProduct: async () => {
    try {
      const data = await fGet('/api/resource/Sales Order Item', {
        fields:   JSON.stringify(['item_name','qty','amount']),
        limit:    500,
        order_by: 'amount desc',
      });
      const byItem = {};
      (data.data || []).forEach(i => {
        if (!byItem[i.item_name]) byItem[i.item_name] = { כמות: 0, הכנסה: 0, רווח: 0 };
        byItem[i.item_name].כמות  += i.qty    || 0;
        byItem[i.item_name].הכנסה += i.amount || 0;
        byItem[i.item_name].רווח  += (i.amount || 0) * 0.35;
      });
      return Object.entries(byItem).map(([name, v]) => ({ name, ...v }));
    } catch {
      return ordersByProduct;
    }
  },
};

// ── Client Portal ─────────────────────────────────────────────────────────────

export const clientPortalAPI = {
  getProfile: async (customerId) => {
    try {
      return await clientsAPI.getById(customerId);
    } catch {
      return mockClientOrders[0] || {};
    }
  },

  getOrders: async (customerId) => {
    try {
      return await ordersAPI.getAll({ clientId: customerId });
    } catch {
      return mockClientOrders;
    }
  },
};
