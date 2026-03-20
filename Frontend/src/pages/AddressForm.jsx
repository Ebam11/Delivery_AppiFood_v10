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
    label: '',
    address: '',
    reference: '',
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
      const response = await api.get(`/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm(response.data.data);
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
            <label htmlFor="label">Etiqueta (Casa, Trabajo, etc.)</label>
            <input
              type="text"
              id="label"
              name="label"
              value={form.label}
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
            <label htmlFor="reference">Referencia (piso, apartamento, etc.)</label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              placeholder="Apartamento 302"
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
              onClick={() => navigate('/addresses')}
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
