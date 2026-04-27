// Archivo: src/pages/AddressForm.jsx | Comentario: logica principal del modulo.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
      console.error(err);
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
    <main className="page-address-form">
      <div className="container">
        <h1>{id ? t('address_form.title_edit') : t('address_form.title_new')}</h1>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">{t('address_form.label')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t('address_form.label_placeholder')}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">{t('address_form.address')}</label>
            <input
              type="text"
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder={t('address_form.address_placeholder')}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lat">Lat</label>
            <input
              type="number"
              step="any"
              id="lat"
              name="lat"
              value={form.lat}
              onChange={handleChange}
              placeholder="4.7110"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lng">Lng</label>
            <input
              type="number"
              step="any"
              id="lng"
              name="lng"
              value={form.lng}
              onChange={handleChange}
              placeholder="-74.0721"
              className="form-input"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={form.is_default}
              onChange={handleChange}
              className="form-checkbox"
            />
            <label htmlFor="is_default">{t('address_form.is_default')}</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('address_form.saving') : t('address_form.save')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/user/addresses')}
              className="btn btn-secondary"
            >
              {t('address_form.cancel')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}