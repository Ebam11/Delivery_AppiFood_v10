import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SupportChatbot from '../components/SupportChatbot'
import { fetchJson } from '../api/fetchJson'
import { supportFaqs, supportShortcuts } from '../utils/supportAssistant'

const faqBadgeStyles = {
  'Pedidos y pagos': 'bg-red-50 text-[#FF4B3E] border-red-100',
  'Cuenta y direcciones': 'bg-blue-50 text-blue-700 border-blue-100',
  'Restaurantes y pedidos': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Suscripción y ayuda': 'bg-amber-50 text-amber-700 border-amber-100',
}

export default function Support() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeChat, setActiveChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Cargar pedidos del usuario para dar soporte sobre pedidos activos
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoadingOrders(true)
        const response = await fetchJson('/api/orders')
        // Laravel paginate wrap check
        const list = Array.isArray(response) ? response : response?.data?.data || response?.data || []
        setOrders(list)
      } catch (err) {
        console.warn('Error al obtener pedidos para soporte:', err)
      } finally {
        setLoadingOrders(false)
      }
    }
    loadOrders()
  }, [])

  // Auto-scroll en el chat con el restaurante
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, typing])

  const openChatWithRestaurant = (order) => {
    setActiveChat(order)
    setChatMessages([
      {
        id: 1,
        sender: 'restaurant',
        name: order.restaurant_name || 'Restaurante',
        text: `¡Hola! Gracias por contactarnos sobre tu pedido #${order.id}. ¿En qué te podemos ayudar?`,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      name: 'Tú',
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }

    setChatMessages(prev => [...prev, userMsg])
    const currentInput = inputValue.trim().toLowerCase()
    setInputValue('')
    setTyping(true)

    // Simular respuesta inteligente del restaurante tras 1.5 segundos
    setTimeout(() => {
      setTyping(false)
      let replyText = 'Hola, recibimos tu mensaje. Estamos verificando los detalles de tu orden con el personal de cocina.'

      if (currentInput.includes('cebolla') || currentInput.includes('salsa') || currentInput.includes('ingrediente') || currentInput.includes('queso')) {
        replyText = '¡Entendido! Acabamos de reportar este requerimiento especial a nuestro chef para que preparen tu pedido tal como lo solicitas. ¡Muchas gracias por avisarnos!'
      } else if (currentInput.includes('demora') || currentInput.includes('cuanto') || currentInput.includes('cuánto') || currentInput.includes('tiempo') || currentInput.includes('tarda')) {
        const orderStatus = String(activeChat?.status || '').toLowerCase()
        if (orderStatus === 'preparing' || orderStatus === 'preparando') {
          replyText = 'Tu pedido ya está en preparación y se encuentra en su fase final en la cocina. Saldrá con un repartidor en aproximadamente 10 minutos.'
        } else if (orderStatus === 'on_the_way' || orderStatus === 'en_camino') {
          replyText = 'El pedido ya fue recogido por el repartidor y va en camino a tu dirección. Puedes seguir el mapa de entrega en los detalles de tu orden.'
        } else {
          replyText = 'Estamos procesando tu orden lo más rápido posible. El tiempo estimado de entrega total es de 30-40 minutos.'
        }
      } else if (currentInput.includes('dirección') || currentInput.includes('direccion') || currentInput.includes('casa') || currentInput.includes('apto') || currentInput.includes('apartamento')) {
        replyText = `Confirmamos que la dirección de envío registrada es "${activeChat?.delivery_address || 'tu dirección actual'}". Si necesitas modificarla de urgencia, coméntanoslo por aquí.`
      }

      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'restaurant',
        name: activeChat?.restaurant_name || 'Restaurante',
        text: replyText,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }])
    }, 1500)
  }

  const getStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'pending' || s === 'pendiente') return 'bg-yellow-50 text-yellow-755 border-yellow-200'
    if (s === 'confirmed' || s === 'confirmado') return 'bg-blue-50 text-blue-755 border-blue-200'
    if (s === 'preparing' || s === 'preparando') return 'bg-purple-50 text-purple-755 border-purple-200'
    if (s === 'on_the_way' || s === 'en_camino') return 'bg-cyan-50 text-cyan-755 border-cyan-200'
    if (s === 'delivered' || s === 'entregado') return 'bg-green-50 text-green-755 border-green-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Esperando Pago/Confirmación',
      confirmed: 'Confirmado por Restaurante',
      preparing: 'En preparación 🍳',
      on_the_way: 'En camino 🛵',
      delivered: 'Entregado ✓',
      cancelled: 'Cancelado ✕',
    }
    return labels[status] || status
  }

  return (
    <main className="page-support min-h-screen bg-[#fff8f6] dark:bg-slate-950 transition-colors duration-300 pt-8 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,75,62,0.16),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(255,122,89,0.12),_transparent_38%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-[#FF4B3E] font-bold text-sm shadow-sm transition-colors duration-300">
              <i className="fas fa-headset" /> {t('supportPage.badge') || 'Centro de soporte'}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight transition-colors duration-300">
              {t('supportPage.title') || 'Resuelve dudas de tus pedidos con un asistente inteligente.'}
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl transition-colors duration-300">
              {t('supportPage.subtitle') || 'Pregunta por pedidos, pagos, direcciones, suscripción o restaurantes. Si necesitas ir rápido, usa los accesos directos o abre el chat.'}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportShortcuts.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#fff0ed] dark:bg-red-950/40 text-[#FF4B3E] flex items-center justify-center mb-4 transition-colors duration-300">
                  <i className={`fas ${item.icon}`} />
                </div>
                <h2 className="font-black text-gray-900 dark:text-gray-100 text-lg transition-colors duration-300">{item.label}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{t('supportPage.shortcut_desc') || 'Acceso directo para resolver un caso frecuente.'}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN DEL CHAT CON EL RESTAURANTE (Rappi-style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl p-6 sm:p-8 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-lg">
              <i className="fas fa-store" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Pedidos Activos y Soporte de Restaurante</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-semibold mt-0.5">Comunícate directamente con el comercio si tienes algún requerimiento de cocina o entrega</p>
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-8 flex items-center justify-center gap-2 text-gray-400">
              <i className="fas fa-spinner fa-spin text-xl" />
              <span className="font-semibold text-sm">Cargando tus pedidos...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl">
              <i className="fas fa-receipt text-3xl mb-2 opacity-30" />
              <p className="text-sm font-semibold">No tienes pedidos activos ni recientes registrados en tu cuenta.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition duration-200"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-black text-gray-900 dark:text-white text-base truncate">{order.restaurant_name || 'Restaurante'}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-semibold space-y-1">
                      <p><i className="fas fa-hashtag mr-1" /> Pedido #{order.id}</p>
                      <p><i className="far fa-calendar mr-1" /> {new Date(order.created_at).toLocaleDateString('es-ES')}</p>
                      <p><i className="fas fa-wallet mr-1" /> COP ${Number(order.total).toLocaleString('es-CO')}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => openChatWithRestaurant(order)}
                    className="mt-5 w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-orange-500/10"
                  >
                    <i className="fas fa-comments" />
                    <span>Hablar con el restaurante</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] items-start">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">{t('supportPage.assistant_title') || 'Asistente AppiFood'}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{t('supportPage.assistant_desc') || 'Respuestas inmediatas para soporte y navegación dentro de la app.'}</p>
            </div>
            <div className="p-4 sm:p-6">
              <SupportChatbot embedded />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-lg p-6 transition-colors duration-300">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('supportPage.faqs_title') || 'Preguntas frecuentes'}</h2>
              <div className="space-y-6">
                {supportFaqs.map((group) => (
                  <div key={group.category}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${faqBadgeStyles[group.category] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                        {t(`supportPage.faq_category.${group.category.replace(/\s/g, '_')}`, { defaultValue: group.category })}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {group.items.map((faq) => {
                        const key = faq.question.replace(/[¿?]/g, '').trim().replace(/\s/g, '_')
                        return (
                          <div key={faq.question} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                              {t(`supportPage.faq_q.${key}`, { defaultValue: faq.question })}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                              {t(`supportPage.faq_a.${key}`, { defaultValue: faq.answer })}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FF4B3E] to-[#FF7A59] rounded-3xl p-6 text-white shadow-xl">
              <h2 className="text-2xl font-black">{t('supportPage.need_more_help') || '¿Necesitas más ayuda?'}</h2>
              <p className="mt-2 text-white/90 leading-relaxed">
                {t('supportPage.need_more_help_desc') || 'Usa el asistente para respuestas rápidas y navega al módulo que necesites sin perder tiempo.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/help-center" className="px-4 py-3 rounded-2xl bg-white text-[#FF4B3E] font-bold text-sm shadow-sm">
                  {t('supportPage.help_center') || 'Centro de ayuda'}
                </Link>
                <Link to="/user/orders" className="px-4 py-3 rounded-2xl bg-white text-[#FF4B3E] font-bold text-sm shadow-sm">
                  {t('supportPage.view_orders') || 'Ver pedidos'}
                </Link>
                <Link to="/user/profile" className="px-4 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/20">
                  {t('supportPage.go_to_profile') || 'Ir a mi perfil'}
                </Link>
                <Link to="/subscription" className="px-4 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/20">
                  {t('supportPage.subscription') || 'Suscripción'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAT MODAL INTERACTIVO CON EL RESTAURANTE */}
      {activeChat && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 w-[min(94vw,480px)] max-h-[82vh] flex flex-col overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-[#FF4B3E] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center font-black text-white text-lg">
                  {String(activeChat.restaurant_name || 'R').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-sm">{activeChat.restaurant_name || 'Restaurante'}</h3>
                  <p className="text-[10px] text-white/80 font-semibold mt-0.5">Soporte Pedido #{activeChat.id} · {getStatusLabel(activeChat.status)}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 transition"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/40 min-h-[300px]">
              {chatMessages.map(msg => {
                const isMe = msg.sender === 'user'
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold px-2 mb-1">
                      {msg.name} · {msg.time}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-[#FF4B3E] text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-850 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-800 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}

              {/* Indicador de escritura */}
              {typing && (
                <div className="flex flex-col items-start">
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold px-2 mb-1">
                    {activeChat.restaurant_name || 'Restaurante'} está escribiendo...
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-800 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje para el restaurante..."
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || typing}
                className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition active:scale-95 disabled:opacity-50"
              >
                <i className="fas fa-paper-plane" />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}