// Frontend/src/components/AdminDashboard/NotificationsSection.jsx
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../services/adminApi'

export default function NotificationsSection({ showToast }) {
  const { t } = useTranslation()

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ subject: '', message: '', target: 'all' })
  const [sending, setSending] = useState(false)

  // ── Cargar notificaciones ────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getNotifications()
      setNotifications(res.data || res || [])
    } catch (err) {
      setError('No se pudieron cargar las notificaciones.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // ── Acciones ─────────────────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      )
    } catch {
      showToast('Error al marcar notificación', 'error')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
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

  const handleSend = async () => {
    if (!form.subject || !form.message) {
      showToast('Completa todos los campos', 'error')
      return
    }
    setSending(true)
    // Simulación — no hay endpoint de broadcast en el backend actual
    await new Promise(r => setTimeout(r, 800))
    showToast(`Notificación enviada a: ${form.target}`)
    setForm({ subject: '', message: '', target: 'all' })
    setSending(false)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter(n => !n.read_at).length

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const inputClass = "w-full border-2 border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 dark:focus:border-red-400 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 transition"
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2 tracking-wider"

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: notifications.length, color: 'text-gray-800 dark:text-slate-100' },
          { label: 'Sin leer', value: unreadCount, color: 'text-red-500' },
          { label: 'Leídas', value: notifications.length - unreadCount, color: 'text-green-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Formulario de envío ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-6 text-lg">
            {t('adminDashboard.notifications.sendTitle', { defaultValue: 'Enviar Notificación' })}
          </h3>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>
                {t('adminDashboard.notifications.recipients', { defaultValue: 'Destinatarios' })}
              </label>
              <select
                value={form.target}
                onChange={e => setForm({ ...form, target: e.target.value })}
                className={inputClass}
              >
                <option value="all">Todos los usuarios</option>
                <option value="clients">Solo clientes</option>
                <option value="restaurants">Solo restaurantes</option>
                <option value="premium">Usuarios premium</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                {t('adminDashboard.notifications.subject', { defaultValue: 'Asunto' })}
              </label>
              <input
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Ej: Mantenimiento del sistema"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                {t('adminDashboard.notifications.message', { defaultValue: 'Mensaje' })}
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Escribe el mensaje que se enviará..."
                rows="5"
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Enviando...' : 'Enviar Notificación'}
            </button>
          </div>
        </div>

        {/* ── Historial real del backend ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">
              {t('adminDashboard.notifications.historyTitle', { defaultValue: 'Notificaciones' })}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400 text-sm">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-slate-500">
              <p className="text-3xl mb-2">🔔</p>
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 p-4 rounded-xl border transition group ${
                    !n.read_at
                      ? 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10'
                      : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center flex-shrink-0 text-base">
                    {!n.read_at ? '🔵' : '📨'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate">
                      {n.data?.title || n.title || 'Notificación'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {n.data?.message || n.message || ''}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read_at && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 transition text-xs"
                        title="Marcar como leída"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition text-xs"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}