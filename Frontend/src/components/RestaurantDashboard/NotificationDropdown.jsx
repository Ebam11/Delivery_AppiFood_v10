    import { useState, useRef, useEffect } from 'react'
    import { useTranslation } from 'react-i18next'
    import { COLORS } from '../../data/restaurantDashboardData'

    /**
     * Dropdown de notificaciones para el panel del restaurante.
     * Se abre/cierra con el botón de la campana en TopBar.
     * Reutiliza los mismos endpoints que NotificationsTab del perfil de usuario.
     */
    export default function NotificationDropdown({ notifications = [], unreadCount = 0, onRead, onDelete, onMarkAll }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [actionId, setActionId] = useState(null)
    const ref = useRef(null)

    // Cerrar al hacer click fuera del dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            setOpen(false)
        }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleRead = async (id) => {
        setActionId(id)
        try {
        await onRead(id)
        } finally {
        setActionId(null)
        }
    }

    const handleDelete = async (id) => {
        setActionId(id)
        try {
        await onDelete(id)
        } finally {
        setActionId(null)
        }
    }

    const handleMarkAll = async () => {
        setActionId('all')
        try {
        await onMarkAll()
        } finally {
        setActionId(null)
        }
    }

    return (
        <div className="relative" ref={ref}>

        {/* Botón campana */}
        <button
            onClick={() => setOpen(prev => !prev)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition"
        >
            🔔
            {unreadCount > 0 && (
            <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ background: COLORS.primary }}
            >
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            )}
        </button>

        {/* Dropdown */}
        {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

            {/* Header del dropdown */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">
                {t('profile.notifications')}
                {unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: COLORS.primary }}>
                    {unreadCount}
                    </span>
                )}
                </p>
                {unreadCount > 0 && (
                <button
                    onClick={handleMarkAll}
                    disabled={actionId === 'all'}
                    className="text-xs font-semibold disabled:opacity-50 hover:underline"
                    style={{ color: COLORS.primary }}
                >
                    {actionId === 'all'
                    ? t('subscriptionTab.processing')
                    : t('notificationsTab.mark_all_read') || 'Marcar todas'}
                </button>
                )}
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <span className="text-3xl mb-2">🔔</span>
                    <p className="text-xs font-semibold">{t('profile.no_notifications')}</p>
                </div>
                ) : (
                notifications.map(n => (
                    <div
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 items-start transition ${!n.is_read ? 'bg-red-50/50' : 'bg-white'}`}
                    >
                    {/* Indicador no leído */}
                    <div className="mt-1.5 flex-shrink-0">
                        {!n.is_read
                        ? <span className="w-2 h-2 rounded-full block" style={{ background: COLORS.primary }} />
                        : <span className="w-2 h-2 rounded-full block bg-transparent" />
                        }
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                        {n.created_at ? new Date(n.created_at).toLocaleString('es-CO') : ''}
                        </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                        {!n.is_read && (
                        <button
                            onClick={() => handleRead(n.id)}
                            disabled={actionId === n.id}
                            className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            {t('notificationsTab.read') || 'Leer'}
                        </button>
                        )}
                        <button
                        onClick={() => handleDelete(n.id)}
                        disabled={actionId === n.id}
                        className="text-[10px] px-2 py-1 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 disabled:opacity-50 transition"
                        >
                        {t('notificationsTab.delete') || 'Eliminar'}
                        </button>
                    </div>
                    </div>
                ))
                )}
            </div>

            </div>
        )}
        </div>
    )
    }