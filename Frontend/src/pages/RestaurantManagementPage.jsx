import { Link } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';

export default function RestaurantManagementPage({ title, description, note }) {
  const { t } = useTranslation()
  return (
    <main className="page-restaurant-management min-h-[70vh] bg-[#f7f8fa]">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wide text-[#FF4B3E] uppercase mb-2">{t('restaurantMgmt.panel') || 'Panel Restaurante'}</p>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>

          <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
            {note}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/restaurant/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#FF4B3E] px-5 py-3 text-sm font-bold text-white hover:bg-[#e03a2d] transition"
            >
              {t('restaurantMgmt.back_to_panel') || 'Volver al panel'}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition"
            >
              {t('restaurantMgmt.go_home') || 'Ir al inicio'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}