import { Link } from 'react-router-dom'
import SupportChatbot from '../components/SupportChatbot'
import { supportFaqs, supportShortcuts } from '../utils/supportAssistant'

const faqBadgeStyles = {
  'Pedidos y pagos': 'bg-red-50 text-[#FF4B3E] border-red-100',
  'Cuenta y direcciones': 'bg-blue-50 text-blue-700 border-blue-100',
  'Restaurantes y pedidos': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Suscripción y ayuda': 'bg-amber-50 text-amber-700 border-amber-100',
}

export default function Support() {
  return (
    <main className="min-h-screen bg-[#fff8f6] pt-8 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,75,62,0.16),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(255,122,89,0.12),_transparent_38%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-[#FF4B3E] font-bold text-sm shadow-sm">
              <i className="fas fa-headset" /> Centro de soporte
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Resuelve dudas de tus pedidos con un asistente inteligente.
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl">
              Pregunta por pedidos, pagos, direcciones, suscripción o restaurantes. Si necesitas ir rápido, usa los accesos directos o abre el chat.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportShortcuts.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#fff0ed] text-[#FF4B3E] flex items-center justify-center mb-4">
                  <i className={`fas ${item.icon}`} />
                </div>
                <h2 className="font-black text-gray-900 text-lg">{item.label}</h2>
                <p className="mt-1 text-sm text-gray-500">Acceso directo para resolver un caso frecuente.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] items-start">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900">Asistente AppiFood</h2>
              <p className="text-gray-500 mt-1">Respuestas inmediatas para soporte y navegación dentro de la app.</p>
            </div>
            <div className="p-4 sm:p-6">
              <SupportChatbot embedded />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-4">Preguntas frecuentes</h2>
              <div className="space-y-6">
                {supportFaqs.map((group) => (
                  <div key={group.category}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${faqBadgeStyles[group.category] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                        {group.category}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {group.items.map((faq) => (
                        <div key={faq.question} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                          <h3 className="font-bold text-gray-900">{faq.question}</h3>
                          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FF4B3E] to-[#FF7A59] rounded-3xl p-6 text-white shadow-xl">
              <h2 className="text-2xl font-black">¿Necesitas más ayuda?</h2>
              <p className="mt-2 text-white/90 leading-relaxed">
                Usa el asistente para respuestas rápidas y navega al módulo que necesites sin perder tiempo.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/help-center" className="px-4 py-3 rounded-2xl bg-white text-[#FF4B3E] font-bold text-sm shadow-sm">
                  Centro de ayuda
                </Link>
                <Link to="/user/orders" className="px-4 py-3 rounded-2xl bg-white text-[#FF4B3E] font-bold text-sm shadow-sm">
                  Ver pedidos
                </Link>
                <Link to="/user/profile" className="px-4 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/20">
                  Ir a mi perfil
                </Link>
                <Link to="/subscription" className="px-4 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/20">
                  Suscripción
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
