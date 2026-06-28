import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../Header'
import CartSidebar from '../CartSidebar'
import SupportChatbot from '../SupportChatbot'
import { FOOD_BACKDROP_IMAGES } from '../../utils/appHelpers'

// Rutas donde NO se muestra el chatbot
const AUTH_ROUTES = ['/login', '/register', '/register-restaurant', '/restaurant/login', '/forgot-password']

export default function PublicLayout({ children, isAuth, user, onLogout, isLoading }) {
  const { t } = useTranslation()
  const location = useLocation()

  const isAuthPage = AUTH_ROUTES.some(r => location.pathname.startsWith(r))
  const showChatbot = !isLoading && !isAuthPage && user?.role !== 'restaurant' && user?.role !== 'admin'

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0f0f16]">
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
        {showChatbot && <SupportChatbot />}
      </div>
    </div>
  )
}