import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────
const P  = '#e71d1d'
const PL = 'rgba(231,29,29,0.1)'
const BG = '#FFF8F5'

// ─────────────────────────────────────────
// DATOS MOCK
// ─────────────────────────────────────────
const RESTAURANTS = [
  { id:1,  name:'La Paella Dorada',    owner:'Carlos Méndez',    email:'paella@email.com',    phone:'3001234567', city:'Popayán', status:'active',   joined:'2026-01-15', orders:142, rating:4.8 },
  { id:2,  name:'Tacos del Norte',     owner:'Ana Gutiérrez',    email:'tacos@email.com',     phone:'3109876543', city:'Popayán', status:'active',   joined:'2026-02-03', orders:98,  rating:4.6 },
  { id:3,  name:'Sushi Garden',        owner:'Kenji Tanaka',     email:'sushi@email.com',     phone:'3205551234', city:'Popayán', status:'pending',  joined:'2026-03-20', orders:0,   rating:0   },
  { id:4,  name:'Burger Bros',         owner:'Miguel Torres',    email:'burger@email.com',    phone:'3154443322', city:'Popayán', status:'pending',  joined:'2026-03-25', orders:0,   rating:0   },
  { id:5,  name:'Pizza Paradise',      owner:'Laura Sánchez',    email:'pizza@email.com',     phone:'3001112233', city:'Popayán', status:'active',   joined:'2026-01-28', orders:211, rating:4.7 },
  { id:6,  name:'El Ceviche Mixto',    owner:'Pedro Ríos',       email:'ceviche@email.com',   phone:'3187776655', city:'Popayán', status:'suspended',joined:'2026-02-14', orders:55,  rating:4.2 },
  { id:7,  name:'La Bandeja Paisa',    owner:'Sofía Vargas',     email:'bandeja@email.com',   phone:'3124445566', city:'Popayán', status:'active',   joined:'2026-01-10', orders:189, rating:4.9 },
  { id:8,  name:'Wok Express',         owner:'Chen Li',          email:'wok@email.com',       phone:'3209998877', city:'Popayán', status:'pending',  joined:'2026-03-28', orders:0,   rating:0   },
]

const USERS = [
  { id:1,  name:'María García',    email:'maria@email.com',    phone:'3001112222', city:'Popayán', status:'active',    joined:'2026-01-05', orders:24, subscription:'Premium' },
  { id:2,  name:'Carlos López',    email:'carlos@email.com',   phone:'3109993333', status:'active',    joined:'2026-01-12', orders:18, subscription:'Free',    city:'Popayán' },
  { id:3,  name:'Ana Rodríguez',   email:'ana@email.com',      phone:'3204445555', status:'suspended', joined:'2026-02-08', orders:7,  subscription:'Free',    city:'Popayán' },
  { id:4,  name:'Pedro Martínez',  email:'pedro@email.com',    phone:'3156667777', status:'active',    joined:'2026-02-15', orders:31, subscription:'Premium', city:'Popayán' },
  { id:5,  name:'Laura Sánchez',   email:'laura@email.com',    phone:'3008889999', status:'active',    joined:'2026-02-20', orders:12, subscription:'Free',    city:'Popayán' },
  { id:6,  name:'Roberto Díaz',    email:'roberto@email.com',  phone:'3181110000', status:'active',    joined:'2026-03-01', orders:9,  subscription:'Premium', city:'Popayán' },
  { id:7,  name:'Isabel Moreno',   email:'isabel@email.com',   phone:'3122221111', status:'suspended', joined:'2026-03-10', orders:3,  subscription:'Free',    city:'Popayán' },
  { id:8,  name:'Miguel Torres',   email:'miguel@email.com',   phone:'3203334444', status:'active',    joined:'2026-03-15', orders:6,  subscription:'Free',    city:'Popayán' },
]

