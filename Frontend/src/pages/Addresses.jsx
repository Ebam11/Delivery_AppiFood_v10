// Archivo: src/pages/Addresses.jsx | Comentario: logica principal del modulo.
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('addresses.confirm_delete'))) return;
    try {
      await api.delete(`/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      setError(t('addresses.error_delete'));
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="page-addresses">
      <div className="container">
        <div className="page-header">
          <h1>{t('addresses.title')}</h1>
          <button
            onClick={() => navigate('/user/addresses/create')}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i> {t('addresses.add')}
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        {addresses.length > 0 ? (
          <div className="addresses-grid">
            {addresses.map(address => (
              <div key={address.id} className="address-card">
                <div className="address-card-header">
                  <h3>{address.name || t('addresses.default_label')}</h3>
                  {address.is_default && (
                    <span className="badge badge-primary">{t('addresses.default_badge')}</span>
                  )}
                </div>
                <p className="address-text">{address.address}</p>
                <div className="address-actions">
                  <button
                    onClick={() => navigate(`/user/addresses/${address.id}/edit`)}
                    className="btn btn-sm btn-secondary"
                  >
                    <i className="fas fa-edit"></i> {t('addresses.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="btn btn-sm btn-danger"
                  >
                    <i className="fas fa-trash"></i> {t('addresses.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-map-marker-alt"></i>
            <p>{t('addresses.empty')}</p>
            <button
              onClick={() => navigate('/user/addresses/create')}
              className="btn btn-primary"
            >
              {t('addresses.add_first')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}