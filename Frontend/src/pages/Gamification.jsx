/**
 * Archivo: src/pages/Gamification.jsx
 * Sistema de gamificación y programa de lealtad para clientes de AppiFood.
 * Muestra el nivel actual (Bronce, Plata, Oro, Diamante), barra de progreso,
 * historial de misiones/puntos y permite redimir puntos por cupones.
 */
import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api/fetchJson';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import LoadingScreen from '../components/layout/LoadingScreen';
import '../styles/Gamification.css';

export default function Gamification() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [redeemedCoupon, setRedeemedCoupon] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const res = await fetchJson('/api/profile');
      const userData = res?.data || res;
      setUser(userData);
      // Actualizar localStorage para sincronizar puntos en la barra de navegación
      const localUserStr = localStorage.getItem('user');
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          localUser.points = userData.points;
          localStorage.setItem('user', JSON.stringify(localUser));
        } catch (_) {}
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Determinar nivel y progreso
  const getLevelInfo = (points) => {
    if (points < 150) {
      return {
        level: t('gamification.levels.bronze', { defaultValue: 'Bronce' }),
        icon: '🥉',
        min: 0,
        max: 150,
        color: 'from-amber-600 to-amber-800',
        nextLevel: t('gamification.levels.silver', { defaultValue: 'Plata' }),
        desc: t('gamification.levels.desc_bronze', { defaultValue: '¡Estás comenzando tu viaje gourmet!' })
      };
    } else if (points < 400) {
      return {
        level: t('gamification.levels.silver', { defaultValue: 'Plata' }),
        icon: '🥈',
        min: 150,
        max: 400,
        color: 'from-slate-400 to-slate-600',
        nextLevel: t('gamification.levels.gold', { defaultValue: 'Oro' }),
        desc: t('gamification.levels.desc_silver', { defaultValue: '¡Eres un comensal frecuente!' })
      };
    } else if (points < 800) {
      return {
        level: t('gamification.levels.gold', { defaultValue: 'Oro' }),
        icon: '🥇',
        min: 400,
        max: 800,
        color: 'from-yellow-500 to-amber-500',
        nextLevel: t('gamification.levels.diamond', { defaultValue: 'Diamante' }),
        desc: t('gamification.levels.desc_gold', { defaultValue: '¡Tienes un paladar de oro!' })
      };
    } else {
      return {
        level: t('gamification.levels.diamond', { defaultValue: 'Diamante' }),
        icon: '💎',
        min: 800,
        max: 99999, // Max nivel
        color: 'from-cyan-400 to-blue-600',
        nextLevel: t('gamification.max_level', { defaultValue: '¡Nivel Máximo!' }),
        desc: t('gamification.levels.desc_diamond', { defaultValue: '¡Eres una leyenda gastronómica de AppiFood!' })
      };
    }
  };

  const handleRedeem = async (rewardType) => {
    setActionLoading(rewardType);
    setRedeemedCoupon(null);
    try {
      const res = await fetchJson('/api/loyalty/redeem', {
        method: 'POST',
        body: { reward_type: rewardType }
      });
      showToast(res.message || t('gamification.coupon_claimed', { defaultValue: '¡Cupón redimido!' }), 'success');
      setRedeemedCoupon(res.data);
      // Recargar perfil para actualizar puntos
      await fetchUserProfile();
    } catch (err) {
      showToast(err.message || t('gamification.error_redeem', { defaultValue: 'Error al redimir puntos' }), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingScreen message={t('gamification.loading_rewards', { defaultValue: 'Cargando tus recompensas...' })} />;
  }

  const points = user?.points || 0;
  const levelInfo = getLevelInfo(points);
  const isMaxLevel = levelInfo.level === t('gamification.levels.diamond', { defaultValue: 'Diamante' });

  // Progreso en porcentaje para la barra
  const range = levelInfo.max - levelInfo.min;
  const currentProgress = points - levelInfo.min;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.max(0, (currentProgress / range) * 100));

  const rewards = [
    {
      id: 'bronze',
      title: t('gamification.rewards.bronze_title', { defaultValue: 'Cupón Bronce' }),
      points: 100,
      value: '$5,000 COP',
      desc: t('gamification.rewards.bronze_desc', { defaultValue: 'Descuento para cualquier pedido en la plataforma sin compra mínima.' }),
      color: 'border-amber-600/30 hover:border-amber-600',
      badge: `🥉 ${t('gamification.levels.bronze', { defaultValue: 'Bronce' })}`
    },
    {
      id: 'silver',
      title: t('gamification.rewards.silver_title', { defaultValue: 'Cupón Plata' }),
      points: 250,
      value: '$15,000 COP',
      desc: t('gamification.rewards.silver_desc', { defaultValue: 'Descuento especial de rango medio para tus antojos.' }),
      color: 'border-slate-400/30 hover:border-slate-400',
      badge: `🥈 ${t('gamification.levels.silver', { defaultValue: 'Plata' })}`
    },
    {
      id: 'gold',
      title: t('gamification.rewards.gold_title', { defaultValue: 'Cupón Oro' }),
      points: 500,
      value: '$35,000 COP',
      desc: t('gamification.rewards.gold_desc', { defaultValue: 'Gran descuento de fidelidad premium.' }),
      color: 'border-yellow-500/30 hover:border-yellow-500',
      badge: `🥇 ${t('gamification.levels.gold', { defaultValue: 'Oro' })}`
    },
    {
      id: 'diamond',
      title: t('gamification.rewards.diamond_title', { defaultValue: 'Cupón Diamante' }),
      points: 1000,
      value: '$80,000 COP',
      desc: t('gamification.rewards.diamond_desc', { defaultValue: 'Nuestra máxima recompensa para leyendas AppiFood.' }),
      color: 'border-cyan-400/30 hover:border-cyan-400',
      badge: `💎 ${t('gamification.levels.diamond', { defaultValue: 'Diamante' })}`
    }
  ];

  return (
    <div className="gf-container">
      <div className="gf-wrapper">
        {/* Header de Gamificación */}
        <header className="gf-header">
          <div className="gf-header-bg" />
          <div className="gf-header-content">
            <h1 className="gf-title">{t('gamification.title', { defaultValue: '🏆 Club de Fidelidad AppiFood' })}</h1>
            <p className="gf-subtitle">{t('gamification.subtitle', { defaultValue: 'Gana puntos ordenando comida deliciosa y redímelos por cupones gratis.' })}</p>
          </div>
        </header>

        {/* Nivel y Progreso */}
        <div className="gf-level-card">
          <div className="gf-level-info">
            <div className="gf-level-badge-container">
              <span className="gf-level-icon">{levelInfo.icon}</span>
              <div>
                <h2 className="gf-level-title">{t('gamification.level', { defaultValue: 'Nivel' })} {levelInfo.level}</h2>
                <p className="gf-level-desc">{levelInfo.desc}</p>
              </div>
            </div>
            <div className="gf-points-display">
              <span className="gf-points-value">{points}</span>
              <span className="gf-points-label">{t('gamification.total_points', { defaultValue: 'puntos totales' })}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="gf-progress-container">
            <div className="gf-progress-labels">
              <span>{levelInfo.min} pts</span>
              <span>
                {isMaxLevel ? t('gamification.max_level', { defaultValue: '¡Nivel Máximo!' }) : t('gamification.next_level', { level: levelInfo.nextLevel, max: levelInfo.max, defaultValue: `Siguiente nivel: ${levelInfo.nextLevel} (${levelInfo.max} pts)` })}
              </span>
            </div>
            <div className="gf-progress-bar-bg">
              <div
                className={`gf-progress-bar-fill bg-gradient-to-r ${levelInfo.color}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recompensa reclamada (Modal o Banner flotante de éxito) */}
        {redeemedCoupon && (
          <div className="gf-coupon-alert animate-bounce">
            <div className="gf-coupon-alert-inner">
              <div className="gf-coupon-icon">🎁</div>
              <div className="flex-1">
                <h3 className="gf-coupon-alert-title">{t('gamification.coupon_claimed', { defaultValue: '¡Cupón reclamado con éxito!' })}</h3>
                <p className="gf-coupon-alert-desc">{t('gamification.use_code', { defaultValue: 'Usa el siguiente código en el checkout de tu próxima compra:' })}</p>
                <div 
                  className="gf-coupon-code-box cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(redeemedCoupon.code);
                    showToast(t('gamification.copied_toast', { defaultValue: 'Código de cupón copiado al portapapeles' }), 'info');
                  }}
                  title={t('gamification.click_to_copy', { defaultValue: 'Haz clic para copiar' })}
                >
                  <span className="gf-coupon-code font-mono text-lg font-black tracking-wider text-[#FF4B3E]">
                    {redeemedCoupon.code}
                  </span>
                  <span className="gf-copy-btn text-xs font-bold text-gray-500 flex items-center gap-1">
                    📋 {t('gamification.copy', { defaultValue: 'Copiar' })}
                  </span>
                </div>
                <p className="gf-coupon-alert-expiry">{t('gamification.expires_in', { date: redeemedCoupon.expires_at, defaultValue: `Expira en 30 días (${redeemedCoupon.expires_at})` })}</p>
              </div>
              <button className="gf-close-alert" onClick={() => setRedeemedCoupon(null)}>✕</button>
            </div>
          </div>
        )}

        {/* Cupones disponibles */}
        <section className="gf-rewards-section">
          <h2 className="gf-section-title">{t('gamification.redeem_rewards', { defaultValue: '🎁 Redimir Recompensas' })}</h2>
          <div className="gf-rewards-grid">
            {rewards.map((reward) => {
              const canAfford = points >= reward.points;
              return (
                <div key={reward.id} className={`gf-reward-card border-2 ${reward.color} ${!canAfford ? 'opacity-70' : ''}`}>
                  <div className="gf-reward-header">
                    <span className="gf-reward-badge">{reward.badge}</span>
                    <span className="gf-reward-points">{reward.points} {t('gamification.points_count', { count: reward.points, defaultValue: 'Puntos' })}</span>
                  </div>
                  <div className="gf-reward-body">
                    <h3 className="gf-reward-title">{reward.title}</h3>
                    <p className="gf-reward-value">{reward.value}</p>
                    <p className="gf-reward-desc">{reward.desc}</p>
                  </div>
                  <div className="gf-reward-footer">
                    <button
                      className={`gf-redeem-btn ${canAfford ? 'active' : 'disabled'}`}
                      disabled={!canAfford || actionLoading === reward.id}
                      onClick={() => handleRedeem(reward.id)}
                    >
                      {actionLoading === reward.id ? (
                        <div className="gf-btn-spinner" />
                      ) : canAfford ? (
                        t('gamification.redeem_now', { defaultValue: 'Redimir ahora' })
                      ) : (
                        t('gamification.pts_missing', { count: reward.points - points, defaultValue: `Faltan ${reward.points - points} pts` })
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`gf-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
        </div>
      )}
    </div>
  );
}
