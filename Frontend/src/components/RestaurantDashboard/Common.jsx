import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { COLORS } from './constants'

/**
 * Badge de estado para las órdenes.
 */
export function Badge({ status }) {
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
    <span 
      className="px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap" 
      style={{ background: c.bg, color: c.color }}
    >
      {t(c.text)}
    </span>
  )
}

/**
 * Componente de calificación por estrellas.
 */
export function Stars({ rating, size = 'text-sm' }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span 
          key={s} 
          className={size} 
          style={{ color: s <= Math.floor(rating) ? COLORS.primary : '#e5e7eb' }}
        >
          ★
        </span>
      ))}
    </span>
  )
}
