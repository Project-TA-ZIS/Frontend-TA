import React, { useEffect, useState } from "react";
import amilService from "../../services/amil.service";
import Swal from "sweetalert2";
import { formattedDate } from "../../utils/formattedDate";
import PageTransition from "../../components/shared/PageTransition";
import { Edit, Info, Plus, Search, Trash2, X } from "lucide-react";

const mapApiAmilToRowData = (amil) => ({
  id: amil.id || "",
  nama: amil.nama_lengkap || "",
  email: amil.email || "",
  telp: amil.nomor_telpon || "",
  alamat: amil.alamat || "",
});

export default function AnggotaAmil() {
  // ─── States ───
  const [anggotaList, setAnggotaList] = useState([]); // Mulai dengan array kosong, data akan dimuat dari API
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State: Untuk melacak ID mana yang sedang diedit (null = mode Tambah)
  const [editingId, setEditingId] = useState(null);

  // State untuk form input (Tanpa Role)
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telp: "",
    alamat: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadAmilData = async () => {
    try {
      const data = await amilService.getAllAmil();
      if (data && Array.isArray(data.data)) {
        const mappedData = data.data.map(mapApiAmilToRowData);
        setAnggotaList(mappedData);
      } else {
        setAnggotaList([]);
        console.warn("Data Amil tidak ditemukan");
      }
    } catch (err) {
      console.error("Error fetching Amil data:", err);
      setAnggotaList([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) loadAmilData();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Filter Pencarian ───
  const filteredAnggota = anggotaList.filter(
    (anggota) =>
      anggota.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anggota.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anggota.telp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anggota.alamat.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data Amil yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await amilService.deleteAmil(id);
        await loadAmilData();

        Swal.fire({
          title: "Berhasil!",
          text: "Data Amil berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            error?.response?.data?.message || "Terjadi kesalahan pada server",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  // Handler saat tombol "+ Amil" diklik (Mode Tambah)
  const handleTambahClick = () => {
    setEditingId(null);
    setFormData({ nama: "", email: "", telp: "", alamat: "", password: "" });
    setIsModalOpen(true);
  };

  // Handler saat tombol "Edit" di tabel diklik (Mode Edit)
  const handleEditClick = (anggota) => {
    setEditingId(anggota.id);
    setFormData({
      nama: anggota.nama,
      email: anggota.email,
      telp: anggota.telp,
      alamat: anggota.alamat,
      password: "",
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi!";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Alamat email wajib diisi!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid!";
    }

    if (!editingId) {
      if (!formData.password.trim()) {
        newErrors.password = "Password wajib diisi!";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter!";
      }
    }

    if (!formData.telp.trim()) {
      newErrors.telp = "Nomor telepon wajib diisi!";
    } else if (!/^[0-9]+$/.test(formData.telp)) {
      newErrors.telp = "Nomor telepon hanya boleh angka!";
    } else if (formData.telp.length < 10) {
      newErrors.telp = "Nomor telepon tidak valid!";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrorMsg("");

    try {
      if (editingId) {
        // EDIT DATA
        await amilService.updateAmil(editingId, {
          nama_lengkap: formData.nama,
          email: formData.email,
          nomor_telpon: formData.telp,
          alamat: formData.alamat,
        });

        // refresh data
        await loadAmilData();

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data amil berhasil diperbarui",
          confirmButtonColor: "#10B981",
        });
      } else {
        // TAMBAH DATA
        await amilService.createAmil({
          nama_lengkap: formData.nama,
          email: formData.email,
          password: formData.password,
          nomor_telpon: formData.telp,
          alamat: formData.alamat,
        });

        // refresh data
        await loadAmilData();

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Akun amil berhasil dibuat",
          confirmButtonColor: "#10B981",
        });
      }

      // reset form + tutup modal
      setIsModalOpen(false);
      setEditingId(null);

      setFormData({
        nama: "",
        email: "",
        telp: "",
        alamat: "",
        password: "",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err?.response?.data?.message || "Terjadi kesalahan pada server",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleCloseModal = async () => {
    const result = await Swal.fire({
      title: "Tutup form?",
      text: "Data yang belum disimpan akan hilang",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, tutup",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setIsModalOpen(false);
      setEditingId(null);

      setFormData({
        nama: "",
        email: "",
        telp: "",
        alamat: "",
        password: "",
      });
    }
  };

  // ─── Kelas reusable untuk input & label (ukuran lebih besar & jelas) ───
  const labelClass =
    "block text-sm font-bold text-gray-500 uppercase tracking-wide mb-2";
  const inputClass =
    "w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-xl focus:ring-2 focus:ring-[#10B981] focus:bg-white focus:border-[#0F766E] block px-4 py-3.5 font-semibold outline-none transition-all";
  const sectionTitleClass =
    "text-lg font-extrabold text-gray-900 tracking-tight";

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-gray-50 p-6 md:p-10 relative"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Anggota Amil
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Beberapa Anggota Amil yang sudah Terdaftar
          </p>
        </div>

        {/* ─── Tombol Tambah ─── */}
        <div className="mb-8">
          <button
            onClick={handleTambahClick}
            className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Tambah Amil
          </button>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari data amil berdasarkan nama..."
            className="bg-gray-200/60 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-5 py-3.5 font-medium outline-none transition-all placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ─── Table ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center w-20">
                    No
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NAMA
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NO.TELP
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    ALAMAT
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center w-28">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAnggota.length > 0 ? (
                  filteredAnggota.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {item.telp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {item.alamat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* Tombol Edit: Hijau Solid Standby */}
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-[#10B981] bg-emerald-50 hover:bg-emerald-100 hover:text-[#064E3B] p-2 rounded-lg transition-colors shadow-sm"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>

                          {/* Tombol Hapus: Merah Solid Standby */}
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 p-2 rounded-lg transition-colors shadow-sm"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {searchQuery ? (
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-sm font-medium text-gray-500"
                      >
                        Tidak ada data yang cocok dengan pencarian "
                        {searchQuery}"
                      </td>
                    ) : (
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-sm font-medium text-gray-500"
                      >
                        Belum ada data anggota amil. Klik tombol "Tambah Anggota
                        Amil" untuk menambahkan data pertama Anda.
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── MODAL FORM: TAMBAH / EDIT DATA (Gaya jelas & lega) ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-[#0F766E] px-7 py-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {editingId ? "Edit Data Amil" : "Tambah Anggota Amil"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body (scrollable) */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-7 space-y-7 overflow-y-auto flex-1">
                  {/* Section: Akun (hanya saat tambah) */}
                  {!editingId && (
                    <div className="space-y-5">
                      <h3 className={sectionTitleClass}>Informasi Akun</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>Alamat Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="email@contoh.com"
                          />
                          {errors.email && (
                            <p className="text-sm font-semibold text-red-500 mt-1.5">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelClass}>Password</label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Minimal 6 karakter"
                          />
                          {errors.password && (
                            <p className="text-sm font-semibold text-red-500 mt-1.5">
                              {errors.password}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section: Informasi Dasar */}
                  <div className="space-y-5">
                    <h3 className={sectionTitleClass}>Informasi Dasar</h3>
                    <div>
                      <label className={labelClass}>Nama Lengkap</label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Masukkan nama lengkap..."
                      />
                      {errors.nama && (
                        <p className="text-sm font-semibold text-red-500 mt-1.5">
                          {errors.nama}
                        </p>
                      )}
                    </div>
                    {!editingId && (
                      <div>
                        <label className={labelClass}>Nomor Telepon</label>
                        <input
                          type="text"
                          name="telp"
                          value={formData.telp}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="08xxxxxxxxxx"
                        />
                        {errors.telp && (
                          <p className="text-sm font-semibold text-red-500 mt-1.5">
                            {errors.telp}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <label className={labelClass}>Alamat</label>
                      <textarea
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Bandung, Jawa Barat"
                      />
                      {errors.alamat && (
                        <p className="text-sm font-semibold text-red-500 mt-1.5">
                          {errors.alamat}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 rounded-xl text-base font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-3 rounded-xl text-base font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-colors active:scale-95"
                  >
                    {editingId ? "Simpan Perubahan" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isInfoModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Header Modal */}
              <div className="bg-[#0F766E] px-7 py-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Detail Kader Dasawisma
                </h2>
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Konten Detail */}
              <div className="p-7 space-y-7 overflow-y-auto flex-1">
                {/* Section: Informasi Dasar */}
                <div className="space-y-5">
                  <h3 className={sectionTitleClass}>Informasi Dasar</h3>
                  <div>
                    <span className={labelClass}>Nama Lengkap</span>
                    <span className="text-lg font-extrabold text-gray-800 block">
                      {selectedUser.nama_lengkap || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <span className={labelClass}>Role / Peran</span>
                      <span className="inline-block px-3 py-1.5 rounded-lg text-sm font-bold bg-[#D1FAE5] text-[#0F766E] capitalize">
                        {selectedUser.roles || "-"}
                      </span>
                    </div>
                    <div>
                      <span className={labelClass}>NIK</span>
                      <span className="text-base font-bold text-gray-700 block tracking-wide">
                        {selectedUser.nik || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <span className={labelClass}>Alamat Email</span>
                      <span className="text-base font-semibold text-gray-700 block break-all">
                        {selectedUser.email || "-"}
                      </span>
                    </div>
                    <div>
                      <span className={labelClass}>Nomor Telepon</span>
                      <span className="text-base font-bold text-gray-700 block">
                        {selectedUser.nomor_telpon || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Kelahiran */}
                <div className="space-y-5 border-t border-gray-100 pt-6">
                  <h3 className={sectionTitleClass}>Kelahiran</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <span className={labelClass}>Tempat Lahir</span>
                      <span className="text-base font-semibold text-gray-700 block">
                        {selectedUser.tempat_lahir || "-"}
                      </span>
                    </div>
                    <div>
                      <span className={labelClass}>Tanggal Lahir</span>
                      <span className="text-base font-bold text-gray-700 block">
                        {selectedUser.tanggal_lahir
                          ? new Date(
                              selectedUser.tanggal_lahir,
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Alamat */}
                <div className="space-y-5 border-t border-gray-100 pt-6">
                  <h3 className={sectionTitleClass}>Alamat Domisili</h3>
                  <div>
                    <span className="text-base font-medium text-gray-700 block leading-relaxed">
                      {selectedUser.alamat || "-"}
                    </span>
                  </div>
                </div>

                {/* Section: Lainnya */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-100 pt-6">
                  <div>
                    <span className={labelClass}>Terdaftar Pada</span>
                    <span className="text-base font-bold text-gray-700 block">
                      {formattedDate(selectedUser.created_at) || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={labelClass}>Pembaruan Terakhir</span>
                    <span className="text-base font-bold text-gray-700 block">
                      {selectedUser.updated_at
                        ? formattedDate(selectedUser.updated_at)
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="px-7 py-5 border-t border-gray-100 flex justify-end bg-gray-50/50 flex-shrink-0">
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-7 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-base transition shadow-sm active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
