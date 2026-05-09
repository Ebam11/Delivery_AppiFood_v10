/**
 * Datos de ejemplo (Mock Data) para el panel del restaurante.
 * Estos datos se usan mientras se cargan los datos reales del servidor.
 */

export const INITIAL_ORDERS = [
  { id:'#ORD1023', date:'2026-03-20', time:'02:47 PM', customer:'María García',   type:'Dine-In',  qty:1, amount:18.00, status:'completed',  address:'-',              items:[{ name:'Classic Italian Penne', qty:1, price:18.00 }] },
  { id:'#ORD1024', date:'2026-03-20', time:'12:47 AM', customer:'Carlos López',   type:'Takeaway', qty:2, amount:24.00, status:'cancelled',   address:'-',              items:[{ name:'Pepperoni Pizza', qty:2, price:12.00 },{ name:'Garlic Bread', qty:1, price:5.00 }] },
  { id:'#ORD1025', date:'2026-03-21', time:'10:47 PM', customer:'Ana Rodríguez',  type:'Dine-In',  qty:1, amount:10.00, status:'completed',   address:'-',              items:[{ name:'Salmon Sushi Roll', qty:3, price:10.00 }] },
  { id:'#ORD1026', date:'2026-03-21', time:'01:47 PM', customer:'Dana White',     type:'Dine-In',  qty:3, amount:30.00, status:'on_process',  address:'-',              items:[{ name:'Salmon Sushi Roll', qty:3, price:10.00 },{ name:'Edamame', qty:1, price:6.00 }] },
  { id:'#ORD1027', date:'2026-03-22', time:'03:47 PM', customer:'Eve Carter',     type:'Online',   qty:1, amount:15.00, status:'completed',   address:'123 Elm Street', items:[{ name:'Spaghetti Carbonara', qty:1, price:15.00 },{ name:'Garlic Bread', qty:1, price:5.00 }] },
  { id:'#ORD1028', date:'2026-03-22', time:'11:47 AM', customer:'Frank Miller',   type:'Online',   qty:4, amount:35.00, status:'completed',   address:'456 Pine Avenue',items:[{ name:'Smokey Supreme Pizza', qty:1, price:12.00 },{ name:'Garlic Bread', qty:1, price:5.00 },{ name:'Caesar Salad', qty:2, price:8.00 },{ name:'Chocolate Lava Cake', qty:1, price:10.00 }] },
  { id:'#ORD1029', date:'2026-03-23', time:'09:47 AM', customer:'Grace Lee',      type:'Takeaway', qty:2, amount:22.00, status:'cancelled',   address:'-',              items:[{ name:'Vegan Buddha Bowl', qty:2, price:11.00 },{ name:'Iced Caramel Machiato', qty:1, price:5.00 }] },
  { id:'#ORD1030', date:'2026-03-23', time:'08:47 AM', customer:'Hannah Gold',    type:'Dine-In',  qty:3, amount:36.00, status:'on_process',  address:'-',              items:[{ name:'Grilled Chicken Delight', qty:1, price:8.00 },{ name:'Smokey Supreme Pizza', qty:2, price:12.00 }] },
]

export const INITIAL_MENU = [
  { id:1, name:'Paella Valenciana',     category:'Plato Fuerte', price:20, rating:4.8, orders:42, active:true,  img:'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop' },
  { id:2, name:'Tacos al Pastor',       category:'Plato Fuerte', price:15, rating:4.7, orders:38, active:true,  img:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop' },
  { id:3, name:'Enchiladas Suizas',     category:'Plato Fuerte', price:15, rating:4.6, orders:31, active:true,  img:'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop' },
  { id:4, name:'Ceviche Mixto',         category:'Entrada',      price:20, rating:4.9, orders:27, active:true,  img:'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop' },
  { id:5, name:'Burrito Supreme',       category:'Plato Fuerte', price:15, rating:4.5, orders:24, active:false, img:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop' },
  { id:6, name:'Churros con Chocolate', category:'Postre',       price:8,  rating:4.7, orders:19, active:true,  img:'https://images.unsplash.com/photo-1624371414361-e670edf0c6a2?w=400&h=300&fit=crop' },
  { id:7, name:'Sangría de la Casa',    category:'Bebida',       price:10, rating:4.6, orders:33, active:true,  img:'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop' },
  { id:8, name:'Guacamole Fresco',      category:'Entrada',      price:7,  rating:4.8, orders:21, active:true,  img:'https://images.unsplash.com/photo-1594568284297-7c64464062b4?w=400&h=300&fit=crop' },
]

export const REVIEWS_DATA = [
  { id:1, dish:'Paella Valenciana',     category:'Plato Fuerte', rating:5,   date:'Mar 20, 2026', text:'Un plato espectacular, el arroz perfectamente cocinado y los mariscos fresquísimos. Totalmente recomendado.',                        author:'María G.',  totalReviews:42, avgRating:4.8 },
  { id:2, dish:'Tacos al Pastor',       category:'Plato Fuerte', rating:4.5, date:'Mar 19, 2026', text:'Muy sabrosos y auténticos. La carne estaba bien marinada y las tortillas recién hechas.',                                            author:'Carlos L.', totalReviews:38, avgRating:4.7 },
  { id:3, dish:'Ceviche Mixto',         category:'Entrada',      rating:5,   date:'Mar 18, 2026', text:'El mejor ceviche que he probado. Fresco, con el punto perfecto de limón y muy bien presentado.',                                     author:'Ana R.',    totalReviews:27, avgRating:4.9 },
  { id:4, dish:'Churros con Chocolate', category:'Postre',       rating:4.7, date:'Mar 17, 2026', text:'Churros crujientes por fuera y suaves por dentro. El chocolate caliente estaba delicioso.',                                          author:'Laura S.',  totalReviews:19, avgRating:4.7 },
]

export const ACTIVITY = [
  { icon:'📦', name:'Sylvester Quilt', role:'Inventory Manager', action:'actualizó inventario - 10 unidades de "Pollo Orgánico"', time:'11:20 AM' },
  { icon:'✅', name:'Maria Kings',     role:'Kitchen Admin',     action:'marcó la orden #ORD1028 como completada',               time:'11:00 AM' },
  { icon:'📅', name:'William Smith',   role:'Receptionist',      action:'agregó una reservación para 4 personas a las 7:00 PM',  time:'10:30 AM' },
]

export const EVENT_COLORS = {
  'Meetings':     '#e71d1d',
  'Menu Updates': '#fbbf24',
  'Inventory Checks': '#6366f1',
  'Events':       '#1a202c',
}

export const NEXT_STATUS = { on_process:'completed' }

// Colores base del diseño
export const COLORS = {
  primary: '#FF4B3E',
  primaryLight: 'rgba(255, 75, 62, 0.1)',
  background: '#f8fafc',
}
