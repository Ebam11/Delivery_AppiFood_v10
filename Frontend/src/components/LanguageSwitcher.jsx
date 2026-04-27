import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  // Normaliza el idioma activo: 'es-CO', 'es_CO', 'co' → 'es'
  const raw = i18n.language ?? 'es';
  const currentLang = raw.split('-')[0].split('_')[0].toLowerCase();

  return (
    <div className="component-language-switcher flex items-center gap-1 text-sm font-medium">
      {languages.map((lang, index) => (
        <span key={lang.code} className="flex items-center gap-1">
          <button
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`transition-colors duration-200 ${
              currentLang === lang.code
                ? 'text-[#FF4B3E] font-bold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {lang.label}
          </button>
          {index < languages.length - 1 && (
            <span className="text-gray-300">|</span>
          )}
        </span>
      ))}
    </div>
  );
}