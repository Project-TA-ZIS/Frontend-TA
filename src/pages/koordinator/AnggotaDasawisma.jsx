import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, X, Info } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import dasawismaService from "../../services/dasawisma.service";
import Swal from "sweetalert2";
import { formattedDate } from "../../utils/formattedDate";
import AnggotaTable from "../../components/shared/Dasawisma/AnggotaTable";

// Halaman kelola Kader Dasawisma (koordinator): tabel + tambah/edit/hapus/detail
// via modal, dengan pencarian dan pagination.
export default function AnggotaDasawisma() {
  // ─── States ───
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [, setIsLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State untuk form input
  const [formData, setFormData] = useState({
    nama: "",
    role: "Kader Dasawisma",
    email: "",
    telp: "",
    password: "",
  });

  // Ubah label role dari format UI → format server (sebelum dikirim ke API).
  const roleUiToApi = (roleUi) => {
    if (roleUi === "Penanggung Jawab Dasawisma")
      return "penanggung jawab dasawisma";
    if (roleUi === "Kader Dasawisma") return "kader dasawisma";
    return null;
  };

  // Kebalikan roleUiToApi: ubah role dari server → label rapi untuk ditampilkan.
  const roleApiToUi = (roleApi) => {
    if (roleApi === "penanggung jawab dasawisma")
      return "Penanggung Jawab Dasawisma";
    if (roleApi === "kader dasawisma") return "Kader Dasawisma";
    if (roleApi === "amil zakat") return "Amil Zakat";
    return roleApi || "-";
  };

  // Ubah satu data anggota dari format server menjadi format baris tabel.
  const mapApiToRow = (item) => ({
    id: String(item?.id ?? ""),
    nama: item?.nama_lengkap ?? "",
    role: roleApiToUi(item?.roles),
    email: item?.email ?? "",
    telp: item?.nomor_telpon ?? "",
  });

  // Validasi isian form; password hanya wajib saat menambah data baru.
  const validateForm = () => {
    let newErrors = {};
    if (!(formData.nama || "").trim())
      newErrors.nama = "Nama lengkap wajib diisi!";
    if (!(formData.email || "").trim()) {
      newErrors.email = "Alamat email wajib diisi!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid!";
    }
    if (!editingId) {
      if (!(formData.password || "").trim()) {
        newErrors.password = "Password wajib diisi!";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter!";
      }
    }
    if (!(formData.telp || "").trim()) {
      newErrors.telp = "Nomor telepon wajib diisi!";
    } else if (!/^[0-9]+$/.test(formData.telp)) {
      newErrors.telp = "Nomor telepon hanya boleh angka!";
    } else if (formData.telp.length < 10) {
      newErrors.telp = "Nomor telepon tidak valid!";
    }
    if (!formData.role) newErrors.role = "Role wajib dipilih!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ambil semua data anggota dari server lalu ubah ke format baris tabel.
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await dasawismaService.getAllAnggotaDasawisma();
      const rows = Array.isArray(res?.data) ? res.data.map(mapApiToRow) : [];
      setAnggotaList(rows);
    } catch (err) {
      if (err?.response?.status === 404) {
        setAnggotaList([]);
        return;
      }
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat data anggota",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Muat data anggota saat halaman pertama dibuka.
  useEffect(() => {
    loadData();
  }, []);

  // Saring data sesuai kata kunci pencarian (nama atau ID).
  const filteredAnggota = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return anggotaList.filter(
      (anggota) =>
        anggota.nama.toLowerCase().includes(q) ||
        anggota.id.toLowerCase().includes(q),
    );
  }, [anggotaList, searchQuery]);

  // Hitung total halaman & ambil potongan data untuk halaman aktif (pagination).
  const totalPages = Math.ceil(filteredAnggota.length / itemsPerPage);
  const paginatedAnggota = filteredAnggota.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Update field form saat user mengetik & bersihkan error field tsb.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Buka modal mode TAMBAH: kosongkan form.
  const handleTambahClick = () => {
    setEditingId(null);
    setErrors({});
    setFormData({
      nama: "",
      role: "Kader Dasawisma",
      email: "",
      telp: "",
      password: "",
    });
    setIsModalOpen(true);
  };

  // Hapus data anggota setelah konfirmasi, lalu muat ulang tabel.
  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data Anggota yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        await dasawismaService.deleteAnggotaDasawisma(id);
        await loadData();
        Swal.fire({
          title: "Berhasil!",
          text: "Data Anggota berhasil dihapus.",
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

  // Buka modal mode EDIT: isi form dengan data baris yang dipilih.
  const handleEditClick = (anggota) => {
    setEditingId(anggota.id);
    setErrors({});
    setFormData({
      nama: anggota.nama,
      role: anggota.role,
      email: anggota.email,
      telp: anggota.telp,
      password: "",
    });
    setIsModalOpen(true);
  };

  // Simpan form: validasi + konversi role, lalu update (edit) atau buat baru (tambah).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validateForm()) return;
    try {
      const roleApi = roleUiToApi(formData.role);
      if (!roleApi) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Role tidak didukung untuk modul Dasawisma.",
          confirmButtonColor: "#EF4444",
        });
        setErrorMsg("Role tidak didukung untuk modul Dasawisma.");
        return;
      }

      if (editingId) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data anggota berhasil diperbarui",
          confirmButtonColor: "#10B981",
        });
        await dasawismaService.updateAnggotaByPJ(editingId, {
          nama_lengkap: formData.nama,
          email: formData.email,
          nomor_telpon: formData.telp,
          roles: roleApi,
        });
      } else {
        await dasawismaService.createAnggotaDasawisma({
          nama_lengkap: formData.nama,
          email: formData.email,
          nomor_telpon: formData.telp,
          password: formData.password,
          roles: roleApi,
        });
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
        role: "Kader Dasawisma",
        email: "",
        telp: "",
        password: "",
      });
      await loadData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Gagal menyimpan data anggota",
        confirmButtonColor: "#EF4444",
      });
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menyimpan data anggota",
      );
    }
  };

  // Tutup modal form dengan konfirmasi (data belum disimpan akan hilang).
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
        role: "Kader Dasawisma",
        email: "",
        telp: "",
        password: "",
      });
    }
  };

  // Ambil detail satu anggota dari server lalu tampilkan di modal detail.
  const handleInfoClick = async (id) => {
    try {
      setIsLoadingDetail(true);
      const res = await dasawismaService.getAnggotaDasawismaById(id);
      setSelectedUser(res.data);
      setIsInfoModalOpen(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message || "Gagal mengambil detail anggota",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ─── KUNCI PERUBAHAN: Kelas reusable untuk form responsif ───
  // Ukuran font dan margin dikecilkan di mobile, kembali normal di desktop (md:)
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E] tracking-tight capitalize">
            Kader Dasawisma
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Beberapa kader dasawisma yang sudah terdaftar dalam sistem.
          </p>
        </div>

        {/* ─── Tombol Tambah ─── */}
        <div className="mb-6">
          <button
            onClick={handleTambahClick}
            className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Tambah Kader
          </button>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari data warga berdasarkan nama atau ID..."
            className="bg-gray-100 border border-gray-200/60 text-gray-700 text-xs rounded-xl focus:ring-2 focus:ring-[#10B981] focus:bg-white focus:border-[#0F766E] block w-full pl-11 pr-5 py-3 font-medium outline-none transition-all placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ─── Table ─── */}
        <AnggotaTable
          data={filteredAnggota}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onInfo={handleInfoClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          canView
          canEdit
          canDelete
        />

        {/* ─── MODAL FORM: TAMBAH / EDIT DATA ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] md:max-h-[90vh]">
              {/* Header */}
              {/* Padding responsif px-5 py-4 untuk mobile, px-7 py-5 untuk desktop */}
              <div className="bg-[#0F766E] px-5 md:px-7 py-4 md:py-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  {editingId ? "Edit Data Kader" : "Tambah Kader Dasawisma"}
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
                {/* Spasi antar section dikecilkan pada mobile */}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                      <div>
                        <label className={labelClass}>
                          Role (Peran)<span className="text-red-500"> *</span>
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          <option value="Kader Dasawisma">
                            Kader Dasawisma
                          </option>
                          <option value="Penanggung Jawab Dasawisma">
                            Penanggung Jawab Dasawisma
                          </option>
                        </select>
                        {errors.role && (
                          <p className="text-xs md:text-sm font-semibold text-red-500 mt-1">
                            {errors.role}
                          </p>
                        )}
                      </div>

                      {/* Saat edit, telp ada di sini */}
                      {editingId && (
                        <div>
                          <label className={labelClass}>
                            Nomor Telepon
                            <span className="text-red-500"> *</span>
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

                    {/* Saat tambah, nomor telepon di section dasar */}
                    {!editingId && (
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
                    )}
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

        {/* ─── MODAL DETAIL USER KADER ─── */}
        {isInfoModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] md:max-h-[90vh]">
              {/* Header Modal */}
              <div className="bg-[#0F766E] px-5 md:px-7 py-4 md:py-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  Detail Kader Dasawisma
                </h2>
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 md:p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Konten Detail */}
              <div className="p-5 md:p-7 space-y-6 md:space-y-7 overflow-y-auto flex-1">
                {/* Section: Informasi Dasar */}
                <div className="space-y-4 md:space-y-5">
                  <h3 className={sectionTitleClass}>Informasi Dasar</h3>
                  <div>
                    <span className={labelClass}>Nama Lengkap</span>
                    <span className="text-base md:text-lg font-extrabold text-gray-800 block">
                      {selectedUser.nama_lengkap || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <span className={labelClass}>Role / Peran</span>
                      <span className="inline-block px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold bg-[#D1FAE5] text-[#0F766E] capitalize">
                        {selectedUser.roles || "-"}
                      </span>
                    </div>
                    <div>
                      <span className={labelClass}>NIK</span>
                      <span className="text-sm md:text-base font-bold text-gray-700 block tracking-wide">
                        {selectedUser.nik || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <span className={labelClass}>Alamat Email</span>
                      <span className="text-sm md:text-base font-semibold text-gray-700 block break-all">
                        {selectedUser.email || "-"}
                      </span>
                    </div>
                    <div>
                      <span className={labelClass}>Nomor Telepon</span>
                      <span className="text-sm md:text-base font-bold text-gray-700 block">
                        {selectedUser.nomor_telpon || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Kelahiran */}
                <div className="space-y-4 md:space-y-5 border-t border-gray-100 pt-5 md:pt-6">
                  <h3 className={sectionTitleClass}>Kelahiran</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <span className={labelClass}>Tempat Lahir</span>
                      <span className="text-sm md:text-base font-semibold text-gray-700 block">
                        {selectedUser.tempat_lahir || "-"}
                      </span>
                    </div>
                    <div>
                      <span className={labelClass}>Tanggal Lahir</span>
                      <span className="text-sm md:text-base font-bold text-gray-700 block">
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
                <div className="space-y-4 md:space-y-5 border-t border-gray-100 pt-5 md:pt-6">
                  <h3 className={sectionTitleClass}>Alamat Domisili</h3>
                  <div>
                    <span className="text-sm md:text-base font-medium text-gray-700 block leading-relaxed">
                      {selectedUser.alamat || "-"}
                    </span>
                  </div>
                </div>

                {/* Section: Lainnya */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 border-t border-gray-100 pt-5 md:pt-6">
                  <div>
                    <span className={labelClass}>Terdaftar Pada</span>
                    <span className="text-sm md:text-base font-bold text-gray-700 block">
                      {formattedDate(selectedUser.created_at) || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={labelClass}>Pembaruan Terakhir</span>
                    <span className="text-sm md:text-base font-bold text-gray-700 block">
                      {selectedUser.updated_at
                        ? formattedDate(selectedUser.updated_at)
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="px-5 md:px-7 py-4 md:py-5 border-t border-gray-100 flex justify-end bg-gray-50/50 flex-shrink-0">
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-6 md:px-7 py-2.5 md:py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-sm md:text-base transition shadow-sm active:scale-95"
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
