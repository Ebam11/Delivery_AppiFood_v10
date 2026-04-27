import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAssistantReply, supportShortcuts } from '../utils/supportAssistant'

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

export default function SupportChatbot({ embedded = false }) {
  const location = useLocation()
  const bottomRef = useRef(null)
  const [open, setOpen] = useState(embedded)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState([
    makeMessage('assistant', 'Hola, soy el asistente de AppiFood. Puedo ayudarte con pedidos, pagos, direcciones y suscripciones.'),
  ])

  const hiddenRoutes = ['/support', '/user/support', '/coupons']
  const hiddenOnPage = !embedded && hiddenRoutes.includes(location.pathname)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, open])

  const quickActions = useMemo(() => supportShortcuts.slice(0, 4), [])

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
        makeMessage('assistant', 'No pude procesar tu mensaje en este momento. Abre el centro de soporte o intenta de nuevo.'),
      ])
    } finally {
      setIsSending(false)
    }
  }

  const panel = (
    <div className={`component-support-chatbot bg-white border border-gray-200 shadow-2xl overflow-hidden ${embedded ? 'rounded-3xl' : 'rounded-3xl w-[min(92vw,420px)] max-h-[min(78vh,720px)]'}`}>
      <div className="bg-gradient-to-r from-[#FF4B3E] to-[#FF7A59] text-white p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-lg">Asistente AppiFood</p>
          <p className="text-white/85 text-xs">Soporte inteligente y respuestas rápidas</p>
        </div>
        {!embedded && (
          <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center">
            <i className="fas fa-minus text-sm" />
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
                Escribiendo respuesta...
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
              placeholder="Escribe tu pregunta..."
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

  return (
    <div className="component-support-chatbot-float fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[80] flex flex-col items-end gap-3">
      {open ? (
        panel
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#FF4B3E] to-[#FF7A59] text-white border-2 border-white shadow-xl shadow-[#FF4B3E]/30 flex items-center justify-center hover:scale-105 transition"
          aria-label="Abrir asistente de soporte"
        >
          <i className="fas fa-message text-xl group-hover:scale-110 transition" />
        </button>
      )}
    </div>
  )
}
