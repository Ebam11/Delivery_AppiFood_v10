// Archivo: src/components/Footer.jsx | Comentario: logica principal del modulo.
// src/components/Footer.jsx
import { Link } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import LanguageSwitcher from './LanguageSwitcher'
import GooglePlay from '../assets/GooglePlay.svg'
import AppStore from '../assets/AppStore.png'

export default function Footer({ restaurants = [] }) {
  const { t } = useTranslation()

  return (
    <footer className="component-footer bg-[#1a1a1a] text-gray-300 pt-16 pb-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-gray-700">

          {/* Marca */}
          <div>
            <span className="font-['Satisfy'] text-3xl text-[#FF4B3E] block mb-3">AppiFood</span>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3 mt-4">
              {[['fa-facebook-f','#'], ['fa-twitter','#'], ['fa-instagram','#'], ['fa-whatsapp','#']].map(([icon, href]) => (
                <a key={icon} href={href}
                  className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#FF4B3E] hover:text-white transition">
                  <i className={`fab ${icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Acerca de */}
          <div>
            <h4 className="font-bold text-[#FF4B3E] mb-4 text-sm uppercase tracking-wider">{t('footer.aboutTitle')}</h4>
            <ul className="space-y-2 text-sm">
              {[
                { labelKey: 'footer.joinTeam',           href: '#' },
                { labelKey: 'footer.registerRestaurant',  to: '/register-restaurant' },
                { labelKey: 'footer.blog',               href: '#' },
                { labelKey: 'footer.terms',              href: '#' },
                { labelKey: 'footer.privacy',            href: '#' },
              ].map(item => (
                <li key={item.labelKey}>
                  {item.to ? (
                    <Link to={item.to} className="text-gray-400 hover:text-[#FF4B3E] transition">
                      {t(item.labelKey)}
                    </Link>
                  ) : (
                    <a href={item.href} className="text-gray-400 hover:text-[#FF4B3E] transition">
                      {t(item.labelKey)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Marcas */}
          <div>
            <h4 className="font-bold text-[#FF4B3E] mb-4 text-sm uppercase tracking-wider">{t('footer.brandsTitle')}</h4>
            <ul className="space-y-2 text-sm">
              {(restaurants.length ? restaurants.slice(0, 4) : [
                t('footer.brand1'),
                t('footer.brand2'),
                t('footer.brand3'),
                t('footer.brand4'),
              ]).map(r => (
                <li key={typeof r === 'string' ? r : r.id}>
                  <Link to={typeof r === 'string' ? '#' : `/restaurants/${r.id}`}
                    className="text-gray-400 hover:text-[#FF4B3E] transition">
                    {typeof r === 'string' ? r : r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto + app */}
          <div>
            <h4 className="font-bold text-[#FF4B3E] mb-4 text-sm uppercase tracking-wider">{t('footer.contactTitle')}</h4>
            <address className="not-italic text-sm text-gray-400 leading-loose mb-4">
              AppiFood S.A.S<br />
              Calle 10 # 15F - 03 Popayán, Cauca<br />
              <a href="mailto:AppiFood@gmail.com" className="hover:text-[#FF4B3E] transition">AppiFood@gmail.com</a>
            </address>
            <h4 className="font-bold text-[#FF4B3E] mb-3 text-sm uppercase tracking-wider">{t('footer.downloadTitle')}</h4>
            <div className="flex gap-2 flex-wrap">
              <a href="#" target="_blank" rel="noreferrer">
                <img src={GooglePlay} alt="Google Play" className="h-10 w-auto" />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <img src={AppStore} alt="App Store" className="h-10 w-auto" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} AppiFood — {t('footer.rights')}</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{t('footer.language') || "Idioma:"}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}