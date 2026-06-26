// Archivo: src/pages/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrderStore } from '../store/orderStore';
import { Loading } from '../components/Loading';
import { ErrorMessage as ErrorMsg } from '../components/ErrorMessage';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchJson } from '../api/fetchJson';

// Iconos personalizados de Leaflet
const driverIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: linear-gradient(135deg, #6C5CE7, #A29BFE);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 12px rgba(108,92,231,0.5);
    border: 3px solid white;
  ">🛵</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const customerIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: linear-gradient(135deg, #00CEC9, #81ECEC);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 12px rgba(0,206,201,0.5);
    border: 3px solid white;
  ">🏠</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapAutoCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

const OrderTrackingMap = ({ order }) => {
  const [driverLocation, setDriverLocation] = useState(
    order.driver_lat && order.driver_lng
      ? { lat: Number(order.driver_lat), lng: Number(order.driver_lng) }
      : null
  );

  useEffect(() => {
    let intervalId;

    const fetchLocation = async () => {
      try {
        const res = await fetchJson(`/api/orders/${order.id}/driver-location`);
        if (res?.data?.lat && res?.data?.lng) {
          setDriverLocation({
            lat: Number(res.data.lat),
            lng: Number(res.data.lng),
          });
        }
      } catch (err) {
        console.warn('Error fetching driver location:', err.message);
      }
    };

    fetchLocation();
    intervalId = setInterval(fetchLocation, 10000);

    return () => clearInterval(intervalId);
  }, [order.id]);

  const customerPos = order.delivery_lat && order.delivery_lng
    ? [Number(order.delivery_lat), Number(order.delivery_lng)]
    : null;

  const centerPos = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : customerPos || [4.7110, -74.0721];

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mt-4">
      <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-base">
        <i className="fas fa-motorcycle text-[#FF4B3E]" /> {t('order_detail.tracking_title') || 'Sigue a tu repartidor en tiempo real'}
      </h3>
      <div className="w-full h-72 rounded-lg overflow-hidden border border-gray-200 shadow-inner relative">
        <MapContainer
          center={centerPos}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {driverLocation && (
            <>
              <MapAutoCenter center={[driverLocation.lat, driverLocation.lng]} />
              <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                <Popup>{t('order_detail.driver_here') || '🛵 Tu repartidor está aquí'}</Popup>
              </Marker>
            </>
          )}
          {customerPos && (
            <Marker position={customerPos} icon={customerIcon}>
              <Popup>{t('order_detail.delivery_address_label') || '🏠 Tu dirección de entrega'}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedOrder, isLoading, error, fetchOrderById, cancelOrderById, clearError } = useOrderStore();

  useEffect(() => {
    fetchOrderById(id);
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      pending:    'bg-yellow-100 text-yellow-800',
      confirmed:  'bg-blue-100 text-blue-800',
      preparing:  'bg-purple-100 text-purple-800',
      on_the_way: 'bg-cyan-100 text-cyan-800',
      delivered:  'bg-green-100 text-green-800',
      cancelled:  'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending:    t('orders.status_pending'),
      confirmed:  t('orders.status_confirmed'),
      preparing:  t('orders.status_preparing'),
      on_the_way: t('orders.status_on_the_way'),
      delivered:  t('orders.status_delivered'),
      cancelled:  t('orders.status_cancelled'),
    };
    return labels[status] || status;
  };

  const handleCancel = async () => {
    if (window.confirm(t('order_detail.cancel_confirm'))) {
      try {
        await cancelOrderById(id);
        alert(t('order_detail.cancel_success'));
      } catch (error) {
        alert(t('order_detail.cancel_error'));
      }
    }
  };

  if (isLoading) return <Loading />;

  if (!selectedOrder) {
    return (
      <div className="page-order-detail min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 text-xl">{t('order_detail.not_found')}</p>
          <button
            onClick={() => navigate('/user/orders')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            {t('order_detail.back')}
          </button>
        </div>
      </div>
    );
  }

  const order = selectedOrder.data || selectedOrder;

  return (
    <div className="page-order-detail min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/user/orders')}
          className="mb-6 text-[#FF4B3E] hover:text-[#e03a2d] font-bold flex items-center gap-2 transition"
        >
          <i className="fas fa-arrow-left" /> {t('order_detail.back')}
        </button>

        {error && <ErrorMsg message={error} onDismiss={clearError} />}

        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF4B3E] to-[#e03a2d] text-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black">{t('order_detail.title')}{order.id}</h1>
                <p className="text-red-100 mt-1 font-semibold flex items-center gap-1.5">
                  <i className="fas fa-store" /> {order.restaurant_name}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Productos */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('order_detail.products')}</h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-bold text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-500 font-semibold">x{item.quantity}</p>
                    </div>
                    <p className="font-black text-gray-800">
                      ${Number(item.quantity * item.unit_price).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalles de entrega */}
            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 p-4 rounded-xl">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-[#FF4B3E]" /> {t('order_detail.delivery')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{order.delivery_address}</p>
            </div>

            {/* Notas */}
            {order.notes && (
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5 flex items-center gap-2">
                  <i className="far fa-sticky-note text-[#FF4B3E]" /> {t('order_detail.notes')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{order.notes}</p>
              </div>
            )}

            {/* Resumen financiero */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">{t('order_detail.subtotal')}</span>
                <span className="font-semibold">${Number(order.subtotal || 0).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">{t('order_detail.shipping')}</span>
                <span className="font-semibold">${Number(order.delivery_cost || 0).toLocaleString('es-CO')}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>{t('order_detail.discount')}</span>
                  <span>-${Number(order.discount || 0).toLocaleString('es-CO')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black border-t-2 border-gray-200 pt-3">
                <span className="text-gray-800">{t('order_detail.total')}</span>
                <span className="text-[#FF4B3E]">${Number(order.total || 0).toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Estado de pago */}
            {order.payment && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <i className="fas fa-check-circle text-green-600 text-lg" />
                <p className="text-green-800 font-bold text-sm">
                  {t('order_detail.paid_at')} {new Date(order.payment.paid_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}

            {/* Tracking */}
            {order.tracking && order.tracking.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-3">{t('order_detail.history')}</h3>
                <div className="space-y-2 border-l-2 border-gray-200 pl-4 ml-2">
                  {order.tracking.map((track, index) => (
                    <div key={index} className="text-xs text-gray-600 relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
                      <span className="font-bold text-gray-700">{getStatusLabel(track.status)}</span>
                      <span className="mx-2 text-gray-400">·</span>
                      <span>{new Date(track.changed_at).toLocaleString('es-ES')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-3.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-times-circle" /> {t('order_detail.cancel_order')}
                </button>
              )}
              <button
                onClick={() => navigate('/user/orders')}
                className="w-full sm:flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-chevron-left" /> {t('order_detail.back')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};