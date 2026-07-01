// Frontend/src/components/AdminDashboard/NotificationsSection.jsx
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../services/adminApi'

const TARGET_LABELS = {
  all: 'Todos los usuarios',
  clients: 'Solo clientes',
  restaurants: 'Solo restaurantes',
  premium: 'Usuarios premium',
  drivers: 'Conductores',
}

const TARGET_ICONS = {
  all: '🌐',
  clients: '👤',
  restaurants: '🍽️',
  premium: '⭐',
  drivers: '🚗',
}

export default function NotificationsSection({ showToast }) {
  const { t } = useTranslation()

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ title: '', message: '', target: 'all' })
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState(null) // { sent_to, target }

  // ── Cargar notificaciones del admin (propias) ────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setLoadingNotifs(true)
    setError(null)
    try {
      const res = await adminApi.getNotifications()
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : []
      setNotifications(list)
    } catch {
      setError('No se pudieron cargar las notificaciones.')
    } finally {
      setLoadingNotifs(false)
    }
  }, [])

  // ── Cargar historial de broadcast ────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await adminApi.getNotificationHistory()
      const list = Array.isArray(res.data) ? res.data : []
      setHistory(list)
    } catch {
      // silencioso — el historial es secundario
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    loadHistory()
  }, [loadNotifications, loadHistory])

  // ── Acciones propias ─────────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch {
      showToast('Error al marcar notificación', 'error')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      showToast('Todas las notificaciones marcadas como leídas')
    } catch {
      showToast('Error al actualizar notificaciones', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      showToast('Notificación eliminada')
    } catch {
      showToast('Error al eliminar notificación', 'error')
    }
  }

  // ── Enviar broadcast real ─────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      showToast('Completa el asunto y el mensaje', 'error')
      return
    }
    setSending(true)
    setLastResult(null)
    try {
      const res = await adminApi.broadcastNotification({
        target:  form.target,
        title:   form.title.trim(),
        message: form.message.trim(),
      })

      const data = res.data ?? res
      const sentTo = data?.sent_to ?? 0
      setLastResult({ sent_to: sentTo, target: form.target })
      showToast(`✅ Notificación enviada a ${sentTo} usuario(s)`)
      setForm({ title: '', message: '', target: 'all' })
      loadHistory() // refrescar historial
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al enviar la notificación'
      showToast(msg, 'error')
    } finally {
      setSending(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter(n => !n.is_read).length

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const inputClass = "w-full border-2 border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 dark:focus:border-red-400 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 transition"
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2 tracking-wider"

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: notifications.length,              color: 'text-gray-800 dark:text-slate-100' },
          { label: 'Sin leer', value: unreadCount,                       color: 'text-red-500' },
          { label: 'Leídas',   value: notifications.length - unreadCount, color: 'text-green-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Formulario de envío ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">
            Enviar Notificación
          </h3>

          {/* Target */}
          <div>
            <label className={labelClass}>Destinatarios</label>
            <select
              value={form.target}
              onChange={e => setForm({ ...form, target: e.target.value })}
              className={inputClass}
            >
              {Object.entries(TARGET_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Asunto / Title */}
          <div>
            <label className={labelClass}>Asunto</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Mantenimiento del sistema"
              maxLength={150}
              className={inputClass}
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className={labelClass}>Mensaje</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Escribe el mensaje que se enviará..."
              rows="4"
              maxLength={1000}
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-right text-gray-400 mt-1">{form.message.length}/1000</p>
          </div>

          {/* Resultado del último envío */}
          {lastResult && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium">
              <span>✅</span>
              <span>
                Enviado a <strong>{lastResult.sent_to}</strong> usuario(s) •{' '}
                {TARGET_ICONS[lastResult.target]} {TARGET_LABELS[lastResult.target]}
              </span>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Enviando...
              </>
            ) : (
              '📣 Enviar Notificación'
            )}
          </button>
        </div>

        {/* ── Panel derecho: historial de broadcast + notificaciones propias ── */}
        <div className="flex flex-col gap-4">

          {/* Historial de broadcast */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base mb-4">
              📋 Historial de Envíos
            </h3>

            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-red-500 border-t-transparent" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-6">Sin envíos anteriores</p>
            ) : (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40">
                    <span className="text-lg flex-shrink-0">{TARGET_ICONS[h.target] ?? '📣'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate">{h.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{h.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 dark:text-slate-500">{formatDate(h.sent_at)}</span>
                        <span className="text-xs font-bold text-blue-500">→ {h.total_sent} usuarios</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notificaciones propias del admin */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base">
                🔔 Mis Notificaciones
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-red-500 hover:text-red-600 transition"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>

            {loadingNotifs ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-7 w-7 border-4 border-red-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-400 text-sm">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                <p className="text-3xl mb-2">🔕</p>
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex gap-3 p-3 rounded-xl border transition group ${
                      !n.is_read
                        ? 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10'
                        : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center flex-shrink-0 text-sm">
                      {!n.is_read ? '🔵' : '📨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate">
                        {n.data?.title || n.title || 'Notificación'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {n.data?.message || n.message || ''}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{formatDate(n.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 transition text-xs"
                          title="Marcar como leída"
                        >✓</button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition text-xs"
                        title="Eliminar"
                      >🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}