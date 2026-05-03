export const mockWorkerDay = {
  workerName: 'משה אברהם',
  breakTime: '12:30 – 13:00',
  endTime: '16:00',

  pickups: [
    {
      warehouse: 'מחסן תל אביב',
      address: 'רחוב הברזל 12, תל אביב',
      items: [
        { name: 'שמן זית',  qty: 12, unit: 'ליטר', location: 'מדף A3' },
        { name: 'קמח לבן',  qty: 8,  unit: 'ק"ג',  location: 'מדף B1' },
        { name: 'סוכר',     qty: 5,  unit: 'ק"ג',  location: 'מדף B2' },
      ]
    },
    {
      warehouse: 'מחסן רמת גן',
      address: 'רחוב ביאליק 4, רמת גן',
      items: [
        { name: 'גבינה לבנה', qty: 10, unit: 'יח', location: 'מדף C1' },
      ]
    }
  ],

  tasks: [
    {
      id: 1,
      clientName: 'מאפיית לחם הארץ',
      address: 'רחוב דיזנגוף 55, תל אביב',
      phone: '054-1234567',
      eta: '09:30',
      isStorage: false,
      done: false,
      items: [
        { name: 'שמן זית',  qty: 5,  price: 32 },
        { name: 'קמח לבן',  qty: 4,  price: 18 },
        { name: 'סוכר',     qty: 3,  price: 12 },
      ]
    },
    {
      id: 2,
      clientName: 'קפה ראשון',
      address: 'שדרות ירושלים 22, רמת גן',
      phone: '054-3334455',
      eta: '10:15',
      isStorage: false,
      done: false,
      items: [
        { name: 'גבינה לבנה', qty: 6, price: 28 },
        { name: 'שמן זית',    qty: 3, price: 32 },
      ]
    },
    {
      id: 3,
      clientName: null,
      address: 'מחסן רמת גן – רחוב ביאליק 4',
      phone: null,
      eta: '11:00',
      isStorage: true,
      done: false,
      items: [
        { name: 'קמח לבן', qty: 4, price: 0 },
      ]
    },
    {
      id: 4,
      clientName: 'מסעדת הגליל',
      address: 'רחוב אלנבי 100, תל אביב',
      phone: '052-9876543',
      eta: '13:30',
      isStorage: false,
      done: false,
      items: [
        { name: 'שמן זית',    qty: 4, price: 32 },
        { name: 'גבינה לבנה', qty: 4, price: 28 },
        { name: 'סוכר',       qty: 2, price: 12 },
      ]
    },
  ]
};
