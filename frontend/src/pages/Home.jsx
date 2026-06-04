import React, { useState, useEffect } from "react";
import { SparklesIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cafes?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const suggestions = [
    
  ];

  return (
    <div
      className="relative min-h-[calc(100vh-73px)] flex items-center justify-center bg-emerald-900 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 76, 58, 0.85), rgba(15, 76, 58, 0.95)), url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80')`,
      }}
    >
      <div className="relative z-10 w-full max-w-4xl px-4 py-20 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm mb-8">
          <SparklesIcon className="h-4 w-4" />
          YAPAY ZEKA DESTEKLİ KAFE KEŞFİ
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
          Uygun fiyata iyi kahve bulmak <br className="hidden sm:block" />
          artık çok kolay.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-lg text-emerald-50/80 mb-10">
          Doğal dilde sor, Uyguna Bak senin için filtrelesin. 5 kriterli ağırlıklı
          puanlama ile gerçekten değer veren kafeleri öne çıkar.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl mb-8">
          <div className="relative flex items-center bg-white rounded-full p-2 shadow-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Örn: bol prizli, sessiz, uygun fiyat, Kadıköy..."
              className="flex-1 bg-transparent px-6 py-4 text-slate-900 placeholder-slate-400 outline-none text-lg rounded-l-full"
            />
            <button
              type="submit"
              className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-[#f15a24] text-white transition-transform hover:scale-105 active:scale-95"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </div>
        </form>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setSearchQuery(suggestion)}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
