// Archivo: src/components/Footer.jsx | Comentario: logica principal del modulo.
// src/components/Footer.jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'
import GooglePlay from '../assets/GooglePlay.svg'
import AppStore from '../assets/AppStore.png'

export default function Footer({ restaurants = [] }) {
  const { t } = useTranslation()

  return (
    <footer className="component-footer bg-[#0d0d0d] dark:bg-slate-950 text-slate-400 pt-20 pb-8 relative overflow-hidden border-t border-slate-900/50">
      {/* Elemento de brillo decorativo superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-slate-900">

          {/* Columna de Marca y Descripción */}
          <div className="space-y-6">
            <div>
              <span className="font-['Satisfy'] text-4xl text-red-500 font-bold block mb-1">AppiFood</span>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Popayán, Cauca</p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {t('footer.tagline') || 'La forma más fácil y rápida de pedir comida de tus restaurantes favoritos en Popayán.'}
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'fa-facebook-f', href: '#' },
                { icon: 'fa-twitter', href: '#' },
                { icon: 'fa-instagram', href: '#' },
                { icon: 'fa-whatsapp', href: '#' }
              ].map(({ icon, href }) => (
                <a 
                  key={icon} 
                  href={href}
                  className="w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-red-500 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg border border-slate-800"
                >
                  <i className={`fab ${icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Columna Acerca de */}
          <div>
            <h4 className="font-black text-slate-200 mb-6 text-xs uppercase tracking-widest">{t('footer.aboutTitle') || 'Acerca de AppiFood'}</h4>
            <ul className="space-y-3.5 text-sm font-semibold">
              {[
                { labelKey: 'footer.joinTeam', href: '#' },
                { labelKey: 'footer.registerRestaurant', to: '/register-restaurant' },
                { labelKey: 'footer.blog', href: '#' },
                { labelKey: 'footer.terms', href: '#' },
                { labelKey: 'footer.privacy', href: '#' },
              ].map(item => (
                <li key={item.labelKey}>
                  {item.to ? (
                    <Link to={item.to} className="text-slate-400 hover:text-red-500 transition-colors">
                      {t(item.labelKey)}
                    </Link>
                  ) : (
                    <a href={item.href} className="text-slate-400 hover:text-red-500 transition-colors">
                      {t(item.labelKey)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna Marcas / Restaurantes populares */}
          <div>
            <h4 className="font-black text-slate-200 mb-6 text-xs uppercase tracking-widest">{t('footer.brandsTitle') || 'Principales Marcas'}</h4>
            <ul className="space-y-3.5 text-sm font-semibold">
              {(restaurants.length ? restaurants.slice(0, 4) : [
                t('footer.brand1') || 'Burger House',
                t('footer.brand2') || 'Pizza Nostra',
                t('footer.brand3') || 'Sushi Zen',
                t('footer.brand4') || 'El Rincón Paisa',
              ]).map(r => (
                <li key={typeof r === 'string' ? r : r.id}>
                  <Link 
                    to={typeof r === 'string' ? '/restaurants' : `/restaurants/${r.id}`}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {typeof r === 'string' ? r : r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna de Contacto y Descargas */}
          <div className="space-y-6">
            <div>
              <h4 className="font-black text-slate-200 mb-4 text-xs uppercase tracking-widest">{t('footer.contactTitle') || 'Contáctanos'}</h4>
              <address className="not-italic text-sm text-slate-400 leading-relaxed font-semibold">
                AppiFood S.A.S<br />
                Calle 10 # 15F - 03 Popayán, Cauca<br />
                <a href="mailto:AppiFood@gmail.com" className="text-red-500 hover:underline">AppiFood@gmail.com</a>
              </address>
            </div>
            <div>
              <h4 className="font-black text-slate-200 mb-4 text-xs uppercase tracking-widest">{t('footer.downloadTitle') || 'Descarga la App'}</h4>
              <div className="flex gap-3 flex-wrap">
                <a href="#" target="_blank" rel="noreferrer" className="transition-transform duration-300 hover:scale-105">
                  <img src={GooglePlay} alt="Google Play" className="h-10 w-auto rounded-lg" />
                </a>
                <a href="#" target="_blank" rel="noreferrer" className="transition-transform duration-300 hover:scale-105">
                  <img src={AppStore} alt="App Store" className="h-10 w-auto rounded-lg" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Sección inferior - Idioma y Derechos */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span className="text-slate-600">{t('footer.language') || "Idioma:"}</span>
            <LanguageSwitcher />
          </div>
          <span>© {new Date().getFullYear()} AppiFood. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  )
}