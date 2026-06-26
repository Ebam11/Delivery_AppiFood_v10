import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // <- CORREGIDO

export default function PWAInstallPrompt() {
  const { t } = useTranslation(); // <- CORREGIDO
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa_dismissed') === 'true';
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-fade-in">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF4B3E]" />

        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
          aria-label={t('app.dismiss') || "Cerrar"}
        >
          <i className="fas fa-times text-xs" />
        </button>

        <div className="flex gap-4 items-start pr-6 mt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FF4B3E]/10 dark:bg-[#FF4B3E]/20 flex items-center justify-center text-[#FF4B3E] text-2xl flex-shrink-0">
            <i className="fas fa-mobile-alt" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-base">
              {t('pwa.install_title', { defaultValue: 'Instala AppiFood' })}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {t('pwa.install_desc', { defaultValue: 'Accede más rápido y haz tus pedidos al instante directo desde tu pantalla de inicio.' })}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button 
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            {t('pwa.install_later', { defaultValue: 'Más tarde' })}
          </button>
          <button 
            onClick={handleInstallClick}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF4B3E] hover:bg-[#e03a2d] text-white shadow-md shadow-brand/10 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {t('pwa.install_now', { defaultValue: 'Instalar ahora' })}
          </button>
        </div>
      </div>
    </div>
  );
}