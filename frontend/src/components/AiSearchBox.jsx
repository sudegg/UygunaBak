import React, { useState } from "react";
import axios from "axios";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

function AiSearchBox({ userId, onSearchResults }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [detectedFilters, setDetectedFilters] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setAiFeedback(null);
    setDetectedFilters(null);

    try {
      const response = await axios.post("/api/ai-search", {
        query_text: query,
        user_id: userId, // Kullanıcı giriş yapmış kabul edilip UUID yollanır
      });

      const data = response.data;

      // Feedback mesajı (Bulunamazsa 'kriterleri esnet' uyarısı)
      setAiFeedback({
        message: data.message,
        isWarning: data.count === 0,
      });

      setDetectedFilters(data.filters_detected);

      // Sonuçları ana component'e bildir
      if (onSearchResults) {
        onSearchResults(data.data);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
      const msg =
        error.response?.data?.message ||
        "Arama sırasında bir hata oluştu.";
      setAiFeedback({
        message: msg,
        isWarning: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-cyan-50 p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-bold text-slate-900 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              AI
            </span>
            Akıllı Arama
          </p>
          <p className="text-sm text-slate-600">
            Ne aradığını yaz, akıllı filtreleme sonuçlarını anında göster.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: tost olan kafeler, wifi olan sessiz kafe"
            className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4" /> Sorgula
              </>
            )}
          </button>
        </form>

        {detectedFilters && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-700">
            <span className="font-semibold">Algılanan Kriterler:</span>
            {detectedFilters.features?.map((item, index) => (
              <span
                key={`f-${index}`}
                className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700"
              >
                Özellik: {item}
              </span>
            ))}
            {detectedFilters.products?.map((item, index) => (
              <span
                key={`p-${index}`}
                className="rounded-full bg-violet-100 px-3 py-1 text-violet-700"
              >
                Ürün: {item}
              </span>
            ))}
            {detectedFilters.max_price && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                Fiyat ≤ {detectedFilters.max_price}₺
              </span>
            )}
          </div>
        )}

        {aiFeedback && (
          <div
            className={`rounded-3xl border px-4 py-3 text-sm ${aiFeedback.isWarning ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}
          >
            {aiFeedback.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AiSearchBox;
