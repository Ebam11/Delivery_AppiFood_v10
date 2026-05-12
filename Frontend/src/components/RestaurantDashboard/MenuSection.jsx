import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../../data/restaurantDashboardData'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  img: '',
  file: null,
  newCategoryName: '',
  isNewCat: false,
}

export default function MenuSection({ menu, categories, loading, onAdd, onEdit, onDelete, onToggle }) {
  const { t } = useTranslation()

  const [showModal, setShowModal]   = useState(false)
  const [editingId, setEditingId]   = useState(null)   // null = crear, number = editar
  const [catFilter, setCatFilter]   = useState('Todos')
  const [search, setSearch]         = useState('')
  const [form, setForm]             = useState(EMPTY_FORM)
  const [preview, setPreview]       = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const ALL_LABEL = t('rd.all_categories')
  const CATEGORY_TABS = [ALL_LABEL, ...categories.map(c => c.name)]

  // ─── Filtrado ────────────────────────────────────────────────────────────────

  const visible = menu
    .filter(m =>
      catFilter === ALL_LABEL || catFilter === 'Todos' ||
      m.category?.name === catFilter || m.category === catFilter
    )
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  // ─── Imagen ──────────────────────────────────────────────────────────────────

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setForm(f => ({ ...f, img: url, file }))
  }

  // ─── Abrir modal ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      name:            item.name        || '',
      description:     item.description || '',
      price:           String(item.price ?? ''),
      category_id:     item.category_id ?? item.category?.id ?? '',
      img:             item.img         || '',
      file:            null,
      newCategoryName: '',
      isNewCat:        false,
    })
    setPreview(item.img || null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setPreview(null)
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const submit = async () => {
    if (!form.name.trim() || !form.price) return
    setSubmitting(true)
    try {
      if (editingId !== null) {
        await onEdit(editingId, form)
      } else {
        await onAdd(form)
      }
      closeModal()
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
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
            onClick={openCreate}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
            style={{ background: COLORS.primary }}
          >
            {t('rd.add_dish')}
          </button>
        </div>
      </div>

      {/* Filtros de categoría */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_TABS.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border transition"
            style={
              catFilter === c
                ? { background: COLORS.primary, color: 'white', borderColor: COLORS.primary }
                : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
            }
          >
            {c}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
              <div className="w-full h-40 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid de productos */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">
              {t('rd.no_dishes') || 'No hay platos para mostrar'}
            </p>
          )}
          {visible.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all ${!item.active ? 'opacity-60' : ''}`}
            >
              <div className="relative">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' }}
                />
                {/* Badge activo/inactivo — clickeable para toggle */}
                <button
                  onClick={() => onToggle(item.id)}
                  title={item.active ? 'Desactivar' : 'Activar'}
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition
                    ${item.active ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
                >
                  {item.active ? t('rd.active_badge') : t('rd.inactive_badge')}
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-0.5">{item.category?.name || item.category}</p>
                <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-2 mb-3">
                  <span className="text-xs text-gray-400">
                    ⭐ {item.rating} · {item.orders} {t('rd.orders_label')}
                  </span>
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    ${Number(item.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    {t('rd.edit')}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    {t('rd.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

            <h2 className="text-base font-bold text-gray-800 mb-4">
              {editingId !== null ? t('rd.edit_dish') || 'Editar plato' : t('rd.new_dish')}
            </h2>

            <div className="space-y-3">

              {/* Imagen */}
              <div
                className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:bg-gray-100 transition"
                onClick={() => document.getElementById('menu-img-input').click()}
              >
                {preview
                  ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  : <span className="text-gray-400 text-sm">📷 {t('rd.upload_image') || 'Subir imagen'}</span>
                }
              </div>
              <input id="menu-img-input" type="file" accept="image/*" className="hidden" onChange={handleImage} />

              {/* Nombre */}
              <input
                placeholder={t('rd.dish_name') || 'Nombre del plato *'}
                value={form.name}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-red-400"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />

              {/* Descripción */}
              <textarea
                placeholder={t('rd.dish_description') || 'Descripción (opcional)'}
                value={form.description}
                rows={2}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm resize-none focus:outline-none focus:border-red-400"
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              {/* Precio */}
              <input
                placeholder={t('rd.dish_price') || 'Precio *'}
                type="number"
                min="0"
                value={form.price}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-red-400"
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />

              {/* Categoría */}
              {!form.isNewCat ? (
                <div className="flex gap-2">
                  <select
                    value={form.category_id}
                    className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-red-400 text-gray-600"
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  >
                    <option value="">{t('rd.select_category') || 'Seleccionar categoría'}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setForm(f => ({ ...f, isNewCat: true, category_id: '' }))}
                    className="px-3 py-2 rounded-xl text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 whitespace-nowrap"
                  >
                    + Nueva
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Nombre de categoría nueva"
                    value={form.newCategoryName}
                    className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-red-400"
                    onChange={e => setForm(f => ({ ...f, newCategoryName: e.target.value }))}
                  />
                  <button
                    onClick={() => setForm(f => ({ ...f, isNewCat: false, newCategoryName: '' }))}
                    className="px-3 py-2 rounded-xl text-xs border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    ✕
                  </button>
                </div>
              )}

            </div>

            {/* Acciones */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
              >
                {t('rd.cancel') || 'Cancelar'}
              </button>
              <button
                onClick={submit}
                disabled={submitting || !form.name.trim() || !form.price}
                className="flex-1 py-2.5 text-sm text-white rounded-xl font-semibold disabled:opacity-50 transition hover:opacity-90"
                style={{ background: COLORS.primary }}
              >
                {submitting
                  ? (t('rd.saving') || 'Guardando...')
                  : (editingId !== null ? (t('rd.save_changes') || 'Guardar cambios') : (t('rd.save') || 'Guardar'))
                }
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}