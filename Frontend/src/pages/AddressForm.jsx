// Archivo: src/pages/AddressForm.jsx | Comentario: logica principal del modulo.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AddressForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    is_default: false,
  });

  useEffect(() => {
    if (id) fetchAddress();
  }, [id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response?.data?.data || {};
      setForm({
        name: data.name || '',
        address: data.address || '',
        lat: data.lat ?? '',
        lng: data.lng ?? '',
        is_default: Boolean(data.is_default),
      });
      setError(null);
    } catch (err) {
      setError(t('address_form.error_load'));
      console.error('Error cargando dirección:', err?.message || err?.response?.data?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        lat: form.lat === '' ? null : Number(form.lat),
        lng: form.lng === '' ? null : Number(form.lng),
      };
      let savedAddressId = id;

      if (id) {
        const response = await api.put(`/addresses/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        savedAddressId = response?.data?.data?.id || id;
      } else {
        const response = await api.post('/addresses', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        savedAddressId = response?.data?.data?.id;
      }

      if (form.is_default && savedAddressId) {
        await api.patch(`/addresses/${savedAddressId}/default`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigate('/user/addresses');
    } catch (err) {
      setError(err.response?.data?.message || t('address_form.error_save'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-address-form min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/user/addresses')}
          className="mb-6 text-[#FF4B3E] hover:text-[#e03a2d] font-bold flex items-center gap-2 transition"
        >
          <i className="fas fa-arrow-left" /> Volver a mis direcciones
        </button>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-soft">
          <h1 className="text-3xl font-black text-gray-900 mb-8">
            {id ? t('address_form.title_edit') : t('address_form.title_new')}
          </h1>

          {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                {t('address_form.label')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t('address_form.label_placeholder')}
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF4B3E]/30 focus:bg-white rounded-2xl outline-none transition font-medium text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                {t('address_form.address')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder={t('address_form.address_placeholder')}
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF4B3E]/30 focus:bg-white rounded-2xl outline-none transition font-medium text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="bg-orange-50/50 dark:bg-slate-800/50 border border-orange-100 dark:border-slate-700/50 p-5 rounded-2xl mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">¿Deseas autodetectar tu ubicación?</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">El sistema puede completar la latitud y longitud por ti mediante GPS.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setForm(prev => ({
                            ...prev,
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                          }));
                          alert("Ubicación detectada correctamente.");
                        },
                        () => alert("No se pudo obtener acceso a la geolocalización.")
                      );
                    } else {
                      alert("Tu navegador no soporta geolocalización.");
                    }
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-200 hover:border-[#FF4B3E] text-gray-700 hover:text-[#FF4B3E] font-bold rounded-xl text-xs transition active:scale-95 shadow-sm whitespace-nowrap"
                >
                  📍 Obtener ubicación actual
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="lat" className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                  Coordenada Latitud (Opcional)
                </label>
                <input
                  type="number"
                  step="any"
                  id="lat"
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="Ej: 2.4448"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF4B3E]/30 focus:bg-white rounded-2xl outline-none transition font-medium text-gray-700 placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lng" className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                  Coordenada Longitud (Opcional)
                </label>
                <input
                  type="number"
                  step="any"
                  id="lng"
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="Ej: -76.6147"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF4B3E]/30 focus:bg-white rounded-2xl outline-none transition font-medium text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label htmlFor="is_default" className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={form.is_default}
                  onChange={handleChange}
                  className="accent-[#FF4B3E] w-5 h-5 cursor-pointer rounded"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-[#FF4B3E] transition-colors">
                  {t('address_form.is_default')}
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3.5 bg-[#FF4B3E] hover:bg-[#e03a2d] active:scale-95 text-white font-black rounded-2xl shadow-xl shadow-brand/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin" /> {t('address_form.saving')}</>
                ) : (
                  <><i className="fas fa-save" /> {t('address_form.save')}</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/user/addresses')}
                className="w-full sm:flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 font-bold rounded-2xl transition flex items-center justify-center gap-2"
              >
                {t('address_form.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}