const ORDERS = [
  { id:'#ORD1023', date:'2026-03-20', time:'02:47 PM', customer:'María García',   restaurant:'La Paella Dorada',  type:'Dine-In',  qty:1, amount:18.00, status:'completed'  },
  { id:'#ORD1024', date:'2026-03-20', time:'12:47 AM', customer:'Carlos López',   restaurant:'Tacos del Norte',   type:'Takeaway', qty:2, amount:24.00, status:'cancelled'  },
  { id:'#ORD1025', date:'2026-03-21', time:'10:47 PM', customer:'Ana Rodríguez',  restaurant:'Pizza Paradise',    type:'Dine-In',  qty:1, amount:10.00, status:'completed'  },
  { id:'#ORD1026', date:'2026-03-21', time:'01:47 PM', customer:'Pedro Martínez', restaurant:'La Paella Dorada',  type:'Dine-In',  qty:3, amount:30.00, status:'on_process' },
  { id:'#ORD1027', date:'2026-03-22', time:'03:47 PM', customer:'Laura Sánchez',  restaurant:'Sushi Garden',      type:'Online',   qty:1, amount:15.00, status:'completed'  },
  { id:'#ORD1028', date:'2026-03-22', time:'11:47 AM', customer:'Roberto Díaz',   restaurant:'Burger Bros',       type:'Online',   qty:4, amount:35.00, status:'completed'  },
  { id:'#ORD1029', date:'2026-03-23', time:'09:47 AM', customer:'Isabel Moreno',  restaurant:'El Ceviche Mixto',  type:'Takeaway', qty:2, amount:22.00, status:'cancelled'  },
  { id:'#ORD1030', date:'2026-03-23', time:'08:47 AM', customer:'Miguel Torres',  restaurant:'La Bandeja Paisa',  type:'Dine-In',  qty:3, amount:36.00, status:'on_process' },
]

const REVIEWS = [
  { id:1, reviewer:'María García',   restaurant:'La Paella Dorada', rating:5,   date:'Mar 20, 2026', text:'Excelente comida, aunque el domicilio se demoró un poco. Los platos llegaron bien empacados.',        status:'pending'  },
  { id:2, reviewer:'Carlos López',   restaurant:'Tacos del Norte',  rating:4,   date:'Mar 19, 2026', text:'La pizza llegó fría, pero el sabor era bueno. La masa estaba deliciosa.',                             status:'answered' },
  { id:3, reviewer:'Ana Rodríguez',  restaurant:'Pizza Paradise',   rating:5,   date:'Mar 18, 2026', text:'Increíble servicio! El repartidor fue muy amable y la comida llegó perfecta.',                        status:'pending'  },
  { id:4, reviewer:'Pedro Martínez', restaurant:'La Bandeja Paisa', rating:3,   date:'Mar 17, 2026', text:'Pedí una ensalada César pero llegó sin el aderezo. El pollo estaba seco.',                           status:'answered' },
  { id:5, reviewer:'Laura Sánchez',  restaurant:'Burger Bros',      rating:4.5, date:'Mar 16, 2026', text:'Muy buena hamburguesa, la carne estaba jugosa y el pan fresco. Recomendado.',                        status:'pending'  },
]

const NOTIFICATIONS_HISTORY = [
  { id:1, date:'28/03/2026 - 11:30', subject:'Mantenimiento programado',     preview:'El sistema estará en mantenimiento el próximo domingo de 2:00 a 6:00 AM.',    recipients:'Todos los usuarios' },
  { id:2, date:'26/03/2026 - 15:45', subject:'Oferta 2x1 habilitada',        preview:'Aprovecha nuestra promoción 2x1 en todos los restaurantes participantes.',     recipients:'Solo clientes'       },
  { id:3, date:'25/03/2026 - 10:10', subject:'Recordatorio de actualización',preview:'La nueva versión del sistema estará disponible a partir del lunes.',           recipients:'Solo restaurantes'   },
  { id:4, date:'23/03/2026 - 09:15', subject:'Nueva función de seguimiento', preview:'Hemos implementado el seguimiento en tiempo real para todos los pedidos.',      recipients:'Todos los usuarios' },
]

const STATUS_ORDER = {
  completed:  { label:'Completado',  bg: P,              text:'text-white'      },
  on_process: { label:'En Proceso',  bg:'bg-orange-100', text:'text-orange-600' },
  cancelled:  { label:'Cancelado',   bg:'bg-gray-800',   text:'text-white'      },
}

const STATUS_REST = {
  active:    { label:'Activo',    bg:'bg-green-100',  text:'text-green-700'  },
  pending:   { label:'Pendiente', bg:'bg-yellow-100', text:'text-yellow-700' },
  suspended: { label:'Suspendido',bg:'bg-gray-100',   text:'text-gray-600'   },
}

const STATUS_USER = {
  active:    { label:'Activo',    bg:'bg-green-100', text:'text-green-700' },
  suspended: { label:'Suspendido',bg:'bg-gray-100',  text:'text-gray-600'  },
}

// ─────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────
function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white" style={{ background: P }}>
      ✓ {message}
    </div>
  )
}

