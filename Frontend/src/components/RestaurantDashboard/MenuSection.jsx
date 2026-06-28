import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { COLORS } from './constants'

export default function MenuSection({ menu, categories, onAdd, onDelete, onEdit, onToggle, onToggleAvailability, externalSearch = '' }) {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [catFilter, setCatFilter] = useState(t('rd.all_categories') || 'Todos')
  const [search, setSearch] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', category_id: '',
    stock: '', prep_time_minutes: '', img: '', file: null,
  })
  const [preview, setPreview] = useState(null)

  const CATEGORIES = [t('rd.all_categories'), ...categories.map(c => c.name)]

  // Sincronizar con el buscador externo del TopBar
  useEffect(() => {
    setSearch(externalSearch)
  }, [externalSearch])

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
          {/* Barra de búsqueda interna ELIMINADA - Ahora usa la del TopBar */}
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
                {item.stock != null && <span><i className="fas fa-box text-gray-300 mr-1" />{item.stock}</span>}
                {item.prep_time_minutes != null && <span><i className="fas fa-clock text-gray-300 mr-1" />{item.prep_time_minutes} min</span>}
              </div>
              <div className="flex items-center justify-between mt-2 mb-3">
                <span className="text-xs text-gray-400 dark:text-slate-500"><i className="fas fa-star mr-1"></i> {item.rating} · {item.orders} {t('rd.orders_label')}</span>
                <span className="font-bold" style={{ color: COLORS.primary }}>${Number(item.price).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
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
            <i className="fas fa-utensils text-4xl text-gray-300 dark:text-slate-600 mb-2 block" />
            <p className="font-medium">{t('rd.no_dishes')}</p>
          </div>
        )}
      </div>

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
              <div>
                <label className={labelCls}>{t('rd.dish_photo')}</label>
                <div
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  onClick={() => document.getElementById('menu-img-input').click()}
                >
                  {preview
                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    : <span className="text-gray-400 dark:text-slate-500 text-sm flex items-center gap-1">
                        <i className="fas fa-camera" /> {t('rd.photo_upload')}
                      </span>
                  }
                </div>
                <input id="menu-img-input" type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>

              <div>
                <label className={labelCls}>{t('rd.name')} *</label>
                <input
                  placeholder={t('rd.name_placeholder') || "Ej: Bandeja Paisa"}
                  value={form.name}
                  className={inputCls}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className={labelCls}>{t('rd.description')}</label>
                <textarea
                  placeholder={t('rd.desc_placeholder')}
                  value={form.description}
                  rows={2}
                  className={inputCls + " resize-none"}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className={labelCls}>{t('rd.price_label')} *</label>
                <input
                  placeholder={t('rd.price_placeholder') || "Ej: 15000"}
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  className={inputCls}
                  onChange={e => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, '') })}
                />
              </div>

              <div>
                <label className={labelCls}>{t('rd.category')} *</label>
                <select
                  value={form.category_id}
                  className={inputCls}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">{t('rd.select_category') || 'Seleccionar categoría'}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('rd.stock') || 'Stock disponible'}</label>
                  <input
                    placeholder={t('rd.stock_placeholder') || "Ej: 20"}
                    type="number"
                    min="0"
                    value={form.stock}
                    className={inputCls}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t('rd.prep_time') || 'Tiempo de preparación'}</label>
                  <select
                    value={form.prep_time_minutes}
                    className={inputCls}
                    onChange={e => setForm({ ...form, prep_time_minutes: e.target.value })}
                  >
                    <option value="">{t('rd.not_specified') || 'Sin especificar'}</option>
                    <option value="5">{t('rd.less_than_5') || 'Menos de 5 min'}</option>
                    <option value="10">{t('rd.between_5_10') || '5 – 10 min'}</option>
                    <option value="15">{t('rd.between_10_15') || '10 – 15 min'}</option>
                    <option value="20">{t('rd.between_15_20') || '15 – 20 min'}</option>
                    <option value="30">{t('rd.between_20_30') || '20 – 30 min'}</option>
                    <option value="45">{t('rd.between_30_45') || '30 – 45 min'}</option>
                    <option value="60">{t('rd.between_45_60') || '45 – 60 min'}</option>
                    <option value="90">{t('rd.more_than_60') || 'Más de 60 min'}</option>
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
              <i className="fas fa-trash text-3xl text-red-400 mb-3 block" />
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 mb-1">
                {t('rd.confirm_delete')}
              </h3>
              <p className="text-sm text-gray-400 dark:text-slate-500">
                {t('rd.delete_warning') || 'Esta acción no se puede deshacer.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                {t('rd.cancel')}
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete)
                  setConfirmDelete(null)
                }}
                className="flex-1 py-2.5 text-sm text-white rounded-xl font-semibold transition hover:opacity-90 bg-red-500"
              >
                {t('rd.delete_confirm') || 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}