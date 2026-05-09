export const RESTAURANTS = [
  { id:1,  name:'La Paella Dorada',    owner:'Carlos Méndez',    email:'paella@email.com',    phone:'3001234567', city:'Popayán', status:'active',   joined:'2026-01-15', orders:142, rating:4.8 },
  { id:2,  name:'Tacos del Norte',     owner:'Ana Gutiérrez',    email:'tacos@email.com',     phone:'3109876543', city:'Popayán', status:'active',   joined:'2026-02-03', orders:98,  rating:4.6 },
  { id:3,  name:'Sushi Garden',        owner:'Kenji Tanaka',     email:'sushi@email.com',     phone:'3205551234', city:'Popayán', status:'pending',  joined:'2026-03-20', orders:0,   rating:0   },
  { id:4,  name:'Burger Bros',         owner:'Miguel Torres',    email:'burger@email.com',    phone:'3154443322', city:'Popayán', status:'pending',  joined:'2026-03-25', orders:0,   rating:0   },
]

export const USERS = [
  { id:1,  name:'María García',    email:'maria@email.com',    phone:'3001112222', city:'Popayán', status:'active',    joined:'2026-01-05', orders:24, subscription:'Premium' },
  { id:2,  name:'Carlos López',    email:'carlos@email.com',   phone:'3109993333', city:'Popayán', status:'active',    joined:'2026-01-12', orders:18, subscription:'Free'    },
]

export const ORDERS = [
  { id:'#ORD1023', date:'2026-03-20', time:'02:47 PM', customer:'María García',   restaurant:'La Paella Dorada',  type:'Dine-In',  qty:1, amount:18.00, status:'completed'  },
  { id:'#ORD1024', date:'2026-03-20', time:'12:47 AM', customer:'Carlos López',   restaurant:'Tacos del Norte',   type:'Takeaway', qty:2, amount:24.00, status:'cancelled'  },
]
