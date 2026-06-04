import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CafeCard from "./components/CafeCard";
import CafeMap from "./components/CafeMap";
import AiSearchBox from "./components/AiSearchBox";
import ReviewList from "./components/ReviewList";
import Toast from "./components/Toast";
import {
  SparklesIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  WifiIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  BarsArrowUpIcon,
  XMarkIcon,
  MapIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  MagnifyingGlassIcon as SearchIcon,
  ChevronDownIcon,
  FunnelIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

function CafeList() {
  const [cafes, setCafes] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("all");

  // Favoriler state'i
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("cafeFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Şehirler listesi
  const [cities, setCities] = useState([]);

  // Menü modal state'i
  const [selectedCafeForMenu, setSelectedCafeForMenu] = useState(null);
  const [cafeModalTab, setCafeModalTab] = useState("menu");
  const [selectedCafeMenuItems, setSelectedCafeMenuItems] = useState([]);
  const [selectedCafeCampaigns, setSelectedCafeCampaigns] = useState([]);
  const [selectedCafeReviews, setSelectedCafeReviews] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [selectedCafeForDirections, setSelectedCafeForDirections] =
    useState(null);

  const [filters, setFilters] = useState({
    city: "",
    district: "",
    lat: null,
    lon: null,
    category_id: "",
    feature_ids: [],
    min_price: "",
    max_price: "",
    min_rating: "",
    max_rating: "",
    sortBy: "name_asc",
  });

  // Filtreleme seçenekleri
  const filterOptions = {
    features: [
      { id: 1, name: "Wi-Fi", icon: <WifiIcon className="h-4 w-4" /> },
      { id: 2, name: "Priz", icon: <BoltIcon className="h-4 w-4" /> },
      {
        id: 3,
        name: "Evcil Hayvan Dostu",
        icon: <HeartSolidIcon className="h-4 w-4" />,
      },
    ],
    sortOptions: [
      { value: "name_asc", label: "İsim (A-Z)" },
      { value: "rating_desc", label: "Puana Göre (Yüksek-Düşük)" },
      { value: "rating_asc", label: "Puana Göre (Düşük-Yüksek)" },
      { value: "price_asc", label: "Fiyata Göre (Düşük-Yüksek)" },
      { value: "price_desc", label: "Fiyata Göre (Yüksek-Düşük)" },
    ],
  };

  // Favoriler fonksiyonları
  const toggleFavorite = (cafeId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(cafeId)
        ? prev.filter((id) => id !== cafeId)
        : [...prev, cafeId];

      localStorage.setItem("cafeFavorites", JSON.stringify(newFavorites));
      setToast({
        message: prev.includes(cafeId)
          ? "Favorilerden çıkarıldı"
          : "Favorilere eklendi",
        type: "success",
      });
      return newFavorites;
    });
  };

  const isFavorite = (cafeId) => favorites.includes(cafeId);

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem("uygunabak_user");
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Stored user parse error:", error);
      return null;
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem("uygunabak_token") || localStorage.getItem("token");
  };

  // Şehirleri çek
  const fetchCities = useCallback(async () => {
    try {
      const response = await axios.get("/api/cafes");
      if (response.data?.success) {
        const uniqueCities = [
          ...new Set(
            response.data.data.map((cafe) => cafe.city).filter(Boolean),
          ),
        ];
        setCities(uniqueCities.sort());
      }
    } catch (err) {
      console.error("Cities fetch error:", err);
    }
  }, []);

  // Sayfa yüklendiğinde şehirleri çek
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const activeFilterCount = [
    filters.city ? 1 : 0,
    filters.category_id ? 1 : 0,
    filters.min_price || filters.max_price ? 1 : 0,
    filters.min_rating || filters.max_rating ? 1 : 0,
    filters.feature_ids?.length || 0,
    searchQuery.trim() ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  // API çağrısı için modüler fonksiyon
  const fetchCafes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        q: searchQuery.trim() || undefined,
      };

      const response = await axios.get("/api/cafes", {
        params,
        timeout: 15000,
      });

      if (response.data?.success) {
        setCafes(response.data.data || []);
      } else {
        setCafes([]);
        setError(response.data?.message || "Veri bulunamadı.");
        setToast({
          message: "Kafeler yüklenirken bir sorun oluştu.",
          type: "warning",
        });
      }
    } catch (err) {
      console.error("Cafes fetch error:", err);
      const errorMessage =
        err.response?.data?.message || "Sunucu bağlantısı başarısız.";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
      setCafes([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // Debounced arama
  useEffect(() => {
    const delay = setTimeout(fetchCafes, 350);
    return () => clearTimeout(delay);
  }, [fetchCafes]);

  // Filtre güncelleme fonksiyonu
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Özellik toggle fonksiyonu
  const toggleFeature = (featureId) => {
    setFilters((prev) => ({
      ...prev,
      feature_ids: prev.feature_ids.includes(featureId)
        ? prev.feature_ids.filter((id) => id !== featureId)
        : [...prev.feature_ids, featureId],
    }));
  };

  // Filtreleri temizleme
  const clearFilters = () => {
    setFilters({
      city: "",
      district: "",
      lat: null,
      lon: null,
      category_id: "",
      feature_ids: [],
      min_price: "",
      max_price: "",
      min_rating: "",
      max_rating: "",
      sortBy: "name_asc",
    });
    setSearchQuery("");
    setToast({
      message: "Tüm filtreler ve arama temizlendi.",
      type: "success",
    });
  };

  // Menü modal fonksiyonları
  const openMenuModal = async (cafe, initialTab = "menu") => {
    setSelectedCafeForMenu(cafe);
    setCafeModalTab(initialTab);
    setSelectedCafeMenuItems([]);
    setSelectedCafeCampaigns([]);
    setSelectedCafeReviews([]);
    setMenuError(null);
    setReviewError(null);
    setReviewForm({ rating: 5, comment: "" });
    setMenuLoading(true);

    try {
      const [menuResult, reviewResult, campaignResult] = await Promise.allSettled([
        axios.get(`/api/cafes/${cafe.id}/menu`),
        axios.get(`/api/reviews/cafe/${cafe.id}`),
        axios.get(`/api/cafes/${cafe.id}/campaigns`),
      ]);

      // ✅ Menü fetch
      if (menuResult.status === "fulfilled") {
        if (menuResult.value.data?.success) {
          setSelectedCafeMenuItems(menuResult.value.data.data || []);
        } else {
          setMenuError(menuResult.value.data?.message || 'Menü alınamadı.');
        }
      } else {
        console.error('❌ Menu fetch error:', menuResult.reason);
        setMenuError('Menü yüklenemedi: ' + (menuResult.reason?.message || 'Bilinmeyen hata'));
      }

      // ✅ Yorum fetch
      if (reviewResult.status === "fulfilled") {
        if (reviewResult.value.data?.success) {
          const reviews = reviewResult.value.data.data || [];
          setSelectedCafeReviews(reviews);
          console.log(`✅ ${reviews.length} yorum yüklendi`);
        } else {
          console.warn('⚠️ Yorum verisi başarısız:', reviewResult.value.data?.message);
          setSelectedCafeReviews([]);
        }
      } else {
        console.error('❌ Review fetch error:', reviewResult.reason);
        setReviewError('Yorumlar yüklenemedi: ' + (reviewResult.reason?.message || 'Bilinmeyen hata'));
        setSelectedCafeReviews([]);
      }

      // ✅ Kampanya fetch
      if (campaignResult.status === "fulfilled") {
        if (campaignResult.value.data?.success) {
          setSelectedCafeCampaigns(campaignResult.value.data.data || []);
        }
      } else {
        console.error('❌ Campaign fetch error:', campaignResult.reason);
      }
    } catch (error) {
      console.error('❌ Menu modal fetch error:', error);
      setMenuError('Menü yüklenemedi: ' + (error?.message || 'Bilinmeyen hata'));
    } finally {
      setMenuLoading(false);
    }
  };

  const openReviewModal = async (cafe) => {
    await openMenuModal(cafe, "reviews");
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCafeForMenu) {
      return;
    }

    const currentUser = getCurrentUser();
    const token = getAuthToken();

    console.log('Review submit - User:', currentUser, 'Token:', token ? 'exists' : 'missing');

    if (!currentUser || !token) {
      const message = "Yorum yapmak için giriş yapmalısınız.";
      setReviewError(message);
      setToast({ message, type: "warning" });
      return;
    }

    const trimmedComment = reviewForm.comment.trim();
    if (trimmedComment.length < 10) {
      const message = "Yorum en az 10 karakter olmalıdır.";
      setReviewError(message);
      setToast({ message, type: "warning" });
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      console.log('Submitting review:', {
        cafe_id: selectedCafeForMenu.id,
        comment: trimmedComment,
        overall_rating: reviewForm.rating,
      });

      const response = await axios.post(
        "/api/reviews",
        {
          cafe_id: selectedCafeForMenu.id,
          comment: trimmedComment,
          overall_rating: reviewForm.rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Review submitted successfully:', response.data);

      setToast({ message: "Yorumunuz kaydedildi.", type: "success" });
      setReviewForm({ rating: 5, comment: "" });
      await fetchCafes();
      await reloadCafeModalData(selectedCafeForMenu);
    } catch (error) {
      console.error('Review submit error:', error);
      const message = error.response?.data?.message || "Yorum kaydedilemedi.";
      setReviewError(message);
      setToast({ message, type: "error" });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const closeMenuModal = () => {
    setSelectedCafeForMenu(null);
    setSelectedCafeMenuItems([]);
    setSelectedCafeCampaigns([]);
    setMenuError(null);
    setCafeModalTab("menu");
  };

  const reloadCafeModalData = async (cafe) => {
    if (!cafe) return;
    try {
      const [menuResult, reviewResult, campaignResult] = await Promise.allSettled([
        axios.get(`/api/cafes/${cafe.id}/menu`),
        axios.get(`/api/reviews/cafe/${cafe.id}`),
        axios.get(`/api/cafes/${cafe.id}/campaigns`),
      ]);
      if (menuResult.status === "fulfilled" && menuResult.value.data?.success) {
        setSelectedCafeMenuItems(menuResult.value.data.data || []);
      }
      if (reviewResult.status === "fulfilled" && reviewResult.value.data?.success) {
        setSelectedCafeReviews(reviewResult.value.data.data || []);
      }
      if (campaignResult.status === "fulfilled" && campaignResult.value.data?.success) {
        setSelectedCafeCampaigns(campaignResult.value.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Yol tarifi modal fonksiyonları
  const openDirectionsModal = (cafe) => {
    setSelectedCafeForDirections(cafe);
  };

  const closeDirectionsModal = () => {
    setSelectedCafeForDirections(null);
  };

  // Google Maps URL oluştur
  const getGoogleMapsUrl = (cafe) => {
    if (cafe.latitude && cafe.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${cafe.latitude},${cafe.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name + " " + cafe.city + " " + cafe.district)}`;
  };

  // Konum isteği
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setToast({
        message: "Tarayıcınız konum servisini desteklemiyor.",
        type: "warning",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFilter("lat", position.coords.latitude);
        updateFilter("lon", position.coords.longitude);
        updateFilter("city", "");
        updateFilter("district", "");
        setToast({
          message: "Konum izni alındı. Yakınınızdaki mekânlar listeleniyor.",
          type: "success",
        });
      },
      () => {
        setToast({
          message:
            "Konum izni reddedildi. Şehir/ilçe seçerek arama yapabilirsiniz.",
          type: "warning",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // AI arama sonuçları
  const handleAiSearchResults = (results) => {
    if (results?.length) {
      setCafes(results);
      setToast({ message: "Yapay zeka sonuçları yüklendi.", type: "success" });
    }
  };

  const closeToast = () => setToast(null);

  const favoriteCafes = cafes.filter((cafe) => favorites.includes(cafe.id));
  const displayedCafes = activeSection === "favorites" ? favoriteCafes : cafes;
  const currentUser = getCurrentUser();

  const notificationItems = [
    {
      id: 1,
      title: "Yeni kafe eklendi!",
      description:
        "Kadıköy bölgesine yeni bir mekan eklendi. Keşfetmek için hemen tıkla.",
      badge: "Yeni",
      time: "2 saat önce",
    },
    {
      id: 2,
      title: "%20 indirim kampanyası",
      description: "Hafta sonuna özel tüm filtre kahvelerinde %20 indirim.",
      badge: "Kampanya",
      time: "5 saat önce",
    },
    {
      id: 3,
      title: "Wi-Fi hız testi tamamlandı",
      description: "En iyi Wi-Fi bağlantısına sahip 5 mekan güncellendi.",
      badge: "Duyuru",
      time: "1 gün önce",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Ana içerik */}
      <div className="flex">
        {/* Sidebar Filtre Paneli */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filtreler
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Arama Kutusu */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                Kafe Ara
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kafe adı ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
                <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Şehir Filtresi */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Şehir Seç
              </h3>
              <select
                value={filters.city}
                onChange={(e) => updateFilter("city", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Özellikler */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Özellikler
              </h3>
              <div className="space-y-2">
                {filterOptions.features.map((feature) => (
                  <label
                    key={feature.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.feature_ids.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="flex items-center gap-2 text-sm text-slate-700">
                      {feature.icon}
                      {feature.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fiyat Aralığı */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Fiyat Aralığı (₺)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) => updateFilter("min_price", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) => updateFilter("max_price", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Puan Aralığı */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Puan Aralığı
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="Min"
                  value={filters.min_rating}
                  onChange={(e) => updateFilter("min_rating", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="Max"
                  value={filters.max_rating}
                  onChange={(e) => updateFilter("max_rating", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Sıralama */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BarsArrowUpIcon className="h-4 w-4" />
                Sıralama
              </h3>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {filterOptions.sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Temizle Butonu */}
            <button
              onClick={clearFilters}
              className="mt-auto w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Filtreleri Temizle
            </button>
          </div>
        </aside>

        {/* Ana İçerik Alanı */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Üst Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kafeler</h1>
                <p className="text-slate-600">En uygun mekanları keşfedin</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Filtreler
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={requestLocation}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <MapPinIcon className="h-4 w-4" />
                  Yakınımda
                </button>
              </div>
            </div>

            {/* Arama Kutusu */}
            <div className="mb-6">
              <AiSearchBox
                userId={currentUser?.id}
                onSearchResults={handleAiSearchResults}
              />
            </div>

            {/* Bölümler ve Görünüm Modları */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: "Tüm Kafeler" },
                  {
                    key: "favorites",
                    label: `Favorilerim (${favoriteCafes.length})`,
                  },
                  { key: "notifications", label: "Bildirimler" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeSection === tab.key
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="text-sm text-slate-600">
                  {loading
                    ? "Yükleniyor..."
                    : activeSection === "favorites"
                      ? `${favoriteCafes.length} favori bulundu`
                      : `${cafes.length} sonuç bulundu`}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeFilterCount > 0 &&
                    activeSection !== "notifications" && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {activeFilterCount} aktif filtre
                      </span>
                    )}
                  <div className="flex items-center gap-2">
                    {[
                      { key: "grid", label: "Grid", icon: Squares2X2Icon },
                      { key: "list", label: "Liste", icon: ListBulletIcon },
                      { key: "map", label: "Harita", icon: MapIcon },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setViewMode(key)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                          viewMode === key
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Kafeler Görünümü */}
            <div className="min-h-[420px]">
              {loading ? (
                activeSection === "notifications" ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8">
                    Bildirimler yükleniyor...
                  </div>
                ) : viewMode === "map" ? (
                  <div className="h-[600px] animate-pulse rounded-2xl bg-slate-200" />
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                        : "space-y-4"
                    }
                  >
                    {[...Array(6)].map((_, idx) => (
                      <div
                        key={idx}
                        className="h-80 animate-pulse rounded-2xl bg-slate-200"
                      />
                    ))}
                  </div>
                )
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                  <div className="mx-auto h-12 w-12 text-red-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-red-800">
                    Bir sorun oluştu
                  </h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchCafes}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : activeSection === "notifications" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {notificationItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            {item.description}
                          </p>
                        </div>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                          {item.badge}
                        </span>
                      </div>
                      <p className="mt-4 text-xs text-slate-500">{item.time}</p>
                    </div>
                  ))}
                </div>
              ) : viewMode === "map" ? (
                <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-200">
                  <CafeMap
                    cafes={displayedCafes}
                    onCafeSelect={(cafe) => {
                      setToast({
                        message: `${cafe.name} seçildi`,
                        type: "info",
                      });
                    }}
                  />
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {displayedCafes.length > 0 ? (
                    displayedCafes.map((cafe) => (
                      <CafeCard
                        key={cafe.id}
                        cafe={cafe}
                        viewMode={viewMode}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={isFavorite}
                        onMenuClick={openMenuModal}
                          onReviewClick={openReviewModal}
                        onDirectionsClick={openDirectionsModal}
                      />
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
                      <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-400" />
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        {activeSection === "favorites"
                          ? "Henüz favori eklenmiş kafe yok"
                          : "Sonuç bulunamadı"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {activeSection === "favorites"
                          ? "Favori eklemek için kalp butonuna tıklayın."
                          : "Arama kriterlerinizi değiştirin veya filtreleri temizleyin."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Menü Modal */}
        {selectedCafeForMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-w-2xl w-full max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedCafeForMenu.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCafeForMenu.city}, {selectedCafeForMenu.district}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { key: "menu", label: "Menü" },
                      { key: "campaigns", label: "Kampanyalar" },
                      { key: "reviews", label: "Yorumlar" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setCafeModalTab(t.key)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          cafeModalTab === t.key
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={closeMenuModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {menuLoading ? (
                    <div className="py-12 text-center text-gray-500">
                      Yükleniyor...
                    </div>
                  ) : (
                    <>
                      {cafeModalTab === "menu" && (
                        <>
                          {menuError ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                              {menuError}
                            </div>
                          ) : selectedCafeMenuItems.length > 0 ? (
                            selectedCafeMenuItems.map((item) => (
                              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center gap-4">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {item.category_name || 'Kategori yok'}
                                      {!item.is_available ? ' · Stokta yok' : ''}
                                    </p>
                                  </div>
                                  <span className="font-bold text-lg text-green-600">
                                    {Number(item.price).toFixed(2)} {item.currency || 'TRY'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                              Bu kafe için henüz menü ürünü bulunmuyor.
                            </div>
                          )}
                          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
                            Kampanyalar ve yorumlar için üstteki sekmelere geçebilirsiniz.
                          </p>
                        </>
                      )}

                      {cafeModalTab === "campaigns" && (
                        <div className="space-y-4">
                          {selectedCafeCampaigns.length === 0 ? (
                            <p className="text-sm text-gray-500">
                              Şu an için geçerli kampanya bulunmuyor.
                            </p>
                          ) : (
                            selectedCafeCampaigns.map((c) => (
                              <div
                                key={c.id}
                                className="rounded-xl border border-purple-200 bg-purple-50/50 p-4"
                              >
                                <h3 className="font-bold text-slate-900">{c.title}</h3>
                                {c.description && (
                                  <p className="mt-2 text-sm text-slate-600">{c.description}</p>
                                )}
                                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                                  {c.discount_percent != null && (
                                    <span className="rounded-full bg-white px-2 py-1 font-semibold text-purple-700">
                                      %{Number(c.discount_percent)} indirim
                                    </span>
                                  )}
                                  <span>
                                    {c.starts_at} — {c.ends_at}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {cafeModalTab === "reviews" && (
                        <div className="space-y-6">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">Yorum Yap</h3>
                              <p className="text-sm text-slate-600 mt-1">
                                Deneyiminizi kısa bir yorum ve puanla paylaşın.
                              </p>
                            </div>

                            {reviewError && (
                              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {reviewError}
                              </div>
                            )}

                            {currentUser ? (
                              <form className="space-y-4" onSubmit={handleReviewSubmit}>
                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Puan
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((starValue) => (
                                      <button
                                        key={starValue}
                                        type="button"
                                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: starValue }))}
                                        className="transition-transform hover:scale-110"
                                        aria-label={`${starValue} puan ver`}
                                      >
                                        <StarIcon
                                          className={`h-7 w-7 ${reviewForm.rating >= starValue ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                                        />
                                      </button>
                                    ))}
                                    <span className="ml-2 text-sm font-medium text-slate-600">
                                      {reviewForm.rating}/5
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Yorum
                                  </label>
                                  <textarea
                                    value={reviewForm.comment}
                                    onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                                    rows="4"
                                    maxLength={1000}
                                    placeholder="Kafe deneyiminizi paylaşın..."
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                  />
                                  <p className="mt-1 text-xs text-slate-500">
                                    En az 10 karakter olmalıdır.
                                  </p>
                                </div>

                                <button
                                  type="submit"
                                  disabled={reviewSubmitting}
                                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {reviewSubmitting ? 'Kaydediliyor...' : 'Yorumu Kaydet'}
                                </button>
                              </form>
                            ) : (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Yorum bırakmak için giriş yapmalısınız.
                              </div>
                            )}
                          </div>

                          <ReviewList reviews={selectedCafeReviews} />
                        </div>
                      )}
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yol Tarifi Modal */}
        {selectedCafeForDirections && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Yol Tarifi
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCafeForDirections.name}
                  </p>
                </div>
                <button
                  onClick={closeDirectionsModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedCafeForDirections.address ||
                      `${selectedCafeForDirections.city}, ${selectedCafeForDirections.district}`}
                  </p>
                </div>
                <div className="space-y-3">
                  <a
                    href={getGoogleMapsUrl(selectedCafeForDirections)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPinIcon className="h-5 w-5" />
                    Google Maps'te Aç
                  </a>
                  <button
                    onClick={closeDirectionsModal}
                    className="w-full bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Asistan Butonu */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/20 transition hover:scale-105"
      >
        <SparklesIcon className="h-6 w-6" />
        Akıllı Asistan
      </button>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-5">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  Yapay Zeka Asistanı
                </p>
                <p className="text-sm text-slate-600">
                  Akıllı arama ve öneriler için sorunu yaz.
                </p>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Kapat
              </button>
            </div>
            <AiSearchBox
              userId={currentUser?.id}
              onSearchResults={handleAiSearchResults}
            />
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default CafeList;
