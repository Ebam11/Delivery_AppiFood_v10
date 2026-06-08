import { useTranslate as useTranslation } from '../../hooks/useTranslate';

/**
 * Pantalla de carga universal para la aplicación.
 */
export default function LoadingScreen({ message = 'AppiFood' }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf8]">
      <div className="text-center">
        <span className="font-['Satisfy'] text-4xl text-[#FF4B3E]">{message}</span>
        <div className="mt-4 w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-400 text-sm animate-pulse">{t('app.loading') || "Cargando..."}</p>
      </div>
    </div>
  )
}
