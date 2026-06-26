// Archivo: src/pages/Addresses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(t('addresses.error_load'));
      console.error('Error cargando direcciones:', err?.message || err?.response?.data?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/addresses/${confirmDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.filter(a => a.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(t('addresses.error_delete'));
      setConfirmDeleteId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-addresses min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">{t('addresses.title')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('addresses.subtitle') || 'Gestiona tus puntos de entrega para pedidos rápidos.'}</p>
          </div>
          <button
            onClick={() => navigate('/user/addresses/create')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF4B3E] hover:bg-[#e03a2d] active:scale-95 text-white rounded-full font-bold transition-all shadow-md shadow-brand/20 text-sm self-start sm:self-auto"
          >
            <i className="fas fa-plus text-xs" /> {t('addresses.add')}
          </button>
        </div>

        {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(address => (
              <div key={address.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-gray-800 text-lg truncate flex items-center gap-2">
                      <i className="fas fa-map-pin text-[#FF4B3E]/70" />
                      {address.name || t('addresses.default_label')}
                    </h3>
                    {address.is_default && (
                      <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                        {t('addresses.default_badge')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed min-h-[44px]">{address.address}</p>
                </div>

                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/user/addresses/${address.id}/edit`)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 active:scale-95 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-edit" /> {t('addresses.edit')}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(address.id)}
                    className="py-2.5 px-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-trash" /> {t('addresses.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 text-2xl mb-4">
              <i className="fas fa-map-marker-alt" />
            </div>
            <p className="text-gray-500 font-bold text-lg mb-2">{t('addresses.empty')}</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">{t('addresses.empty_hint') || 'No tienes ninguna dirección registrada todavía. Añade una para empezar a pedir.'}</p>
            <button
              onClick={() => navigate('/user/addresses/create')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF4B3E] hover:bg-[#e03a2d] text-white rounded-full font-bold transition-all shadow-md shadow-brand/20 text-sm"
            >
              <i className="fas fa-plus text-xs" /> {t('addresses.add_first')}
            </button>
          </div>
        )}

        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-scale-up">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-2xl mx-auto mb-4">
                <i className="fas fa-exclamation-triangle" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">{t('addresses.confirm_delete') || '¿Eliminar dirección?'}</h3>
              <p className="text-gray-500 text-center text-sm mb-6">
                {t('addresses.delete_warning') || 'Esta acción no se puede deshacer. Ya no podrás seleccionar este punto de entrega.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-650 active:scale-95 text-white font-bold rounded-2xl transition shadow-lg shadow-red-500/10 text-sm"
                >
                  {t('addresses.confirm_delete_btn') || 'Sí, eliminar'}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 font-bold rounded-2xl transition text-sm"
                >
                  {t('addresses.cancel') || 'Cancelar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}