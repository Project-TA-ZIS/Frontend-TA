import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { login as loginRequest, getMe } from "../../services/auth.service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const setLogin = useAuthStore((s) => s.setLogin);
  const setLogout = useAuthStore((s) => s.setLogout);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const data = await loginRequest({ email, password });
      const token = data?.token;
      if (!token) {
        setErrorMsg("Login berhasil tapi token tidak ditemukan.");
        return;
      }

      // Simpan token dulu supaya interceptor axios bisa mengirim Authorization saat memanggil /me.
      setLogin(null, token);

      let userData = null;
      try {
        const me = await getMe();
        userData = me?.user || null;
      } catch {
        // Kalau /me gagal, jangan lanjut navigate karena role belum diketahui dan route guard akan me-redirect.
        setLogout();
        setErrorMsg(
          "Gagal mengambil profil pengguna. Silakan coba login ulang.",
        );
        return;
      }

      setLogin(userData, token);

      const role = userData?.roles;
      if (role === "anggota dasawisma") {
        navigate("/anggota/dashboard");
      } else if (role === "amil zakat") {
        navigate("/amil/dashboard");
      } else {
        // default: koordinator dasawisma
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal login. Pastikan backend menyala.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex bg-white"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* Import Font Manrope langsung dari Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ─── SISI KIRI: Branding & Informasi (Hanya tampil di layar besar) ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F766E] p-12 flex-col justify-between relative overflow-hidden">
        {/* Efek Ornamen Lingkaran Cahaya */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#10B981] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#047857] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

        {/* Logo Atas */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-[#0F766E] font-extrabold text-2xl leading-none">
              D
            </span>
          </div>
          <div>
            <h1 className="font-extrabold text-white leading-tight text-xl tracking-tight">
              DASAWISMA
            </h1>
            <p className="text-[10px] font-bold text-[#A7F3D0] tracking-[0.2em] uppercase">
              Lenteng Agung
            </p>
          </div>
        </div>

        {/* Tagline Tengah */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Kelola Dana ZIS & Kas Lebih Transparan.
          </h2>
          <p className="text-[#D1FAE5] text-lg leading-relaxed">
            Sistem Informasi terpadu untuk mempermudah pemantauan, pencatatan,
            dan pelaporan keuangan Dasawisma secara *real-time*.
          </p>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 text-[#A7F3D0] text-sm font-medium">
          &copy; {new Date().getFullYear()} Dasawisma Lenteng Agung. All rights
          reserved.
        </div>
      </div>

      {/* ─── SISI KANAN: Form Login ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Header Form */}
          <div className="mb-10">
            {/* Munculkan logo di HP karena sidebar kiri hilang */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#0F766E] rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-xl leading-none">
                  D
                </span>
              </div>
              <div>
                <h1 className="font-extrabold text-[#064E3B] leading-tight text-lg tracking-tight">
                  DASAWISMA
                </h1>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Selamat Datang 👋
            </h2>
            <p className="text-gray-500 font-medium">
              Silakan masuk menggunakan akun yang telah terdaftar.
            </p>
          </div>

          {/* Notifikasi Error */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <p className="text-sm font-bold text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all shadow-sm font-medium"
                  placeholder="admin@dasawisma.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Kata Sandi
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-[#0F766E] hover:text-[#10B981] transition-colors"
                >
                  Lupa Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all shadow-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0F766E] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Ingat Saya */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#0F766E] focus:ring-[#10B981] border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm font-medium text-gray-600 cursor-pointer"
              >
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#064E3B] text-white py-4 rounded-xl font-bold transition-all shadow-md shadow-emerald-900/10 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                "Memverifikasi Data..."
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#064E3B] text-white py-4 rounded-xl font-bold transition-all shadow-md shadow-emerald-900/10 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Kembali ke Home Page
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
