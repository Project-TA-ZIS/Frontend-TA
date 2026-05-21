import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, X, Info } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import dasawismaService from "../../services/dasawisma.service";
import Swal from "sweetalert2";
import { formattedDate } from "../../utils/formattedDate";

export default function AnggotaDasawisma() {
  // ─── States ───
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
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

  const roleUiToApi = (roleUi) => {
    if (roleUi === "Penanggung Jawab Dasawisma") return "Penanggung Jawab Dasawisma";
    if (roleUi === "Kader Dasawisma") return "Kader Dasawisma";
    return null;
  };

  const roleApiToUi = (roleApi) => {
    if (roleApi === "Penanggung Jawab Dasawisma") return "Penanggung Jawab Dasawisma";
    if (roleApi === "Kader Dasawisma") return "Kader Dasawisma";
    if (roleApi === "Amil Zakat") return "Amil Zakat";
    return roleApi || "-";
  };

  const mapApiToRow = (item) => ({
    id: String(item?.id ?? ""),
    nama: item?.nama_lengkap ?? "",
    role: roleApiToUi(item?.roles),
    email: item?.email ?? "",
    telp: item?.nomor_telpon ?? "",
  });

  const validateForm = () => {
    let newErrors = {};
    if (!(formData.nama || "").trim()) newErrors.nama = "Nama lengkap wajib diisi!";
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
      setErrorMsg(err?.response?.data?.message || err?.message || "Gagal memuat data anggota");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAnggota = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return anggotaList.filter(
      (anggota) =>
        anggota.nama.toLowerCase().includes(q) ||
        anggota.id.toLowerCase().includes(q),
    );
  }, [anggotaList, searchQuery]);

  const totalPages = Math.ceil(filteredAnggota.length / itemsPerPage);
  const paginatedAnggota = filteredAnggota.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTambahClick = () => {
    setEditingId(null);
    setErrors({});
    setFormData({ nama: "", role: "Kader Dasawisma", email: "", telp: "", password: "" });
    setIsModalOpen(true);
  };

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
        Swal.fire({ title: "Berhasil!", text: "Data Anggota berhasil dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ icon: "error", title: "Oops...", text: error?.response?.data?.message || "Terjadi kesalahan pada server", confirmButtonColor: "#EF4444" });
      }
    }
  };

  const handleEditClick = (anggota) => {
    setEditingId(anggota.id);
    setErrors({});
    setFormData({ nama: anggota.nama, role: anggota.role, email: anggota.email, telp: anggota.telp, password: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validateForm()) return;
    try {
      const roleApi = roleUiToApi(formData.role);
      if (!roleApi) {
        Swal.fire({ icon: "error", title: "Gagal", text: "Role tidak didukung untuk modul Dasawisma.", confirmButtonColor: "#EF4444" });
        setErrorMsg("Role tidak didukung untuk modul Dasawisma.");
        return;
      }

      if (editingId) {
        await dasawismaService.updateAnggotaDasawisma(editingId, {
          nama_lengkap: formData.nama,
          email: formData.email,
          nomor_telpon: formData.telp,
          roles: roleApi,
        });
      } else {
        await dasawismaService.createAnggotaDasawisma({
          nama_lengkap: formData.nama,
          email: formData.email,
          password: formData.password,
          roles: roleApi,
        });
        Swal.fire({ icon: "success", title: "Berhasil", text: "Akun amil berhasil dibuat", confirmButtonColor: "#10B981" });
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ nama: "", role: "Kader Dasawisma", email: "", telp: "", password: "" });
      await loadData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err?.response?.data?.message || err?.message || "Gagal menyimpan data anggota", confirmButtonColor: "#EF4444" });
      setErrorMsg(err?.response?.data?.message || err?.message || "Gagal menyimpan data anggota");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setErrors({});
  };

  const handleInfoClick = async (id) => {
    try {
      setIsLoadingDetail(true);
      const res = await dasawismaService.getAnggotaDasawismaById(id);
      setSelectedUser(res.data);
      setIsInfoModalOpen(true);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Gagal", text: error?.response?.data?.message || "Gagal mengambil detail anggota", confirmButtonColor: "#EF4444" });
    } finally {
      setIsLoadingDetail(false);
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
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative" style={{ fontFamily: "Manrope, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E] tracking-tight capitalize">
            Kader Dasawisma
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Beberapa kader dasawisma yang sudah terdaftar dalam sistem.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* ─── Tombol Tambah ─── */}
        <div className="mb-6">
          <button
            onClick={handleTambahClick}
            className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-20">Nomor</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">No. Telp</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-xs font-bold text-gray-400">Memuat data...</td>
                  </tr>
                ) : filteredAnggota.length > 0 ? (
                  paginatedAnggota.map((item, index) => (
                    <tr key={index} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#10B981] text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-800">{item.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                          item.role.toLowerCase() === "penanggung jawab dasawisma" || item.role === "Amil Zakat"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500 text-center">{item.telp || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleInfoClick(item.id)}
                            className="text-[#0F766E] bg-emerald-50 hover:bg-[#0F766E] hover:text-white p-2 rounded-xl transition-all shadow-sm"
                            title="Detail"
                          >
                            <Info size={15} />
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-xs font-medium text-gray-400">
                      Tidak ada data yang cocok dengan pencarian "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between m-6">
              <p className="text-xs text-gray-400 font-bold">Halaman {currentPage} dari {totalPages}</p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#10B981] hover:bg-[#059669] text-white"
                  }`}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MODAL FORM: TAMBAH / EDIT DATA (Gaya jelas & lega) ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-[#0F766E] px-7 py-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {editingId ? "Edit Data Kader" : "Tambah Kader Dasawisma"}
                </h2>
                <button onClick={handleCloseModal} className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body (scrollable) */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
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
                          {errors.email && <p className="text-sm font-semibold text-red-500 mt-1.5">{errors.email}</p>}
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
                          {errors.password && <p className="text-sm font-semibold text-red-500 mt-1.5">{errors.password}</p>}
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
                      {errors.nama && <p className="text-sm font-semibold text-red-500 mt-1.5">{errors.nama}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Role (Peran)</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          <option value="Kader Dasawisma">Kader Dasawisma</option>
                          <option value="Penanggung Jawab Dasawisma">Penanggung Jawab Dasawisma</option>
                        </select>
                        {errors.role && <p className="text-sm font-semibold text-red-500 mt-1.5">{errors.role}</p>}
                      </div>

                      {/* Saat edit, email & telp ada di sini */}
                      {editingId && (
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
                          {errors.telp && <p className="text-sm font-semibold text-red-500 mt-1.5">{errors.telp}</p>}
                        </div>
                      )}
                    </div>

                    {editingId && (
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
                        {errors.email && <p className="text-sm font-semibold text-red-500 mt-1.5">{errors.email}</p>}
                      </div>
                    )}

                    {/* Saat tambah, nomor telepon di section dasar */}
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
                        {errors.telp && <p className="text-sm font-semibold text-red-500 mt-1.5">{errors.telp}</p>}
                      </div>
                    )}
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

        {/* ─── MODAL DETAIL USER KADER (Gaya jelas & lega) ─── */}
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
                    <span className="text-lg font-extrabold text-gray-800 block">{selectedUser.nama_lengkap || "-"}</span>
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
                      <span className="text-base font-bold text-gray-700 block tracking-wide">{selectedUser.nik || "-"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <span className={labelClass}>Alamat Email</span>
                      <span className="text-base font-semibold text-gray-700 block break-all">{selectedUser.email || "-"}</span>
                    </div>
                    <div>
                      <span className={labelClass}>Nomor Telepon</span>
                      <span className="text-base font-bold text-gray-700 block">{selectedUser.nomor_telpon || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Section: Kelahiran */}
                <div className="space-y-5 border-t border-gray-100 pt-6">
                  <h3 className={sectionTitleClass}>Kelahiran</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <span className={labelClass}>Tempat Lahir</span>
                      <span className="text-base font-semibold text-gray-700 block">{selectedUser.tempat_lahir || "-"}</span>
                    </div>
                    <div>
                      <span className={labelClass}>Tanggal Lahir</span>
                      <span className="text-base font-bold text-gray-700 block">
                        {selectedUser.tanggal_lahir ? new Date(selectedUser.tanggal_lahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Alamat */}
                <div className="space-y-5 border-t border-gray-100 pt-6">
                  <h3 className={sectionTitleClass}>Alamat Domisili</h3>
                  <div>
                    <span className="text-base font-medium text-gray-700 block leading-relaxed">{selectedUser.alamat || "-"}</span>
                  </div>
                </div>

                {/* Section: Lainnya */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-100 pt-6">
                  <div>
                    <span className={labelClass}>Terdaftar Pada</span>
                    <span className="text-base font-bold text-gray-700 block">{formattedDate(selectedUser.created_at) || "-"}</span>
                  </div>
                  <div>
                    <span className={labelClass}>Pembaruan Terakhir</span>
                    <span className="text-base font-bold text-gray-700 block">{selectedUser.updated_at ? formattedDate(selectedUser.updated_at) : "-"}</span>
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