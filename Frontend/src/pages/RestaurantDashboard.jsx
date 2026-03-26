import { Link } from 'react-router-dom'

export default function RestaurantDashboard({ user }) {
  const name = user?.name || 'Restaurante'

  return (
    <main className="min-h-[70vh] bg-[#f7f8fa]">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wide text-[#FF4B3E] uppercase mb-2">Panel Restaurante</p>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Bienvenido, {name}</h1>
          <p className="text-gray-600 mt-2">
            Este es tu home de restaurante. Desde aqui puedes gestionar tu negocio en AppiFood.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
            <Link to="/restaurant/profile" className="rounded-xl border border-gray-200 p-4 hover:border-[#FF4B3E] hover:shadow-sm transition">
              <p className="font-bold text-gray-900">Mi perfil</p>
              <p className="text-sm text-gray-500 mt-1">Configura la informacion del local</p>
            </Link>

            <Link to="/restaurant/products" className="rounded-xl border border-gray-200 p-4 hover:border-[#FF4B3E] hover:shadow-sm transition">
              <p className="font-bold text-gray-900">Productos</p>
              <p className="text-sm text-gray-500 mt-1">Crea y administra tu menu</p>
            </Link>

            <Link to="/restaurant/orders" className="rounded-xl border border-gray-200 p-4 hover:border-[#FF4B3E] hover:shadow-sm transition">
              <p className="font-bold text-gray-900">Pedidos</p>
              <p className="text-sm text-gray-500 mt-1">Revisa y actualiza estados</p>
            </Link>

            <Link to="/restaurant/categories" className="rounded-xl border border-gray-200 p-4 hover:border-[#FF4B3E] hover:shadow-sm transition">
              <p className="font-bold text-gray-900">Categorias</p>
              <p className="text-sm text-gray-500 mt-1">Organiza tus productos</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
