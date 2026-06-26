import { useTranslation } from 'react-i18next'; // <- CORREGIDO

export default function LoadingScreen({ message = 'AppiFood' }) {
  const { t } = useTranslation() // <- CORREGIDO
  return (
    <div className="fixed top-16 bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-[6px] transition-colors duration-300 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative h-28 flex items-center justify-center mb-8">
        <div className="animated-burger-loader">
          <div className="burger-layer burger-bun-top" />
          <div className="burger-layer burger-lettuce" />
          <div className="burger-layer burger-cheese" />
          <div className="burger-layer burger-patty" />
          <div className="burger-layer burger-bun-bottom" />
        </div>
      </div>

      <h2 className="font-['Outfit'] text-2xl font-black text-slate-800 dark:text-white mb-2">{message}</h2>
      <p className="text-[#FF4B3E] dark:text-[#ff6157] text-xs font-black tracking-widest uppercase animate-pulse">
        {t('app.loading') || "Preparando tu pedido..."}
      </p>
    </div>
  )
}