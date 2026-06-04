import React, { useState, useEffect } from 'react';
import { Save, Edit2, Eye, EyeOff } from 'lucide-react';
import { invalidateMenuCache, clearMenuCache } from '../../hooks/useMenuCache';

export default function QuickPriceUpdate({ products = [], cafeId, isAdmin, onAfterSave }) {
  const [editingId, setEditingId] = useState(null);
  const [prices, setPrices] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    setPrices(products.reduce((acc, p) => ({ ...acc, [p.id]: p.price }), {}));
    setEditingId(null);
  }, [products]);

  const getAuthToken = () => localStorage.getItem('uygunabak_token') || localStorage.getItem('token');

  const handleSavePrice = async (productId) => {
    setSavingId(productId);
    try {
      const url = isAdmin
        ? `/api/admin/cafes/${cafeId}/products/${productId}`
        : `/api/owner/products/${productId}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ price: Number(prices[productId]) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setEditingId(null);
      clearMenuCache(cafeId);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`cafe_menu_${cafeId}`);
        localStorage.removeItem(`cafe_menu_${cafeId}`);
      }
      onAfterSave?.();
    } catch (error) {
      alert(`Fiyat güncellenemedi: ${error.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleAvailability = async (product) => {
    setTogglingId(product.id);
    try {
      const url = isAdmin
        ? `/api/admin/cafes/${cafeId}/products/${product.id}`
        : `/api/owner/products/${product.id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ is_available: !product.is_available }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      clearMenuCache(cafeId);
      onAfterSave?.();
    } catch (error) {
      alert(`Durum güncellenemedi: ${error.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-teal-500">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Menü & Fiyat Yönetimi</h2>
        <p className="text-sm text-slate-500">Henüz ürün eklenmemiş. Yukarıdan ürün ekleyebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-teal-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Menü & Fiyat Yönetimi</h2>
        <span className="text-sm text-slate-500">{products.length} ürün</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className={`rounded-lg p-4 border transition ${
              product.is_available
                ? 'bg-slate-50 border-slate-200 hover:shadow-md'
                : 'bg-red-50 border-red-200 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                {product.category_name && (
                  <p className="text-xs text-slate-400 mt-0.5">{product.category_name}</p>
                )}
              </div>
              <button
                type="button"
                title={product.is_available ? 'Stokta var — tıkla kapatmak için' : 'Stokta yok — tıkla açmak için'}
                disabled={togglingId === product.id}
                onClick={() => handleToggleAvailability(product)}
                className={`shrink-0 p-1.5 rounded-lg transition ${
                  product.is_available
                    ? 'text-emerald-600 hover:bg-emerald-100'
                    : 'text-red-500 hover:bg-red-100'
                } disabled:opacity-40`}
              >
                {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex-1">
                {editingId === product.id ? (
                  <input
                    type="number"
                    value={prices[product.id] ?? product.price}
                    onChange={(e) => setPrices({ ...prices, [product.id]: e.target.value })}
                    className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="text-xl font-bold text-teal-600">{prices[product.id] ?? product.price}₺</p>
                )}
              </div>

              {editingId === product.id ? (
                <button
                  type="button"
                  disabled={savingId === product.id}
                  onClick={() => handleSavePrice(product.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingId(product.id)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {!product.is_available && (
              <p className="text-xs text-red-500 mt-2 font-medium">Stokta yok</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
