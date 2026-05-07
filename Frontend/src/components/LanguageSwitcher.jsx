import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Normaliza el idioma activo: 'es-CO', 'es_CO', 'co' → 'es'
  const raw = i18n.language ?? 'es';
  const currentLangCode = raw.split('-')[0].split('_')[0].toLowerCase();
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:border-[#FF4B3E] hover:shadow-sm transition-all duration-300 text-sm font-medium text-gray-700"
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="uppercase">{currentLang.code}</span>
        <i className={`fas fa-chevron-down text-[10px] text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  currentLangCode === lang.code
                    ? 'bg-red-50 text-[#FF4B3E] font-bold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#FF4B3E]'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLangCode === lang.code && (
                  <i className="fas fa-check ml-auto text-xs"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}