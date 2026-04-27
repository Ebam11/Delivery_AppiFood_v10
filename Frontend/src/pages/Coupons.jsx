import { Link } from 'react-router-dom'

const coupons = [
  {
    code: 'BIENVENIDO',
    title: 'Descuento de bienvenida',
    description: 'Obtén 15% en tu primera compra.',
    benefit: '15% OFF',
    terms: 'Válido para usuarios nuevos. Monto mínimo $20.000.',
  },
  {
    code: 'BURGER10',
    title: 'Combo burger',
    description: 'Ahorra en tus hamburguesas favoritas.',
    benefit: '10% OFF',
    terms: 'Aplica solo en restaurantes seleccionados.',
  },
  {
    code: 'PIZZA5000',
    title: 'Noche de pizza',
    description: 'Descuento fijo para pedidos de pizza.',
    benefit: '$5.000 OFF',
    terms: 'Monto mínimo $30.000. Una vez por usuario.',
  },
]

export default function Coupons() {
  return (
    <main className="page-coupons min-h-screen bg-[#fff8f6] py-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-100 bg-gradient-to-r from-[#fff3ef] to-[#fffaf8] p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#FF4B3E] border border-red-100">
            <i className="fas fa-ticket-alt" /> Cupones disponibles
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-gray-900">
            Elige tu cupón y aplícalo en el carrito
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Copia cualquiera de estos códigos y pégalo en tu checkout para activar el beneficio.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <article key={coupon.code} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900">{coupon.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{coupon.description}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fff0ed] text-[#FF4B3E]">
                  {coupon.benefit}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-3 bg-gray-50 flex items-center justify-between">
                <code className="font-black text-gray-800 tracking-wider">{coupon.code}</code>
                <span className="text-xs text-gray-500">Cópialo en carrito</span>
              </div>

              <p className="mt-3 text-xs text-gray-500">{coupon.terms}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/restaurants" className="px-5 py-3 rounded-2xl bg-[#FF4B3E] text-white font-bold hover:bg-[#e03a2d] transition">
            Ir a restaurantes
          </Link>
          <Link to="/user/cart" className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition">
            Ir al carrito
          </Link>
        </div>
      </section>
    </main>
  )
}
