// Archivo: src/components/NotificationsTab.jsx | Comentario: logica principal del modulo.
import { useEffect, useState } from 'react';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api/notifications';

export default function NotificationsTab() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getNotifications();
      const payload = data?.data?.data ?? data?.data ?? data;
      setNotifications(Array.isArray(payload) ? payload : []);
      setUnreadCount(data?.unread_count ?? 0);
    } catch (err) {
      setError(err.message || t('profile.no_notifications'));
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {
    setActionId(id);
    try {
      await markNotificationAsRead(id);
      await loadNotifications();
    } catch (err) {
      setError(err.message || t('profile.no_notifications'));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await deleteNotification(id);
      await loadNotifications();
    } catch (err) {
      setError(err.message || t('profile.no_notifications'));
    } finally {
      setActionId(null);
    }
  };

  const handleMarkAll = async () => {
    setActionId('all');
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (err) {
      setError(err.message || t('profile.no_notifications'));
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('subscriptionTab.loading')}</div>;
  }

  return (
    <div className="component-notifications-tab">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{t('profile.notifications')}</h2>
          <p style={{ color: '#9aa0a6', margin: 0 }}>{unreadCount > 0 ? `${unreadCount} ${t('profile.notifications')}` : t('profile.no_notifications')}</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={actionId === 'all'}
            style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#FF4B3E', color: 'white', fontWeight: 700, cursor: actionId === 'all' ? 'not-allowed' : 'pointer' }}
          >
            {actionId === 'all' ? t('subscriptionTab.processing') : t('notificationsTab.mark_all_read') || 'Marcar todas como leídas'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#fff5f5', border: '1px solid #fca5a5', color: '#dc2626', fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9aa0a6' }}>
            <span style={{ fontSize: 48 }}>🔔</span>
            <p style={{ marginTop: 12, fontWeight: 600 }}>{t('profile.no_notifications')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <article
              key={notification.id}
              style={{
                borderRadius: 14,
                border: `1px solid ${notification.is_read ? '#ececec' : '#ffd0cb'}`,
                background: notification.is_read ? '#ffffff' : '#fff7f6',
                padding: '16px 18px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, color: '#2c2c2c' }}>{notification.title}</p>
                  <p style={{ margin: '8px 0 0', color: '#4b5563', lineHeight: 1.6 }}>{notification.message}</p>
                  <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9aa0a6' }}>
                    {notification.created_at ? new Date(notification.created_at).toLocaleString('es-CO') : ''}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'start', flexShrink: 0 }}>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleRead(notification.id)}
                      disabled={actionId === notification.id}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: actionId === notification.id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      {actionId === notification.id ? t('subscriptionTab.processing') : t('notificationsTab.read') || 'Leer'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    disabled={actionId === notification.id}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', cursor: actionId === notification.id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700 }}
                  >
                    {actionId === notification.id ? t('subscriptionTab.processing') : t('notificationsTab.delete') || 'Eliminar'}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}