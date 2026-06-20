import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { getAssistantReply, supportShortcuts } from '../utils/supportAssistant'
import { useCart } from '../context/useCart'

const AI_ENDPOINT = import.meta.env.VITE_AI_ASSISTANT_URL || '/api/support/chat'

function makeMessage(role, text, meta = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    ...meta,
  }
}

async function resolveAnswer(message, history) {
  if (AI_ENDPOINT) {
    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      })

      if (response.ok) {
        const data = await response.json()
        const reply = data.reply || data.answer || data.message || data.text
        if (reply) {
          const fallback = getAssistantReply(message)
          return {
            reply,
            action: data.action || fallback.action || null,
          }
        }
      }
    } catch (error) {
      console.warn('AI assistant fallback:', error)
    }
  }

  return getAssistantReply(message)
}

export default function SupportChatbot({ embedded = false, startOpen = false }) {
  const { t } = useTranslation()
  const location = useLocation()
  const bottomRef = useRef(null)
  const [open, setOpen] = useState(embedded || startOpen)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState([
    makeMessage('assistant', t('supportChatbot.welcome') || 'Hola, soy el asistente de AppiFood. Puedo ayudarte con pedidos, pagos, direcciones y suscripciones.'),
  ])

  const hiddenRoutes = ['/support', '/user/support', '/coupons']
  const hiddenOnPage = !embedded && hiddenRoutes.includes(location.pathname)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, open])

  const quickActions = useMemo(() => supportShortcuts.slice(0, 4), [])

  const { isOpen: isCartOpen } = useCart()
  const [isNearFooter, setIsNearFooter] = useState(false)

  // Detectar scroll cerca del footer
  useEffect(() => {
    if (embedded) return
    const handleScroll = () => {
      const threshold = 180
      const totalHeight = document.documentElement.scrollHeight
      const currentScroll = window.innerHeight + window.scrollY
      
      if (totalHeight - currentScroll < threshold) {
        setIsNearFooter(true)
      } else {
        setIsNearFooter(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [embedded])

  if (hiddenOnPage) return null

  const sendMessage = async (text) => {
    const clean = text.trim()
    if (!clean || isSending) return

    const history = [...messages, makeMessage('user', clean)]
    setMessages(history)
    setInput('')
    setIsSending(true)

    try {
      const answer = await resolveAnswer(clean, history)
      setMessages((current) => [
        ...current,
        makeMessage('assistant', answer.reply, { action: answer.action || null }),
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        makeMessage('assistant', t('supportChatbot.error') || 'No pude procesar tu mensaje en este momento. Abre el centro de soporte o intenta de nuevo.'),
      ])
    } finally {
      setIsSending(false)
    }
  }

  const panel = (
    <div className={`component-support-chatbot bg-white border border-gray-200 shadow-2xl overflow-hidden ${embedded ? 'rounded-3xl' : 'rounded-2xl w-[min(88vw,380px)] max-h-[min(70vh,680px)]'}`}>
      <div className="bg-white text-gray-900 border-b border-gray-100 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-lg">{t('supportChatbot.title') || 'Asistente IA'}</p>
          <p className="text-gray-500 text-xs">{t('supportChatbot.subtitle') || 'Respuestas rápidas sobre pedidos, pagos y soporte'}</p>
        </div>
        {!embedded && (
          <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-700">
            <i className="fas fa-chevron-down text-sm" />
          </button>
        )}
      </div>

      <div className={`${embedded ? 'h-[620px]' : 'h-[420px] sm:h-[460px]'} flex flex-col`}>
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-[#fff8f6] space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === 'user'
                  ? 'bg-[#FF4B3E] text-white rounded-br-md'
                  : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md'
                }`}
              >
                <p>{message.text}</p>
                {message.action && (
                  <Link
                    to={message.action.path}
                    className={`inline-flex mt-3 px-3 py-2 rounded-xl text-xs font-bold transition ${message.role === 'user' ? 'bg-white text-[#FF4B3E]' : 'bg-[#FF4B3E] text-white hover:opacity-90'}`}
                  >
                    {message.action.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-sm">
                {t('supportChatbot.typing') || 'Escribiendo respuesta...'}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-4 bg-white space-y-3">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-[#fff0ed] hover:text-[#FF4B3E] transition text-xs font-semibold"
              >
                <i className={`fas ${item.icon}`} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && sendMessage(input)}
              placeholder={t('supportChatbot.placeholder') || "Escribe tu pregunta..."}
              className="flex-1 min-w-0 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]/20 focus:border-[#FF4B3E] text-sm"
            />
            <button
              onClick={() => sendMessage(input)}
              className="px-4 py-3 rounded-2xl bg-[#FF4B3E] text-white font-bold hover:bg-[#e03a2d] transition disabled:opacity-60"
              disabled={isSending}
            >
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (embedded) return panel

  const shouldHideFloating = isCartOpen || isNearFooter

  return (
    <div 
      className={`component-support-chatbot-float fixed bottom-[4.25rem] right-5 sm:bottom-[4.75rem] sm:right-8 z-[9998] flex flex-col items-end gap-3 transition-all duration-300 ${shouldHideFloating ? 'opacity-0 pointer-events-none scale-90 translate-y-4' : 'opacity-100'}`}
    >
      {open ? (
        panel
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#FF4B3E] to-[#FF7A59] text-white border-2 border-white shadow-xl shadow-[#FF4B3E]/30 flex items-center justify-center hover:scale-105 transition"
          aria-label={t('supportChatbot.open_aria') || "Abrir asistente de soporte"}
        >
          <i className="fas fa-message text-xl group-hover:scale-110 transition" />
        </button>
      )}
    </div>
  )
}
