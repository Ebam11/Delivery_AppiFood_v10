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
    label: '',
    address: '',
    reference: '',
    is_default: false,
  });

  useEffect(() => {
    if (id) fetchAddress();
  }, [id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm(response.data.data);
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
      if (id) {
        await api.put(`/api/addresses/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/api/addresses', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/addresses');
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
            <label htmlFor="label">{t('address_form.label')}</label>
            <input
              type="text"
              id="label"
              name="label"
              value={form.label}
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
            <label htmlFor="reference">{t('address_form.reference')}</label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              placeholder={t('address_form.reference_placeholder')}
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
              onClick={() => navigate('/addresses')}
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