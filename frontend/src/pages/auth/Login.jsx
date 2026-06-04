import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Token ve kullanıcı detaylarını kaydet
        localStorage.setItem('uygunabak_token', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('uygunabak_user', JSON.stringify(data.user));

        // Role göre yönlendirme
        if (data.user.role === 'ADMIN') navigate('/admin');
        else if (data.user.role === 'OWNER') navigate('/owner');
        else navigate('/cafes');

        // App'in re-render olması için
        window.dispatchEvent(new Event('storage'));
      } else {
        setError(data.message || 'Giriş başarısız.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-73px)] flex items-center justify-center bg-slate-900 bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80')`,
      }}
    >
      <div className="relative z-10 max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/20">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f15a24] text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v1m4.5-1v1m-7.5 4h10.5M4.5 10.5A2.25 2.25 0 002.25 12.75v3A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25h-15z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
            UygunaBak'a Giriş Yap
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Kaldığınız yerden keşfetmeye devam edin
          </p>
        </div>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a24] focus:border-transparent transition-all sm:text-sm"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a24] focus:border-transparent transition-all sm:text-sm"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#f15a24] hover:bg-[#d94a1a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f15a24] focus:ring-offset-slate-900 transition-all shadow-lg hover:shadow-[#f15a24]/30"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;