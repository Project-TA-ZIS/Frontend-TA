import React, { useEffect, useMemo, useState } from "react";
import amilService from "../../services/amil.service";
import Swal from "sweetalert2";
import PageTransition from "../../components/shared/PageTransition";
import { Edit, Info, Plus, Search, Trash2, X } from "lucide-react";
import { ValidateAnggotaAmil } from "../../utils/ValidateAnggotaAmil";
import AmilTable from "../../components/shared/ZIS/AmilTable";

// Ubah satu data amil dari format server menjadi format baris tabel yang dipakai UI.
const mapApiAmilToRowData = (amil) => ({
  id: amil.id || "",
  nama: amil.nama_lengkap || "",
  email: amil.email || "",
  telp: amil.nomor_telpon || "",
  alamat: amil.alamat || "",
});

// Halaman kelola data Amil (koordinator): tabel + tambah/edit/hapus via modal,
// dengan pencarian dan pagination.
export default function AnggotaAmil() {
  // ─── States ───
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telp: "",
    alamat: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [, setErrorMsg] = useState("");

  // Ambil semua data amil dari server lalu ubah ke format baris tabel.
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

  // Muat data amil saat halaman pertama dibuka.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) loadAmilData();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Saring data amil sesuai kata kunci pencarian (nama/email/telp/alamat).
  const filteredAnggota = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return anggotaList.filter(
      (anggota) =>
        anggota.nama.toLowerCase().includes(q) ||
        anggota.email.toLowerCase().includes(q) ||
        anggota.telp.toLowerCase().includes(q) ||
        anggota.alamat.toLowerCase().includes(q),
    );
  }, [anggotaList, searchQuery]);

  // Hitung total halaman & ambil potongan data untuk halaman aktif (pagination).
  const totalPages = Math.max(1, Math.ceil(filteredAnggota.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedAnggota = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredAnggota.slice(start, start + PAGE_SIZE);
  }, [filteredAnggota, safePage]);

  // Update field form saat user mengetik.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Hapus data amil setelah konfirmasi, lalu muat ulang tabel.
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

  // Buka modal dalam mode TAMBAH: kosongkan form.
  const handleTambahClick = () => {
    setEditingId(null);
    setFormData({ nama: "", email: "", telp: "", alamat: "", password: "" });
    setIsModalOpen(true);
  };

  // Buka modal dalam mode EDIT: isi form dengan data baris yang dipilih.
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

  // Simpan form: validasi dulu, lalu update (jika edit) atau buat baru (jika tambah).
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = ValidateAnggotaAmil(formData, editingId);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      if (editingId) {
        await amilService.updateAmil(editingId, {
          nama_lengkap: formData.nama,
          email: formData.email,
          nomor_telpon: formData.telp,
          alamat: formData.alamat,
        });

        await loadAmilData();

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data amil berhasil diperbarui",
          confirmButtonColor: "#10B981",
        });
      } else {
        await amilService.createAmil({
          nama_lengkap: formData.nama,
          email: formData.email,
          password: formData.password,
          nomor_telpon: formData.telp,
          alamat: formData.alamat,
        });

        await loadAmilData();

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Akun amil berhasil dibuat",
          confirmButtonColor: "#10B981",
        });
      }

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
      console.error("Error submitting form:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err?.response?.data?.message || "Terjadi kesalahan pada server",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  // Tutup modal dengan konfirmasi (data yang belum disimpan akan hilang).
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
      setErrors({});
      setFormData({
        nama: "",
        email: "",
        telp: "",
        alamat: "",
        password: "",
      });
    }
  };

  // ─── KUNCI PERUBAHAN: Kelas reusable responsif untuk form ───
  const labelClass =
    "block text-[11px] md:text-sm font-bold text-gray-500 uppercase tracking-wide mb-1.5 md:mb-2";
  const inputClass =
    "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm md:text-base rounded-xl focus:ring-2 focus:ring-[#10B981] focus:bg-white focus:border-[#0F766E] block px-4 py-2.5 md:py-3.5 font-semibold outline-none transition-all";
  const sectionTitleClass =
    "text-base md:text-lg font-extrabold text-gray-900 tracking-tight";

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-gray-50 p-6 md:p-10 relative"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* ─── Table ─── */}
        <AmilTable
          data={filteredAnggota}
          isLoading={false}
          searchQuery={searchQuery}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          canEdit
          canDelete
        />

        {/* ─── MODAL FORM: TAMBAH / EDIT DATA ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] md:max-h-[90vh]">
              {/* Header */}
              <div className="bg-[#0F766E] px-5 md:px-7 py-4 md:py-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  {editingId ? "Edit Data Amil" : "Tambah Anggota Amil"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 md:p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body (scrollable) */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-5 md:p-7 space-y-5 md:space-y-7 overflow-y-auto flex-1">
                  {/* Section: Akun (hanya saat tambah) */}
                  {!editingId && (
                    <div className="space-y-4 md:space-y-5">
                      <h3 className={sectionTitleClass}>Informasi Akun</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                        <div>
                          <label className={labelClass}>
                            Alamat Email<span className="text-red-500"> *</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="email@contoh.com"
                          />
                          {errors.email && (
                            <p className="text-xs md:text-sm font-semibold text-red-500 mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelClass}>
                            Password<span className="text-red-500"> *</span>
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Minimal 6 karakter"
                          />
                          {errors.password && (
                            <p className="text-xs md:text-sm font-semibold text-red-500 mt-1">
                              {errors.password}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section: Informasi Dasar */}
                  <div className="space-y-4 md:space-y-5">
                    <h3 className={sectionTitleClass}>Informasi Dasar</h3>
                    <div>
                      <label className={labelClass}>
                        Nama Lengkap<span className="text-red-500"> *</span>
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Masukkan nama lengkap..."
                      />
                      {errors.nama && (
                        <p className="text-xs md:text-sm font-semibold text-red-500 mt-1">
                          {errors.nama}
                        </p>
                      )}
                    </div>

                    {editingId && (
                      <div>
                        <label className={labelClass}>
                          Alamat Email<span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="email@contoh.com"
                        />
                        {errors.email && (
                          <p className="text-xs md:text-sm font-semibold text-red-500 mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>
                        Nomor Telepon<span className="text-red-500"> *</span>
                      </label>
                      <input
                        type="text"
                        name="telp"
                        value={formData.telp}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="08xxxxxxxxxx"
                      />
                      {errors.telp && (
                        <p className="text-xs md:text-sm font-semibold text-red-500 mt-1">
                          {errors.telp}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Alamat<span className="text-red-500"> *</span>
                      </label>
                      <textarea
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Bandung, Jawa Barat"
                      />
                      {errors.alamat && (
                        <p className="text-xs md:text-sm font-semibold text-red-500 mt-1">
                          {errors.alamat}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 md:px-7 py-4 md:py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 md:px-7 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-colors active:scale-95"
                  >
                    {editingId ? "Simpan Perubahan" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
