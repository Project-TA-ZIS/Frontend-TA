import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

export default function LupaPassword() {
  const navigate = useNavigate();

  // States untuk input form (Sudah Sinkron)
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States untuk kontrol visibility password (Sudah Sinkron)
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // State error lokal linear
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. Validasi Input Kosong
    if (!email.trim() || !newPassword || !confirmPassword) {
      setErrorMsg("Semua kolom input wajib diisi!");
      return;
    }

    // 2. Validasi Panjang Password
    if (newPassword.length < 6) {
      setErrorMsg("Kata sandi baru minimal harus 6 karakter!");
      return;
    }

    // 3. Validasi Kecocokan Password
    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }

    try {
      setIsLoading(true);

      // Hubungkan dengan API backend Anda di sini nanti, contoh:
      // await authService.resetPassword({ email, newPassword });

      Swal.fire({
        icon: "success",
        title: "Sandi Diperbarui",
        text: "Kata sandi akun Anda berhasil diubah. Silakan login kembali.",
        confirmButtonColor: "#10B981",
      });

      // Kembalikan ke halaman login jika sukses
      navigate("/login");
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message ||
          "Gagal memperbarui kata sandi. Pastikan email Anda benar.",
      );
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

        {/* Copyright Bawah */}
        <p className="relative z-10 text-[#A7F3D0] text-sm font-medium">
          &copy; {new Date().getFullYear()} Dasawisma Lenteng Agung. All rights
          reserved.
        </p>
      </div>

      {/* ─── SISI KANAN: FORM INPUT RESET (PUTIH MINIMALIS) ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Judul Atas */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Atur Ulang Sandi 🔐
            </h2>
            <p className="text-gray-500 font-medium">
              Masukkan email terdaftar untuk memperbarui kata sandi akun Anda.
            </p>
          </div>

          {/* Alert Error Linier */}
          {errorMsg && (
            <div className="px-4 py-3 bg-red-50 border border-red-200/60 rounded-xl text-xs font-bold text-red-600 animate-in shake duration-300">
              {errorMsg}
            </div>
          )}

          {/* Form Elemen */}
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {/* FIELD 1: EMAIL */}
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
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white focus:border-[#0F766E] transition-all shadow-sm font-medium"
                  placeholder="kader@dasawisma.com"
                />
              </div>
            </div>

            {/* FIELD 2: KATA SANDI BARU (Sihir Perbaikan Variabel) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showNewPass ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white focus:border-[#0F766E] transition-all shadow-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0F766E] transition-colors"
                >
                  {showNewPass ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* FIELD 3: KONFIRMASI KATA SANDI BARU (Sihir Perbaikan Variabel) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPass ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white focus:border-[#0F766E] transition-all shadow-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0F766E] transition-colors"
                >
                  {showConfirmPass ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons (Desain yang Jauh Lebih Menarik) */}
            <div className="pt-2 space-y-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#064E3B] text-white py-4 rounded-xl font-bold transition-all shadow-md shadow-emerald-900/10 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? "Memproses..." : "Perbarui Kata Sandi"}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
