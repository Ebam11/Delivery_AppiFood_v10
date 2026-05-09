import { useTranslation } from 'react-i18next'
import { COLORS } from '../../data/restaurantDashboardData'
import { Badge } from './Common'

/**
 * Modal con el detalle extendido de una orden.
 */
export default function OrderDetailModal({ order, onClose, onStatusChange }) {
  const { t } = useTranslation()
  if (!order) return null

  const total = order.items.reduce((s, i) => s + i.price * i.qty, 0)
  
  const TRACKING = [
    { label: t('rd.order_delivered'),  done: order.status === 'completed' || order.status === 'delivered' },
    { label: t('rd.on_the_way'),       done: order.status === 'on_the_way' || order.status === 'delivered' },
    { label: t('rd.preparing'),        done: order.status !== 'pending' && order.status !== 'cancelled' },
    { label: t('rd.order_confirmed'),  done: true },
    { label: t('rd.order_received'),   done: true },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-bold text-gray-800">{t('rd.order_id')}</h2>
            <span className="font-bold" style={{ color: COLORS.primary }}>{order.id}</span>
            <Badge status={order.status} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Lista de Items */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2 text-xs font-semibold text-gray-400 uppercase">{t('rd.item')}</th>
                  <th className="text-center px-5 py-2 text-xs font-semibold text-gray-400 uppercase">{t('rd.qty')}</th>
                  <th className="text-right px-5 py-2 text-xs font-semibold text-gray-400 uppercase">{t('rd.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{item.qty}</td>
                    <td className="px-5 py-3 text-right font-semibold">${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
              <span className="text-sm font-bold text-gray-800">{t('rd.total_amount')}</span>
              <span className="font-bold text-lg" style={{ color: COLORS.primary }}>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Información del Cliente y Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('rd.customer_col')}</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: COLORS.primary }}>
                  {order.customer.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('rd.order_tracking')}</p>
              <div className="space-y-2">
                {TRACKING.map((trk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${trk.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {trk.done ? '✓' : ''}
                    </div>
                    <p className={`text-xs font-medium ${trk.done ? 'text-gray-800' : 'text-gray-400'}`}>{trk.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cambio de Estado */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('rd.update_status')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => { onStatusChange(order.id, st); onClose() }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${order.status === st ? 'text-white border-transparent' : 'text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                  style={order.status === st ? { background: COLORS.primary } : {}}
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
