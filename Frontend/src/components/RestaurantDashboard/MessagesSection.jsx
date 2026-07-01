import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../../api/fetchJson'

export default function MessagesSection() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    let isFirstLoad = true
    const loadNotifications = async () => {
      try {
        if (isFirstLoad) setLoading(true)
        const ordersData = await fetchJson('/api/restaurant/orders')
        const orders = Array.isArray(ordersData) ? ordersData : ordersData?.data || []

        const chats = orders.slice(0, 20).map(order => ({
          id: order.id,
          name: order.user?.name || t('rd.customer'),
          avatar: (order.user?.name || 'C').charAt(0).toUpperCase(),
          lastMsg: `${t('rd.order')} #${order.id} - ${order.status === 'pending' ? t('rd.waiting_confirmation') || 'Esperando confirmación' : order.status === 'delivered' ? t('rd.order_delivered') || '¡Pedido entregado!' : t('rd.in_progress') || 'En proceso'}`,
          time: new Date(order.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(order.created_at),
          unread: order.status === 'pending',
          status: order.status,
          items: order.items || [],
          total: order.total,
          address: order.delivery_address,
        }))

        setNotifications(chats)
        setSelected(prev => {
          if (prev) {
            const updated = chats.find(c => c.id === prev.id)
            return updated || prev
          }
          return chats.length > 0 ? chats[0] : null
        })
      } catch (err) {
        console.error('Error cargando mensajes', err)
      } finally {
        if (isFirstLoad) {
          setLoading(false)
          isFirstLoad = false
        }
      }
    }
    
    loadNotifications()
    const interval = setInterval(loadNotifications, 10000) // Sincroniza cada 10 segundos
    return () => clearInterval(interval)
  }, [t])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected])

  const filtered = notifications.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.lastMsg.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status) => {
    const map = {
      pending: 'text-yellow-500',
      confirmed: 'text-blue-500',
      preparing: 'text-purple-500',
      on_the_way: 'text-cyan-500',
      delivered: 'text-green-500',
      cancelled: 'text-red-500',
    }
    return map[status] || 'text-gray-500'
  }

  const getStatusLabel = (status) => {
    const map = {
      pending:    `⏳ ${t('orders.status_pending')}`,
      confirmed:  `✓ ${t('orders.status_confirmed')}`,
      preparing:  `🔥 ${t('orders.status_preparing')}`,
      on_the_way: `🛵 ${t('orders.status_on_the_way')}`,
      delivered:  `✅ ${t('orders.status_delivered')}`,
      cancelled:  `✕ ${t('orders.status_cancelled')}`,
    }
    return map[status] || status
  }

  return (
    <div className="h-[calc(100vh-140px)] animate-fade-in bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden">
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50 flex-shrink-0">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h3 className="font-bold text-gray-800 mb-3">{t('rd.messages')}</h3>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <span className="text-gray-400">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('rd.search_msg')}
              className="bg-transparent outline-none w-full text-sm text-gray-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">{t('rd.loading')}</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">{t('rd.no_results')}</div>
          ) : (
            filtered.map(chat => (
              <div
                key={chat.id}
                onClick={() => setSelected(chat)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  selected?.id === chat.id
                    ? 'bg-red-50 border border-red-100'
                    : chat.unread
                      ? 'bg-white shadow-sm border border-gray-100'
                      : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {chat.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-sm truncate ${chat.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {chat.name}
                    </p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className={`text-xs truncate ${chat.unread ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                    {chat.lastMsg}
                  </p>
                </div>
                {chat.unread && <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />}
              </div>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 text-white flex items-center justify-center font-bold text-sm">
                {selected.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-800">{selected.name}</p>
                <p className={`text-xs font-semibold ${getStatusColor(selected.status)}`}>
                  {getStatusLabel(selected.status)}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              #{String(selected.id).padStart(5, '0')}
            </span>
          </div>

          <div className="flex-1 p-6 bg-slate-50 overflow-y-auto flex flex-col gap-4">
            <div className="text-center text-xs font-semibold text-gray-400 my-1">
              {selected.date.toLocaleDateString('es-CO', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>

            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-400 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {selected.avatar}
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                <p className="text-sm text-gray-700 mb-2">{t('rd.order_message') || 'Hola, acabo de realizar un pedido. Aquí el resumen:'}</p>
                {selected.items && selected.items.length > 0 ? (
                  <div className="space-y-1">
                    {selected.items.map((item, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        • {item.quantity || item.qty}x {item.product?.name || item.name}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">{t('rd.order_details_hint') || 'Ver detalle en sección de Pedidos'}</p>
                )}
                {selected.address && (
                  <p className="text-xs text-gray-400 mt-2"><i className="fas fa-map-marker-alt mr-1"></i> {selected.address}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-2">{selected.time}</p>
              </div>
            </div>

            <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse">
              <div className="bg-red-500 p-4 rounded-2xl rounded-tr-none shadow-md text-sm text-white">
                <p>
                  {selected.status === 'pending'
                    ? t('rd.reply_pending') || '¡Hola! Recibimos tu pedido y lo estamos revisando. Te confirmaremos en breve.'
                    : selected.status === 'confirmed'
                      ? t('rd.reply_confirmed') || '¡Pedido confirmado! Ya estamos preparando tu orden.'
                      : selected.status === 'preparing'
                        ? t('rd.reply_preparing') || '<i className="fas fa-user-tie mr-1"></i> Tu pedido está siendo preparado con mucho cariño.'
                        : selected.status === 'on_the_way'
                          ? t('rd.reply_on_the_way') || '<i className="fas fa-motorcycle mr-1"></i> Tu pedido ya salió en camino. ¡Llegará pronto!'
                          : selected.status === 'delivered'
                            ? t('rd.reply_delivered') || '¡Pedido entregado! Esperamos que lo hayas disfrutado. 😊'
                            : t('rd.reply_default') || 'Gracias por contactarnos.'}
                </p>
                <p className="text-[10px] text-red-200 mt-2">{selected.time}</p>
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{t('rd.total')}</span>
                <span className="font-black text-gray-800 text-lg">
                  ${Number(selected.total || 0).toLocaleString('es-CO')}
                </span>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                selected.status === 'delivered' ? 'bg-green-100 text-green-700' :
                selected.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {getStatusLabel(selected.status)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="text-6xl mb-4"><i className="fas fa-comment mr-1"></i></div>
          <p className="font-semibold text-gray-600">{t('rd.select_order') || 'Selecciona un pedido'}</p>
          <p className="text-sm mt-1">{t('rd.select_order_hint') || 'Verás el detalle de la conversación aquí'}</p>
        </div>
      )}
    </div>
  )
}