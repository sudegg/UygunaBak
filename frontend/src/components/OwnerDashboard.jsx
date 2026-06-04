import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TrendingUp, AlertCircle, Star, MapPin, X, Plus, Settings, Store, RefreshCw } from 'lucide-react';
import KPICard from './dashboard/KPICard';
import PriceComparison from './dashboard/PriceComparison';
import HeatMap from './dashboard/HeatMap';
import CustomerFeedback from './dashboard/CustomerFeedback';
import QuickPriceUpdate from './dashboard/QuickPriceUpdate';
import CampaignManager from './dashboard/CampaignManager';
import ReviewList from './ReviewList';

const getAuthToken = () => localStorage.getItem('uygunabak_token') || localStorage.getItem('token');
const getApi = () => axios.create({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

function AddProductPanel({ cafeId, isAdmin, onAdded }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!name.trim() || price === '') return;
        setBusy(true);
        try {
            const url = isAdmin ? `/api/admin/cafes/${cafeId}/products` : '/api/owner/products';
            let body = { name: name.trim(), price: Number(price) };
            if (selectedCategoryId) {
                body.category_id = selectedCategoryId;
            } else {
                // Eğer kategori seçilmediyse, sunucu isimden kategoriyi çözsün
                body.category_name = name.trim();
            }
            if (!isAdmin) body.cafe_id = cafeId;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Eklenemedi');
            setName('');
            setPrice('');
            onAdded?.();
        } catch (err) {
            alert(err.message || 'Ürün eklenemedi.');
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const resp = await fetch('/api/cafes/categories');
                const json = await resp.json();
                if (json.success) {
                    setCategories(json.data || []);
                }
            } catch (err) {
                // ignore
            }
        };
        loadCategories();
    }, []);

    // Basit heuristic: ürün adından kategori tahmini yap ve seç
    useEffect(() => {
        if (!name || categories.length === 0) return;
        const s = name.toLowerCase();
        const heuristics = [
            { tokens: ['tost', 'sandvi', 'sandviç', 'burger', 'wrap'], slug: 'sandvic' },
            { tokens: ['latte', 'espresso', 'filtre', 'cappuccino', 'americano', 'kahve', 'ristretto', 'v60', 'pour', 'flat white', 'macchiato'], slug: 'kahve' },
            { tokens: ['buzlu', 'cold', 'cold brew', 'nitro', 'frappe', 'shake', 'smoothie'], slug: 'soguk-kahve' },
            { tokens: ['tatlı', 'cheesecake', 'brownie', 'pasta', 'tiramisu', 'kek', 'baklava', 'tart', 'kurabiye'], slug: 'tatli' },
            { tokens: ['kahvalt', 'omlet', 'granola', 'serpme'], slug: 'kahvalti' },
            { tokens: ['çay', 'chai', 'sultan çayı'], slug: 'cay' },
            { tokens: ['limonata', 'smoothie', 'mojito', 'ice', 'ice tea'], slug: 'icecek' },
            { tokens: ['kek', 'kurabiye', 'lokum'], slug: 'atistirmalik' },
        ];

        for (const rule of heuristics) {
            for (const t of rule.tokens) {
                if (s.includes(t)) {
                    const matched = categories.find(c => c.slug === rule.slug || (c.name || '').toLowerCase().includes(rule.slug));
                    if (matched) {
                        setSelectedCategoryId(matched.id);
                        return;
                    }
                }
            }
        }
        // Eşleşme yoksa seçimi temizle (sunucu fallback 'Kahve' kalacak)
        setSelectedCategoryId(null);
    }, [name, categories]);

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="text-teal-600" size={22} /> Menüye ürün ekle
            </h3>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ürün adı</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                        placeholder="Örn. Latte"
                    />
                </div>
                <div className="w-full sm:w-56">
                    <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                    <select
                        value={selectedCategoryId || ''}
                        onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white"
                    >
                        <option value="">Otomatik (isimden)</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-32">
                    <label className="text-xs font-bold text-slate-500 uppercase">Fiyat (₺)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={busy}
                    className="w-full sm:w-auto rounded-xl bg-teal-600 text-white font-bold px-6 py-2.5 text-sm hover:bg-teal-700 disabled:opacity-50"
                >
                    {busy ? 'Ekleniyor...' : 'Ekle'}
                </button>
            </form>
            <p className="text-xs text-slate-400 mt-3">Kategori varsayılan olarak &quot;Kahve&quot; atanır; gerekirse veritabanında genişletin.</p>
        </div>
    );
}

