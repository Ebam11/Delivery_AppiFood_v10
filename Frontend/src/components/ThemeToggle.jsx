import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next'; // <- CORREGIDO

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation(); // <- CORREGIDO

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-300 hover:border-[#FF4B3E] dark:hover:border-[#FF4B3E] hover:shadow-sm transition-all duration-300 relative group overflow-hidden"
      aria-label={isDark ? t('app.lightMode', { defaultValue: 'Modo claro' }) : t('app.darkMode', { defaultValue: 'Modo oscuro' })}
      title={isDark ? t('app.lightMode', { defaultValue: 'Modo claro' }) : t('app.darkMode', { defaultValue: 'Modo oscuro' })}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <i 
          className={`fas fa-sun text-yellow-500 text-lg absolute transition-all duration-500 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <i 
          className={`fas fa-moon text-indigo-400 text-lg absolute transition-all duration-500 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
      
      <span className="absolute inset-0 w-full h-full bg-red-500/5 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300 -z-10" />
    </button>
  );
}