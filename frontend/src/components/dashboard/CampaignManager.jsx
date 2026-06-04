import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Trash2, Pencil, Plus } from 'lucide-react';

const getAuthToken = () => localStorage.getItem('uygunabak_token') || localStorage.getItem('token');

function deriveStatus(row) {
  if (!row.is_active) return 'expired';
  const now = new Date();
  const start = new Date(row.starts_at);
  const end = new Date(row.ends_at);
  end.setHours(23, 59, 59, 999);
  if (now < start) return 'pending';
  if (now > end) return 'expired';
  return 'active';
}

export default function CampaignManager({ campaigns = [], cafeId, isAdmin, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    discount_percent: '',
    starts_at: '',
    ends_at: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const displayList = useMemo(
    () => campaigns.map((c) => ({ ...c, displayStatus: deriveStatus(c) })),
    [campaigns]
  );

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      discount_percent: '',
      starts_at: '',
      ends_at: '',
      is_active: true,
    });
    setEditingId(null);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    const toYmd = (d) => (typeof d === 'string' ? d.slice(0, 10) : d);
    setForm({
      title: c.title || '',
      description: c.description || '',
      discount_percent: c.discount_percent != null ? String(c.discount_percent) : '',
      starts_at: toYmd(c.starts_at),
      ends_at: toYmd(c.ends_at),
      is_active: !!c.is_active,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cafeId || !form.title || !form.starts_at || !form.ends_at) return;
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        discount_percent: form.discount_percent === '' ? null : Number(form.discount_percent),
        starts_at: form.starts_at,
        ends_at: form.ends_at,
        is_active: form.is_active,
      };
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      };

      if (editingId) {
        const url = isAdmin
          ? `/api/admin/cafes/${cafeId}/campaigns/${editingId}`
          : `/api/owner/campaigns/${editingId}`;
        const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      } else {
        const url = isAdmin ? `/api/admin/cafes/${cafeId}/campaigns` : '/api/owner/campaigns';
        const postBody = isAdmin ? body : { ...body, cafe_id: cafeId };
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(postBody) });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      }
      resetForm();
      await onRefresh?.();
    } catch (err) {
      console.error(err);
      alert(err.message || 'İşlem başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kampanyayı silmek istiyor musunuz?')) return;
    try {
      const url = isAdmin
        ? `/api/admin/cafes/${cafeId}/campaigns/${id}`
        : `/api/owner/campaigns/${id}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      if (editingId === id) resetForm();
      await onRefresh?.();
    } catch (err) {
      console.error(err);
      alert('Silinemedi.');
    }
  };

  const CampaignBadge = ({ status }) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      expired: 'bg-red-100 text-red-800 border-red-300',
    };
    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      expired: <AlertCircle className="w-4 h-4" />,
    };
    const labels = { active: 'Aktif', pending: 'Beklemede', expired: 'Süresi doldu / pasif' };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
      >
        {icons[status]} {labels[status]}
      </span>
    );
  };

  const activeCount = displayList.filter((c) => c.displayStatus === 'active').length;
  const pendingCount = displayList.filter((c) => c.displayStatus === 'pending').length;
  const expiredCount = displayList.filter((c) => c.displayStatus === 'expired').length;

  if (!cafeId) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Kampanya yönetimi</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-slate-600">Aktif dönemde</p>
          <p className="text-3xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-slate-600">Yakında</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-slate-600">Biten / kapalı</p>
          <p className="text-3xl font-bold text-red-600">{expiredCount}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="font-semibold text-slate-800">{editingId ? 'Kampanyayı düzenle' : 'Yeni kampanya'}</p>
        <input
          type="text"
          required
          placeholder="Başlık"
          value={form.title}
          onChange={(ev) => setForm((f) => ({ ...f, title: ev.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Açıklama (isteğe bağlı)"
          value={form.description}
          onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="İndirim %"
            value={form.discount_percent}
            onChange={(ev) => setForm((f) => ({ ...f, discount_percent: ev.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            required
            value={form.starts_at}
            onChange={(ev) => setForm((f) => ({ ...f, starts_at: ev.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            required
            value={form.ends_at}
            onChange={(ev) => setForm((f) => ({ ...f, ends_at: ev.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 px-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(ev) => setForm((f) => ({ ...f, is_active: ev.target.checked }))}
            />
            Yayında
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {editingId ? 'Güncelle' : 'Ekle'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {displayList.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz kampanya yok.</p>
        ) : (
          displayList.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-400 transition"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{campaign.title}</p>
                  {campaign.description && (
                    <p className="text-sm text-slate-600 mt-1">{campaign.description}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 shrink-0" />
                    {campaign.starts_at} — {campaign.ends_at}
                  </p>
                  {campaign.discount_percent != null && (
                    <p className="text-xs text-purple-700 font-semibold mt-1">
                      %{Number(campaign.discount_percent)} indirim
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <CampaignBadge status={campaign.displayStatus} />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(campaign)}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      title="Düzenle"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(campaign.id)}
                      className="p-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