function OwnerDashboard() {
    const [ownedCafes, setOwnedCafes] = useState([]);
    const [selectedCafeId, setSelectedCafeId] = useState(() =>
        localStorage.getItem('uygunabak_admin_selected_cafe_id') ||
        localStorage.getItem('uygunabak_active_cafe_id') ||
        ''
    );
    const [dashboardData, setDashboardData] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [products, setProducts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [cafeReviews, setCafeReviews] = useState([]);
    const [reports, setReports] = useState([]);
    const [reportForm, setReportForm] = useState({
        report_type: 'Genel Uyarı',
        title: '',
        description: '',
    });
    const [reportSaving, setReportSaving] = useState(false);
    
    const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(() => {
        try {
            const u = JSON.parse(localStorage.getItem('uygunabak_user') || '{}');
            return u.role === 'ADMIN';
        } catch {
            return false;
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const updateActiveCafe = (id, adminHint) => {
        const user = JSON.parse(localStorage.getItem('uygunabak_user') || '{}');
        const adminMode = adminHint ?? user.role === 'ADMIN';
        setSelectedCafeId(String(id));
        localStorage.setItem('uygunabak_active_cafe_id', String(id));
        if (adminMode) {
            localStorage.setItem('uygunabak_admin_selected_cafe_id', String(id));
        }
    };

    const refreshCafeData = useCallback(async () => {
        if (!selectedCafeId) return;
        const api = getApi();
        try {
            const reportsEndpoint = isAdmin
                ? `/api/admin/reports?cafe_id=${selectedCafeId}`
                : `/api/owner/reports?cafe_id=${selectedCafeId}`;
            const [prodRes, reviewsRes, campRes, reportsRes] = await Promise.all([
                isAdmin
                    ? api.get(`/api/admin/cafes/${selectedCafeId}/products`)
                    : api.get(`/api/owner/products?cafe_id=${selectedCafeId}`),
                api.get(`/api/reviews/cafe/${selectedCafeId}`).catch(() => ({ data: { data: [] } })),
                isAdmin
                    ? api.get(`/api/admin/cafes/${selectedCafeId}/campaigns`)
                    : api.get(`/api/owner/campaigns?cafe_id=${selectedCafeId}`),
                api.get(reportsEndpoint).catch(() => ({ data: { data: [] } })),
            ]);
            setProducts(prodRes.data?.data || []);
            setCafeReviews(reviewsRes.data?.data || []);
            setCampaigns(campRes.data?.data || []);
            setReports(reportsRes.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    }, [selectedCafeId, isAdmin]);

    // 1. ADIM: Rol Kontrolü ve Kafe Listesini Yükleme
    useEffect(() => {
        const initAction = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('uygunabak_user') || '{}');
                const adminMode = user.role === 'ADMIN';
                setIsAdmin(adminMode);

                const endpoint = adminMode ? '/api/admin/cafes' : '/api/owner/cafes';
                const res = await getApi().get(endpoint);
                
                if (res.data?.success) {
                    const cafes = (res.data.data || []).slice().sort((a, b) =>
                        (a.name || '').localeCompare(b.name || '', 'tr')
                    );
                    setOwnedCafes(cafes);
                    const stored =
                        localStorage.getItem('uygunabak_admin_selected_cafe_id') ||
                        localStorage.getItem('uygunabak_active_cafe_id');
                    const stillValid = stored && cafes.some((c) => String(c.id) === String(stored));
                    if (stillValid) {
                        setSelectedCafeId(String(stored));
                    } else if (cafes.length > 0) {
                        updateActiveCafe(cafes[0].id, adminMode);
                    }
                }
            } catch (err) {
                setError("Sistem başlatılamadı.");
            }
        };
        initAction();
    }, []);

    // 2. ADIM: Seçili Kafe Değiştiğinde Tüm Panel Verilerini Yenile
    useEffect(() => {
        if (!selectedCafeId) return;

        const fetchAllData = async () => {
            setLoading(true);
            const api = getApi();
            try {
                const reportsEndpoint = isAdmin
                    ? `/api/admin/reports?cafe_id=${selectedCafeId}`
                    : `/api/owner/reports?cafe_id=${selectedCafeId}`;
                const [dashRes, prodRes, analyticsRes, reviewsRes, campRes, reportsRes] = await Promise.all([
                    isAdmin
                        ? api.get(`/api/admin/cafes/${selectedCafeId}/details`)
                        : api.get(`/api/owner/dashboard?cafe_id=${selectedCafeId}`),
                    isAdmin
                        ? api.get(`/api/admin/cafes/${selectedCafeId}/products`)
                        : api.get(`/api/owner/products?cafe_id=${selectedCafeId}`),
                    isAdmin
                        ? Promise.resolve({ data: { data: null } })
                        : api.get(`/api/owner/analytics?cafe_id=${selectedCafeId}`).catch(() => ({ data: { data: null } })),
                    api.get(`/api/reviews/cafe/${selectedCafeId}`).catch(() => ({ data: { data: [] } })),
                    isAdmin
                        ? api.get(`/api/admin/cafes/${selectedCafeId}/campaigns`)
                        : api.get(`/api/owner/campaigns?cafe_id=${selectedCafeId}`),
                    api.get(reportsEndpoint).catch(() => ({ data: { data: [] } })),
                ]);

                setDashboardData(dashRes.data?.data || dashRes.data);
                setProducts(prodRes.data?.data || []);
                setAnalyticsData(analyticsRes.data?.data || null);
                setCafeReviews(reviewsRes.data?.data || []);
                setCampaigns(campRes.data?.data || []);
                setReports(reportsRes.data?.data || []);
                setError(null);
            } catch (err) {
                setError("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [selectedCafeId, isAdmin]);

    // İŞLEM YÖNETİCİLERİ (Admin veya Owner fark etmeksizin çalışır)
    const handleStatusToggle = async () => {
        const nextStatus = !dashboardData?.cafe?.is_active;
        setDashboardData(prev => ({ ...prev, cafe: { ...prev.cafe, is_active: nextStatus } }));
        try {
            if (isAdmin) {
                await getApi().put(`/api/admin/cafes/${selectedCafeId}/status`, { is_active: nextStatus });
            } else {
                await getApi().put('/api/owner/status', { is_active: nextStatus, cafe_id: selectedCafeId });
            }
        } catch (err) {
            alert("Durum güncellenemedi.");
            setDashboardData(prev => ({ ...prev, cafe: { ...prev.cafe, is_active: !nextStatus } }));
        }
    };

    const handleCreateReport = async (event) => {
        event.preventDefault();
        if (!selectedCafeId || !reportForm.title.trim() || !reportForm.description.trim()) return;

        setReportSaving(true);
        try {
            const response = await getApi().post('/api/owner/reports', {
                cafe_id: selectedCafeId,
                report_type: reportForm.report_type,
                title: reportForm.title.trim(),
                description: reportForm.description.trim(),
            });

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Rapor oluşturulamadı.');
            }

            setReportForm({
                report_type: 'Genel Uyarı',
                title: '',
                description: '',
            });
            await refreshCafeData();
        } catch (err) {
            alert(err.message || 'Rapor oluşturulamadı.');
        } finally {
            setReportSaving(false);
        }
    };

    if (loading && !dashboardData) return <div className="p-20 text-center animate-pulse">İşletme verileri hazırlanıyor...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* ÜST SEÇİM PANELİ: Admin her şeyi, Owner sadece kendi şubelerini görür */}
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isAdmin ? <Settings size={24} /> : <Store size={24} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800">
                                {isAdmin ? 'Sistem Yönetim Konsolu' : 'İşletme Yönetimi'}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Aktif Kafe: {dashboardData?.cafe?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select 
                            className="flex-1 md:w-72 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer"
                            value={selectedCafeId}
                            onChange={(e) => updateActiveCafe(e.target.value, isAdmin)}
                        >
                            {ownedCafes.map((cafe, idx) => (
                                <option key={cafe.id} value={cafe.id}>
                                    {idx + 1}. {cafe.name} ({cafe.district})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {dashboardData && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        {/* BAŞLIK VE AKTİFLİK AYARI */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900">{dashboardData.cafe?.name}</h1>
                                <p className="text-slate-500 font-medium">{dashboardData.cafe?.address}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">İşletme Görünürlüğü</p>
                                    <p className={`text-sm font-bold ${dashboardData.cafe?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                        {dashboardData.cafe?.is_active ? 'Sitede Yayında' : 'Yayında Değil'}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleStatusToggle}
                                    className={`w-14 h-8 rounded-full transition-all relative shadow-inner ${dashboardData.cafe?.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 bg-white w-6 h-6 rounded-full shadow-md transition-all ${dashboardData.cafe?.is_active ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* KPI KARTLARI */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard title="Favoriler" value={dashboardData.basicAnalytics?.favorites || 0} icon={<Star />} />
                            <KPICard title="Toplam Ürün" value={products.length} icon={<AlertCircle />} />
                            <KPICard title="Puan Ort." value={dashboardData.basicAnalytics?.weeklyTrend || '0.0'} icon={<TrendingUp />} />
                            <KPICard title="Müşteri Etkileşimi" value={cafeReviews.length} icon={<MapPin />} />
                        </div>

                        {/* ANALİZ VE YÖNETİM BÖLÜMÜ */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* SOL KOLON: Menü ve Fiyat Karşılaştırma */}
                            <div className="lg:col-span-2 space-y-8">
                                <AddProductPanel
                                    cafeId={selectedCafeId}
                                    isAdmin={isAdmin}
                                    onAdded={refreshCafeData}
                                />
                                <QuickPriceUpdate
                                    products={products}
                                    cafeId={selectedCafeId}
                                    isAdmin={isAdmin}
                                    onAfterSave={refreshCafeData}
                                />
                                <CampaignManager
                                    campaigns={campaigns}
                                    cafeId={selectedCafeId}
                                    isAdmin={isAdmin}
                                    onRefresh={refreshCafeData}
                                />
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">Raporlar</h3>
                                            <p className="text-sm text-slate-500">Seçili işletme için admin paneline düşen raporları izleyin.</p>
                                        </div>
                                        <div className="text-right text-xs text-slate-400">
                                            {reports.length} kayıtlı rapor
                                        </div>
                                    </div>

                                    {!isAdmin && (
                                        <form onSubmit={handleCreateReport} className="grid gap-4 md:grid-cols-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Rapor türü</label>
                                                <select
                                                    value={reportForm.report_type}
                                                    onChange={(e) => setReportForm((prev) => ({ ...prev, report_type: e.target.value }))}
                                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                                >
                                                    <option>Genel Uyarı</option>
                                                    <option>Fiyat Güncelleme</option>
                                                    <option>Yorum Şikayeti</option>
                                                    <option>Operasyonel Sorun</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Başlık</label>
                                                <input
                                                    value={reportForm.title}
                                                    onChange={(e) => setReportForm((prev) => ({ ...prev, title: e.target.value }))}
                                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                                    placeholder="Örn. Menü fiyatları güncellensin"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Açıklama</label>
                                                <input
                                                    value={reportForm.description}
                                                    onChange={(e) => setReportForm((prev) => ({ ...prev, description: e.target.value }))}
                                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                                    placeholder="Kısa açıklama yazın"
                                                />
                                            </div>
                                            <div className="md:col-span-3 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={reportSaving}
                                                    className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                                                >
                                                    {reportSaving ? 'Gönderiliyor...' : 'Rapora gönder'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="space-y-3">
                                        {reports.length > 0 ? reports.slice(0, 3).map((report) => (
                                            <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{report.report_type} • {report.status === 'resolved' ? 'Çözüldü' : report.status === 'in_review' ? 'İnceleniyor' : 'Beklemede'}</p>
                                                        <p className="text-sm text-slate-600 mt-2">{report.description}</p>
                                                    </div>
                                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{new Date(report.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-slate-500">Henüz rapor yok.</p>
                                        )}
                                    </div>
                                </div>
                                <PriceComparison data={analyticsData?.priceComparison} cafeProducts={products} />
                                
                                {/* En Çok Tercih Edilenler (Dinamik Liste) */}
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                        <TrendingUp className="text-orange-500" /> En Çok Tercih Edilen Ürünler
                                    </h3>
                                    <div className="space-y-4">
                                        {products.slice(0, 4).map((p, index) => (
                                            <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full font-black text-slate-400 text-xs">{index + 1}</span>
                                                    <span className="font-bold text-slate-700">{p.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-400">{Math.floor(Math.random() * 500)} Tıklama</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* SAĞ KOLON: Geri Bildirim ve Isı Haritası */}
                            <div className="space-y-8">
                                <HeatMap locations={analyticsData?.searchLocations} />
                                <CustomerFeedback feedbacks={cafeReviews} onViewAll={() => setShowAllReviewsModal(true)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showAllReviewsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Tüm Yorumlar</h2>
                                <p className="text-sm text-slate-500">{cafeReviews.length} yorum</p>
                            </div>
                            <button
                                onClick={() => setShowAllReviewsModal(false)}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <ReviewList reviews={cafeReviews} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OwnerDashboard;