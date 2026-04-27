// Archivo: src/components/NavDrawer.jsx | Comentario: logica principal del modulo.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function NavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();
  const effectiveUser = user || storedUser;
  const isPremium = Boolean(effectiveUser?.is_premium);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleNavClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleScrollLink = (e, target) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      setIsOpen(false);
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 340);
    }
  };

  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        className="component-nav-drawer-toggle hidden lg:hidden w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 fixed top-4 left-4 z-50"
        id="menuToggleBtn"
        onClick={toggleDrawer}
        aria-label={t('navDrawer.openMenu')}
        aria-expanded={isOpen}
        aria-controls="navDrawer"
      >
        <i className={`fas fa-${isOpen ? 'times' : 'bars'} text-xl`} id="menuToggleIcon"></i>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        id="drawerOverlay"
        onClick={toggleDrawer}
        aria-hidden={!isOpen}
      />

      {/* Nav Drawer */}
      <nav
        className={`component-nav-drawer fixed top-0 left-0 h-full w-full max-w-xs bg-white z-40 flex flex-col shadow-2xl lg:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        id="navDrawer"
        role="dialog"
        aria-modal="true"
        aria-label={t('navDrawer.mainMenu')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="font-['Satisfy'] text-2xl text-[#FF4B3E] font-bold">AppiFood</span>
          <button
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-[#FF4B3E] transition"
            onClick={toggleDrawer}
            aria-label={t('navDrawer.closeMenu')}
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Perfil */}
        {effectiveUser && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-gradient-to-br from-[#FF4B3E] to-[#FF6B52] text-white">
              {effectiveUser.avatar ? (
                <img src={effectiveUser.avatar} alt={effectiveUser.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{effectiveUser.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate flex items-center gap-2">
                <span>{effectiveUser.name}</span>
                {isPremium && <i className="fas fa-crown text-yellow-500 text-xs" aria-hidden="true" />}
              </p>
              <p className="text-xs text-gray-500 truncate">{effectiveUser.email}</p>
              {isPremium && <p className="text-[11px] font-semibold text-yellow-600 mt-1">Plan Premium activo</p>}
            </div>
          </div>
        )}

        {/* Descubrir */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">{t('navDrawer.sectionDiscover')}</p>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={() => handleNavClick('/')}
          >
            <i className="fas fa-home w-5"></i> {t('navDrawer.home')}
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={() => handleNavClick('/restaurants')}
          >
            <i className="fas fa-store w-5"></i> {t('navDrawer.restaurants')}
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={(e) => handleScrollLink(e, '#fastfoods')}
          >
            <i className="fas fa-fire w-5"></i> {t('navDrawer.fastfoods')}
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={(e) => handleScrollLink(e, '#popular')}
          >
            <i className="fas fa-star w-5"></i> {t('navDrawer.topRated')}
          </button>
        </div>

        {/* Mi Cuenta */}
        {user && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">{t('navDrawer.sectionAccount')}</p>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/orders')}
            >
              <i className="fas fa-box w-5"></i> {t('navDrawer.myOrders')}
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/favorites')}
            >
              <i className="fas fa-heart w-5"></i> {t('navDrawer.myFavorites')}
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/user/addresses')}
            >
              <i className="fas fa-map-marker-alt w-5"></i> {t('navDrawer.myAddresses')}
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/user/profile')}
            >
              <i className="fas fa-user-cog w-5"></i> {t('navDrawer.settings')}
            </button>
          </div>
        )}

        {/* Ofertas */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">{t('navDrawer.sectionOffers')}</p>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-medium text-sm"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-tag w-5"></i> {t('navDrawer.coupons')}
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-percent w-5"></i> {t('navDrawer.dailyPromos')}
          </button>
        </div>

        {/* Info */}
        <div className="px-5 py-4 border-b border-gray-100 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">{t('navDrawer.sectionInfo')}</p>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm">
            <i className="fas fa-question-circle w-5"></i> {t('navDrawer.howItWorks')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm">
            <i className="fas fa-headset w-5"></i> {t('navDrawer.support')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm">
            <i className="fas fa-mobile-alt w-5"></i> {t('navDrawer.downloadApp')}
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#FF4B3E] hover:bg-red-50 transition font-medium text-sm"
            onClick={() => handleNavClick('/register-restaurant')}
          >
            <i className="fas fa-utensils w-5"></i> {t('navDrawer.registerRestaurant')}
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2 flex-shrink-0">
          {/* Selector de idioma */}
          <div className="flex justify-center py-1">
            <LanguageSwitcher />
          </div>

          {user ? (
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF4B3E] text-white rounded-lg font-bold hover:bg-[#e03a2d] transition text-sm"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> {t('navDrawer.logout')}
            </button>
          ) : (
            <>
              <button
                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-lg font-bold hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition text-sm"
                onClick={() => handleNavClick('/login')}
              >
                {t('navDrawer.login')}
              </button>
              <button
                className="w-full px-4 py-3 bg-[#FF4B3E] text-white rounded-lg font-bold hover:bg-[#e03a2d] transition text-sm"
                onClick={() => handleNavClick('/register')}
              >
                {t('navDrawer.registerFree')}
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}