import React, { useState } from "react";
import { User, Mail, Phone, Lock, Camera, Check } from "lucide-react";
import PageTransition from "../../components/PageTransition";

export default function PengaturanAnggota() {
  const [formData, setFormData] = useState({
    nama: "Anggota Keluarga",
    email: "anggota@dasawisma.com",
    telp: "089876543210",
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

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

    if (formData.passwordBaru) {
      if (formData.passwordBaru.length < 6) newErrors.passwordBaru = "Kata sandi minimal 6 karakter!";
      if (formData.passwordBaru !== formData.konfirmasiPassword) newErrors.konfirmasiPassword = "Konfirmasi kata sandi tidak cocok!";
      if (!formData.passwordLama) newErrors.passwordLama = "Masukkan kata sandi lama!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Data Anggota disimpan:", formData);
      setIsSuccess(true);
      setFormData((prev) => ({ ...prev, passwordLama: "", passwordBaru: "", konfirmasiPassword: "" }));
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">Pengaturan Profil</h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">Kelola informasi data diri dan keamanan akun Anda.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-[#10B981] rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-md border-4 border-white">AD</div>
              <button className="absolute bottom-0 right-0 bg-[#0F766E] hover:bg-[#064E3B] text-white p-2.5 rounded-full shadow-lg border-2 border-white transition-colors"><Camera size={18} /></button>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">{formData.nama || "Anggota Keluarga"}</h3>
            <p className="text-sm font-bold text-[#0F766E] mt-1 uppercase tracking-wider">WARGA DASAWISMA</p>
            <p className="text-sm text-gray-500 mt-2">Format foto JPEG/PNG maks. 2MB</p>
          </div>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {isSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center text-white shrink-0"><Check size={16} strokeWidth={3} /></div>
                <p className="text-sm font-bold text-emerald-800">Profil berhasil diperbarui!</p>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-base font-extrabold text-gray-900 mb-4">Informasi Dasar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                      <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className={`w-full pl-11 pr-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border ${errors.nama ? 'border-red-500 focus:ring-red-500 bg-red-50/50' : 'border-gray-200 focus:ring-2 focus:ring-[#10B981]'}`} />
                    </div>
                    {errors.nama && <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">{errors.nama}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nomor Telepon</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                      <input type="text" name="telp" value={formData.telp} onChange={handleInputChange} className={`w-full pl-11 pr-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border ${errors.telp ? 'border-red-500 focus:ring-red-500 bg-red-50/50' : 'border-gray-200 focus:ring-2 focus:ring-[#10B981]'}`} />
                    </div>
                    {errors.telp && <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">{errors.telp}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full pl-11 pr-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border ${errors.email ? 'border-red-500 focus:ring-red-500 bg-red-50/50' : 'border-gray-200 focus:ring-2 focus:ring-[#10B981]'}`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-gray-900 mb-4">Ubah Kata Sandi <span className="text-xs font-medium text-gray-400 normal-case">(Opsional)</span></h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kata Sandi Lama</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                      <input type="password" name="passwordLama" placeholder="••••••••" value={formData.passwordLama} onChange={handleInputChange} className={`w-full pl-11 pr-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border ${errors.passwordLama ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#10B981]'}`}/>
                    </div>
                    {errors.passwordLama && <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">{errors.passwordLama}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kata Sandi Baru</label>
                      <input type="password" name="passwordBaru" placeholder="••••••••" value={formData.passwordBaru} onChange={handleInputChange} className={`w-full px-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border ${errors.passwordBaru ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#10B981]'}`}/>
                      {errors.passwordBaru && <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">{errors.passwordBaru}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Konfirmasi Sandi Baru</label>
                      <input type="password" name="konfirmasiPassword" placeholder="••••••••" value={formData.konfirmasiPassword} onChange={handleInputChange} className={`w-full px-4 py-3 bg-gray-50 text-sm rounded-xl outline-none font-semibold transition-all border ${errors.konfirmasiPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#10B981]'}`}/>
                      {errors.konfirmasiPassword && <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">{errors.konfirmasiPassword}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Batal</button>
                <button type="submit" className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-md shadow-emerald-900/10 transition-colors">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}