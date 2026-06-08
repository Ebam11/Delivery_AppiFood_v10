import { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { fetchJson } from '../../api/fetchJson';

/**
 * PromotionsSection - Gestión de cupones y promociones del restaurante.
 * Se conecta a los cupones del backend admin, pero muestra los relevantes al restaurante.
 */
export default function PromotionsSection() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        setLoading(true);
        // Intentar cargar cupones del endpoint admin (visible para restaurantes también)
        const data = await fetchJson('/api/admin/coupons').catch(() => null);
        const items = Array.isArray(data) ? data : data?.data || [];
        setCoupons(items);
      } catch (err) {
        console.error('Error cargando cupones', err);
      } finally {
        setLoading(false);
      }
    };
    loadCoupons();
  }, []);

  const handleCreate = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      const res = await fetchJson('/api/admin/coupons', {
        method: 'POST',
        body: {
          ...form,
          value: Number(form.value),
          min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          is_active: true,
        }
      });
      const newCoupon = res.data || res;
      setCoupons(prev => [newCoupon, ...prev]);
      setForm({ code: '', description: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '' });
      setShowForm(false);
      showToast('Cupón creado exitosamente ✓');
    } catch (err) {
      showToast('Error al crear el cupón', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await fetchJson(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        body: { is_active: !coupon.is_active }
      });
      setCoupons(prev =>
        prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)
      );
      showToast(coupon.is_active ? 'Cupón pausado' : 'Cupón activado');
    } catch (err) {
      showToast('Error al actualizar cupón', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">
            {t('restaurantDashboard.promotions.title', { defaultValue: 'Cupones y Promociones' })}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{coupons.length} cupones registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center gap-2 text-sm shadow-lg shadow-red-500/20"
        >
          <i className="fas fa-plus" /> {showForm ? 'Cancelar' : 'Crear Cupón'}
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h4 className="font-bold text-gray-800 mb-5">Nuevo Cupón</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Código *</label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="PROMO20"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-gray-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tipo de Descuento *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-gray-50"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Valor Fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Valor * {form.type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percentage' ? '20' : '5000'}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Pedido Mínimo ($)</label>
              <input
                type="number"
                value={form.min_order_amount}
                onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                placeholder="20000"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Usos Máximos</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                placeholder="100"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Fecha de Expiración</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-gray-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Descripción</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descuento especial para nuevos clientes"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-gray-50"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="mt-5 w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Crear Cupón'}
          </button>
        </div>
      )}

      {/* Lista de cupones */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">⏳</div>
          <p className="font-semibold">Cargando cupones...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <div className="text-5xl mb-3">🎟️</div>
          <p className="font-semibold text-gray-600">No tienes cupones creados.</p>
          <p className="text-sm mt-1">Crea tu primera promoción para atraer más clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition">
              <div className={`p-6 border-b border-gray-100 relative ${c.is_active ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gray-100'}`}>
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${c.is_active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {c.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <h4 className={`text-xl font-black mb-1 font-mono tracking-wider ${c.is_active ? 'text-white' : 'text-gray-600'}`}>
                  {c.code}
                </h4>
                <p className={`text-sm font-bold ${c.is_active ? 'text-red-100' : 'text-gray-400'}`}>
                  {c.description || (c.type === 'percentage' ? `${c.value}% de descuento` : `$${Number(c.value).toLocaleString()} de descuento`)}
                </p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento</span>
                  <span className="font-bold text-gray-800">
                    {c.type === 'percentage' ? `${c.value}%` : `$${Number(c.value).toLocaleString()}`}
                  </span>
                </div>
                {c.min_order_amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pedido Mín.</span>
                    <span className="font-bold text-gray-800">${Number(c.min_order_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Usos</span>
                  <span className="font-bold text-gray-800">
                    {c.used_count || 0}{c.max_uses ? ` / ${c.max_uses}` : ' (ilimitado)'}
                  </span>
                </div>
                {c.expires_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expira</span>
                    <span className="font-bold text-gray-800">
                      {new Date(c.expires_at).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggle(c)}
                    className={`w-full py-2 text-sm font-bold rounded-xl transition ${
                      c.is_active
                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {c.is_active ? '⏸ Pausar' : '▶ Activar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
