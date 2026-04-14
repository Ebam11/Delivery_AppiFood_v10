// Archivo: src/pages/AddressForm.jsx | Comentario: logica principal del modulo.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AddressForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
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
    if (id) {
      fetchAddress();
    }
  }, [id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/addresses/${id}`);
      const data = response.data?.data || {};
      setForm({
        name: data.name || '',
        address: data.address || '',
        lat: data.lat ?? '',
        lng: data.lng ?? '',
        is_default: Boolean(data.is_default),
      });
      setError(null);
    } catch (err) {
      setError('Error al cargar la dirección');
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
        await api.put(`/addresses/${id}`, payload);
      } else {
        const response = await api.post('/addresses', payload);
        savedAddressId = response.data?.data?.id;
      }

      if (form.is_default && savedAddressId) {
        await api.patch(`/addresses/${savedAddressId}/default`);
      }

      navigate('/user/addresses');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la dirección');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="page-address-form">
      <div className="container">
        <h1>{id ? 'Editar Dirección' : 'Nueva Dirección'}</h1>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Etiqueta (Casa, Trabajo, etc.)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Casa"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Calle 123 # 45-67"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lat">Latitud (opcional)</label>
            <input
              type="number"
              step="any"
              id="lat"
              name="lat"
              value={form.lat}
              onChange={handleChange}
              placeholder="2.4448"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lng">Longitud (opcional)</label>
            <input
              type="number"
              step="any"
              id="lng"
              name="lng"
              value={form.lng}
              onChange={handleChange}
              placeholder="-76.6147"
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
            <label htmlFor="is_default">Establecer como dirección por defecto</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Dirección'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/user/addresses')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
