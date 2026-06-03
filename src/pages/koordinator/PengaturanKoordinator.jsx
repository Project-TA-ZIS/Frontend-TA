import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Check,
  Calendar,
  Home,
  X,
} from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import useAuthStore from "../../store/useAuthStore";
import { formattedDate, formatDateInput } from "../../utils/formattedDate";
import dasawismaService from "../../services/dasawisma.service";
import Swal from "sweetalert2";
import authService from "../../services/auth.service";

export default function PengaturanKoordinator() {
  const user = useAuthStore((s) => s.user) || {};
  const role = useAuthStore((s) => s.role);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    role: "",
    nik: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    telp: "",
    alamat: "",
  });

  const loadUser = async () => {
    try {
      const updatedUser = await authService.getMe();

      const userData = updatedUser?.user || updatedUser;

      useAuthStore.setState({ user: userData });

      setFormData({
        nama:
          userData?.nama_lengkap ||
          userData?.name ||
          userData?.nama ||
          userData?.username ||
          "",
        email: userData?.email || "",
        role: userData?.roles || "",
        nik: userData?.nik || "",
        tempat_lahir: userData?.tempat_lahir || "",
        tanggal_lahir: userData?.tanggal_lahir || "",
        telp: userData?.nomor_telpon || "",
        alamat: userData?.alamat || "",
      });

      setIsUserLoaded(true);
    } catch (error) {
      console.log(error);
    }
  };

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setIsSuccess(false);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama lengkap wajib diisi!";
    if (!formData.email.trim()) {
      newErrors.email = "Alamat email wajib diisi!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid!";
    }
    if (!formData.telp.trim()) {
      newErrors.telp = "Nomor telepon wajib diisi!";
    } else if (!/^[0-9]+$/.test(formData.telp)) {
      newErrors.telp = "Nomor telepon hanya boleh angka!";
    }
    if (!formData.nik.trim()) {
      newErrors.nik = "NIK wajib diisi!";
    }
    if (!formData.tanggal_lahir.trim()) {
      newErrors.tanggal_lahir = "Tanggal lahir wajib diisi!";
    }
    if (!formData.tempat_lahir.trim()) {
      newErrors.tempat_lahir = "Tempat lahir wajib diisi!";
    }
    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat wajib diisi!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Periksa kembali data yang diisi.",
        confirmButtonColor: "#10B981",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        nama_lengkap: formData.nama,
        email: formData.email,
        nomor_telpon: formData.telp,
        alamat: formData.alamat,
        nik: formData.nik,
        roles: formData.role,
        tempat_lahir: formData.tempat_lahir,
        tanggal_lahir: formData.tanggal_lahir,
      };
      const res = await dasawismaService.updateAnggotaDasawisma(
        user?.id,
        payload,
      );
      setIsSuccess(true);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profil berhasil diperbarui.",
        confirmButtonColor: "#10B981",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat update profile.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    const safe = (name || "").trim();
    if (!safe) return "U";
    const parts = safe.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [passwordData, setPasswordData] = useState({
    passwordLama: "",
    passwordBaru: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  const handlePasswordChange = async (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    let errors = {};

    if (!passwordData.passwordLama) {
      errors.passwordLama = "Password lama wajib diisi!";
    }

    if (!passwordData.passwordBaru) {
      errors.passwordBaru = "Password baru wajib diisi!";
    } else if (passwordData.passwordBaru.length < 6) {
      errors.passwordBaru = "Password minimal 6 karakter!";
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        oldPassword: passwordData.passwordLama,
        newPassword: passwordData.passwordBaru,
      };

      const rs = await dasawismaService.updatePassword(data);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Password berhasil diperbarui.",
        confirmButtonColor: "#10B981",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("Error ganti password:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat mengganti password.",
        confirmButtonColor: "#EF4444",
      });
    }

    setIsModalOpen(false);

    setPasswordData({
      passwordLama: "",
      passwordBaru: "",
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── Header ─── */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Pengaturan Profil
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Kelola informasi data diri dan keamanan akun Anda.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* ─── Bagian Kiri: Kartu Profil ─── */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 text-center flex flex-col items-center">
              <div className="relative mb-5 md:mb-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0F766E] rounded-full flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-md border-4 border-white">
                  {getInitials(formData.nama)}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-gray-900">
                {formData.nama || "Super Admin"}
              </h3>
              <p className="text-xs md:text-sm font-bold text-[#10B981] mt-1 uppercase tracking-wider">
                {formData.role || ""}
              </p>
            </div>
          </div>

          {/* ─── Bagian Kanan: Form Edit Profil ─── */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
              {isSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center text-white shrink-0">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-emerald-800">
                    Profil berhasil diperbarui!
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5 md:space-y-6"
              >
                <div className="border-b border-gray-100 pb-6">
                  <h4 className="text-base md:text-lg font-extrabold text-gray-900 mb-4">
                    Informasi Dasar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Input Nama Lengkap */}
                    <div>
                      <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="nama"
                          value={formData.nama}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${errors.nama ? "border-red-500 focus:ring-red-500 bg-red-50/50" : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"}`}
                        />
                      </div>
                      {errors.nama && (
                        <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5 pl-1">
                          {errors.nama}
                        </p>
                      )}
                    </div>

                    {/* Input Nomor Telepon */}
                    <div>
                      <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="telp"
                          value={formData.telp}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${errors.telp ? "border-red-500 focus:ring-red-500 bg-red-50/50" : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"}`}
                        />
                      </div>
                      {errors.telp && (
                        <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5 pl-1">
                          {errors.telp}
                        </p>
                      )}
                    </div>

                    {/* Input Tempat Lahir */}
                    <div>
                      <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Tempat Lahir
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="tempat_lahir"
                          value={formData.tempat_lahir}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${errors.tempat_lahir ? "border-red-500 focus:ring-red-500 bg-red-50/50" : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"}`}
                        />
                      </div>
                      {errors.tempat_lahir && (
                        <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5 pl-1">
                          {errors.tempat_lahir}
                        </p>
                      )}
                    </div>

                    {/* Input Tanggal Lahir */}
                    <div>
                      <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Tanggal Lahir
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="tanggal_lahir"
                          value={formatDateInput(formData.tanggal_lahir) || ""}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${errors.tanggal_lahir ? "border-red-500 focus:ring-red-500 bg-red-50/50" : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"}`}
                        />
                      </div>
                      {errors.tanggal_lahir && (
                        <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5 pl-1">
                          {errors.tanggal_lahir}
                        </p>
                      )}
                    </div>

                    {/* Input Alamat Email (Memanjang) */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">
                        Alamat Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${errors.email ? "border-red-500 focus:ring-red-500 bg-red-50/50" : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5 pl-1">
                          {errors.email}
                        </p>
                      )}

                      {/* Input NIK */}
                      <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4 md:mt-5">
                        Nomor Induk Kependudukan (NIK)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="nik"
                          value={formData.nik}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${errors.nik ? "border-red-500 focus:ring-red-500 bg-red-50/50" : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"}`}
                        />
                      </div>
                      {errors.nik && (
                        <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5 pl-1">
                          {errors.nik}
                        </p>
                      )}

                      {/* Input Alamat Rumah */}
                      <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4 md:mt-5">
                        Alamat Rumah
                      </label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border ${errors.alamat ? "border-red-500 focus:ring-red-500 bg-red-50/50" : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"}`}
                        placeholder="Masukkan alamat"
                        rows="3"
                      />
                      {errors.alamat && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                          {errors.alamat}
                        </p>
                      )}
                      {errors.alamat && (
                        <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5 pl-1">
                          {errors.alamat}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col md:flex-row justify-end gap-3 pt-2 md:pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors w-full md:w-auto"
                  >
                    Ganti Password
                  </button>

                  <button
                    type="submit"
                    className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-md shadow-emerald-900/10 transition-colors w-full md:w-auto"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL POP-UP EDIT PASSWORD ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="bg-[#0F766E] px-5 md:px-6 py-4 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-bold text-white">
                Ganti Password
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <form
              onSubmit={handleSubmitPassword}
              className="p-5 md:p-6 space-y-4 md:space-y-5"
            >
              <div>
                <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Password Lama
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="password"
                  name="passwordLama"
                  value={passwordData.passwordLama}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${
                    passwordErrors.passwordLama
                      ? "border-red-500"
                      : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"
                  }`}
                  placeholder="Masukkan password lama"
                />
                {passwordErrors.passwordLama && (
                  <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5">
                    {passwordErrors.passwordLama}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Password Baru
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="password"
                  name="passwordBaru"
                  value={passwordData.passwordBaru}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2.5 md:py-3 bg-gray-50 text-sm md:text-base rounded-xl outline-none font-semibold transition-all border ${
                    passwordErrors.passwordBaru
                      ? "border-red-500"
                      : "border-gray-200 focus:ring-2 focus:ring-[#10B981]"
                  }`}
                  placeholder="Masukkan password baru"
                />
                {passwordErrors.passwordBaru && (
                  <p className="text-red-500 text-[10px] md:text-[11px] font-bold mt-1.5">
                    {passwordErrors.passwordBaru}
                  </p>
                )}
              </div>

              {/* Footer Modal */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-colors w-full sm:w-auto"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
