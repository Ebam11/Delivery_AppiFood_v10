import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../../data/restaurantDashboardData'

/**
 * Sección de gestión del menú y productos del restaurante.
 */
export default function MenuSection({ menu, categories, onAdd, onDelete }) {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [catFilter, setCatFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name:'', description:'', price:'', category_id: '', img:'', file:null, newCategoryName: '' })
  const [isNewCat, setIsNewCat] = useState(false)
  const [preview, setPreview] = useState(null)

  const SUGGESTIONS = ['Plato Fuerte', 'Entrada', 'Postre', 'Bebida', 'Desayuno', 'Comida', 'Snacks', 'Ensaladas']
  const CATEGORIES = [t('rd.all_categories'), ...categories.map(c => c.name)]

  const visible = menu
    .filter(m => catFilter === t('rd.all_categories') || catFilter === 'Todos' || m.category?.name === catFilter || m.category === catFilter)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setForm(f => ({ ...f, img: url, file }))
  }

  const submit = () => {
    if (!form.name || !form.price) return
    onAdd(form)
    setForm({ name:'', description:'', price:'', category_id:'', img:'', file:null, newCategoryName: '' })
    setIsNewCat(false)
    setPreview(null)
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-400">
          {menu.filter(m => m.active).length} {t('rd.active_dishes')} / {menu.length} {t('rd.total_dishes')}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400 text-sm">🔍</span>
            <input 
              placeholder={t('rd.search_dish')} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="text-sm outline-none w-32 text-gray-600 placeholder-gray-400" 
            />
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" 
            style={{ background: COLORS.primary }}
          >
            {t('rd.add_dish')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button 
            key={c} 
            onClick={() => setCatFilter(c)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border transition"
            style={catFilter === c ? { background: COLORS.primary, color:'white', borderColor: COLORS.primary } : { background:'white', color:'#6b7280', borderColor:'#e5e7eb' }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visible.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative">
              <img 
                src={item.img} 
                alt={item.name} 
                className="w-full h-40 object-cover" 
                onError={e => { e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' }} 
              />
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${item.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                {item.active ? t('rd.active_badge') : t('rd.inactive_badge')}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-0.5">{item.category?.name || item.category}</p>
              <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
              <div className="flex items-center justify-between mt-2 mb-3">
                <span className="text-xs text-gray-400">⭐ {item.rating} · {item.orders} {t('rd.orders_label')}</span>
                <span className="font-bold" style={{ color: COLORS.primary }}>${item.price}.00</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">{t('rd.edit')}</button>
                <button onClick={() => onDelete(item.id)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition">{t('rd.delete')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para añadir plato */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-base font-bold text-gray-800 mb-4">{t('rd.new_dish')}</h2>
            <div className="space-y-4">
               {/* Formulario simplificado para el ejemplo */}
               <input 
                placeholder="Nombre del plato" 
                className="w-full border p-2 rounded-xl text-sm" 
                onChange={e => setForm({...form, name: e.target.value})}
               />
               <input 
                placeholder="Precio" 
                type="number"
                className="w-full border p-2 rounded-xl text-sm" 
                onChange={e => setForm({...form, price: e.target.value})}
               />
               <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm">Cancelar</button>
                <button onClick={submit} className="flex-1 py-2 text-sm bg-red-500 text-white rounded-xl">Guardar</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
