import { useTranslation } from 'react-i18next'
import { COLORS } from './constants'
import { Badge } from './Common'

function printReceipt(order, total, restaurantName) {
  const items = order.items.map(item => `
    <tr>
      <td style="padding:6px 0;border-bottom:1px dashed #eee">${item.name}</td>
      <td style="padding:6px 0;border-bottom:1px dashed #eee;text-align:center">${item.qty}</td>
      <td style="padding:6px 0;border-bottom:1px dashed #eee;text-align:right">$${(item.price * item.qty).toLocaleString('es-CO')}</td>
    </tr>
  `).join('')

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Recibo ${order.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 13px; color: #111; background: #fff; padding: 20px; max-width: 320px; margin: 0 auto; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #999; margin: 10px 0; }
        .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #FF4B3E; }
        .order-id { font-size: 11px; color: #666; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        th { font-size: 10px; text-transform: uppercase; color: #999; padding: 4px 0; text-align: left; }
        th:nth-child(2) { text-align: center; }
        th:nth-child(3) { text-align: right; }
        .total-row td { padding-top: 10px; font-weight: bold; font-size: 15px; }
        .total-row td:last-child { color: #FF4B3E; }
        .footer { margin-top: 16px; font-size: 11px; color: #999; text-align: center; line-height: 1.6; }
        @media print {
          body { padding: 0; }
          @page { margin: 10mm; size: 80mm auto; }
        }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="logo">AppiFood</div>
        <div style="font-size:12px;color:#666;margin-top:2px">${restaurantName || 'Restaurante'}</div>
        <div class="order-id">Pedido: ${order.id}</div>
        <div class="order-id">${dateStr} · ${timeStr}</div>
      </div>

      <div class="divider"></div>

      <div>
        <div style="font-size:11px;color:#999;margin-bottom:4px">CLIENTE</div>
        <div class="bold">${order.customer}</div>
        ${order.address && order.address !== '-' ? `<div style="font-size:11px;color:#666">${order.address}</div>` : ''}
      </div>

      <div class="divider"></div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td style="text-align:right">$${total.toLocaleString('es-CO')}</td>
          </tr>
        </tfoot>
      </table>

      <div class="divider"></div>

      <div class="footer">
        <div>Estado: <strong>${order.status?.toUpperCase()}</strong></div>
        <div style="margin-top:8px">¡Gracias por tu pedido!</div>
        <div>www.appifood.com</div>
      </div>
    </body>
    </html>
  `

  const win = window.open('', '_blank', 'width=400,height=600')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 300)
}

export default function OrderDetailModal({ order, onClose, onStatusChange, restaurantName }) {
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-bold text-gray-800 dark:text-slate-100">{t('rd.order_id')}</h2>
            <span className="font-bold" style={{ color: COLORS.primary }}>{order.id}</span>
            <Badge status={order.status} />
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => printReceipt(order, total, restaurantName)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white transition shadow-sm"
            >
            <i className="fas fa-print" />
            Imprimir recibo
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Items */}
          <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr className="border-b border-gray-100 dark:border-slate-800">
                  <th className="text-left px-5 py-2 text-xs font-semibold text-gray-400 uppercase">{t('rd.item')}</th>
                  <th className="text-center px-5 py-2 text-xs font-semibold text-gray-400 uppercase">{t('rd.qty')}</th>
                  <th className="text-right px-5 py-2 text-xs font-semibold text-gray-400 uppercase">{t('rd.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-slate-200">{item.name}</td>
                    <td className="px-5 py-3 text-center text-gray-500 dark:text-slate-400">{item.qty}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800 dark:text-slate-200">${(item.price * item.qty).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-between">
              <span className="text-sm font-bold text-gray-800 dark:text-slate-100">{t('rd.total_amount')}</span>
              <span className="font-bold text-lg" style={{ color: COLORS.primary }}>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Cliente y tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('rd.customer_col')}</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: COLORS.primary }}>
                  {order.customer?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-slate-100">{order.customer}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{order.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('rd.order_tracking')}</p>
              <div className="space-y-2">
                {TRACKING.map((trk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${trk.done ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-400'}`}>
                      {trk.done ? '✓' : ''}
                    </div>
                    <p className={`text-xs font-medium ${trk.done ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>{trk.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actualizar estado */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('rd.update_status')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => { onStatusChange(order.id, st); onClose() }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${order.status === st ? 'text-white border-transparent' : 'text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
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