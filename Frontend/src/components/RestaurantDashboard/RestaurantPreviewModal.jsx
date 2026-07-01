import React from 'react';
import { getPlaceholderImage, detectFoodCategory } from '../../api/images';

export default function RestaurantPreviewModal({ restaurant, onClose }) {
  if (!restaurant) return null;

  const products = Array.isArray(restaurant.products) ? restaurant.products : [];
  const fmt = n => Number(n).toLocaleString('es-CO');

  // Agrupar platos por categoría
  const categoriesGrouped = products.reduce((acc, p) => {
    const catName = p.category_name || p.category?.name || 'General';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(p);
    return acc;
  }, {});

  // Schedules fallback
  const schedules = Array.isArray(restaurant.schedules) ? restaurant.schedules : [];

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-0 md:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-950 w-full max-w-6xl rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-up">
        
        {/* Botón X Flotante para Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition shadow-lg group"
        >
          <i className="fas fa-times text-lg group-hover:scale-110 transition-transform" />
        </button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 h-full">
          {/* Header Banner */}
          <div className="relative h-[280px] md:h-[350px] overflow-hidden bg-gradient-to-r from-slate-950 via-red-950 to-slate-950 flex items-center">
            {restaurant.banner && (
              <img 
                src={restaurant.banner} 
                className="absolute inset-0 w-full h-full object-cover" 
                alt={restaurant.name} 
              />
            )}
            <div className="absolute inset-0 bg-black/60" />
            
            <div className="absolute inset-0 flex items-end pb-8">
              <div className="container mx-auto px-6">
                <div className="max-w-2xl text-white flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Logo circular */}
                  <div className="flex-shrink-0">
                    {restaurant.logo ? (
                      <img
                        src={restaurant.logo}
                        alt={`Logo ${restaurant.name}`}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/90 shadow-2xl bg-white"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center border-4 border-white/90 shadow-2xl text-4xl font-black text-white uppercase select-none">
                        {restaurant.name?.charAt(0) || 'R'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-500 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Abierto
                      </span>
                      <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <i className="fas fa-star mr-1"></i> {restaurant.rating || '4.5'}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{restaurant.name}</h1>
                    <p className="text-white/80 text-xs md:text-sm mt-1 line-clamp-2 max-w-xl">{restaurant.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Perfil Content */}
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Menu Section */}
              <div className="lg:col-span-2 space-y-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-800">Menú</h2>

                {Object.keys(categoriesGrouped).length > 0 ? (
                  Object.keys(categoriesGrouped).map(catName => (
                    <div key={catName} className="mb-6">
                      <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 capitalize flex items-center gap-2">
                        <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                        {catName}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoriesGrouped[catName].map(p => (
                          <div
                            key={p.id}
                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-3 flex gap-3 hover:shadow-md transition cursor-default"
                          >
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                              <img
                                src={p.image || p.img || getPlaceholderImage(detectFoodCategory(p.name))}
                                className="w-full h-full object-cover"
                                alt={p.name}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{p.name}</h4>
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 line-clamp-2 mb-1">{p.description}</p>
                              <span className="font-black text-red-500 text-xs">${fmt(p.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No hay productos en el menú actualmente.</p>
                )}
              </div>

              {/* Sidebar Info */}
              <aside className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-black mb-4 dark:text-white">Información</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                        <i className="fas fa-map-marker-alt text-xs" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Dirección</p>
                        <p className="text-xs text-gray-700 dark:text-slate-300 font-medium">{restaurant.address || 'Por confirmar'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                        <i className="fas fa-phone-alt text-xs" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Teléfono</p>
                        <p className="text-xs text-gray-700 dark:text-slate-300 font-medium">{restaurant.phone || 'Por confirmar'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-black mb-4 dark:text-white"><i className="far fa-clock mr-1" /> Horario</h3>
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => {
                      const daysEng = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                      const daySched = schedules.find(s => s.day?.toLowerCase() === daysEng[idx]);
                      const isClosed = daySched ? daySched.is_closed : (day === 'Domingo');
                      return (
                        <div key={day} className="flex justify-between py-2 text-xs">
                          <span className="text-gray-500 dark:text-slate-400">{day}</span>
                          <span className={isClosed ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                            {isClosed ? 'Cerrado' : `${daySched?.opening_time?.slice(0, 5) || '09:00'} - ${daySched?.closing_time?.slice(0, 5) || '22:00'}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
