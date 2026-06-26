import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../../api/fetchJson'
import CalendarSection from './CalendarSection'
import ThemeToggle from '../ThemeToggle'

export default function RestaurantInfoSection({ restaurant, restaurantId }) {
  const { t } = useTranslation()

  const [form, setForm] = useState({
    name: restaurant?.name || '',
    desc: restaurant?.description || '',
    email: restaurant?.email || '',
    phone: restaurant?.phone || '',
    address: restaurant?.address || '',
    status: restaurant?.is_active ?? true,
    delivery: restaurant?.delivery_available ?? true
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [logoPreview, setLogoPreview] = useState(restaurant?.logo || null)
  const [bannerPreview, setBannerPreview] = useState(restaurant?.banner || null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || '',
        desc: restaurant.description || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        status: restaurant.is_active ?? true,
        delivery: restaurant.delivery_available ?? true
      })
      setLogoPreview(restaurant.logo || null)
      setBannerPreview(restaurant.banner || null)
    }
  }, [restaurant])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await fetchJson('/api/restaurant/profile', {
        method: 'PUT',
        body: {
          name: form.name,
          description: form.desc,
          email: form.email,
          phone: form.phone,
          address: form.address,
          is_active: form.status,
          delivery_available: form.delivery
        }
      })
      setMsg({ type: 'success', text: t('rd.info_saved') })
    } catch (error) {
      setMsg({ type: 'error', text: t('rd.info_save_error') || 'Error al guardar los cambios.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setUploadingLogo(true)
    try {
      const body = new FormData()
      body.append('logo', file)
      await fetchJson('/api/restaurant/profile/logo', { method: 'POST', body })
      setMsg({ type: 'success', text: t('rd.logo_updated') || 'Logo actualizado correctamente.' })
    } catch {
      setMsg({ type: 'error', text: t('rd.logo_error') || 'Error al subir el logo.' })
    } finally {
      setUploadingLogo(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBannerPreview(URL.createObjectURL(file))
    setUploadingBanner(true)
    try {
      const body = new FormData()
      body.append('banner', file)
      await fetchJson('/api/restaurant/profile/banner', { method: 'POST', body })
      setMsg({ type: 'success', text: t('rd.banner_updated') || 'Imagen de portada actualizada.' })
    } catch {
      setMsg({ type: 'error', text: t('rd.banner_error') || 'Error al subir la portada.' })
    } finally {
      setUploadingBanner(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-10">

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-bold ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 dark:text-white">
            {t('rd.general_info')}
          </h3>
          {restaurant?.id && (
            <a
              href={`/restaurants/${restaurantId || restaurant?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition"
              style={{ background: '#FF4B3E' }}
            >
              👁️ {t('rd.view_as_customer') || 'Ver como cliente'}
            </a>
          )}
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('rd.restaurant_name')}</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('rd.email')}</label>
              <input name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('rd.phone')}</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('rd.address_label')}</label>
              <input name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('rd.desc_label')}</label>
            <textarea name="desc" value={form.desc} onChange={handleChange} rows="3" className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800 px-6 py-4">
          <h3 className="font-bold text-gray-800 dark:text-white">{t('rd.visual_identity') || 'Identidad Visual'}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t('rd.visual_identity_hint') || 'Logo y portada que verán tus clientes'}</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3">{t('rd.logo') || 'Logo del restaurante'}</label>
            <div
              className="relative w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 overflow-hidden bg-gray-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:border-red-400 transition group"
              onClick={() => document.getElementById('logo-input').click()}
            >
              {logoPreview
                ? <img src={logoPreview} className="w-full h-full object-contain p-4" alt="Logo" />
                : <div className="text-center text-gray-400">
                    <p className="text-3xl mb-1">🏪</p>
                    <p className="text-xs font-medium">{t('rd.upload_logo') || 'Subir logo'}</p>
                    <p className="text-xs text-gray-300">JPG, PNG, WEBP · máx 2MB</p>
                  </div>
              }
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <p className="text-white text-xs font-bold">{t('rd.uploading') || 'Subiendo...'}</p>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition">
                {t('rd.change') || 'Cambiar'}
              </div>
            </div>
            <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3">{t('rd.banner') || 'Imagen de portada'}</label>
            <div
              className="relative w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 overflow-hidden bg-gray-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:border-red-400 transition group"
              onClick={() => document.getElementById('banner-input').click()}
            >
              {bannerPreview
                ? <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
                : <div className="text-center text-gray-400">
                    <p className="text-3xl mb-1">🖼️</p>
                    <p className="text-xs font-medium">{t('rd.upload_banner') || 'Subir portada'}</p>
                    <p className="text-xs text-gray-300">JPG, PNG, WEBP · máx 2MB</p>
                  </div>
              }
              {uploadingBanner && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <p className="text-white text-xs font-bold">{t('rd.uploading') || 'Subiendo...'}</p>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition">
                {t('rd.change') || 'Cambiar'}
              </div>
            </div>
            <input id="banner-input" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800 px-6 py-4">
          <h3 className="font-bold text-gray-800 dark:text-white">{t('rd.settings') || 'Configuración Operativa'}</h3>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/60 transition">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{t('rd.restaurant_active')}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('rd.restaurant_active_hint') || 'Permite que los clientes vean tu restaurante y hagan pedidos'}</p>
            </div>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
              <input type="checkbox" name="status" checked={form.status} onChange={handleChange} className="sr-only" />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.status ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/60 transition">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{t('rd.delivery_available')}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('rd.delivery_available_hint') || 'Ofrece envío a domicilio a través de la plataforma'}</p>
            </div>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.delivery ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
              <input type="checkbox" name="delivery" checked={form.delivery} onChange={handleChange} className="sr-only" />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.delivery ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{t('rd.theme') || 'Tema Visual'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('rd.theme_hint') || 'Activar modo claro o modo noche'}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-gray-900 dark:bg-red-500 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-red-600 transition shadow-xl shadow-gray-900/20 disabled:opacity-50">
        {saving ? t('rd.saving') || 'Guardando...' : t('rd.save')}
      </button>

      <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
        <CalendarSection />
      </div>
    </div>
  )
}