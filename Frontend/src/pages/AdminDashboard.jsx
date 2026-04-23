// Archivo: src/pages/AdminDashboard.jsx | Comentario: logica principal del modulo.
import { Link } from 'react-router-dom'

export default function AdminDashboard({ user }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 md:p-8">
          <p className="text-xs uppercase tracking-widest font-bold text-[#FF4B3E] mb-2">Panel de administracion</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Bienvenido, {user?.name || 'Admin'}</h1>
          <p className="text-gray-600 mb-6">Desde aqui puedes gestionar usuarios, restaurantes, pedidos y configuraciones del sistema.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/restaurants" className="rounded-xl border border-gray-200 p-4 hover:border-[#FF4B3E] hover:shadow-sm transition">
              <p className="text-sm text-gray-500">Gestion</p>
              <p className="font-bold text-gray-900">Restaurantes</p>
            </Link>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Gestion</p>
              <p className="font-bold text-gray-900">Pedidos</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Gestion</p>
              <p className="font-bold text-gray-900">Usuarios</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Sistema</p>
              <p className="font-bold text-gray-900">Configuracion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
