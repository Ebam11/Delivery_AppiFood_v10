import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import Header from '../Header'
import CartSidebar from '../CartSidebar'
import SupportChatbot from '../SupportChatbot'
import { FOOD_BACKDROP_IMAGES } from '../../utils/appHelpers'

/**
 * Layout para las páginas públicas y de clientes.
 * Incluye el Header, Sidebar del carrito y el fondo decorativo.
 */
export default function PublicLayout({ children, isAuth, user, onLogout, isLoading }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffdf8]">
      {/* Elementos decorativos de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img src={FOOD_BACKDROP_IMAGES[0]} alt="" className="absolute left-4 top-8 h-20 w-20 rotate-[-12deg] opacity-[0.08] blur-[0.2px] sm:h-24 sm:w-24" />
        <img src={FOOD_BACKDROP_IMAGES[1]} alt="" className="absolute right-8 top-20 h-20 w-20 rotate-[10deg] opacity-[0.08] blur-[0.2px] sm:h-24 sm:w-24" />
        <img src={FOOD_BACKDROP_IMAGES[2]} alt="" className="absolute left-[12%] top-[34%] h-16 w-16 rotate-[8deg] opacity-[0.07] blur-[0.2px] sm:h-20 sm:w-20" />
        <img src={FOOD_BACKDROP_IMAGES[3]} alt="" className="absolute right-[14%] top-[42%] h-20 w-20 rotate-[-8deg] opacity-[0.07] blur-[0.2px] sm:h-24 sm:w-24" />
        <img src={FOOD_BACKDROP_IMAGES[4]} alt="" className="absolute left-[18%] bottom-[18%] h-16 w-16 rotate-[6deg] opacity-[0.06] blur-[0.2px] sm:h-20 sm:w-20" />
        <img src={FOOD_BACKDROP_IMAGES[5]} alt="" className="absolute right-[8%] bottom-[22%] h-18 w-18 rotate-[-10deg] opacity-[0.06] blur-[0.2px] sm:h-24 sm:w-24" />
      </div>
      
      <div className="relative z-10">
        <Header isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading} />
        <main>{children}</main>
        <CartSidebar isAuth={isAuth} />
        {user?.role !== 'restaurant' && user?.role !== 'admin' && <SupportChatbot />}
      </div>
    </div>
  )
}
