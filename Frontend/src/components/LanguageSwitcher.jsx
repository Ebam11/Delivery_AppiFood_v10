import { useState, useRef, useEffect } from 'react';
import { useTranslate as useTranslation } from '../hooks/useTranslate';

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export default function LanguageSwitcher() {
  const { currentLang: currentLangCode, changeLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#FF4B3E] text-white shadow-md shadow-red-500/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:border-[#FF4B3E] hover:text-[#FF4B3E] hover:shadow-sm'}`}
        title="Cambiar Idioma / Change Language"
      >
        <i className="fas fa-globe text-lg sm:text-xl transition-transform duration-500 hover:rotate-180"></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-3 w-40 origin-bottom-right rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-200 border border-gray-100 dark:border-slate-800">
          <div className="py-1.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLang(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  currentLangCode === lang.code
                    ? 'bg-red-50 dark:bg-red-950/30 text-[#FF4B3E] font-bold border-l-2 border-[#FF4B3E]'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-[#FF4B3E] border-l-2 border-transparent'
                }`}
              >
                <span className="uppercase text-xs font-black opacity-60 w-6 text-center">{lang.code}</span>
                <span>{lang.label}</span>
                {currentLangCode === lang.code && (
                  <i className="fas fa-check ml-auto text-[10px]"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}