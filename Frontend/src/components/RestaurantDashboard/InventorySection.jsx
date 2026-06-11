import { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { fetchJson } from '../../api/fetchJson';

/**
 * InventorySection - Muestra el stock real de los productos del restaurante.
 * Permite al restaurante marcar productos como disponibles o no.
 */
export default function InventorySection() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchJson('/api/restaurant/products?paginate=false');
        const items = Array.isArray(data) ? data : data.data || [];
        setProducts(items);
      } catch (err) {
        console.error('Error cargando inventario', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleToggle = async (product) => {
    setTogglingId(product.id);
    try {
      await fetchJson(`/api/restaurant/products/${product.id}`, {
        method: 'PUT',
        body: { is_available: !product.is_available }
      });
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p)
      );
      showToast(product.is_available ? 'Producto marcado como no disponible' : 'Producto marcado como disponible');
    } catch (err) {
      showToast('Error al actualizar producto', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const available = products.filter(p => p.is_available);
  const unavailable = products.filter(p => !p.is_available);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white transition-all
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Resumen de stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('restaurantDashboard.inventory.inStock', { defaultValue: 'Disponibles' }), value: available.length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', icon: '✅' },
          { label: t('restaurantDashboard.inventory.outOfStock', { defaultValue: 'No disponibles' }), value: unavailable.length, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', icon: '❌' },
          { label: 'Total de Productos', value: products.length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: '📦' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de inventario */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-gray-800 dark:text-slate-200">
            {t('restaurantDashboard.inventory.title', { defaultValue: 'Control de Disponibilidad' })}
          </h3>
          <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
            Activa o desactiva productos de tu menú
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500">
            <div className="text-4xl mb-3">⏳</div>
            <p className="font-semibold">Cargando inventario...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-semibold text-gray-600 dark:text-slate-300">No tienes productos registrados.</p>
            <p className="text-sm mt-1">Ve a la sección de Menú para añadir productos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                <tr>
                  {['Producto', 'Categoría', 'Precio', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">🍽️</div>
                        )}
                        <span className="font-bold text-gray-800 dark:text-slate-200">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{product.category?.name || 'Sin categoría'}</td>
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-slate-200">
                      ${Number(product.price).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.is_available ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
                        {product.is_available ? '✅ Disponible' : '❌ No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(product)}
                        disabled={togglingId === product.id}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                          product.is_available
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-900/40'
                            : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/30'
                        }`}
                      >
                        {togglingId === product.id ? '...' : (product.is_available ? 'Pausar' : 'Activar')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
