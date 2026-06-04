import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, MessageSquare, Users, Bell, CheckCircle2, Sparkles } from 'lucide-react';

const getAuthToken = () => localStorage.getItem('uygunabak_token') || localStorage.getItem('token');

const getApi = () => ({
  get: (url) => fetch(url, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  }).then((response) => response.json()),
  put: async (url, body) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }
});

const sampleUsers = [
  { id: 'u1', name: 'Elif Çetin', role: 'USER', email: 'elif@example.com', status: 'Aktif' },
  { id: 'u2', name: 'Mehmet Kaya', role: 'OWNER', email: 'mehmet@example.com', status: 'Beklemede' },
  { id: 'u3', name: 'Beyza Yılmaz', role: 'USER', email: 'beyza@example.com', status: 'Aktif' },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [selectedCafeId, setSelectedCafeId] = useState(() => localStorage.getItem('uygunabak_admin_selected_cafe_id') || '');
  const [users, setUsers] = useState(sampleUsers);
  const [reports, setReports] = useState([]);
  const [loadingCafes, setLoadingCafes] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const stored = localStorage.getItem('uygunabak_user');
    const parsedUser = stored ? JSON.parse(stored) : null;
    setUser(parsedUser);

    if (!parsedUser || parsedUser.role !== 'ADMIN') {
      navigate('/login');
    }

    const loadCafes = async () => {
      try {
        const response = await getApi().get('/api/admin/cafes');
        if (response?.success) {
          const mappedCafes = (response.data || [])
            .map((cafe) => ({
            id: cafe.id,
            name: cafe.name,
            status: cafe.is_active ? 'Aktif' : 'Pasif',
            avgRating: Number(cafe.avg_rating || 0),
            reports: 0,
            city: cafe.city,
            district: cafe.district,
          }))
            .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
          setCafes(mappedCafes);
            // choose a default selected cafe for admin if none stored
            if (!selectedCafeId && mappedCafes.length > 0) {
              const firstId = mappedCafes[0].id;
              setSelectedCafeId(firstId);
              localStorage.setItem('uygunabak_admin_selected_cafe_id', firstId);
            }
        }
      } catch (error) {
        console.error('Admin cafes fetch error:', error);
      } finally {
        setLoadingCafes(false);
      }
    };

    const loadReports = async () => {
      try {
        const response = await getApi().get('/api/admin/reports');
        if (response?.success) {
          setReports(response.data || []);
        }
      } catch (error) {
        console.error('Admin reports fetch error:', error);
      } finally {
        setLoadingReports(false);
      }
    };

    loadCafes();
    loadReports();
  }, [navigate]);

  const reportCountByCafe = useMemo(() => {
    return reports.reduce((acc, report) => {
      if (!report.cafe_id) return acc;
      acc[report.cafe_id] = (acc[report.cafe_id] || 0) + 1;
      return acc;
    }, {});
  }, [reports]);

  const stats = useMemo(() => ({
    totalCafes: cafes.length,
    pendingApprovals: cafes.filter((cafe) => cafe.status === 'Beklemede').length,
    totalUsers: users.length,
    unresolvedReports: reports.filter((item) => item.status !== 'resolved').length,
  }), [cafes, reports, users]);

  const toggleCafeStatus = async (cafeId) => {
    const targetCafe = cafes.find((cafe) => cafe.id === cafeId);
    if (!targetCafe) return;

    const nextStatus = targetCafe.status === 'Aktif' ? 'Pasif' : 'Aktif';
    const previousCafes = cafes;

    setCafes((prev) =>
      prev.map((cafe) =>
        cafe.id === cafeId
          ? {
              ...cafe,
              status: nextStatus,
            }
          : cafe
      )
    );

    try {
      const response = await getApi().put(`/api/admin/cafes/${cafeId}/status`, {
        is_active: nextStatus === 'Aktif',
      });

      if (!response.success) {
        throw new Error(response.message || 'Kafe durumu güncellenemedi.');
      }
      // reflect server result (in case of normalization)
      setCafes((prev) => prev.map((c) => (c.id === cafeId ? { ...c, status: response.cafe?.is_active ? 'Aktif' : 'Pasif' } : c)));
    } catch (error) {
      console.error('Cafe status update failed:', error);
      setCafes(previousCafes);
      alert('Kafe durumu güncellenemedi.');
    }
  };

  const resolveReport = async (reportId) => {
    try {
      const response = await getApi().put(`/api/admin/reports/${reportId}/resolve`, {});
      if (!response.success) {
        throw new Error(response.message || 'Rapor çözümlenemedi.');
      }
      setReports((prev) => prev.map((report) => (report.id === reportId ? { ...report, status: 'resolved' } : report)));
    } catch (error) {
      console.error('Report resolve failed:', error);
      alert('Rapor çözümlenemedi.');
    }
  };

  const deactivateUser = (userId) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.id === userId ? { ...item, status: item.status === 'Aktif' ? 'Pasif' : 'Aktif' } : item
      )
    );
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Yönetici Paneli</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Sistem Yönetimi</h1>
            <p className="mt-2 text-sm text-slate-600">UygunaBak platformunun yönetim kontrol paneli.</p>
          </div>
          <div className="rounded-3xl bg-indigo-50 px-5 py-4 text-indigo-700">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold">Hoş geldin</p>
            <p className="mt-2 text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-slate-600">{user.role === 'ADMIN' ? 'Sistem Yöneticisi' : user.role}</p>
          </div>
        </div>
      </div>

      {/* Admin cafe selector: horizontal scroll bar so admin can pick a business */}
      <div className="">
        {loadingCafes ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Kafeler yükleniyor...</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto py-2">
              <div className="flex gap-3 items-center px-2">
                {cafes.map((cafe, index) => (
                  <button
                    key={cafe.id}
                    onClick={() => {
                      setSelectedCafeId(cafe.id);
                      localStorage.setItem('uygunabak_admin_selected_cafe_id', cafe.id);
                      localStorage.setItem('uygunabak_active_cafe_id', cafe.id);
                    }}
                    className={`min-w-[220px] flex-shrink-0 rounded-2xl bg-white p-4 text-left shadow-sm transition ${selectedCafeId === cafe.id ? 'ring-2 ring-indigo-500' : 'ring-1 ring-slate-200'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-400 tabular-nums shrink-0">#{index + 1}</p>
                      <span className={`text-xs font-semibold shrink-0 ${cafe.status === 'Aktif' ? 'text-emerald-600' : 'text-rose-600'}`}>{cafe.status}</span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate mt-1">{cafe.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{cafe.city}, {cafe.district}</p>
                  </button>
                ))}
              </div>
            </div>
            {selectedCafeId && (
              <div className="px-2 flex gap-2">
                <button
                  onClick={() => navigate('/owner')}
                  className="rounded-2xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  İşletme panelini aç (seçili kafe)
                </button>
                <button
                  onClick={() => {
                    const targetCafe = cafes.find(c => c.id === selectedCafeId);
                    if (targetCafe) {
                      const nextStatus = targetCafe.status === 'Aktif' ? false : true;
                      toggleCafeStatus(selectedCafeId);
                    }
                  }}
                  className={`rounded-2xl px-6 py-2 text-sm font-semibold transition ${
                    cafes.find(c => c.id === selectedCafeId)?.status === 'Aktif'
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {cafes.find(c => c.id === selectedCafeId)?.status === 'Aktif' ? 'Pasif Yap' : 'Aktif Yap'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Building2 size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Toplam Kafe</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.totalCafes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <Bell size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Bekleyen Onay</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
              <Users size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Kullanıcı Hesabı</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <MessageSquare size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Açılmamış Raporlar</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.unresolvedReports}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Hızlı Yönetim</h2>
            <p className="text-sm text-slate-500">Kayıtlı kafeleri, kullanıcıları ve raporları hızlıca yönetin.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              onClick={() => setActiveTab('overview')}
            >
              Genel Bakış
            </button>
            <button
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'cafes' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              onClick={() => setActiveTab('cafes')}
            >
              Kafeler
            </button>
            <button
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              onClick={() => setActiveTab('users')}
            >
              Kullanıcılar
            </button>
            <button
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'reports' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              onClick={() => setActiveTab('reports')}
            >
              Raporlar
            </button>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3 text-slate-700">
                  <ShieldCheck size={22} />
                  <p className="font-semibold">Sistem Güvenliği</p>
                </div>
                <p className="mt-4 text-sm text-slate-600">Admin kontrol panelinden tüm kafeler, kullanıcılar ve raporlar yönetilebilir. Yetkilendirme kuralları uygulandı.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3 text-slate-700">
                  <Sparkles size={22} />
                  <p className="font-semibold">Platform Sağlığı</p>
                </div>
                <p className="mt-4 text-sm text-slate-600">Kafeler ve kullanıcılar üzerinde hızlı filtreleme yaparak sistemdeki bütünsel görünümü takip edin ve hızlı karar alın.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 size={22} />
                  <p className="font-semibold">İleri Seviye Rapor</p>
                </div>
                <p className="mt-4 text-sm text-slate-600">Yorum raporlarında hızlıca işlem yapın, sorunları çözdükçe sistemdeki raporları kapatın.</p>
              </div>
            </div>
          )}

          {activeTab === 'cafes' && (
            <div className="space-y-4">
              {loadingCafes ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Kafeler yükleniyor...
                </div>
              ) : cafes.length > 0 ? cafes.map((cafe) => (
                <div key={cafe.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Kafe</p>
                    <h3 className="text-xl font-semibold text-slate-900">{cafe.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{cafe.city}, {cafe.district}</p>
                    <p className="mt-1 text-sm text-slate-600">Ortalama Puan: {cafe.avgRating.toFixed(1)}</p>
                    <p className="mt-1 text-sm text-slate-600">Raporlar: {reportCountByCafe[cafe.id] || cafe.reports}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cafe.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : cafe.status === 'Beklemede' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {cafe.status}
                    </span>
                    <button
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      onClick={() => toggleCafeStatus(cafe.id)}
                    >
                      {cafe.status === 'Aktif' ? 'Pasife Al' : 'Aktife Al'}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Gösterilecek kafe bulunamadı.
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                    <th className="px-4 py-3 text-sm font-semibold">Rol</th>
                    <th className="px-4 py-3 text-sm font-semibold">E-posta</th>
                    <th className="px-4 py-3 text-sm font-semibold">Durum</th>
                    <th className="px-4 py-3 text-sm font-semibold">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-sm text-slate-700">{item.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{item.role}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{item.email}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => deactivateUser(item.id)}
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          {item.status === 'Aktif' ? 'Pasife Al' : 'Aktife Al'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              {loadingReports ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Raporlar yükleniyor...</div>
              ) : reports.length > 0 ? reports.map((report) => (
                <div key={report.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Rapor</p>
                      <h3 className="text-lg font-semibold text-slate-900">{report.cafe_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">Tür: {report.report_type}</p>
                      <p className="mt-1 text-sm text-slate-500">{report.city}, {report.district}</p>
                      <p className="mt-2 text-sm text-slate-700">{report.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{report.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : report.status === 'in_review' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {report.status === 'resolved' ? 'Çözüldü' : report.status === 'in_review' ? 'İnceleniyor' : 'Beklemede'}
                      </span>
                      {report.status !== 'resolved' && (
                        <button
                          onClick={() => resolveReport(report.id)}
                          className="rounded-2xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
                        >
                          Onaya Al
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Gösterilecek rapor bulunamadı.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
