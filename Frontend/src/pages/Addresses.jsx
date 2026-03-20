// Archivo: src/pages/Addresses.jsx | Comentario: logica principal del modulo.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar las direcciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return;

    try {
      await api.delete(`/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      setError('Error al eliminar la dirección');
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="page-addresses">
      <div className="container">
        <div className="page-header">
          <h1>Mis Direcciones</h1>
          <button
            onClick={() => navigate('/addresses/create')}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i> Agregar Dirección
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        {addresses.length > 0 ? (
          <div className="addresses-grid">
            {addresses.map(address => (
              <div key={address.id} className="address-card">
                <div className="address-card-header">
                  <h3>{address.label || 'Casa'}</h3>
                  {address.is_default && (
                    <span className="badge badge-primary">Por defecto</span>
                  )}
                </div>
                <p className="address-text">{address.address}</p>
                {address.notes && <p className="address-notes">{address.notes}</p>}
                <div className="address-actions">
                  <button
                    onClick={() => navigate(`/addresses/${address.id}/edit`)}
                    className="btn btn-sm btn-secondary"
                  >
                    <i className="fas fa-edit"></i> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="btn btn-sm btn-danger"
                  >
                    <i className="fas fa-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-map-marker-alt"></i>
            <p>No tienes direcciones guardadas</p>
            <button
              onClick={() => navigate('/addresses/create')}
              className="btn btn-primary"
            >
              Agregar primera dirección
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
