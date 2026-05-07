import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../api/fetchJson'
import { useAuthStore } from '../store/authStore'
import LanguageSwitcher from '../components/LanguageSwitcher'

const P  = '#FF4B3E'
const PL = 'rgba(255, 75, 62, 0.1)'
const BG = '#f8fafc'
const toPercent = (value, max = 100) => {
  const safeMax = Math.max(Number(max) || 0, 1)
  const safeValue = Number(value) || 0
  return `${Math.max(0, Math.min(100, (safeValue / safeMax) * 100))}%`
}
const generateMockSeries = ({ points = 8, base = 80, wave = 18, trend = 2, floor = 12 }) => (
  Array.from({ length: points }, (_, i) => {
    const val = base + Math.sin((i + 1) * 0.85) * wave + i * trend + ((i % 2) ? 4 : -3)
    return Math.max(floor, Math.round(val))
  })
)

const INITIAL_ORDERS = [
  { id:'#ORD1023', date:'2026-03-20', time:'02:47 PM', customer:'María García',   type:'Dine-In',  qty:1, amount:18.00, status:'completed',  address:'-',              items:[{ name:'Classic Italian Penne', qty:1, price:18.00 }] },
  { id:'#ORD1024', date:'2026-03-20', time:'12:47 AM', customer:'Carlos López',   type:'Takeaway', qty:2, amount:24.00, status:'cancelled',   address:'-',              items:[{ name:'Pepperoni Pizza', qty:2, price:12.00 },{ name:'Garlic Bread', qty:1, price:5.00 }] },
  { id:'#ORD1025', date:'2026-03-21', time:'10:47 PM', customer:'Ana Rodríguez',  type:'Dine-In',  qty:1, amount:10.00, status:'completed',   address:'-',              items:[{ name:'Salmon Sushi Roll', qty:3, price:10.00 }] },
  { id:'#ORD1026', date:'2026-03-21', time:'01:47 PM', customer:'Dana White',     type:'Dine-In',  qty:3, amount:30.00, status:'on_process',  address:'-',              items:[{ name:'Salmon Sushi Roll', qty:3, price:10.00 },{ name:'Edamame', qty:1, price:6.00 }] },
  { id:'#ORD1027', date:'2026-03-22', time:'03:47 PM', customer:'Eve Carter',     type:'Online',   qty:1, amount:15.00, status:'completed',   address:'123 Elm Street', items:[{ name:'Spaghetti Carbonara', qty:1, price:15.00 },{ name:'Garlic Bread', qty:1, price:5.00 }] },
  { id:'#ORD1028', date:'2026-03-22', time:'11:47 AM', customer:'Frank Miller',   type:'Online',   qty:4, amount:35.00, status:'completed',   address:'456 Pine Avenue',items:[{ name:'Smokey Supreme Pizza', qty:1, price:12.00 },{ name:'Garlic Bread', qty:1, price:5.00 },{ name:'Caesar Salad', qty:2, price:8.00 },{ name:'Chocolate Lava Cake', qty:1, price:10.00 }] },
  { id:'#ORD1029', date:'2026-03-23', time:'09:47 AM', customer:'Grace Lee',      type:'Takeaway', qty:2, amount:22.00, status:'cancelled',   address:'-',              items:[{ name:'Vegan Buddha Bowl', qty:2, price:11.00 },{ name:'Iced Caramel Machiato', qty:1, price:5.00 }] },
  { id:'#ORD1030', date:'2026-03-23', time:'08:47 AM', customer:'Hannah Gold',    type:'Dine-In',  qty:3, amount:36.00, status:'on_process',  address:'-',              items:[{ name:'Grilled Chicken Delight', qty:1, price:8.00 },{ name:'Smokey Supreme Pizza', qty:2, price:12.00 }] },
]

const INITIAL_MENU = [
  { id:1, name:'Paella Valenciana',     category:'Plato Fuerte', price:20, rating:4.8, orders:42, active:true,  img:'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop' },
  { id:2, name:'Tacos al Pastor',       category:'Plato Fuerte', price:15, rating:4.7, orders:38, active:true,  img:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop' },
  { id:3, name:'Enchiladas Suizas',     category:'Plato Fuerte', price:15, rating:4.6, orders:31, active:true,  img:'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop' },
  { id:4, name:'Ceviche Mixto',         category:'Entrada',      price:20, rating:4.9, orders:27, active:true,  img:'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop' },
  { id:5, name:'Burrito Supreme',       category:'Plato Fuerte', price:15, rating:4.5, orders:24, active:false, img:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop' },
  { id:6, name:'Churros con Chocolate', category:'Postre',       price:8,  rating:4.7, orders:19, active:true,  img:'https://images.unsplash.com/photo-1624371414361-e670edf0c6a2?w=400&h=300&fit=crop' },
  { id:7, name:'Sangría de la Casa',    category:'Bebida',       price:10, rating:4.6, orders:33, active:true,  img:'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop' },
  { id:8, name:'Guacamole Fresco',      category:'Entrada',      price:7,  rating:4.8, orders:21, active:true,  img:'https://images.unsplash.com/photo-1594568284297-7c64464062b4?w=400&h=300&fit=crop' },
]

const REVIEWS_DATA = [
  { id:1, dish:'Paella Valenciana',     category:'Plato Fuerte', rating:5,   date:'Mar 20, 2026', text:'Un plato espectacular, el arroz perfectamente cocinado y los mariscos fresquísimos. Totalmente recomendado.',                        author:'María G.',  totalReviews:42, avgRating:4.8 },
  { id:2, dish:'Tacos al Pastor',       category:'Plato Fuerte', rating:4.5, date:'Mar 19, 2026', text:'Muy sabrosos y auténticos. La carne estaba bien marinada y las tortillas recién hechas.',                                            author:'Carlos L.', totalReviews:38, avgRating:4.7 },
  { id:3, dish:'Ceviche Mixto',         category:'Entrada',      rating:5,   date:'Mar 18, 2026', text:'El mejor ceviche que he probado. Fresco, con el punto perfecto de limón y muy bien presentado.',                                     author:'Ana R.',    totalReviews:27, avgRating:4.9 },
  { id:4, dish:'Churros con Chocolate', category:'Postre',       rating:4.7, date:'Mar 17, 2026', text:'Churros crujientes por fuera y suaves por dentro. El chocolate caliente estaba delicioso.',                                          author:'Laura S.',  totalReviews:19, avgRating:4.7 },
]

const CONTACTS = [
  { id:1, name:'Alice Johnson',  role:'Customer',      time:'09:23 AM', lastMsg:'Absolutely! We\'ll reserve a window table for y...', unread:0, online:true  },
  { id:2, name:'Bob Smith',      role:'Customer',      time:'09:15 AM', lastMsg:'Thanks for the great service yesterday!',            unread:0, online:false },
  { id:3, name:'Charlie Brown',  role:'Customer',      time:'09:05 AM', lastMsg:'Could you confirm the ingredients in the Truff...',  unread:3, online:false },
  { id:4, name:'Maria Kings',    role:'Kitchen Admin', time:'08:58 AM', lastMsg:'I had an issue with my last order. Can we disc...',  unread:1, online:true  },
  { id:5, name:'Eve Carter',     role:'Customer',      time:'08:20 PM', lastMsg:'Is there a gluten-free option for the main cou...',  unread:2, online:false },
  { id:6, name:'Frank Miller',   role:'Customer',      time:'08:14 AM', lastMsg:'Please confirm my order details before delive...',  unread:2, online:true  },
]

const mapRestaurantReview = (rev) => ({
  id: rev.id,
  dish: rev.product?.name || rev.dish || 'Plato',
  category: rev.product?.category?.name || rev.category || 'General',
  rating: Number(rev.rating || 0),
  date: rev.created_at ? new Date(rev.created_at).toLocaleDateString() : (rev.date || ''),
  text: rev.comment || rev.text || '',
  author: rev.user?.name || rev.author || 'Cliente',
  totalReviews: rev.product?.reviews_count || 0,
  avgRating: rev.product?.average_rating || 0,
  featured: Boolean(rev.is_featured),
  response: rev.reply || rev.response || ''
})

const normalizeRestaurantStatus = (status) => status || 'pending'

const mapRestaurantOrder = (order) => {
  const items = Array.isArray(order?.items)
    ? order.items.map((item) => ({
        name: item.name || item.product_name || 'Producto',
        qty: item.quantity || item.qty || 1,
        price: Number(item.unit_price ?? item.price ?? item.subtotal ?? 0),
      }))
    : []

  const totalItems = items.reduce((sum, item) => sum + Number(item.qty || 0), 0)
  const createdAt = order?.created_at ? new Date(order.created_at) : null

  return {
    id: order?.id ? `#ORD${order.id}` : `#ORD-${Date.now()}`,
    date: createdAt ? createdAt.toISOString().slice(0, 10) : '',
    time: createdAt ? createdAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '',
    customer: order?.customer_name || order?.user?.name || 'Cliente',
    type: order?.delivery_address ? 'Online' : 'Dine-In',
    qty: totalItems || items.length || 1,
    amount: Number(order?.total ?? order?.subtotal ?? 0),
    status: normalizeRestaurantStatus(order?.status),
    address: order?.delivery_address || '-',
    items,
  }
}

const mapRestaurantProduct = (product) => {
  const getImageUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop';
    if (path.startsWith('http')) return path;
    const baseUrl = API_URL.replace('/api', '').replace(/\/$/, '');
    return `${baseUrl}/storage/${path.replace(/^\/+/, '')}`;
  };

  return {
    id: product?.id,
    name: product?.name || 'Producto',
    description: product?.description || '',
    price: Number(product?.price ?? 0),
    category_id: product?.category_id,
    category: product?.category?.name || product?.category_name || 'Sin categoría',
    img: getImageUrl(product?.image || product?.img),
    rating: Number(product?.rating ?? 0),
    orders: Number(product?.orders ?? 0),
    active: Boolean(product?.is_available),
  };
};
const CALENDAR_EVENTS = [
  { id:1, title:'Weekly Specials Review',    type:'Menu Updates', date:'2026-04-07', start:'3:00 PM',  end:'4:00 PM',  location:'Kitchen',             team:['Head Chef','Sous Chef'],         notes:'Finalize weekly specials and update menu options for the coming week.' },
  { id:2, title:'Private Dining Event',      type:'Events',       date:'2026-04-07', start:'7:00 PM',  end:'10:00 PM', location:'Private Dining Room', team:['Event Coordinator','Head Chef'],  notes:'VIP client reservation; provide personalized service with customized menu and decor.' },
  { id:3, title:'Weekly Team Check-In',      type:'Meetings',     date:'2026-04-04', start:'9:00 AM',  end:'10:00 AM', location:'Conference Room',     team:['All Staff'],                     notes:'Weekly team alignment meeting.' },
  { id:4, title:'Monthly Staff Meeting',     type:'Meetings',     date:'2026-04-15', start:'10:00 AM', end:'11:30 AM', location:'Main Hall',           team:['All Staff'],                     notes:'Monthly review of performance and goals.' },
  { id:5, title:'New Dessert Recipe Tasting',type:'Menu Updates', date:'2026-04-16', start:'1:00 PM',  end:'2:00 PM',  location:'Kitchen',             team:['Head Chef','Pastry Chef'],       notes:'Taste and approve new dessert options.' },
  { id:6, title:'Staff Skill Training',      type:'Meetings',     date:'2026-04-10', start:'1:00 PM',  end:'3:00 PM',  location:'Training Room',       team:['All Staff'],                     notes:'Quarterly skills training session.' },
  { id:7, title:'Cocktail Menu Planning',    type:'Menu Updates', date:'2026-04-17', start:'5:00 PM',  end:'6:00 PM',  location:'Bar Area',            team:['Head Bartender'],                notes:'Plan new cocktail menu for next season.' },
  { id:8, title:'Wine Tasting Night',        type:'Events',       date:'2026-04-29', start:'6:00 PM',  end:'8:00 PM',  location:'Dining Room',         team:['Sommelier'],                     notes:'Wine tasting event for premium customers.' },
]

const EVENT_COLORS = {
  'Meetings':     '#e71d1d',
  'Menu Updates': '#fbbf24',
  'Inventory Checks': '#6366f1',
  'Events':       '#1a202c',
}

const ACTIVITY = [
  { icon:'📦', name:'Sylvester Quilt', role:'Inventory Manager', action:'actualizó inventario - 10 unidades de "Pollo Orgánico"', time:'11:20 AM' },
  { icon:'✅', name:'Maria Kings',     role:'Kitchen Admin',     action:'marcó la orden #ORD1028 como completada',               time:'11:00 AM' },
  { icon:'📅', name:'William Smith',   role:'Receptionist',      action:'agregó una reservación para 4 personas a las 7:00 PM',  time:'10:30 AM' },
]

const NEXT_STATUS = { on_process:'completed' }

function Stars({ rating, size = 'text-sm' }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={size} style={{ color: s <= Math.floor(rating) ? P : '#e5e7eb' }}>★</span>
      ))}
    </span>
  )
}