function Badge({ status, map }) {
  const cfg = map[status]
  if (!cfg) return null
  const bgStyle = cfg.bg.startsWith('bg-') ? {} : { background: cfg.bg }
  const bgClass = cfg.bg.startsWith('bg-') ? cfg.bg : ''
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${bgClass} ${cfg.text}`} style={bgStyle}>
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────
const NAV = [
  { id:'dashboard',      icon:'⊞', label:'Dashboard'      },
  { id:'restaurants',    icon:'🏪', label:'Restaurantes'   },
  { id:'users',          icon:'👥', label:'Usuarios'       },
  { id:'orders',         icon:'☰', label:'Pedidos'        },
  { id:'reviews',        icon:'★', label:'Reseñas'        },
  { id:'notifications',  icon:'🔔', label:'Notificaciones' },
  { id:'reports',        icon:'📈', label:'Reportes'       },
  { id:'settings',       icon:'⚙️', label:'Configuración'  },
]

function Sidebar({ active, onNav, open, onClose, user, onLogout }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-[210px] bg-white border-r border-gray-100 z-50
        flex flex-col transition-transform duration-300 shadow-sm
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: P }}>A</div>
          <span className="font-bold text-gray-800 text-base">AppiFood</span>
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full text-white font-semibold" style={{ background: P }}>Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); onClose() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active === item.id ? 'text-white font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
              style={active === item.id ? { background: P } : {}}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-5 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: P }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || 'Administrador'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

// ─────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────
function TopBar({ title, breadcrumb, onMenuOpen, user }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuOpen} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500">☰</button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{title}</h1>
          {breadcrumb && (
            <p className="text-xs text-gray-400">
              <span style={{ color: P }}>Dashboard</span>
              {breadcrumb.map((b, i) => <span key={i}> / <span className="text-gray-400">{b}</span></span>)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <span className="text-gray-400 text-sm">🔍</span>
          <input placeholder="Buscar..." className="bg-transparent text-sm outline-none w-32 text-gray-600 placeholder-gray-400" />
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500">🔔</button>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">{user?.name || 'Administrador'}</p>
            <p className="text-xs font-semibold" style={{ color: P }}>Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: P }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────
// DASHBOARD SECTION
// ─────────────────────────────────────────
function DashboardSection({ restaurants, users, orders }) {
  const BARS   = [98,112,105,132,149,187,202,171,209,193,220,241]
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const maxBar = Math.max(...BARS)

  const totalRevenue   = orders.reduce((s, o) => s + o.amount, 0)
  const activeRest     = restaurants.filter(r => r.status === 'active').length
  const pendingRest    = restaurants.filter(r => r.status === 'pending').length
  const activeUsers    = users.filter(u => u.status === 'active').length
  const completedOrders= orders.filter(o => o.status === 'completed').length

  const ACTIVITY = [
    { icon:'🏪', text:'Pizza Paradise completó 5 pedidos en la última hora',       time:'Hace 10 min' },
    { icon:'👤', text:'Nuevo usuario registrado: Roberto Díaz',                    time:'Hace 25 min' },
    { icon:'⚠️', text:'Restaurante "Wok Express" pendiente de aprobación',         time:'Hace 1 hora'  },
    { icon:'★',  text:'Nueva reseña de 5 estrellas en La Bandeja Paisa',           time:'Hace 2 horas' },
    { icon:'💰', text:'Ingresos del día superaron la meta: $240K',                 time:'Hace 3 horas' },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Restaurantes Activos', value: activeRest,      icon:'🏪', trend:'+3 este mes'   },
          { label:'Usuarios Activos',     value: activeUsers,     icon:'👥', trend:'+12% este mes' },
          { label:'Pedidos Totales',      value: orders.length,   icon:'☰', trend:'+8% vs ayer'   },
          { label:'Ingresos Plataforma',  value:`$${totalRevenue.toLocaleString()}`, icon:'💰', trend:'+24.6%' },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: PL }}>{k.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{k.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{k.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: P }}>↑ {k.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica ganancias */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">Ganancias Totales</p>
              <p className="text-2xl font-bold text-gray-800">$240.8K</p>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-bold text-white animate-pulse" style={{ background:'#28a745' }}>EN VIVO</span>
          </div>
          <div className="flex items-end gap-1.5 h-40">
            {BARS.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height:`${(v/maxBar)*100}%`, background: i === 11 ? '#1a202c' : P }} />
                <span className="text-gray-400" style={{ fontSize:'9px' }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Mes anterior: <strong>$125.2K</strong> +12.5%</span>
            <span>Dic 2026</span>
          </div>
        </div>

        {/* Alertas rápidas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">Alertas del Sistema</p>
          <div className="space-y-3">
            {[
              { label:'Restaurantes pendientes', value: pendingRest,                                     color: P,        icon:'🏪' },
              { label:'Reseñas sin responder',   value: REVIEWS.filter(r=>r.status==='pending').length,  color:'#f59e0b', icon:'★'  },
              { label:'Usuarios suspendidos',    value: users.filter(u=>u.status==='suspended').length,  color:'#6b7280', icon:'👤' },
              { label:'Órdenes en proceso',      value: orders.filter(o=>o.status==='on_process').length,color:'#10b981', icon:'☰' },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background:`${a.color}10` }}>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{a.icon}</span>{a.label}
                </span>
                <span className="font-bold text-sm" style={{ color: a.color }}>{a.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos recientes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">Pedidos Recientes</p>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: P, background: PL }}>Ver todos</span>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0,4).map(o => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                <div>
                  <p className="text-sm font-medium text-gray-800">{o.customer}</p>
                  <p className="text-xs text-gray-400">{o.restaurant}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: P }}>${o.amount.toFixed(2)}</p>
                  <Badge status={o.status} map={STATUS_ORDER} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">Actividad Reciente</p>
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: PL }}>{a.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// RESTAURANTS SECTION
// ─────────────────────────────────────────
function RestaurantsSection({ restaurants, onUpdate, showToast }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const visible = restaurants.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    all:       restaurants.length,
    active:    restaurants.filter(r => r.status === 'active').length,
    pending:   restaurants.filter(r => r.status === 'pending').length,
    suspended: restaurants.filter(r => r.status === 'suspended').length,
  }

  const toggleStatus = (id, action) => {
    const map = { approve:'active', suspend:'suspended', reactivate:'active', reject:'suspended' }
    onUpdate(prev => prev.map(r => r.id === id ? { ...r, status: map[action] } : r))
    const msgs = { approve:'Restaurante aprobado', suspend:'Restaurante suspendido', reactivate:'Restaurante reactivado', reject:'Restaurante rechazado' }
    showToast(msgs[action])
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total',      value: counts.all,       color: P         },
          { label:'Activos',    value: counts.active,    color:'#10b981'  },
          { label:'Pendientes', value: counts.pending,   color:'#f59e0b'  },
          { label:'Suspendidos',value: counts.suspended, color:'#6b7280'  },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {[['all','Todos'],['active','Activos'],['pending','Pendientes'],['suspended','Suspendidos']].map(([key,label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={filter === key ? { background: P, color:'white' } : { color:'#6b7280' }}>
              {label} ({counts[key] ?? restaurants.length})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <span className="text-gray-400 text-sm">🔍</span>
          <input placeholder="Buscar restaurante..." value={search} onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-44 text-gray-600 placeholder-gray-400" />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Restaurante','Propietario','Contacto','Ciudad','Estado','Pedidos','Rating','Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.joined}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.owner}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{r.email}</p>
                    <p className="text-xs text-gray-400">{r.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.city}</td>
                  <td className="px-4 py-3"><Badge status={r.status} map={STATUS_REST} /></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{r.orders}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.rating > 0 ? `⭐ ${r.rating}` : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => toggleStatus(r.id, 'approve')} className="px-2 py-1 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition" style={{ background:'#10b981' }}>Aprobar</button>
                          <button onClick={() => toggleStatus(r.id, 'reject')}  className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-gray-500 hover:opacity-90 transition">Rechazar</button>
                        </>
                      )}
                      {r.status === 'active' && (
                        <button onClick={() => toggleStatus(r.id, 'suspend')} className="px-2 py-1 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition" style={{ background: P }}>Suspender</button>
                      )}
                      {r.status === 'suspended' && (
                        <button onClick={() => toggleStatus(r.id, 'reactivate')} className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-gray-700 hover:opacity-90 transition">Reactivar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Mostrando {visible.length} de {restaurants.length} restaurantes
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// USERS SECTION
// ─────────────────────────────────────────
function UsersSection({ users, onUpdate, showToast }) {
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  const visible = users.filter(u => {
    const matchStatus = filter === 'all' || u.status === filter || (filter === 'premium' && u.subscription === 'Premium')
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    all:       users.length,
    active:    users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    premium:   users.filter(u => u.subscription === 'Premium').length,
  }

  const toggleStatus = id => {
    onUpdate(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
    const user = users.find(u => u.id === id)
    showToast(user?.status === 'active' ? 'Usuario suspendido' : 'Usuario reactivado')
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total usuarios',  value: counts.all,       color: P        },
          { label:'Activos',         value: counts.active,    color:'#10b981' },
          { label:'Suspendidos',     value: counts.suspended, color:'#6b7280' },
          { label:'Premium',         value: counts.premium,   color:'#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {[['all','Todos'],['active','Activos'],['suspended','Suspendidos'],['premium','Premium']].map(([key,label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={filter === key ? { background: P, color:'white' } : { color:'#6b7280' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <span className="text-gray-400 text-sm">🔍</span>
          <input placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-44 text-gray-600 placeholder-gray-400" />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Usuario','Contacto','Ciudad','Estado','Suscripción','Pedidos','Registro','Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelected(u)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: P }}>
                        {u.name.charAt(0)}
                      </div>
                      <p className="font-semibold text-gray-800">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-400">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.city}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Badge status={u.status} map={STATUS_USER} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.subscription === 'Premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.subscription}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.orders}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.joined}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition text-gray-600"
                    >
                      {u.status === 'active' ? 'Suspender' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Mostrando {visible.length} de {users.length} usuarios
        </div>
      </div>

      {/* Modal historial usuario */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800">Perfil de Usuario</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: P }}>
                {selected.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">{selected.name}</p>
                <p className="text-sm text-gray-400">{selected.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label:'Teléfono',      value: selected.phone        },
                { label:'Ciudad',        value: selected.city         },
                { label:'Registro',      value: selected.joined       },
                { label:'Suscripción',   value: selected.subscription },
                { label:'Total pedidos', value: selected.orders       },
                { label:'Estado',        value: selected.status === 'active' ? 'Activo' : 'Suspendido' },
              ].map((f, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400">{f.label}</span>
                  <span className="font-medium text-gray-700">{f.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { toggleStatus(selected.id); setSelected(null) }}
              className="w-full mt-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
              style={{ background: P }}
            >
              {selected.status === 'active' ? 'Suspender cuenta' : 'Reactivar cuenta'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// ORDERS SECTION
// ─────────────────────────────────────────
function OrdersSection({ orders }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [restFilter, setRestFilter] = useState('all')

  const restaurants = [...new Set(orders.map(o => o.restaurant))]

  const visible = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchRest   = restFilter === 'all' || o.restaurant === restFilter
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
    return matchStatus && matchRest && matchSearch
  })

  const counts = {
    all:        orders.length,
    completed:  orders.filter(o => o.status === 'completed').length,
    on_process: orders.filter(o => o.status === 'on_process').length,
    cancelled:  orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total',      value: counts.all,        color: P        },
          { label:'Completados',value: counts.completed,  color:'#10b981' },
          { label:'En Proceso', value: counts.on_process, color:'#f59e0b' },
          { label:'Cancelados', value: counts.cancelled,  color:'#6b7280' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {[['all','Todos'],['completed','Completados'],['on_process','En Proceso'],['cancelled','Cancelados']].map(([key,label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={filter === key ? { background: P, color:'white' } : { color:'#6b7280' }}>
              {label}
            </button>
          ))}
        </div>
        <select value={restFilter} onChange={e => setRestFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none shadow-sm">
          <option value="all">Todos los restaurantes</option>
          {restaurants.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <span className="text-gray-400 text-sm">🔍</span>
          <input placeholder="Buscar pedido o cliente..." value={search} onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-44 text-gray-600 placeholder-gray-400" />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Order ID','Fecha','Cliente','Restaurante','Tipo','Cant.','Monto','Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: P }}>{o.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{o.date} {o.time}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{o.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{o.restaurant}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{o.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{o.qty}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: P }}>${o.amount.toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge status={o.status} map={STATUS_ORDER} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Mostrando {visible.length} de {orders.length} pedidos
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// REVIEWS SECTION
// ─────────────────────────────────────────
function ReviewsSection({ showToast }) {
  const [reviews, setReviews]   = useState(REVIEWS)
  const [selected, setSelected] = useState(null)
  const [response, setResponse] = useState('')
  const [filter,   setFilter]   = useState('all')

  const visible = reviews.filter(r => filter === 'all' || r.status === filter)

  const submitResponse = () => {
    if (!response.trim()) return
    setReviews(prev => prev.map(r => r.id === selected.id ? { ...r, status:'answered' } : r))
    showToast('Respuesta enviada correctamente')
    setSelected(null)
    setResponse('')
  }

  const deleteReview = id => {
    if (window.confirm('¿Eliminar esta reseña?')) {
      setReviews(prev => prev.filter(r => r.id !== id))
      showToast('Reseña eliminada')
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total reseñas',    value: reviews.length,                              color: P        },
          { label:'Sin responder',    value: reviews.filter(r=>r.status==='pending').length,  color: P        },
          { label:'Respondidas',      value: reviews.filter(r=>r.status==='answered').length, color:'#10b981' },
          { label:'Calif. promedio',  value: (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1), color:'#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
        {[['all','Todas'],['pending','Sin responder'],['answered','Respondidas']].map(([key,label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            style={filter === key ? { background: P, color:'white' } : { color:'#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Reseña','Restaurante','Calificación','Fecha','Estado','Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-semibold text-gray-800 text-sm">{r.reviewer}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{r.text}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.restaurant}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-sm" style={{ color: s <= Math.floor(r.rating) ? '#f59e0b' : '#e5e7eb' }}>★</span>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{r.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {r.status === 'pending' ? 'Sin responder' : 'Respondida'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setSelected(r)} className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-green-500 hover:opacity-90 transition">
                        {r.status === 'pending' ? 'Responder' : 'Editar'}
                      </button>
                      <button onClick={() => deleteReview(r.id)} className="px-2 py-1 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition" style={{ background: P }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal respuesta */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Responder Reseña</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-800 text-sm">{selected.reviewer}</p>
              <p className="text-xs text-gray-500 mt-1">{selected.text}</p>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5].map(s => <span key={s} className="text-sm" style={{ color: s <= Math.floor(selected.rating) ? '#f59e0b' : '#e5e7eb' }}>★</span>)}
              </div>
            </div>
            <textarea value={response} onChange={e => setResponse(e.target.value)} rows={4}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d] resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={submitResponse} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// NOTIFICATIONS SECTION
// ─────────────────────────────────────────
function NotificationsSection({ showToast }) {
  const [history, setHistory] = useState(NOTIFICATIONS_HISTORY)
  const [form, setForm] = useState({ subject:'', message:'', recipients:'Todos los usuarios' })

  const send = e => {
    e.preventDefault()
    if (!form.subject || !form.message) { showToast('Completa todos los campos'); return }
    const newNotif = {
      id:      Date.now(),
      date:    new Date().toLocaleDateString('es-CO') + ' - ' + new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }),
      subject: form.subject,
      preview: form.message,
      recipients: form.recipients,
    }
    setHistory(prev => [newNotif, ...prev])
    setForm({ subject:'', message:'', recipients:'Todos los usuarios' })
    showToast(`Notificación enviada a ${form.recipients}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel envío */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <span className="text-xl">📤</span>
          <p className="font-semibold text-gray-800">Enviar Notificación</p>
        </div>
        <form onSubmit={send} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Asunto</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Ej: Mantenimiento del sistema"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mensaje</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={5} placeholder="Escribe el mensaje que se enviará..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Destinatarios</label>
            <select value={form.recipients} onChange={e => setForm(f => ({ ...f, recipients: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]">
              <option>Todos los usuarios</option>
              <option>Solo clientes</option>
              <option>Solo restaurantes</option>
              <option>Usuarios premium</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition flex items-center justify-center gap-2" style={{ background: P }}>
            📤 Enviar Notificación
          </button>
        </form>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <span className="text-xl">🕐</span>
          <p className="font-semibold text-gray-800">Historial de Notificaciones</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {history.map(n => (
            <div key={n.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400 flex items-center gap-1">🕐 {n.date}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: PL, color: P }}>{n.recipients}</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm mb-1">{n.subject}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{n.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// REPORTS SECTION
// ─────────────────────────────────────────
function ReportsSection({ restaurants, users, orders }) {
  const MONTHS       = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const REVENUE_DATA = [98,112,105,132,149,187,202,171,209,193,220,241]
  const USERS_DATA   = [120,145,160,180,210,235,260,240,280,265,295,320]
  const ORDERS_DATA  = [320,380,350,420,490,550,610,520,640,590,680,720]
  const maxRev   = Math.max(...REVENUE_DATA)
  const maxUsers = Math.max(...USERS_DATA)
  const maxOrds  = Math.max(...ORDERS_DATA)

  const topRest = [...restaurants].sort((a,b) => b.orders - a.orders).slice(0,5)

  return (
    <div className="space-y-6">
      {/* KPIs anuales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Ingresos Anuales',     value:'$240.8K', trend:'+24.6%', icon:'💰' },
          { label:'Usuarios Totales',     value: users.length,     trend:'+18%',   icon:'👥' },
          { label:'Restaurantes Activos', value: restaurants.filter(r=>r.status==='active').length, trend:'+5',icon:'🏪' },
          { label:'Pedidos Totales',      value: orders.length,    trend:'+32%',   icon:'☰' },
        ].map((k,i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{k.icon}</span>
              <p className="text-xs text-gray-400">{k.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{k.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: P }}>↑ {k.trend} vs año anterior</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos mensuales */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">Ingresos Mensuales (K$)</p>
          <div className="flex items-end gap-1.5 h-36">
            {REVENUE_DATA.map((v,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height:`${(v/maxRev)*100}%`, background: P }} />
                <span className="text-gray-400" style={{ fontSize:'9px' }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crecimiento de usuarios */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">Crecimiento de Usuarios</p>
          <div className="flex items-end gap-1.5 h-36">
            {USERS_DATA.map((v,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height:`${(v/maxUsers)*100}%`, background:'#1a202c' }} />
                <span className="text-gray-400" style={{ fontSize:'9px' }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top restaurantes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">Top Restaurantes por Pedidos</p>
          <div className="space-y-3">
            {topRest.map((r,i) => {
              const maxOrders = topRest[0].orders
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-4">{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800">{r.name}</p>
                      <span className="text-xs font-semibold" style={{ color: P }}>{r.orders} pedidos</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${(r.orders/maxOrders)*100}%`, background: P }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pedidos mensuales */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">Pedidos Mensuales</p>
          <div className="flex items-end gap-1.5 h-36">
            {ORDERS_DATA.map((v,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height:`${(v/maxOrds)*100}%`, background:'#fbbf24' }} />
                <span className="text-gray-400" style={{ fontSize:'9px' }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// SETTINGS SECTION
// ─────────────────────────────────────────
function SettingsSection({ showToast, onLogout }) {
  const [notifs, setNotifs] = useState({ newOrders:true, newRestaurants:true, systemAlerts:true, dailyReports:false })
  const [security, setSecurity] = useState({ twoFactor:'required', sessionTime:60 })

  return (
    <div className="space-y-6">
      {/* Zona de administración */}
      <div className="rounded-2xl p-5 text-white" style={{ background:`linear-gradient(135deg, ${P} 0%, #c01515 100%)` }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🛠️</span>
          <p className="font-bold text-lg">Funciones de Administración</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon:'👥', label:'Gestión de Usuarios',    sub:'Crear, editar, suspender' },
            { icon:'🔒', label:'Seguridad',              sub:'Políticas y autenticación' },
            { icon:'📱', label:'Dispositivos',           sub:'Administrar móviles'       },
            { icon:'📊', label:'Monitoreo',              sub:'Informes de actividad'     },
          ].map((a,i) => (
            <div key={i} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center cursor-pointer transition border border-white/20">
              <span className="text-2xl block mb-2">{a.icon}</span>
              <p className="font-semibold text-sm">{a.label}</p>
              <p className="text-xs opacity-75 mt-1">{a.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestión de usuarios */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <span className="text-xl">👥</span>
            <p className="font-semibold text-gray-800">Gestión de Usuarios</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email del Administrador</label>
              <input defaultValue="admin@appifood.com" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Límite de usuarios simultáneos</label>
              <input type="number" defaultValue={1000} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Política de creación de cuentas</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]">
                <option>Automática con verificación</option>
                <option>Aprobación manual requerida</option>
                <option>Invitación por enlace</option>
              </select>
            </div>
          </div>
          <button onClick={() => showToast('Configuración guardada')} className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
            Guardar Configuración
          </button>
        </div>

        {/* Seguridad */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <span className="text-xl">🔒</span>
            <p className="font-semibold text-gray-800">Seguridad</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Autenticación de Dos Factores</label>
              <div className="flex gap-3">
                {[['required','Obligatoria'],['optional','Opcional']].map(([val,label]) => (
                  <label key={val} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition text-xs font-medium ${security.twoFactor === val ? 'border-[#e71d1d] bg-red-50 text-[#e71d1d]' : 'border-gray-200 text-gray-600'}`}>
                    <input type="radio" name="2fa" checked={security.twoFactor === val} onChange={() => setSecurity(s => ({ ...s, twoFactor: val }))} className="hidden" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tiempo de sesión (minutos)</label>
              <input type="number" value={security.sessionTime} onChange={e => setSecurity(s => ({ ...s, sessionTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
            </div>
          </div>
          <button onClick={() => showToast('Seguridad actualizada')} className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
            Actualizar Seguridad
          </button>
        </div>

        {/* Notificaciones */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <span className="text-xl">🔔</span>
            <p className="font-semibold text-gray-800">Notificaciones del Sistema</p>
          </div>
          <div className="space-y-3">
            {[
              { key:'newOrders',       label:'Nuevos pedidos'           },
              { key:'newRestaurants',  label:'Nuevos restaurantes'      },
              { key:'systemAlerts',   label:'Alertas del sistema'      },
              { key:'dailyReports',   label:'Reportes diarios'         },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{n.label}</span>
                <button
                  onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  className="w-11 h-6 rounded-full transition-colors relative"
                  style={{ background: notifs[n.key] ? P : '#e5e7eb' }}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[n.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reportes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <span className="text-xl">📊</span>
            <p className="font-semibold text-gray-800">Reportes Automáticos</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Frecuencia</label>
              <div className="flex gap-3">
                {['Diario','Semanal'].map(f => (
                  <label key={f} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer text-xs font-medium text-gray-600 hover:border-[#e71d1d] transition">
                    <input type="radio" name="freq" className="accent-[#e71d1d]" /> {f}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email para reportes</label>
              <input defaultValue="reportes@appifood.com" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e71d1d]" />
            </div>
          </div>
          <button onClick={() => showToast('Configuración de reportes guardada')} className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
            Guardar
          </button>
        </div>
      </div>

      {/* Zona de peligro */}
      <div className="border-2 border-red-200 rounded-2xl p-5 bg-red-50">
        <div className="flex items-center gap-3 mb-3 text-red-600">
          <span className="text-xl">⚠️</span>
          <p className="font-bold text-lg">Zona de Administración Crítica</p>
        </div>
        <p className="text-sm text-gray-500 mb-4">Estas acciones afectan todo el sistema y son irreversibles. Solo proceda si está completamente seguro.</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => showToast('Backup generado exitosamente')} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-600 hover:opacity-90 transition">
            📥 Backup Completo
          </button>
          <button onClick={() => { if(window.confirm('¿Activar modo mantenimiento? El sistema será inaccesible.')) showToast('Modo mantenimiento activado') }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ background: P }}>
            🛠️ Modo Mantenimiento
          </button>
          <button onClick={onLogout} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-800 hover:opacity-90 transition">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────
export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [page,        setPage]        = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [restaurants, setRestaurants] = useState(RESTAURANTS)
  const [users,       setUsers]       = useState(USERS)
  const [toast,       setToast]       = useState(null)

  const PAGE_META = {
    dashboard:     { title:'Dashboard',      breadcrumb: null                    },
    restaurants:   { title:'Restaurantes',   breadcrumb: ['Restaurantes']        },
    users:         { title:'Usuarios',       breadcrumb: ['Gestión de Usuarios'] },
    orders:        { title:'Pedidos',        breadcrumb: ['Pedidos Globales']    },
    reviews:       { title:'Reseñas',        breadcrumb: ['Moderación']          },
    notifications: { title:'Notificaciones', breadcrumb: ['Notificaciones']      },
    reports:       { title:'Reportes',       breadcrumb: ['Analytics']           },
    settings:      { title:'Configuración',  breadcrumb: ['Sistema']             },
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const handleLogout = () => { onLogout?.(); navigate('/') }

  const { title, breadcrumb } = PAGE_META[page]
  const props = { restaurants, users, orders: ORDERS, onUpdate: setRestaurants, showToast }

  return (
    <div className="flex min-h-screen" style={{ background: BG }}>
      <Sidebar active={page} onNav={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col md:ml-[210px] min-w-0">
        <TopBar title={title} breadcrumb={breadcrumb} onMenuOpen={() => setSidebarOpen(true)} user={user} />

        <main className="flex-1 p-5 sm:p-6">
          {page === 'dashboard'     && <DashboardSection     {...props} />}
          {page === 'restaurants'   && <RestaurantsSection   {...props} />}
          {page === 'users'         && <UsersSection         restaurants={restaurants} users={users} onUpdate={setUsers} showToast={showToast} />}
          {page === 'orders'        && <OrdersSection        orders={ORDERS} />}
          {page === 'reviews'       && <ReviewsSection       showToast={showToast} />}
          {page === 'notifications' && <NotificationsSection showToast={showToast} />}
          {page === 'reports'       && <ReportsSection       {...props} />}
          {page === 'settings'      && <SettingsSection      showToast={showToast} onLogout={handleLogout} />}
        </main>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  )
}