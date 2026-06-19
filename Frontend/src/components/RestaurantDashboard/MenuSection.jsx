import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { COLORS } from './constants'

export default function MenuSection({ menu, categories, onAdd, onDelete, onEdit, onToggle }) {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [catFilter, setCatFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // guarda el id a eliminar
  const [form, setForm] = useState({
    name: '', description: '', price: '', category_id: '',
    stock: '', prep_time_minutes: '', img: '', file: null,
  })
  const [preview, setPreview] = useState(null)

  const CATEGORIES = [t('rd.all_categories'), ...categories.map(c => c.name)]

  const visible = menu
    .filter(m => catFilter === t('rd.all_categories') || catFilter === 'Todos' || m.category?.name === catFilter || m.category === catFilter)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setForm(f => ({ ...f, file }))
  }

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category_id: '', stock: '', prep_time_minutes: '', img: '', file: null })
    setPreview(null)
    setEditingItem(null)
  }

  const submit = () => {
    if (!form.name || !form.price || !form.category_id) return
    if (editingItem) {
      onEdit(editingItem.id, form)
    } else {
      onAdd(form)
    }
    resetForm()
    setShowModal(false)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      name:              item.name || '',
      description:       item.description || '',
      price:             String(item.price || ''),
      category_id:       String(item.category_id || ''),
      stock:             item.stock != null ? String(item.stock) : '',
      prep_time_minutes: item.prep_time_minutes != null ? String(item.prep_time_minutes) : '',
      img:               item.img || '',
      file:              null,
    })
    setPreview(item.img || null)
    setShowModal(true)
  }

  const inputCls = "w-full border border-gray-200 dark:border-slate-700 p-3 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 outline-none focus:border-red-500 placeholder-gray-400 dark:placeholder-slate-500"
  const labelCls = "text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-400 dark:text-slate-500">
          {menu.filter(m => m.active).length} {t('rd.active_dishes')} / {menu.length} {t('rd.total_dishes')}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              placeholder={t('rd.search_dish')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none w-32 text-gray-600 dark:text-slate-200 placeholder-gray-400 bg-transparent"
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
            style={catFilter === c
              ? { background: COLORS.primary, color: 'white', borderColor: COLORS.primary }
              : { background: 'transparent', color: '#6b7280', borderColor: '#e5e7eb' }
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visible.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-40 object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' }}
              />
              {/* Badge activo/inactivo — clickeable */}
              <button
                onClick={() => onToggle(item.id)}
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition
                  ${item.active ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
              >
                {item.active ? t('rd.active_badge') : t('rd.inactive_badge')}
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{item.category?.name || item.category}</p>
              <p className="font-bold text-gray-800 dark:text-slate-100 text-sm truncate">{item.name}</p>
              {item.description && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-slate-500">
                {item.stock != null && <span>📦 {item.stock}</span>}
                {item.prep_time_minutes != null && <span>⏱ {item.prep_time_minutes} min</span>}
              </div>
              <div className="flex items-center justify-between mt-2 mb-3">
                <span className="text-xs text-gray-400 dark:text-slate-500">⭐ {item.rating} · {item.orders} {t('rd.orders_label')}</span>
                <span className="font-bold" style={{ color: COLORS.primary }}>${Number(item.price).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                {/* Botón editar */}
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {t('rd.edit')}
                </button>
                <button
                  onClick={() => setConfirmDelete(item.id)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                  {t('rd.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 dark:text-slate-500">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="font-medium">{t('rd.no_dishes')}</p>
          </div>
        )}
      </div>

      {/* Modal — montado en el body via portal para evitar el overflow-y-auto del main */}
      {showModal && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) { resetForm(); setShowModal(false) } }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-800 dark:text-slate-100 mb-4">
              {editingItem ? (t('rd.edit_dish') || 'Editar plato') : t('rd.new_dish')}
            </h2>
            <div className="space-y-3">
              

              {/* Imagen */}
              <div>
                <label className={labelCls}>Imagen del plato</label>
                <div
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  onClick={() => document.getElementById('menu-img-input').click()}
                >
                  {preview
                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    : <span className="text-gray-400 dark:text-slate-500 text-sm">📷 {t('rd.upload_image') || 'Subir imagen'}</span>
                  }
                </div>
                <input id="menu-img-input" type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>

              {/* Nombre */}
              <div>
                <label className={labelCls}>Nombre del plato *</label>
                <input
                  placeholder="Ej: Bandeja Paisa"
                  value={form.name}
                  className={inputCls}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  placeholder="Ingredientes o descripción breve..."
                  value={form.description}
                  rows={2}
                  className={inputCls + " resize-none"}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Precio */}
              <div>
                <label className={labelCls}>Precio (COP) *</label>
                <input
                  placeholder="Ej: 15000"
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  className={inputCls}
                  onChange={e => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, '') })}
                />
              </div>

              {/* Categoría */}
              <div>
                <label className={labelCls}>Categoría *</label>
                <select
                  value={form.category_id}
                  className={inputCls}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Stock y tiempo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Stock disponible</label>
                  <input
                    placeholder="Ej: 20"
                    type="number"
                    min="0"
                    value={form.stock}
                    className={inputCls}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Tiempo de preparación</label>
                  <select
                    value={form.prep_time_minutes}
                    className={inputCls}
                    onChange={e => setForm({ ...form, prep_time_minutes: e.target.value })}
                  >
                    <option value="">Sin especificar</option>
                    <option value="5">Menos de 5 min</option>
                    <option value="10">5 – 10 min</option>
                    <option value="15">10 – 15 min</option>
                    <option value="20">15 – 20 min</option>
                    <option value="30">20 – 30 min</option>
                    <option value="45">30 – 45 min</option>
                    <option value="60">45 – 60 min</option>
                    <option value="90">Más de 60 min</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { resetForm(); setShowModal(false) }}
                className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                {t('rd.cancel')}
              </button>
              <button
                onClick={submit}
                disabled={!form.name || !form.price || !form.category_id}
                className="flex-1 py-2.5 text-sm text-white rounded-xl font-semibold disabled:opacity-50 transition hover:opacity-90"
                style={{ background: COLORS.primary }}
              >
                {editingItem ? (t('rd.save_changes') || 'Guardar cambios') : t('rd.add_btn')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <p className="text-3xl mb-3">🗑️</p>
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 mb-1">
                ¿Eliminar este plato?
              </h3>
              <p className="text-sm text-gray-400 dark:text-slate-500">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete)
                  setConfirmDelete(null)
                }}
                className="flex-1 py-2.5 text-sm text-white rounded-xl font-semibold transition hover:opacity-90 bg-red-500"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}