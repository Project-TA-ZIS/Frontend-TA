import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import authService, {
  login as loginRequest,
  getMe,
} from "../../services/auth.service";
import Swal from "sweetalert2";

// Halaman Login: form masuk + modal "Lupa Password".
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const setLogin = useAuthStore((s) => s.setLogin);
  const setLogout = useAuthStore((s) => s.setLogout);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isLoadingForgotPassword, setIsLoadingForgotPassword] = useState(false);

  // Proses login saat form dikirim:
  // 1) minta token ke server, 2) ambil data user, 3) simpan ke store,
  // 4) arahkan ke dashboard sesuai peran (role).
  const handleLogin = async (e) => {
    e.preventDefault(); // cegah reload halaman bawaan form
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1) Kirim email & password, ambil token dari respons.
      const data = await loginRequest({ email, password });
      const token = data?.token;
      if (!token) {
        setErrorMsg("Login berhasil tapi token tidak ditemukan.");
        return;
      }

      // Simpan token dulu agar request berikutnya (getMe) membawa token.
      setLogin(null, token);

      // 2) Ambil data user yang sedang login.
      let userData = null;
      try {
        const me = await getMe();
        userData = me?.user || null;
      } catch {
        // Jika gagal ambil profil, batalkan login (logout) & tampilkan pesan.
        setLogout();
        setErrorMsg("Maaf terjadi kesalahan. Silakan coba login ulang.");
        return;
      }

      // 3) Simpan token + data user lengkap ke store.
      setLogin(userData, token);

      // 4) Arahkan ke halaman sesuai peran user.
      const role = userData?.roles;
      if (role === "kader dasawisma") {
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

  // Proses "Lupa Password": kirim permintaan link reset ke email user.
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      setIsLoadingForgotPassword(true);

      // Minta server mengirim email berisi link reset password.
      await authService.requestPasswordReset({
        email: forgotEmail,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Link reset password telah dikirim ke email Anda",
        confirmButtonColor: "#10B981",
      });

      setIsForgotModalOpen(false);
      setForgotEmail("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "Gagal mengirim email reset password",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsLoadingForgotPassword(false);
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
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-bold text-[#0F766E] hover:text-[#10B981] transition-colors"
                >
                  Lupa Password?
                </button>
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
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Lupa Password</h2>

              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleForgotPassword} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Alamat Email
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full px-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border border-gray-200 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isLoadingForgotPassword}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-colors flex items-center gap-2 ${
                    isLoadingForgotPassword
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#10B981] hover:bg-[#059669]"
                  }`}
                >
                  {isLoadingForgotPassword && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}

                  {isLoadingForgotPassword ? "Mengirim..." : "Kirim Link Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
