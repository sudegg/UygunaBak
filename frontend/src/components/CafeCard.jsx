import React, { useMemo } from "react";
import {
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HeartIcon as HeartOutline,
  HeartIcon as HeartSolid,
} from "@heroicons/react/24/solid";
import { HeartIcon, WifiIcon, BoltIcon } from "@heroicons/react/24/outline";

function CafeCard({
  cafe,
  viewMode,
  onToggleFavorite,
  isFavorite,
  onMenuClick,
  onReviewClick,
  onDirectionsClick,
}) {
  const featureList = useMemo(() => {
    const raw = cafe.features;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [cafe.features]);

  const hasWifi = featureList.some(
    (f) => f.name === "Wi-Fi" || f.name === "WiFi" || Number(f.id) === 1
  );
  const hasOutlet = featureList.some(
    (f) => f.name === "Priz" || Number(f.id) === 2
  );

  const Amenity = ({ label, active, Icon }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500 line-through decoration-slate-400"
      }`}
      title={active ? `${label} var` : `${label} yok / sınırlı`}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "" : "opacity-60"}`} />
      {label}
    </span>
  );
  let priceRange = "Fiyat bilgisi yok";
  if (cafe.min_price && cafe.max_price && cafe.min_price > 0) {
    priceRange = `${cafe.min_price}₺ - ${cafe.max_price}₺`;
  }

  const ratingDisplay =
    cafe.avg_rating && cafe.avg_rating > 0 ? `${cafe.avg_rating}` : "0.0";

  if (viewMode === "list") {
    return (
      <div className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className="w-full md:w-56 h-48 md:h-auto bg-gray-200 relative overflow-hidden shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${cafe.name}&background=random&size=300`}
            alt={cafe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${cafe.is_active ? "bg-emerald-500" : "bg-red-500"}`}
          >
            {cafe.is_active ? "AÇIK" : "KAPALI"}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {cafe.name}
              </h3>
              <button
                onClick={() => onToggleFavorite(cafe.id)}
                className={`p-2 rounded-full transition-all ${
                  isFavorite(cafe.id)
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                {isFavorite(cafe.id) ? (
                  <HeartSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              {cafe.address || `${cafe.city}, ${cafe.district}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Amenity label="Wi‑Fi" active={hasWifi} Icon={WifiIcon} />
              <Amenity label="Priz" active={hasOutlet} Icon={BoltIcon} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5">
              <StarIcon className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-gray-800">
                {Number(ratingDisplay).toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">(12+ Yorum)</span>
            </div>
            <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700 bg-green-50 px-2 py-0.5 rounded">
                Fiyat Aralığı: <span className="font-bold">{priceRange}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center gap-3 w-full md:w-56 shrink-0">
          <button
            onClick={() => onMenuClick(cafe)}
            className="w-full bg-white border-2 border-indigo-600 text-indigo-700 font-bold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Menüyü Gör
          </button>
          <button
            onClick={() => onReviewClick(cafe)}
            className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-amber-600 transition-all"
          >
            Yorum Yap
          </button>
          <button
            onClick={() => onDirectionsClick(cafe)}
            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
          >
            Yol Tarifi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full">
      <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
        <img
          src={`https://ui-avatars.com/api/?name=${cafe.name}&background=random&size=400`}
          alt={cafe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm backdrop-blur-md uppercase tracking-wide ${cafe.is_active ? "bg-emerald-500/90" : "bg-red-500/90"}`}
          >
            {cafe.is_active ? "Şu An Açık" : "Kapalı"}
          </span>
        </div>
        <button
          onClick={() => onToggleFavorite(cafe.id)}
          className={`p-1.5 rounded-full transition-all shadow-sm ${
            isFavorite(cafe.id)
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/30 backdrop-blur-sm text-white hover:text-red-500 hover:bg-white"
          }`}
        >
          {isFavorite(cafe.id) ? (
            <HeartSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="p-5 flex-1 flex flex-col bg-white">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3
            className="text-lg font-bold text-gray-900 leading-tight line-clamp-2"
            title={cafe.name}
          >
            {cafe.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 bg-amber-50 px-2 py-1 rounded-lg">
            <StarIcon className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-amber-900 text-sm">
              {Number(ratingDisplay).toFixed(1)}
            </span>
          </div>
        </div>
        <p
          className="text-gray-500 text-sm flex items-center gap-1.5 mb-2 line-clamp-1"
          title={`${cafe.city}, ${cafe.district}`}
        >
          <MapPinIcon className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">
            {cafe.city}, {cafe.district}
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Amenity label="Wi‑Fi" active={hasWifi} Icon={WifiIcon} />
          <Amenity label="Priz" active={hasOutlet} Icon={BoltIcon} />
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col flex-1">
              <span className="text-gray-400 text-[11px] font-medium uppercase tracking-wider mb-0.5">
                Başlangıç
              </span>
              <span className="font-extrabold text-lg text-emerald-600">
                {cafe.min_price ? `${parseInt(cafe.min_price)}₺` : "-"}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onMenuClick(cafe)}
                className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold rounded-lg text-sm transition-colors"
                title="Menüyü Gör"
              >
                Menü
              </button>
              <button
                onClick={() => onReviewClick(cafe)}
                className="px-3 py-2 bg-amber-500 text-white hover:bg-amber-600 font-semibold rounded-lg text-sm transition-colors"
                title="Yorum Yap"
              >
                Yorum
              </button>
              <button
                onClick={() => onDirectionsClick(cafe)}
                className="px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded-lg text-sm transition-colors"
                title="Yol Tarifi"
              >
                Yol
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CafeCard;
