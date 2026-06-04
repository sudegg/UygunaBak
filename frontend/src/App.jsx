/**
 * UygunaBak - Ana Uygulama Bileşeni (Main App Component)
 * 
 * Uygulamanın ana bileşenidir. React Router kullanarak sayfa yönlendirmesini,
 * kullanıcı kimlik doğrulamasını ve navigasyon menüsünü yönetir.
 * 
 * Rotalar:
 * - / : Ana sayfa
 * - /cafes : Kafe listesi
 * - /login : Giriş sayfası
 * - /owner/* : İşletme sahibi dashboard'ı
 * - /admin/* : Admin paneli
 * 
 * @component
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { UserIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import CafeList from "./CafeList";
import OwnerDashboard from "./components/OwnerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "./index.css";

/**
 * Navigasyon Bileşeni
 * 
 * Başlık kısmında görünen menüyü, arama çubuğunu ve kullanıcı menüsünü 
 * gösterir. Responsive tasarıma sahiptir.
 * 
 * Özellikler:
 * - Dinamik kullanıcı kimlik doğrulama durumu
 * - Çıkış (logout) işlemi
 * - Responsive navigasyon
 * - Arama işlevi
 */
function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const checkAuth = () => {
    const storedUser = localStorage.getItem("uygunabak_user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location.pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [userMenuOpen]);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("uygunabak_token");
    localStorage.removeItem("token");
    localStorage.removeItem("uygunabak_user");
    localStorage.removeItem("uygunabak_selected_cafe_id");
    localStorage.removeItem("uygunabak_active_cafe_id");
    localStorage.removeItem("uygunabak_admin_selected_cafe_id");
    window.dispatchEvent(new Event("storage"));
    setUser(null);
    setUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Ana Sayfa" },
    { to: "/cafes", label: "Kafeler" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cafes?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex h-[73px] flex-wrap items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f15a24] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v1m4.5-1v1m-7.5 4h10.5M4.5 10.5A2.25 2.25 0 002.25 12.75v3A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25h-15z" />
              </svg>
            </div>
            <div className="text-xl tracking-tight text-slate-900">
              <span className="font-bold text-[#f15a24]">Uyguna</span>
              <span className="font-medium">Bak</span>
            </div>
          </Link>

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`text-sm font-medium transition ${
                      isActive(link.to) ? "text-[#f15a24]" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                <li>
                  <Link
                    to="/owner"
                    className={`text-sm font-medium transition ${isActive("/owner") ? "text-[#f15a24]" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    İşletme
                  </Link>
                </li>
              )}
              {user?.role === 'ADMIN' && (
                <li>
                  <Link
                    to="/admin"
                    className={`text-sm font-medium transition ${isActive("/admin") ? "text-[#f15a24]" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Yönetici
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-6 max-w-xl mx-auto lg:mx-0">
          <form onSubmit={handleSearch} className="hidden lg:flex relative w-full border border-slate-300 rounded-full bg-white px-4 py-2 hover:border-[#f15a24] focus-within:border-[#f15a24] focus-within:ring-1 focus-within:ring-[#f15a24] transition-all">
            <MagnifyingGlassIcon className="h-5 w-5 text-[#f15a24] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Yapay zekaya sor: 'sessiz, wifi güçlü, uygun fiyat'"
              className="w-full bg-transparent pl-3 text-sm text-slate-900 placeholder-slate-400 outline-none"
            />
          </form>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f4c3a] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0f4c3a] focus:ring-offset-2"
                >
                  <UserIcon className="h-5 w-5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-[60] mt-1 flex w-48 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="px-4 py-2 border-b border-slate-100 flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f4c3a] text-white">
                <UserIcon className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router
      basename={
        import.meta.env.BASE_URL.replace(/\/$/, "") || undefined
      }
    >
      <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
        <Navigation />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/cafes"
              element={
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                  <CafeList />
                </div>
              }
            />
            <Route
              path="/owner"
              element={
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                  <OwnerDashboard />
                </div>
              }
            />
            <Route
              path="/admin"
              element={
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                  <AdminDashboard />
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
