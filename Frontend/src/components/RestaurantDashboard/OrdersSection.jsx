import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../../data/restaurantDashboardData'
import { Badge } from './Common'

/**
 * Sección de gestión de órdenes con filtros y búsqueda.
 */
export default function OrdersSection({ orders, onStatusChange, onSelectOrder }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('table')

  // Contadores de estados
  const counts = {
    all:        orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    preparing:  orders.filter(o => o.status === 'preparing' || o.status === 'confirmed').length,
    on_the_way: orders.filter(o => o.status === 'on_the_way').length,
    delivered:  orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
  }

  // Filtrado de órdenes
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
  ]

  return (
    <div className="space-y-6">
      {/* Resumen de estados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('rd.total_orders_col'), value: counts.all,        icon:'📋', color: COLORS.primary },
          { label: t('orders.status_pending'), value: counts.pending,    icon:'⏳', color:'#f59e0b' },
          { label: t('orders.status_preparing'), value: counts.preparing,  icon:'👨‍🍳', color:'#a855f7' },
          { label: t('orders.status_delivered'), value: counts.delivered,  icon:'✅', color:'#10b981' },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background:`${s.color}20` }}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controles: Filtros, Búsqueda y Vista */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {FILTERS.map(f => (
            <button 
              key={f.key} 
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={filter === f.key ? { background: COLORS.primary, color:'white' } : { color:'#6b7280' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400 text-sm">🔍</span>
            <input 
              placeholder={t('rd.search_order')} 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none w-full lg:w-40 text-gray-600 placeholder-gray-400" 
            />
          </div>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[t('rd.order_id'), t('rd.customer'), t('rd.amount'), t('rd.status'), t('rd.action')].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => onSelectOrder(o)}>
                  <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: COLORS.primary }}>{o.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{o.customer}</td>
                  <td className="px-5 py-3 font-bold">${o.amount.toFixed(2)}</td>
                  <td className="px-5 py-3"><Badge status={o.status} /></td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
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
      </div>
    </div>
  )
}
