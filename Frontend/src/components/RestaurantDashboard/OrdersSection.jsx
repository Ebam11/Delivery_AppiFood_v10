import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COLORS } from './constants'
import { Badge } from './Common'

export default function OrdersSection({ orders, onStatusChange, onViewDetails }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const counts = {
    all:        orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    preparing:  orders.filter(o => o.status === 'preparing' || o.status === 'confirmed').length,
    on_the_way: orders.filter(o => o.status === 'on_the_way').length,
    delivered:  orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
  }

  const visible = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const customerStr = typeof o.customer === 'object' && o.customer !== null ? o.customer.name : (o.customer ?? '')
    const matchSearch = customerStr.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search)
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('rd.total_orders_col'),     value: counts.all,       icon:'fa-bag-shopping',  color: COLORS.primary },
          { label: t('orders.status_pending'),   value: counts.pending,   icon:'fa-clock',         color:'#f59e0b' },
          { label: t('orders.status_preparing'), value: counts.preparing, icon:'fa-fire-burner',   color:'#a855f7' },
          { label: t('orders.status_delivered'), value: counts.delivered, icon:'fa-circle-check',  color:'#10b981' },
        ].map((s,i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background:`${s.color}20` }}>
                <i className={`fas ${s.icon} text-base`} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-slate-100 mt-2">{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-1 shadow-sm">
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
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400 dark:text-slate-500 text-sm">🔍</span>
            <input 
              placeholder={t('rd.search_order')} 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none w-full lg:w-40 text-gray-600 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 bg-transparent" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                {[t('rd.order_id'), t('rd.customer'), t('rd.amount'), t('rd.status'), t('rd.action')].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {visible.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer" onClick={() => onViewDetails && onViewDetails(o)}>
                  <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: COLORS.primary }}>{o.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-slate-200">
                    {typeof o.customer === 'object' && o.customer !== null ? o.customer.name : o.customer}
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-900 dark:text-white">${Number(o.amount ?? o.total ?? 0).toFixed(2)}</td>
                  <td className="px-5 py-3"><Badge status={o.status} /></td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <select 
                      value={o.status} 
                      onChange={(e) => onStatusChange(o.id, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-red-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300"
                    >
                      {['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(st => (
                        <option key={st} value={st}>{t(`orders.status_${st}`)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-400 dark:text-slate-500">
                    {t('rd.no_orders_found') || 'No se encontraron pedidos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}