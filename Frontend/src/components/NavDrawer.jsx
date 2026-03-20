// Archivo: src/components/NavDrawer.jsx | Comentario: logica principal del modulo.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function NavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        setIsOpen(false);
      }
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
        className="hidden lg:hidden w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 fixed top-4 left-4 z-50"
        id="menuToggleBtn"
        onClick={toggleDrawer}
        aria-label="Abrir menú principal"
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
      ></div>

      {/* Nav Drawer */}
      <nav
        className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white z-40 flex flex-col shadow-2xl lg:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        id="navDrawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="font-['Satisfy'] text-2xl text-[#FF4B3E] font-bold">AppiFood</span>
          <button
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-[#FF4B3E] transition"
            onClick={toggleDrawer}
            aria-label="Cerrar menú"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Perfil */}
        {user && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4B3E] to-[#FF6B52] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Descubrir */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Descubrir</p>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={() => handleNavClick('/')}
          >
            <i className="fas fa-home w-5"></i> Inicio
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={() => handleNavClick('/restaurants')}
          >
            <i className="fas fa-store w-5"></i> Restaurantes
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={(e) => handleScrollLink(e, '#fastfoods')}
          >
            <i className="fas fa-fire w-5"></i> Fast Foods populares
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={(e) => handleScrollLink(e, '#popular')}
          >
            <i className="fas fa-star w-5"></i> Más valorados
          </button>
        </div>

        {/* Mi Cuenta */}
        {user && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Mi cuenta</p>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/orders')}
            >
              <i className="fas fa-box w-5"></i> Mis pedidos
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/favorites')}
            >
              <i className="fas fa-heart w-5"></i> Mis favoritos
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/addresses')}
            >
              <i className="fas fa-map-marker-alt w-5"></i> Mis direcciones
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
              onClick={() => handleNavClick('/profile')}
            >
              <i className="fas fa-user-cog w-5"></i> Configuración
            </button>
          </div>
        )}

        {/* Ofertas */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Ofertas</p>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-medium text-sm"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-tag w-5"></i> Cupones disponibles
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-percent w-5"></i> Promociones del día
          </button>
        </div>

        {/* Info */}
        <div className="px-5 py-4 border-b border-gray-100 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Info</p>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm">
            <i className="fas fa-question-circle w-5"></i> ¿Cómo funciona?
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm">
            <i className="fas fa-headset w-5"></i> Soporte
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E] transition font-medium text-sm">
            <i className="fas fa-mobile-alt w-5"></i> Descarga la app
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2 flex-shrink-0">
          {user ? (
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF4B3E] text-white rounded-lg font-bold hover:bg-[#e03a2d] transition text-sm"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Cerrar sesión
            </button>
          ) : (
            <>
              <button
                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-lg font-bold hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition text-sm"
                onClick={() => handleNavClick('/login')}
              >
                Iniciar sesión
              </button>
              <button
                className="w-full px-4 py-3 bg-[#FF4B3E] text-white rounded-lg font-bold hover:bg-[#e03a2d] transition text-sm"
                onClick={() => handleNavClick('/register')}
              >
                Registrarse gratis
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
