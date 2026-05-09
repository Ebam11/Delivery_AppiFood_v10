/**
 * Archivo: src/pages/RestaurantDetail.jsx
 * Detalle de un restaurante específico, incluyendo menú y horarios.
 */

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import { useRestaurantDetail } from '../hooks/useRestaurantDetail'
import { Loading } from '../components/Loading'
import { AddToCartButton } from '../components/AddToCartButton'
import Footer from '../components/Footer'
import heroImage from '../assets/hero.png'

export const RestaurantDetail = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = useAuthStore()
  const {
    restaurant,
    isLoading,
    error,
    clearError,
    selectedProduct,
    setSelectedProduct,
    isCurrentlyOpen
  } = useRestaurantDetail()

  if (isLoading) return <Loading />
  if (!restaurant) return <div className="p-20 text-center">Restaurante no encontrado</div>

  const products = Array.isArray(restaurant.products) ? restaurant.products : []
  const fmt = n => Number(n).toLocaleString('es-CO')

  return (
    <div className="bg-white min-h-screen">
      {/* Header / Banner */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={restaurant.banner || restaurant.image || heroImage} 
          className="w-full h-full object-cover" 
          alt={restaurant.name} 
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <button 
              onClick={() => navigate('/restaurants')}
              className="mb-8 text-white/80 hover:text-white flex items-center gap-2 font-bold"
            >
              <i className="fas fa-arrow-left" /> Volver
            </button>
            
            <div className="max-w-2xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isCurrentlyOpen ? 'Abierto' : 'Cerrado'}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ {restaurant.rating || '4.5'}
                </span>
              </div>
              <h1 className="text-5xl font-black mb-4">{restaurant.name}</h1>
              <p className="text-lg text-white/90">{restaurant.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Menú */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <h2 className="text-3xl font-black text-gray-900">Nuestro Menú</h2>
              <span className="text-gray-400 font-bold">{products.length} platos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white border border-gray-100 rounded-3xl p-4 flex gap-4 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={p.image || heroImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={p.name} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                    <span className="font-black text-red-500">${fmt(p.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Info */}
          <aside className="space-y-8">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <h3 className="text-xl font-black mb-6">Información</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                    <i className="fas fa-map-marker-alt" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dirección</p>
                    <p className="font-bold text-gray-700">{restaurant.address || 'Popayán, Cauca'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                    <i className="fas fa-phone" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teléfono</p>
                    <p className="font-bold text-gray-700">{restaurant.phone || 'No disponible'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa (Placeholder simplificado) */}
            <div className="bg-gray-100 rounded-3xl h-64 overflow-hidden relative">
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">
                  Mapa de Ubicación
               </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Producto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
               <i className="fas fa-times" />
            </button>
            <div className="h-64 bg-gray-100">
               <img src={selectedProduct.image || heroImage} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>
            <div className="p-10">
               <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-black text-gray-900">{selectedProduct.name}</h3>
                  <span className="text-2xl font-black text-red-500">${fmt(selectedProduct.price)}</span>
               </div>
               <p className="text-gray-600 leading-relaxed mb-8">{selectedProduct.description || 'Producto fresco preparado al momento.'}</p>
               
               {token ? (
                 <AddToCartButton restaurantId={restaurant.id} product={selectedProduct} compact />
               ) : (
                 <button onClick={() => navigate('/login')} className="w-full bg-red-500 text-white font-black py-4 rounded-2xl hover:bg-red-600 transition-colors">
                    Inicia sesión para pedir
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}