function Badge({ status }) {
  const { t } = useTranslation()
  const config = {
    pending:    { color: '#fbbf24', bg: '#fffbeb', text: 'orders.status_pending' },
    confirmed:  { color: '#6366f1', bg: '#eef2ff', text: 'orders.status_confirmed' },
    preparing:  { color: '#a855f7', bg: '#f5f3ff', text: 'orders.status_preparing' },
    on_the_way: { color: '#06b6d4', bg: '#ecfeff', text: 'orders.status_on_the_way' },
    delivered:  { color: '#10b981', bg: '#f0fdf4', text: 'orders.status_delivered' },
    completed:  { color: '#10b981', bg: '#f0fdf4', text: 'orders.status_delivered' },
    cancelled:  { color: '#ef4444', bg: '#fef2f2', text: 'orders.status_cancelled' },
  }
  const c = config[status] || config.pending
  return (
    <span className="px-3 py-1 rounded-lg text-xs font-semibold" 
      style={{ background: c.bg, color: c.color }}>
      {t(c.text)}
    </span>
  )
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white" style={{ background: P }}>
      ✓ {message}
    </div>
  )
}

function OrderDetailModal({ order, onClose, onAdvance, onStatusChange }) {
  const { t } = useTranslation()
  if (!order) return null
  const total = order.items.reduce((s, i) => s + i.price * i.qty, 0)
  const TRACKING = [
    { label: t('rd.order_delivered'),  done: order.status === 'completed' },
    { label: t('rd.on_the_way'),       done: order.status === 'completed' },
    { label: t('rd.preparing'),        done: order.status !== 'cancelled' },
    { label: t('rd.order_confirmed'),  done: true },
    { label: t('rd.order_received'),   done: true },
  ]
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-800">{t('rd.order_id')}</h2>
            <span className="font-bold" style={{ color: P }}>{order.id}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{order.type}</span>
            <Badge status={order.status} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="font-semibold text-gray-800 text-sm">{t('rd.order_list')}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[t('rd.item'), t('rd.qty'), t('rd.price'), t('rd.total')].map(h => (
                    <th key={h} className="text-left px-5 py-2 text-xs font-semibold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-5 py-3 text-gray-500">{item.qty}</td>
                    <td className="px-5 py-3" style={{ color: P }}>${item.price.toFixed(2)}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-between">
              <span className="text-sm text-gray-500">{t('rd.total_amount')}</span>
              <span className="font-bold text-gray-800">${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold text-gray-800 text-sm mb-4">{t('rd.customer_col')}</p>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2" style={{ background: P }}>
                  {order.customer.charAt(0)}
                </div>
                <p className="font-semibold text-gray-800">{order.customer}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('rd.address')}</span>
                  <span className="text-gray-700 font-medium">{order.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('rd.type_col')}</span>
                  <span className="text-gray-700 font-medium">{order.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('rd.hour')}</span>
                  <span className="text-gray-700 font-medium">{order.time}</span>
                </div>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold text-gray-800 text-sm mb-4">{t('rd.order_tracking')}</p>
              <div className="space-y-3">
                {TRACKING.map((trk, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: trk.done ? P : '#e5e7eb', color: trk.done ? 'white' : '#9ca3af' }}>
                      {trk.done ? '✓' : '○'}
                    </div>
                    <p className={`text-sm font-medium ${trk.done ? 'text-gray-800' : 'text-gray-400'}`}>{trk.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('rd.update_status')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => { onStatusChange(order.id, st); onClose() }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${order.status === st ? 'text-white border-red-500' : 'text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                  style={order.status === st ? { background: P } : {}}
                >
                  {t(`orders.status_${st}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ active, onNav, open, onClose, user, onLogout }) {
  const { t } = useTranslation()
  const NAV_SECTIONS = [
    {
      title: t('rd.main_group', { defaultValue: 'Principal' }),
      items: [
        { id:'dashboard',       icon:'⊞', label: t('rd.dashboard') },
        { id:'orders',          icon:'☰', label: t('rd.orders') },
        { id:'calendar',        icon:'📅', label: t('rd.calendar') },
        { id:'messages',        icon:'💬', label: t('rd.messages') },
      ]
    },
    {
      title: t('rd.management_group', { defaultValue: 'Gestión' }),
      items: [
        { id:'menu',            icon:'🍽', label: t('rd.menu') },
        { id:'inventory',       icon:'📦', label: t('rd.inventory') },
        { id:'promotions',      icon:'🎯', label: t('rd.promotions') },
      ]
    },
    {
      title: t('rd.admin_group', { defaultValue: 'Administración' }),
      items: [
        { id:'analytics',       icon:'📈', label: t('rd.analytics') },
        { id:'reviews',         icon:'★',  label: t('rd.reviews') },
        { id:'restaurant-info', icon:'🏪', label: t('rd.restaurant_info') },
      ]
    }
  ]
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-[220px] bg-white border-r border-gray-100 z-50
        flex flex-col transition-transform duration-300 shadow-sm
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="px-5 py-5 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: P }}>A</div>
            <span className="font-bold text-gray-800 text-base capitalize">AppiFood</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <button key={item.id} onClick={() => { onNav(item.id); onClose() }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all
                      ${active === item.id ? 'text-white font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                    style={active === item.id ? { background: P } : {}}>
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-4 pb-5 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: P }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'R'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || t('rd.restaurant_info')}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
            🚪 {t('rd.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}

function TopBar({ title, breadcrumb, onMenuOpen, user }) {
  const { t } = useTranslation()
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuOpen} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500">☰</button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{title}</h1>
          {breadcrumb && (
            <p className="text-xs text-gray-400">
              <span className="cursor-pointer hover:underline" style={{ color: P }}>{t('rd.breadcrumb_dashboard')}</span>
              {breadcrumb.map((b, i) => (
                <span key={i}> / <span className="text-gray-400">{b}</span></span>
              ))}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <span className="text-gray-400 text-sm">🔍</span>
          <input placeholder={t('rd.search')} className="bg-transparent text-sm outline-none w-32 text-gray-600 placeholder-gray-400" />
        </div>
        <LanguageSwitcher />
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500">🔔</button>
        <div className="flex items-center gap-2 border-l border-gray-100 pl-4 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">{user?.name || t('rd.restaurant_info')}</p>
            <p className="text-xs text-gray-400">{t('rd.restaurant_label')}</p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: P }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'R'}
          </div>
        </div>
      </div>
    </header>
  )
}

function DashboardSection({ orders, menu, stats, loading }) {
  const { t } = useTranslation()
  
  // Usar datos del backend si están disponibles, sino usar datos locales
  const totalOrders = stats?.orders?.total || orders.length
  const totalRevenue = stats?.revenue?.total || orders.reduce((s,o) => s + o.amount, 0)
  const completedOrders = stats?.orders?.total ? Math.round(stats.orders.total * 0.75) : orders.filter(o => o.status === 'completed').length
  
  const avgOrderAmount = totalOrders ? totalRevenue / totalOrders : 18
  const BARS_INCOME  = generateMockSeries({ points: 8, base: Math.round(avgOrderAmount * 2.2), wave: 16, trend: 2, floor: 35 })
  const BARS_EXPENSE = BARS_INCOME.map((v, i) => Math.max(16, Math.round(v * (0.38 + (i % 3) * 0.04))))
  const MONTHS = ['Mar','Abr','May','Jun','Jul','Ago','Sep','Oct']
  const WEEK   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  const WEEK_ORDERS = generateMockSeries({ points: 7, base: Math.max(totalOrders * 14, 85), wave: 24, trend: 3, floor: 40 })
  const maxV = Math.max(...WEEK_ORDERS, 1)

  const recentOrders = orders.slice(0, 3)
  const trending     = menu.slice(0, 3)

  return (
    <div className="space-y-6">
      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          {t('rd.loading_data') || "Cargando datos del restaurante..."}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t('rd.total_orders'), value: totalOrders,                       trend:'+1.58%', icon:'📋' },
          { label: t('rd.completed'),    value: completedOrders,                    trend:'+0.42%', icon:'✅' },
          { label: t('rd.income'),       value:`$${totalRevenue.toLocaleString()}`, trend:'+2.36%', icon:'💰' },
        ].map((m,i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: PL }}>{m.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{m.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{m.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: P }}>↑ {m.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-gray-400">{t('rd.total_revenue')}</p>
              <p className="text-2xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: P }} />{t('rd.incomes')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-800 inline-block" />{t('rd.expenses')}</span>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[520px] flex items-end gap-2 h-44 pr-2">
              {BARS_INCOME.map((h,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{ height:'100%' }}>
                    <div className="w-full rounded-sm" style={{ height: toPercent(BARS_EXPENSE[i], 100), background:'#1a202c', opacity:0.85 }} />
                    <div className="w-full rounded-sm" style={{ height: toPercent(Math.max(0, h - BARS_EXPENSE[i]), 100), background: P }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.top_categories')}</p>
            <span className="text-xs text-gray-400">{t('rd.this_month')}</span>
          </div>
          <div className="flex justify-center my-3">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={P}        strokeWidth="3.5" strokeDasharray="45 55" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a202c"  strokeWidth="3.5" strokeDasharray="25 75" strokeDashoffset="-45" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fbbf24"  strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="-70" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb"  strokeWidth="3.5" strokeDasharray="10 90" strokeDashoffset="-90" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs font-bold text-gray-700">100%</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: t('rd.main_dishes'), pct:'45%', color: P },
              { label: t('rd.drinks'),      pct:'25%', color:'#1a202c' },
              { label: t('rd.starters'),    pct:'20%', color:'#fbbf24' },
              { label: t('rd.desserts'),    pct:'10%', color:'#e5e7eb' },
            ].map((c,i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-gray-600">{c.label}</span>
                </span>
                <span className="font-semibold text-gray-700">{c.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.orders_overview')}</p>
            <span className="text-xs text-gray-400">{t('rd.this_week')}</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[500px] flex items-end gap-3 h-40 pr-2">
              {WEEK_ORDERS.map((v,i) => {
                const isMax = v === maxV
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {isMax && (
                      <div className="text-xs text-white px-2 py-0.5 rounded-lg whitespace-nowrap mb-1" style={{ background:'#1a202c' }}>
                        {v} {t('rd.orders_label')}
                      </div>
                    )}
                    <div className="w-full rounded-xl transition-all" style={{ height: toPercent(v, maxV), background: isMax ? P : PL }} />
                    <span className="text-[10px] text-gray-400">{WEEK[i]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.order_types')}</p>
            <span className="text-xs text-gray-400">{t('rd.today')}</span>
          </div>
          {[
            { label:'Dine-In',  count:75, pct:45, color: P },
            { label:'Takeaway', count:60, pct:30, color:'#fbbf24' },
            { label:'Online',   count:65, pct:25, color:'#1a202c' },
          ].map((tp,i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: tp.color }} />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{tp.label}</span>
                  <span className="font-bold text-gray-800">{tp.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${tp.pct}%`, background: tp.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.recent_orders')}</p>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: P, background: PL }}>{t('rd.view_all')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[t('rd.order_id'), t('rd.menu_col'), t('rd.qty'), t('rd.amount'), t('rd.customer'), t('rd.status')].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-500">{o.id}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{o.items[0]?.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{o.qty}</td>
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color: P }}>${o.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{o.customer}</td>
                    <td className="px-5 py-3"><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.recent_activity')}</p>
            <span className="text-gray-400 text-sm cursor-pointer">···</span>
          </div>
          <div className="space-y-4">
            {ACTIVITY.map((a,i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: PL }}>{a.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-800">
                    <span className="font-semibold">{a.name}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded text-gray-500 bg-gray-100 text-xs">{a.role}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-800 text-sm">{t('rd.trending_menus')}</p>
          <span className="text-xs text-gray-400">{t('rd.this_week')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trending.map(item => (
            <div key={item.id} className="rounded-xl overflow-hidden border border-gray-100">
              <img src={item.img} alt={item.name} className="w-full h-32 object-cover" onError={e => { e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' }} />
              <div className="p-3">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{item.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">⭐ {item.rating} · {item.orders} {t('rd.orders_label')}</span>
                  <span className="font-bold text-sm" style={{ color: P }}>${item.price}.00</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OrdersSection({ orders, onAdvance, onStatusChange }) {
  const { t } = useTranslation()
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [selected, setSelected] = useState(null)

  const counts = {
    all:        orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    preparing:  orders.filter(o => o.status === 'preparing' || o.status === 'confirmed').length,
    on_the_way: orders.filter(o => o.status === 'on_the_way').length,
    delivered:  orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
    cancelled:  orders.filter(o => o.status === 'cancelled').length,
  }

  const visible = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
    return matchStatus && matchSearch
  })

  const FILTERS = [
    { key:'all',        label: t('rd.all') },
    { key:'pending',    label: t('orders.status_pending') },
    { key:'preparing',  label: t('orders.status_preparing') },
    { key:'on_the_way', label: t('orders.status_on_the_way') },
    { key:'delivered',  label: t('orders.status_delivered') },
    { key:'cancelled',  label: t('orders.status_cancelled') },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('rd.total_orders_col'), value: counts.all,        icon:'📋', color: P },
          { label: t('orders.status_pending'), value: counts.pending,    icon:'⏳', color:'#f59e0b' },
          { label: t('orders.status_preparing'), value: counts.preparing,  icon:'👨‍🍳', color:'#a855f7' },
          { label: t('orders.status_delivered'), value: counts.delivered,  icon:'✅', color:'#10b981' },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background:`${s.color}20` }}>{s.icon}</div>
              <span className="text-xs text-gray-400">···</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={filter === f.key ? { background: P, color:'white' } : { color:'#6b7280' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400 text-sm">🔍</span>
            <input placeholder={t('rd.search_order')} value={search} onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none w-40 text-gray-600 placeholder-gray-400" />
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setViewMode('table')}
              className="px-3 py-2 text-xs font-semibold transition"
              style={viewMode === 'table' ? { background: P, color:'white' } : { color:'#6b7280' }}>
              {t('rd.table_view')}
            </button>
            <button onClick={() => setViewMode('cards')}
              className="px-3 py-2 text-xs font-semibold transition"
              style={viewMode === 'cards' ? { background: P, color:'white' } : { color:'#6b7280' }}>
              {t('rd.cards_view')}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {[t('rd.order_id'), t('rd.date'), t('rd.customer'), t('rd.type'), t('rd.qty'), t('rd.amount'), t('rd.status'), t('rd.action')].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: P }}>{o.id}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{o.date} {o.time}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{o.customer}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: P }} />{o.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{o.qty}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: P }}>${o.amount.toFixed(2)}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}><Badge status={o.status} /></td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select 
                        value={o.status} 
                        onChange={(e) => onStatusChange(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-red-500 bg-white"
                      >
                        {['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(st => (
                          <option key={st} value={st}>{t(`orders.status_${st}`)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            {t('rd.showing')} {visible.length} {t('rd.of')} {orders.length} {t('rd.orders_count')}
          </div>
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(o => (
            <div key={o.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setSelected(o)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">{o.date} · {o.time}</p>
                  <p className="font-bold text-gray-800 text-lg mt-0.5">{o.customer}</p>
                  <p className="font-semibold text-xs mt-0.5" style={{ color: P }}>{o.id}</p>
                  <span className="text-xs text-gray-400">{o.type}</span>
                </div>
                <Badge status={o.status} />
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">{t('rd.items_col')}</p>
                <div className="space-y-1">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x{item.qty}</span>
                      <span className="text-gray-500">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">{t('rd.total')}</span>
                <span className="font-bold" style={{ color: P }}>${o.amount.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                <button className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition" onClick={() => setSelected(o)}>
                  {t('rd.view_details')}
                </button>
                <select 
                  value={o.status} 
                  onChange={(e) => onStatusChange(o.id, e.target.value)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white outline-none focus:border-red-500"
                >
                  {['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(st => (
                    <option key={st} value={st}>{t(`orders.status_${st}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onAdvance={id => { onAdvance(id); setSelected(null) }}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  )
}
function MenuSection({ menu, categories, onAdd, onDelete }) {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [catFilter, setCatFilter] = useState('Todos')
  const [search,    setSearch]    = useState('')
  const [form, setForm] = useState({ name:'', description:'', price:'', category_id: '', img:'', file:null, newCategoryName: '' })
  const [isNewCat, setIsNewCat] = useState(false)
  const [preview, setPreview] = useState(null)

  const SUGGESTIONS = ['Plato Fuerte', 'Entrada', 'Postre', 'Bebida', 'Desayuno', 'Comida', 'Snacks', 'Ensaladas']
  const CATEGORIES = [t('rd.all_categories'), ...categories.map(c => c.name)]

  const visible = menu
    .filter(m => catFilter === t('rd.all_categories') || catFilter === 'Todos' || m.category?.name === catFilter || m.category === catFilter)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setForm(f => ({ ...f, img: url, file }))
  }

  const submit = () => {
    if (!form.name || !form.price) {
      alert('Por favor completa el nombre y el precio');
      return;
    }
    if (!form.category_id && !form.newCategoryName) {
      alert('Por favor selecciona o escribe una categoría');
      return;
    }
    onAdd(form)
    setForm({ name:'', description:'', price:'', category_id:'', img:'', file:null, newCategoryName: '' })
    setIsNewCat(false)
    setPreview(null)
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-400">{menu.filter(m => m.active).length} {t('rd.active_dishes')} {menu.length} {t('rd.total_dishes')}</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400 text-sm">🔍</span>
            <input placeholder={t('rd.search_dish')} value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none w-32 text-gray-600 placeholder-gray-400" />
          </div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
            {t('rd.add_dish')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border transition"
            style={catFilter === c ? { background: P, color:'white', borderColor: P } : { background:'white', color:'#6b7280', borderColor:'#e5e7eb' }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visible.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="relative">
              <img src={item.img} alt={item.name} className="w-full h-40 object-cover" onError={e => { e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' }} />
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${item.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                {item.active ? t('rd.active_badge') : t('rd.inactive_badge')}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-0.5">{item.category?.name || item.category}</p>
              <p className="font-bold text-gray-800 text-sm">{item.name}</p>
              <div className="flex items-center justify-between mt-2 mb-3">
                <span className="text-xs text-gray-400">⭐ {item.rating} · {item.orders} {t('rd.orders_label')}</span>
                <span className="font-bold" style={{ color: P }}>${item.price}.00</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">{t('rd.edit')}</button>
                <button onClick={() => onDelete(item.id)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition">{t('rd.delete')}</button>
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">{t('rd.no_dishes')}</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-800">{t('rd.new_dish')}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.dish_photo')}</label>
                <div className="relative">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl" />
                      <button onClick={() => { setPreview(null); setForm(f => ({ ...f, img:'' })) }}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70 transition">×</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#e71d1d] hover:bg-red-50 transition">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-xs text-gray-400">{t('rd.photo_upload')}</span>
                      <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.name')}</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Ej: Tacos al Pastor" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.description')}</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} rows={2} placeholder={t('rd.desc_placeholder')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.price_label')}</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price:e.target.value }))} placeholder="0.00" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.category')}</label>
                  <div className="flex gap-2">
                     {!isNewCat ? (
                       <select value={form.category_id} onChange={e => {
                         const val = e.target.value
                         if (val === 'NEW') {
                           setIsNewCat(true)
                           setForm(f => ({ ...f, category_id: '', newCategoryName: '' }))
                         } else if (val.startsWith('SUGGEST:')) {
                           const name = val.replace('SUGGEST:', '')
                           setForm(f => ({ ...f, category_id: '', newCategoryName: name }))
                         } else {
                           setForm(f => ({ ...f, category_id: val, newCategoryName: '' }))
                         }
                       }} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]">
                         <option value="">Seleccionar...</option>
                         {categories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                         ))}
                         <hr />
                         {SUGGESTIONS.map(s => (
                           <option key={s} value={`SUGGEST:${s}`}>Sugerencia: {s}</option>
                         ))}
                         <option value="NEW" className="font-bold text-[#e71d1d]">+ Nueva categoría...</option>
                       </select>
                     ) : (
                       <div className="flex-1 flex gap-2">
                         <input type="text" value={form.newCategoryName} onChange={e => setForm(f => ({ ...f, newCategoryName:e.target.value }))} placeholder="Nombre de categoría" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
                         <button onClick={() => setIsNewCat(false)} className="px-2 text-gray-400 hover:text-gray-600">✕</button>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">{t('rd.cancel')}</button>
              <button onClick={submit} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>{t('rd.add_btn')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewsSection({ reviews, onReply, showToast, t }) {
  const [selected,   setSelected]   = useState(null)
  const [response,   setResponse]   = useState('')
  const [filterFeat, setFilterFeat] = useState('all')

  const MONTHS   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const POS_DATA = [80,120,100,140,160,130,170,174,150,160,140,155]
  const NEG_DATA = [30, 40, 25, 50, 45, 35, 55, 50, 40, 45, 35, 40]
  const maxBar   = Math.max(...POS_DATA, 1)

  const RATINGS = [
    { label: t('rd.food_quality') || 'Calidad de Comida', value:4.8 },
    { label: t('rd.service')      || 'Servicio',          value:4.6 },
    { label: t('rd.ambiance')     || 'Ambiente',          value:4.7 },
    { label: t('rd.price_value')  || 'Precio/Valor',      value:4.5 },
    { label: t('rd.cleanliness')  || 'Limpieza',          value:4.9 },
  ]

  const visible = reviews.filter(r =>
    filterFeat === 'all' ||
    (filterFeat === 'featured' && r.featured) ||
    (filterFeat === 'pending' && !r.response)
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.ratings')}</p>
            <span className="text-xs text-gray-400">{t('rd.this_month')}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center flex-shrink-0">
              <p className="text-5xl font-black text-gray-800">4.7</p>
              <div className="flex justify-center gap-0.5 my-1">
                {[1,2,3,4,5].map(s => <span key={s} className="text-lg" style={{ color: P }}>★</span>)}
              </div>
              <p className="text-xs text-gray-400">350 Reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {RATINGS.map((r,i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="font-bold text-gray-700">{r.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${(r.value/5)*100}%`, background: P }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.review_stats')}</p>
            <span className="text-xs text-gray-400">{t('rd.this_year')}</span>
          </div>
          <div className="flex items-center gap-4 text-xs mb-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: P }} />{t('rd.positive')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-800" />{t('rd.negative')}</span>
          </div>
          <div className="flex items-end gap-1 h-32">
            {POS_DATA.map((p,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height:'100%' }}>
                  <div className="w-full rounded-sm" style={{ height: toPercent(NEG_DATA[i], maxBar), background:'#1a202c' }} />
                  <div className="w-full rounded-sm" style={{ height: toPercent(Math.max(0, p - NEG_DATA[i]), maxBar), background: P }} />
                </div>
                <span className="text-xs text-gray-300">{MONTHS[i].charAt(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[['all', t('rd.all_reviews')],['featured', t('rd.featured')],['pending', t('rd.pending_reply')]].map(([key,label]) => (
          <button key={key} onClick={() => setFilterFeat(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
            style={filterFeat === key ? { background: P, color:'white', borderColor: P } : { background:'white', color:'#6b7280', borderColor:'#e5e7eb' }}>
            {label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{t('rd.reply_review')}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-800 text-sm">{selected.author}</p>
              <p className="text-xs text-gray-500 mt-1">{selected.text}</p>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5].map(s => <span key={s} className="text-sm" style={{ color: s <= Math.floor(selected.rating) ? '#f59e0b' : '#e5e7eb' }}>★</span>)}
              </div>
            </div>
            <textarea value={response} onChange={e => setResponse(e.target.value)} rows={4}
              placeholder={t('rd.reply_placeholder')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d] resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">{t('rd.cancel')}
                
              </button>

                  <button
                    onClick={() => { onReply(selected.id, response); setSelected(null); setResponse('') }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
                    {t('rd.send')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex gap-2 flex-wrap">
                {['All Rating','All Category','All Menu'].map(f => (
                  <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition">{f} ▾</button>
                ))}
              </div>
              <span className="text-xs text-gray-400">{t('rd.this_year')}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {visible.map(r => (
                <div key={r.id} className={`flex gap-4 px-5 py-4 hover:bg-gray-50 transition ${r.featured ? 'border-l-4' : ''}`} style={r.featured ? { borderColor: P } : {}}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {/* Buscamos la imagen en el menu o usamos placeholder */}
                    <img src={INITIAL_MENU.find(m => m.name === r.dish)?.img || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'}
                      alt={r.dish} className="w-full h-full object-cover"
                      onError={e => { e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 text-sm">{r.dish}</p>
                          {r.featured && <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: P }}>{t('rd.featured_badge')}</span>}
                        </div>
                        <p className="text-xs text-gray-400">{r.category}</p>
                        <p className="text-xs text-gray-400 mt-0.5">⭐ {r.rating} · {r.date}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-0.5 justify-end">
                          {[1,2,3,4,5].map(s => <span key={s} className="text-sm" style={{ color: s <= Math.floor(r.rating) ? P : '#e5e7eb' }}>★</span>)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed italic">"{r.text}"</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: P }}>- {r.author}</p>
                    
                    {r.response && (
                      <div className="mt-3 p-3 rounded-xl bg-gray-50 border-l-4" style={{ borderColor: P }}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('rd.restaurant_reply') || 'Respuesta del Restaurante'}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{r.response}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setSelected(r); setResponse(r.response || '') }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                        {r.response ? t('rd.edit_reply') : t('rd.reply_btn')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              {t('rd.showing')} {visible.length} {t('rd.of')} {reviews.length} {t('rd.showing_reviews')}
            </div>
          </div>
        </div>
      )
    }

function MessagesSection() {
  const { t } = useTranslation()
  const [activeContact, setActiveContact] = useState(CONTACTS[0])
  const [messages, setMessages]           = useState(INITIAL_MESSAGES)
  const [input, setInput]                 = useState('')

  const send = () => {
    if (!input.trim()) return
    const newMsg = { id: Date.now(), from:'me', text: input.trim(), time: new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }) }
    setMessages(prev => ({ ...prev, [activeContact.id]: [...(prev[activeContact.id] || []), newMsg] }))
    setInput('')
  }

  const currentMsgs = messages[activeContact.id] || []

  return (
    <div className="flex gap-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height:'calc(100vh - 140px)' }}>
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <input placeholder={t('rd.search_msg')} className="bg-transparent text-sm outline-none flex-1 text-gray-600 placeholder-gray-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CONTACTS.map(c => (
            <div key={c.id} onClick={() => setActiveContact(c)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50 ${activeContact.id === c.id ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: P }}>
                  {c.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                {c.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 truncate">{c.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{c.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-gray-400 truncate flex-1">{c.lastMsg}</span>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ml-1" style={{ background: P }}>{c.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: P }}>
                {activeContact.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              {activeContact.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{activeContact.name}</p>
              <p className="text-xs" style={{ color: activeContact.online ? '#10b981' : '#9ca3af' }}>
                {activeContact.online ? t('rd.online') : t('rd.offline')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['📞','🎥','⊡'].map((icon, i) => (
              <button key={i} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition">{icon}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-center text-xs text-gray-400">Today, {new Date().toLocaleDateString('es-CO', { month:'short', day:'numeric' })}</p>
          {currentMsgs.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${msg.from === 'me' ? 'text-white' : 'bg-gray-100 text-gray-800'}`}
                style={msg.from === 'me' ? { background: PL, color: '#1a202c' } : {}}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-right text-gray-500' : 'text-gray-400'}`}>{msg.time} {msg.from === 'me' && '✓✓'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 text-xl">😊</button>
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={t('rd.type_msg')}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
            <button className="text-gray-400 hover:text-gray-600">📎</button>
          </div>
          <button onClick={send} className="px-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition" style={{ background: P }}>
            {t('rd.send_btn')}
          </button>
        </div>
      </div>
    </div>
  )
}

function CalendarSection() {
  const { t } = useTranslation()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear())
  const [events,       setEvents]       = useState(CALENDAR_EVENTS)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [newEvent, setNewEvent] = useState({ title:'', type:'Meetings', date:'', start:'', end:'', location:'', notes:'' })

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  const firstDay    = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const getEventsForDay = day => {
    const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.date === dateStr)
  }

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1) } else setCurrentMonth(m => m-1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1) } else setCurrentMonth(m => m+1) }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    setEvents(prev => [...prev, { ...newEvent, id: Date.now() }])
    setNewEvent({ title:'', type:'Meetings', date:'', start:'', end:'', location:'', notes:'' })
    setShowAddModal(false)
  }

  const EVENT_TYPE_COUNTS = Object.entries(
    events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {})
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">‹</button>
          <h2 className="font-bold text-gray-800">{MONTHS_ES[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">›</button>
        </div>
        <div className="flex items-center gap-2">
          {EVENT_TYPE_COUNTS.map(([type, count]) => (
            <span key={type} className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ background: EVENT_COLORS[type] || '#6b7280' }} />
              {type} ({count})
            </span>
          ))}
          <button onClick={() => setShowAddModal(true)} className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition flex items-center gap-1" style={{ background: P }}>
            {t('rd.add_schedule')}
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_ES.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-gray-50 p-2" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayEvents = getEventsForDay(day)
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
              return (
                <div key={day} className="min-h-[100px] border-b border-r border-gray-50 p-2 hover:bg-gray-50 transition">
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'text-white' : 'text-gray-600'}`}
                    style={isToday ? { background: P } : {}}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0,2).map(ev => (
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                        className="px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer truncate hover:opacity-80 transition text-white"
                        style={{ background: EVENT_COLORS[ev.type] || '#6b7280' }}>
                        {ev.title}
                        <span className="block text-xs opacity-80">{ev.start} - {ev.end}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-400 pl-1">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedEvent && (
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-sm">{t('rd.schedule_details')}</p>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-bold text-gray-800">{selectedEvent.title}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: EVENT_COLORS[selectedEvent.type] || '#6b7280' }}>
                  {selectedEvent.type}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <p>📅 {selectedEvent.date}</p>
                <p>🕐 {selectedEvent.start} - {selectedEvent.end}</p>
                <p>📍 {selectedEvent.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">{t('rd.team')}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.team.map((tm, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{tm}</span>
                  ))}
                </div>
              </div>
              {selectedEvent.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">{t('rd.notes')}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{selectedEvent.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800">{t('rd.new_schedule')}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              {[
                { label: t('rd.title_label'),    key:'title',    type:'text' },
                { label: t('rd.date_label'),      key:'date',     type:'date' },
                { label: t('rd.start_label'),     key:'start',    type:'time' },
                { label: t('rd.end_label'),       key:'end',      type:'time' },
                { label: t('rd.location_label'),  key:'location', type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} value={newEvent[f.key]} onChange={e => setNewEvent(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.type_schedule')}</label>
                <select value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]">
                  {Object.keys(EVENT_COLORS).map(tp => <option key={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.notes_label')}</label>
                <textarea value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">{t('rd.cancel')}</button>
              <button onClick={addEvent} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>{t('rd.add_btn')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InventorySection({ token, showToast }) {
  const { t } = useTranslation()
  const [tab,       setTab]       = useState('inventory')
  const [inventory, setInventory] = useState([])
  const [purchases, setPurchases] = useState([])
  const [invFilter, setInvFilter] = useState('all')
  const [poFilter,  setPoFilter]  = useState('all')
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const loadInv = async () => {
      try {
        setLoading(true)
        const [invRes, poRes] = await Promise.all([
          fetchJson('/api/restaurant/inventory', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetchJson('/api/restaurant/purchases', { headers: { 'Authorization': `Bearer ${token}` } })
        ])
        setInventory(invRes.data || invRes || [])
        setPurchases(poRes.data || poRes || [])
      } catch (err) {
        console.error('Error loading inventory:', err)
      } finally {
        setLoading(false)
      }
    }
    loadInv()
  }, [token])

  const STATUS_INV = {
    available: { label: t('rd.available'),     bg:'bg-green-100',  text:'text-green-700' },
    low:       { label: t('rd.low'),           bg:'bg-gray-100',   text:'text-gray-600'  },
    out:       { label: t('rd.out_of_stock'),  bg:'bg-gray-800',   text:'text-white'     },
  }
  const STATUS_PO = {
    pending:   { label: t('rd.pending'),   bg:'bg-gray-100',   text:'text-gray-600'   },
    shipped:   { label: t('rd.shipped'),   bg:'bg-yellow-100', text:'text-yellow-700' },
    delivered: { label: t('rd.delivered'), bg:'bg-orange-100', text:'text-orange-600' },
  }

  const visibleInv = inventory
    .filter(i => invFilter === 'all' || i.status === invFilter)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  const visiblePo = purchases
    .filter(p => poFilter === 'all' || p.status === poFilter)
    .filter(p => p.item.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase()))

  const SUPPLY_BARS   = [230,210,240,220,261,235,225,230]
  const SUPPLY_MONTHS = ['Mar','Abr','May','Jun','Jul','Ago','Sep','Oct']
  const maxSupply = Math.max(...SUPPLY_BARS, 1)
  const totalInventory = Math.max(inventory.length, 1)

  const inStock  = inventory.filter(i => i.status === 'available').length
  const lowStock = inventory.filter(i => i.status === 'low').length
  const outStock = inventory.filter(i => i.status === 'out').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-gray-400">{t('rd.supply_overview')}</p>
              <p className="text-3xl font-bold text-gray-800">{purchases.reduce((s,p) => s + p.total, 0).toLocaleString()}</p>
            </div>
            <span className="text-xs text-gray-400">{t('rd.last_8_months')}</span>
          </div>
          <div className="flex items-end gap-2 h-32 mt-4">
            {SUPPLY_BARS.map((v,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: toPercent(v, maxSupply), background: P }} />
                <span className="text-xs text-gray-400">{SUPPLY_MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400">{t('rd.stock_level')}</p>
            <span className="text-xs text-gray-400">{t('rd.this_month')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-3">{inventory.length} <span className="text-sm font-normal text-gray-400">{t('rd.products')}</span></p>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-4">
            <div style={{ width: toPercent(inStock, totalInventory), background: P }} />
            <div style={{ width: toPercent(lowStock, totalInventory), background:'#fbbf24' }} />
            <div style={{ width: toPercent(outStock, totalInventory), background:'#1a202c' }} />
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: P }} />{t('rd.in_stock')} <strong>{inStock}</strong></span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />{t('rd.low_stock')} <strong>{lowStock}</strong></span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-800" />{t('rd.out_stock')} <strong>{outStock}</strong></span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {[['inventory', t('rd.inventory_tab')],['purchases', t('rd.purchase_tab')]].map(([key,label]) => (
            <button key={key} onClick={() => { setTab(key); setSearch('') }}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition"
              style={tab === key ? { background: P, color:'white' } : { color:'#6b7280' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400 text-sm">🔍</span>
            <input placeholder={t('rd.search')} value={search} onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none w-36 text-gray-600 placeholder-gray-400" />
          </div>
          {tab === 'inventory' && (
            <button className="px-3 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition" style={{ background: P }}>{t('rd.add_product')}</button>
          )}
          {tab === 'purchases' && (
            <button className="px-3 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition" style={{ background: P }}>{t('rd.add_purchase')}</button>
          )}
        </div>
      </div>

      {tab === 'inventory' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {[['all', t('rd.all')],['available', t('rd.available')],['low', t('rd.low')],['out', t('rd.out_of_stock')]].map(([key,label]) => (
              <button key={key} onClick={() => setInvFilter(key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition"
                style={invFilter === key ? { background: P, color:'white', borderColor: P } : { background:'white', color:'#6b7280', borderColor:'#e5e7eb' }}>
                {label}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {[t('rd.item'), t('rd.category_col'), t('rd.status'), t('rd.qty_stock'), t('rd.qty_reorder'), t('rd.action')].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleInv.map(item => {
                    const cfg = STATUS_INV[item.status]
                    const pct = Math.min((item.qty / Math.max(item.reorder, 1)) * 100, 100)
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">{item.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{item.category}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:`${pct}%`, background: item.status === 'out' ? '#1a202c' : item.status === 'low' ? '#fbbf24' : P }} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{item.qty}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.reorder}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition">{t('rd.reorder_btn')}</button>
                            <button className="px-3 py-1 rounded-lg text-xs text-white hover:opacity-90 transition" style={{ background: P }}>{t('rd.update_stock')}</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              {t('rd.showing')} {visibleInv.length} {t('rd.of')} {inventory.length} {t('rd.showing_products')}
            </div>
          </div>
        </>
      )}

      {tab === 'purchases' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {[['all', t('rd.all')],['pending', t('rd.pending')],['shipped', t('rd.shipped')],['delivered', t('rd.delivered')]].map(([key,label]) => (
              <button key={key} onClick={() => setPoFilter(key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition"
                style={poFilter === key ? { background: P, color:'white', borderColor: P } : { background:'white', color:'#6b7280', borderColor:'#e5e7eb' }}>
                {label}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {[t('rd.order_id'), t('rd.item'), t('rd.vendor'), t('rd.price'), t('rd.qty'), t('rd.total'), t('rd.status'), t('rd.delivery_col'), t('rd.action')].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visiblePo.map(po => {
                    const cfg = STATUS_PO[po.status]
                    return (
                      <tr key={po.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-semibold" style={{ color: P }}>{po.id}</p>
                          <p className="text-xs text-gray-400">{po.date}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-sm">{po.item}</p>
                          <p className="text-xs text-gray-400">{po.category}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{po.vendor}</td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: P }}>${po.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{po.qty}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">${po.total.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:`${po.delivery}%`, background: po.delivery === 100 ? P : '#fbbf24' }} />
                            </div>
                            <span className="text-xs text-gray-500">{po.delivery}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button className="px-3 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition">{t('rd.receive_btn')}</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              {t('rd.showing')} {visiblePo.length} {t('rd.of')} {purchases.length} {t('rd.showing_orders_po')}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PromotionsSection({ token, showToast }) {
  const { t } = useTranslation()
  const [promos, setPromos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title:'', type:'percentage', discount:'', minOrder:'',
    startDate:'', endDate:''
  })

  useEffect(() => {
    const loadPromos = async () => {
      try {
        setLoading(true)
        const res = await fetchJson('/api/restaurant/promotions', { headers: { 'Authorization': `Bearer ${token}` } })
        setPromos(res.data || res || [])
      } catch (err) {
        console.error('Error loading promos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPromos()
  }, [token])

  const PROMO_TYPES = {
    percentage: { label: t('subscription.plan_free_f3') !== '' ? '% Descuento' : '% Descuento', icon:'%'   },
    '2x1':      { label:'2x1',          icon:'2×1' },
    free_ship:  { label: t('rd.shipped') !== '' ? 'Envío Gratis' : 'Envío Gratis', icon:'🚚' },
    free_item:  { label:'Item Gratis',   icon:'🎁'  },
  }

  const submit = async () => {
    if (!form.title || !form.startDate || !form.endDate) return
    try {
      const res = await fetchJson('/api/restaurant/promotions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, active: true })
      })
      setPromos(prev => [...prev, res.data || res])
      setForm({ title:'', type:'percentage', discount:'', minOrder:'', startDate:'', endDate:'' })
      setShowModal(false)
      showToast(t('rd.promo_created'))
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  const toggle = async (id) => {
    try {
      await fetchJson(`/api/restaurant/promotions/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  const deletePromo = async (id) => {
    if (!window.confirm(t('rd.confirm_delete'))) return
    try {
      await fetchJson(`/api/restaurant/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPromos(prev => prev.filter(p => p.id !== id))
      showToast(t('rd.promo_deleted'))
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  const activeCount = promos.filter(p => p.active).length
  const totalUses   = promos.reduce((s, p) => s + p.uses, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('rd.active_promos'),  value: activeCount,                icon:'🎯', color: P },
          { label: t('rd.total_promos'),   value: promos.length,              icon:'📋', color:'#6b7280' },
          { label: t('rd.total_uses'),     value: totalUses,                  icon:'📊', color:'#10b981' },
          { label: t('rd.inactive_promos'),value: promos.length - activeCount,icon:'⏸', color:'#fbbf24' },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background:`${k.color}20` }}>{k.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{promos.length} {t('rd.total_promos_count')}</p>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
          {t('rd.new_promo')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map(promo => (
          <div key={promo.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition ${promo.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: P }}>
                {PROMO_TYPES[promo.type]?.icon}
              </div>
              <button onClick={() => toggle(promo.id)}
                className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
                style={{ background: promo.active ? P : '#e5e7eb' }}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${promo.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="font-bold text-gray-800 text-sm mb-1">{promo.title}</p>
            <p className="text-xs text-gray-400 mb-3">{promo.target}</p>
            <div className="space-y-1.5 text-xs text-gray-500 mb-4">
              <div className="flex justify-between">
                <span>{t('rd.promo_type')}</span>
                <span className="font-medium text-gray-700">{PROMO_TYPES[promo.type]?.label}</span>
              </div>
              {promo.discount > 0 && (
                <div className="flex justify-between">
                  <span>{t('rd.discount')}</span>
                  <span className="font-medium text-gray-700">{promo.discount}%</span>
                </div>
              )}
              {promo.minOrder > 0 && (
                <div className="flex justify-between">
                  <span>{t('rd.min_order')}</span>
                  <span className="font-medium text-gray-700">${promo.minOrder}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('rd.validity')}</span>
                <span className="font-medium text-gray-700">{promo.startDate} → {promo.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('rd.uses')}</span>
                <span className="font-medium" style={{ color: P }}>{promo.uses} {t('rd.times')}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">{t('rd.edit')}</button>
              <button onClick={() => deletePromo(promo.id)}
                className="flex-1 py-1.5 border border-gray-100 rounded-lg text-xs font-semibold text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition">
                {t('rd.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800">{t('rd.new_promo_title')}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.promo_title')}</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('rd.promo_title_ph')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.promo_type')}</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]">
                    {Object.entries(PROMO_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.discount_pct')}</label>
                  <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.min_order_label')}</label>
                <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.start_date')}</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.end_date')}</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('rd.target')}</label>
                <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]">
                  <option>{t('rd.target_all')}</option>
                  <option>{t('rd.target_new')}</option>
                  <option>{t('rd.target_recurring')}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">{t('rd.cancel')}</button>
              <button onClick={submit} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>{t('rd.create_btn')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AnalyticsSection({ stats }) {
  const { t } = useTranslation()
  
  const analytics = stats?.analytics || {
    hourlyOrders: [],
    avgTicket: [],
    avgTicketMonths: [],
    topDishes: [],
    customerTypes: [],
    kpis: []
  }

  const maxHourly  = Math.max(...(analytics.hourlyOrders?.map(h => h.orders) || [1]), 1)
  const maxTicket  = Math.max(...(analytics.avgTicket || [1]), 1)
  const maxRevenue = Math.max(...(analytics.topDishes?.map(d => d.revenue) || [1]), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {analytics.kpis?.map((k, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{k.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: P }}>↑ {k.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{t('rd.peak_hours')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('rd.peak_subtitle')}</p>
          </div>
          <span className="text-xs text-gray-400">{t('rd.today')}</span>
        </div>
        <div className="flex items-end gap-1.5 h-40">
          {analytics.hourlyOrders?.map((h, i) => {
            const isPeak = h.orders === maxHourly
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {isPeak && (
                  <div className="text-xs text-white px-1.5 py-0.5 rounded-lg whitespace-nowrap mb-1 text-center" style={{ background:'#1a202c', fontSize:'10px' }}>
                    {t('rd.peak_label')}<br/>{h.orders}
                  </div>
                )}
                <div className="w-full rounded-t-lg transition-all" style={{ height:`${(h.orders/maxHourly)*100}%`, background: isPeak ? P : PL }} />
                <span className="text-gray-400" style={{ fontSize:'9px' }}>{h.hour}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{t('rd.avg_ticket')}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t('rd.avg_ticket_subtitle')}</p>
            </div>
            <span className="text-xs text-gray-400">{t('rd.last_8_months_label')}</span>
          </div>
          <div className="flex items-end gap-3 h-32">
            {analytics.avgTicket?.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-600">${v}</span>
                <div className="w-full rounded-t-lg" style={{ height:`${(v/maxTicket)*85}%`, background: P }} />
                <span className="text-xs text-gray-400">{analytics.avgTicketMonths?.[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{t('rd.customer_types')}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t('rd.customer_types_subtitle')}</p>
            </div>
            <span className="text-xs text-gray-400">{t('rd.this_month')}</span>
          </div>
          <div className="flex justify-center my-3">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={P}        strokeWidth="3.5" strokeDasharray="35 65" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fbbf24"  strokeWidth="3.5" strokeDasharray="45 55" strokeDashoffset="-35" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a202c"  strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="-80" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs font-bold text-gray-700">100%</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {analytics.customerTypes?.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-gray-600">{c.label}</span>
                </span>
                <span className="font-bold text-gray-700">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{t('rd.top_dishes')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('rd.top_dishes_subtitle')}</p>
          </div>
          <span className="text-xs text-gray-400">{t('rd.this_month')}</span>
        </div>
        <div className="space-y-4">
          {analytics.topDishes?.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-300 w-4">{i+1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-400">{d.orders} {t('rd.orders_label')}</span>
                    <span className="text-xs font-semibold" style={{ color: P }}>${d.revenue}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: PL, color: P }}>
                      {d.margin}% {t('rd.margin')}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${(d.revenue/maxRevenue)*100}%`, background: P }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RestaurantInfoSection({ user, showToast }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const { token } = useAuthStore()

  const [form, setForm] = useState({
    name:        String(user?.restaurant?.name        || user?.name        || ''),
    email:       String(user?.restaurant?.email       || user?.email       || ''),
    phone:       String(user?.restaurant?.phone       || user?.phone       || ''),
    address:     String(user?.restaurant?.address     || (typeof user?.address === 'string' ? user.address : '') || ''),
    city:        String(user?.restaurant?.city        || 'Popayán'),
    description: String(user?.restaurant?.description || ''),
    opening_time: user?.restaurant?.schedules?.[0]?.opening_time?.substring(0, 5) || '11:00',
    closing_time: user?.restaurant?.schedules?.[0]?.closing_time?.substring(0, 5) || '22:00',
    is_active:    user?.restaurant?.is_active ?? true,
  })

  const save = async () => {
    try {
      const activeToken = token || localStorage.getItem('token')
      if (!activeToken) throw new Error('No se encontró el token de autenticación')

      await fetchJson('/api/restaurant/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify(form)
      })
      setEditing(false)
      showToast(t('rd.info_saved'))
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0" style={{ background: P }}>
            {form.name?.charAt(0)?.toUpperCase() || 'R'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{form.name || t('rd.restaurant_info')}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{form.email}</p>
            <p className="text-sm text-gray-400">{form.city}</p>
          </div>
          <button onClick={() => editing ? save() : setEditing(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
            {editing ? t('rd.save') : t('rd.edit_btn')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{t('rd.general_info')}</h3>
          <div className="space-y-3">
            {[
              { label: t('rd.restaurant_name'), key:'name',    type:'text'  },
              { label: t('rd.email'),           key:'email',   type:'email' },
              { label: t('rd.phone'),           key:'phone',   type:'text'  },
              { label: t('rd.address_label'),   key:'address', type:'text'  },
              { label: t('rd.city'),            key:'city',    type:'text'  },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  readOnly={!editing}
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition
                    ${editing ? 'border-gray-200 focus:border-[#e71d1d] bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('rd.desc_label')}</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                readOnly={!editing} rows={3} placeholder={t('rd.desc_restaurant_ph')}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none transition
                  ${editing ? 'border-gray-200 focus:border-[#e71d1d] bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{t('rd.schedule')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('rd.opening_time')}</label>
              <input type="time" value={form.opening_time} onChange={e => setForm({ ...form, opening_time: e.target.value })}
                disabled={!editing}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition
                  ${editing ? 'border-gray-200 focus:border-[#e71d1d] bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('rd.closing_time')}</label>
              <input type="time" value={form.closing_time} onChange={e => setForm({ ...form, closing_time: e.target.value })}
                disabled={!editing}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition
                  ${editing ? 'border-gray-200 focus:border-[#e71d1d] bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`} />
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 mt-6 mb-4 pb-3 border-b border-gray-100">Estado de Operación</h3>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-gray-700">{form.is_active ? 'ABIERTO' : 'CERRADO MANUALMENTE'}</p>
              <p className="text-xs text-gray-400">Controla si el restaurante aparece disponible para los clientes</p>
            </div>
            <button
              disabled={!editing}
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'} ${!editing && 'opacity-50 cursor-not-allowed'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RestaurantDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = useAuthStore()
  const [page,        setPage]        = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orders,      setOrders]      = useState([])
  const [menu,        setMenu]        = useState([])
  const [reviews,     setReviews]     = useState([])
  const [categories,  setCategories]  = useState([])
  const [toast,       setToast]       = useState(null)
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)

  // Cargar datos reales del restaurante autenticado desde el backend
  useEffect(() => {
    if (!token) {
      setOrders([])
      setMenu([])
      setReviews([])
      setCategories([])
      setStats(null)
      setLoading(false)
      return
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [dashboardData, ordersData, productsData, reviewsData, categoriesData] = await Promise.all([
          fetchJson('/api/restaurant/dashboard',  { headers: { 'Authorization': `Bearer ${token}` } }),
          fetchJson('/api/restaurant/orders',     { headers: { 'Authorization': `Bearer ${token}` } }),
          fetchJson('/api/restaurant/products',   { headers: { 'Authorization': `Bearer ${token}` } }),
          fetchJson('/api/restaurant/reviews',    { headers: { 'Authorization': `Bearer ${token}` } }),
          fetchJson('/api/restaurant/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
        ])

        const ordersList   = ordersData?.data || (Array.isArray(ordersData) ? ordersData : [])
        const productsList = productsData?.data || (Array.isArray(productsData) ? productsData : [])
        const reviewsList  = reviewsData?.data || (Array.isArray(reviewsData) ? reviewsData : [])

        setStats(dashboardData.data || dashboardData)
        setOrders(ordersList.map(mapRestaurantOrder))
        setMenu(productsList.map(mapRestaurantProduct))
        setReviews(reviewsList.map(mapRestaurantReview))
        setCategories(categoriesData?.data || categoriesData || [])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        showToast(t('rd.error_loading') || 'Error al cargar datos del restaurante')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [token])

  const PAGE_META = {
    dashboard:        { title: t('rd.dashboard'),       breadcrumb: null },
    orders:           { title: t('rd.orders'),          breadcrumb: [t('rd.breadcrumb_orders')] },
    messages:         { title: t('rd.messages'),        breadcrumb: [t('rd.breadcrumb_messages')] },
    calendar:         { title: t('rd.calendar'),        breadcrumb: [t('rd.breadcrumb_calendar')] },
    menu:             { title: t('rd.menu'),            breadcrumb: [t('rd.breadcrumb_menu')] },
    inventory:        { title: t('rd.inventory'),       breadcrumb: [t('rd.breadcrumb_inventory')] },
    promotions:       { title: t('rd.promotions'),      breadcrumb: [t('rd.breadcrumb_promotions')] },
    analytics:        { title: t('rd.analytics'),       breadcrumb: [t('rd.breadcrumb_analytics')] },
    reviews:          { title: t('rd.reviews'),         breadcrumb: [t('rd.breadcrumb_reviews')] },
    'restaurant-info':{ title: t('rd.restaurant_info'), breadcrumb: [t('rd.breadcrumb_restaurant')] },
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleReplyReview = async (id, reply) => {
    try {
      await fetchJson(`/api/restaurant/reviews/${id}/reply`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reply })
      })
      setReviews(prev => prev.map(r => r.id === id ? { ...r, response: reply } : r))
      showToast(t('rd.reply_sent') || 'Respuesta enviada correctamente')
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await fetchJson(`/api/restaurant/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      showToast(t('rd.order_updated') || 'Pedido actualizado correctamente')
    } catch (err) {
      console.error('Error updating order status:', err)
      showToast('Error: ' + err.message, 'error')
    }
  }

  const handleAdvance = id => {
    const order = orders.find(o => o.id === id)
    if (!order) return
    const sequence = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered']
    const currentIndex = sequence.indexOf(order.status)
    if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
      handleUpdateStatus(id, sequence[currentIndex + 1])
    }
  }

  const handleAdd = async item => {
    try {
      let category_id = item.category_id

      // Si es una nueva categoría, primero la creamos
      if (item.newCategoryName) {
        try {
          const catRes = await fetchJson('/api/restaurant/categories', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: item.newCategoryName })
          })
          const newCat = catRes.data || catRes
          category_id = newCat.id
          setCategories(prev => [...prev, newCat])
        } catch (catErr) {
          console.error('Error al crear categoría:', catErr)
          showToast('Error al crear categoría: ' + catErr.message, 'error')
          return
        }
      }

      const formData = new FormData()
      formData.append('name', item.name)
      formData.append('description', item.description || '')
      formData.append('price', item.price)
      formData.append('category_id', category_id)
      formData.append('is_available', 1)
      
      if (item.file) {
        formData.append('image', item.file)
      }

      if (!item.id || String(item.id).startsWith('temp') || item.id > 1000000000) {
        const response = await fetchJson('/api/restaurant/products', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        })
        const newProd = mapRestaurantProduct(response.data || response)
        setMenu(prev => [newProd, ...prev])
        showToast(t('rd.dish_added'))
      } else {
        // Producto existente, solo actualizar estado local
        setMenu(prev => [item, ...prev])
        showToast(`${item.name} ${t('rd.added_success')}`)
      }
    } catch (error) {
      console.error('Error al agregar producto:', error)
      const msg = error.response?.data?.message || error.message || 'Error desconocido'
      showToast(`Error: ${msg}`, 'error')
    }
  }

  const handleDelete = async id => {
    const item = menu.find(m => m.id === id)
    if (!window.confirm(`${t('rd.confirm_delete')} ${item?.name}?`)) return
    
    try {
      // Intentar DELETE a la API si el producto tiene un ID numérico real
      if (item.id && !String(item.id).startsWith('temp') && item.id !== Date.now()) {
        await fetchJson(`/api/restaurant/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      }
      
      setMenu(prev => prev.filter(m => m.id !== id))
      showToast(`${item?.name} ${t('rd.deleted')}`)
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      showToast(`Error: ${error.message}`)
    }
  }

  const handleLogout = () => { onLogout?.(); navigate('/') }

  const { title, breadcrumb } = PAGE_META[page]
  const props = { 
    orders, menu, reviews, categories, 
    onAdvance: handleAdvance, 
    onStatusChange: handleUpdateStatus,
    onAdd: handleAdd, onDelete: handleDelete, 
    onReply: handleReplyReview,
    user, stats, loading, showToast, t
  }

  return (
    <div className="page-restaurant-dashboard flex min-h-screen" style={{ background: BG }}>
      <Sidebar active={page} onNav={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col md:ml-[200px] min-w-0">
        <main className="flex-1 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm md:hidden">
            <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600">☰</button>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">{title}</p>
              {breadcrumb && <p className="text-xs text-gray-400">{breadcrumb.join(' / ')}</p>}
            </div>
          </div>
          <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">AppiFood Restaurant</p>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {breadcrumb && <p className="text-sm text-gray-500 mt-1">{breadcrumb.join(' / ')}</p>}
            </div>
          </div>
          {page === 'dashboard'       && <DashboardSection  {...props} />}
          {page === 'orders'          && <OrdersSection     {...props} />}
          {page === 'messages'        && <MessagesSection />}
          {page === 'calendar'        && <CalendarSection />}
          {page === 'menu'            && <MenuSection       {...props} />}
          {page === 'inventory'       && <InventorySection token={token} showToast={showToast} />}
          {page === 'promotions'      && <PromotionsSection token={token} showToast={showToast} />}
          {page === 'analytics'       && <AnalyticsSection stats={stats} />}
          {page === 'reviews'         && <ReviewsSection    {...props} />}
          {page === 'restaurant-info' && <RestaurantInfoSection user={user} showToast={showToast} />}
        </main>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  )
}