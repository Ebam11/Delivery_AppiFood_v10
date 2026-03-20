// Archivo: src/components/Footer.jsx | Comentario: logica principal del modulo.
// src/components/Footer.jsx
import { Link } from 'react-router-dom'

export default function Footer({ restaurants = [] }) {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-16 pb-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-gray-700">

          {/* Marca */}
          <div>
            <span className="font-['Satisfy'] text-3xl text-[#FF4B3E] block mb-3">AppiFood</span>
            <p className="text-sm text-gray-400 leading-relaxed">
              La forma más fácil de pedir tu comida favorita en Popayán. Rápido, seguro y delicioso.
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
            <h4 className="font-bold text-[#FF4B3E] mb-4 text-sm uppercase tracking-wider">Acerca de AppiFood</h4>
            <ul className="space-y-2 text-sm">
              {['Únete al equipo','Registra tu Restaurante','Blog','Términos y condiciones','Privacidad'].map(item => (
                <li key={item}><a href="#" className="text-gray-400 hover:text-[#FF4B3E] transition">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Marcas */}
          <div>
            <h4 className="font-bold text-[#FF4B3E] mb-4 text-sm uppercase tracking-wider">Principales Marcas</h4>
            <ul className="space-y-2 text-sm">
              {(restaurants.length ? restaurants.slice(0, 4) : ['Burger House','Pizza Nostra','Sushi Zen','El Rincón Paisa']).map(r => (
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
            <h4 className="font-bold text-[#FF4B3E] mb-4 text-sm uppercase tracking-wider">Contáctanos</h4>
            <address className="not-italic text-sm text-gray-400 leading-loose mb-4">
              AppiFood S.A.S<br />
              Calle 10 # 15F - 03 Popayán, Cauca<br />
              <a href="mailto:AppiFood@gmail.com" className="hover:text-[#FF4B3E] transition">AppiFood@gmail.com</a>
            </address>
            <h4 className="font-bold text-[#FF4B3E] mb-3 text-sm uppercase tracking-wider">Descarga la App</h4>
            <div className="flex gap-2 flex-wrap">
              <a href="#"><img src="/images/Google_Play-Badge-Logo.wine.svg" alt="Google Play" className="h-16 w-auto" /></a>
              <a href="#"><img src="/images/App_Store_(iOS)-Badge-Logo.wine.svg" alt="App Store" className="h-16 w-auto" /></a>
            </div>
          </div>
        </div>

        <div className="pt-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AppiFood — Todos los derechos reservados
        </div>
      </div>
    </footer>
  )
}
