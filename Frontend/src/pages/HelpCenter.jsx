import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supportFaqs, supportShortcuts } from '../utils/supportAssistant'

const topicCards = [
  {
    title: 'Pedidos y pagos',
    description: 'Seguimiento, confirmación, cancelaciones y problemas de cobro.',
    icon: 'fa-receipt',
    path: '/user/orders',
  },
  {
    title: 'Cuenta y direcciones',
    description: 'Perfil, contraseña, direcciones guardadas y datos de usuario.',
    icon: 'fa-user-cog',
    path: '/user/profile',
  },
  {
    title: 'Restaurantes y menú',
    description: 'Buscar locales, ver el menú y agregar productos al carrito.',
    icon: 'fa-store',
    path: '/restaurants',
  },
  {
    title: 'Suscripción y ayuda',
    description: 'Planes, beneficios, soporte humano y preguntas frecuentes.',
    icon: 'fa-headset',
    path: '/support',
  },
]

export default function HelpCenter() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const flatFaqs = useMemo(() => (
    supportFaqs.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        category: group.category,
      }))
    )
  ), [])

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return flatFaqs

    return flatFaqs.filter((item) => {
      const haystack = `${item.category} ${item.question} ${item.answer}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [flatFaqs, query])

  return (
    <main className="page-help-center min-h-screen bg-[#fff8f6]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,75,62,0.14),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(255,122,89,0.12),_transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-[#FF4B3E] font-bold text-sm shadow-sm">
              <i className="fas fa-circle-info" /> {t('help.center') || "Centro de ayuda"}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              {t('help.title') || "Encuentra respuestas rápidas y sigue comprando sin perder tiempo."}
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl">
              {t('help.subtitle') || "Aquí agrupamos las preguntas frecuentes por tema para que el usuario encuentre solución por su cuenta o salte al chat cuando necesite una respuesta inmediata."}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('help.search_placeholder') || "Buscar por pedido, pago, dirección, restaurante..."}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#FF4B3E]/15 focus:border-[#FF4B3E] text-sm"
                />
              </div>
              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#FF4B3E] text-white font-bold hover:bg-[#e03a2d] transition"
              >
                <i className="fas fa-comments" /> {t('help.open_chat') || "Abrir chat"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          {topicCards.map((card) => (
            <Link
              key={card.title}
              to={card.path}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#fff0ed] text-[#FF4B3E] flex items-center justify-center mb-4">
                <i className={`fas ${card.icon}`} />
              </div>
              <h2 className="font-black text-gray-900 text-lg">{card.title}</h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{card.description}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{t('help.faqs') || "Preguntas frecuentes"}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('help.filtered_results') || "Resultados filtrados según tu búsqueda."}</p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                {filteredFaqs.length} {t('help.results_count') || "resultados"}
              </span>
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <article key={`${faq.category}-${faq.question}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">{faq.question}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                  {t('help.no_results') || "No encontramos resultados con ese término. Prueba con “pedido”, “pago”, “dirección” o “restaurante”."}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 sticky top-6">
            <div className="bg-gradient-to-br from-[#FF4B3E] to-[#FF7A59] rounded-3xl p-6 text-white shadow-xl">
              <h2 className="text-2xl font-black">{t('help.quick_support') || "Atención rápida"}</h2>
              <p className="mt-2 text-white/90 leading-relaxed">
                {t('help.quick_support_desc') || "Si la respuesta que buscas no aparece aquí, abre el chat inteligente o entra al módulo correspondiente."}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link to="/support" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-[#FF4B3E] font-bold shadow-sm">
                  <i className="fas fa-comments" /> {t('help.open_chatbot') || "Abrir chatbot"}
                </Link>
                <Link to="/user/orders" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 text-white font-bold border border-white/20">
                  <i className="fas fa-box" /> {t('help.review_orders') || "Revisar pedidos"}
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">{t('help.shortcuts') || "Accesos directos"}</h3>
              <div className="space-y-3">
                {supportShortcuts.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-gray-50 hover:bg-[#fff0ed] hover:text-[#FF4B3E] transition"
                  >
                    <i className={`fas ${item.icon} text-gray-400 w-4`} />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
