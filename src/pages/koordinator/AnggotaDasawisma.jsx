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

  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State BARU: Untuk melacak ID mana yang sedang diedit (null = mode Tambah)
  const [editingId, setEditingId] = useState(null);

  // State untuk form input
  const [formData, setFormData] = useState({
    nama: "",
    role: "kader dasawisma",
    email: "",
    telp: "",
    password: "",
  });

  const roleUiToApi = (roleUi) => {
    if (roleUi === "penanggung jawab dasawisma")
      return "penanggung jawab dasawisma";
    if (roleUi === "kader dasawisma") return "kader dasawisma";
    return null;
  };

  const roleApiToUi = (roleApi) => {
    if (roleApi === "penanggung jawab dasawisma")
      return "penanggung jawab dasawisma";
    if (roleApi === "kader dasawisma") return "kader dasawisma";
    if (roleApi === "amil zakat") return "Amil Zakat";
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

    if (!(formData.nama || "").trim()) {
      newErrors.nama = "Nama lengkap wajib diisi!";
    }

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

    if (!formData.role) {
      newErrors.role = "Role wajib dipilih!";
    }

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
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat data anggota",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Filter Pencarian ───
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

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handler saat tombol "+ Dasawisma" diklik (Mode Tambah)
  const handleTambahClick = () => {
    setEditingId(null); // Pastikan tidak ada ID yang diedit
    setFormData({
      nama: "",
      role: "kader dasawisma",
      email: "",
      telp: "",
      password: "",
    }); // Kosongkan form
    setIsModalOpen(true);
  };

  // Handler saat tombol "Hapus" di tabel diklik
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

  // Handler saat tombol "Edit" di tabel diklik (Mode Edit)
  const handleEditClick = (anggota) => {
    setEditingId(anggota.id); // Simpan ID yang mau diedit
    setFormData({
      nama: anggota.nama,
      role: anggota.role,
      email: anggota.email,
      telp: anggota.nomor_telpon,
      password: "",
    }); // Isi form dengan data lama
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!validateForm()) return;
    setErrorMsg("");

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

        await loadData();

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
        role: "kader dasawisma",
        email: "",
        telp: "",
        password: "",
      });
      await loadData();
    } catch (err) {
      console.error(err);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

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
            kader dasawisma
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Beberapa kader dasawisma yang sudah Terdaftar
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* ─── Tombol Tambah ─── */}
        <div className="mb-8">
          <button
            onClick={handleTambahClick}
            className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm text-sm"
          >
            <Plus size={18} strokeWidth={3} />
            Dasawisma
          </button>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari data anggota dasawisma berdasarkan nama..."
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
                    ROLE
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NO.TELP
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center w-28">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-sm font-medium text-gray-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredAnggota.length > 0 ? (
                  paginatedAnggota.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider ${
                            item.role === "penanggung jawab dasawisma" ||
                            item.role === "Amil Zakat"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {item.telp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* Tombol Edit: Hijau Solid Standby */}
                          <button
                            onClick={() => handleInfoClick(item.id)}
                            className="text-blue-500 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 p-2 rounded-lg transition-colors shadow-sm"
                            title="Info"
                          >
                            <Info size={18} />
                          </button>
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
                        Belum ada data anggota dasawisma. Klik tombol "Tambah Anggota Dasawisma" untuk menambahkan data pertama Anda.
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between m-10">
              <p className="text-sm text-gray-500 font-medium">
                Halaman {currentPage} dari {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Sebelumnya
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#10B981] hover:bg-[#059669] text-white"
                  }`}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MODAL POP-UP TAMBAH / EDIT DATA ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header Modal berubah teksnya tergantung mode Tambah/Edit */}
              <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {editingId ? "Edit Data Anggota" : "Tambah kader dasawisma"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Jika mode Edit, tampilkan ID-nya agar user tahu (opsional) */}

                {!editingId && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                      placeholder="email@contoh.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

                {!editingId && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                      placeholder="Masukkan password..."
                    />
                    {errors.password && (
                      <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    required
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                    placeholder="Masukkan nama..."
                  />
                  {errors.nama && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                      {errors.nama}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Role (Peran)
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                  >
                    <option value="kader dasawisma">kader dasawisma</option>
                    <option value="penanggung jawab dasawisma">
                      penanggung jawab dasawisma
                    </option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-colors"
                  >
                    {editingId ? "Simpan Perubahan" : "Simpan Data"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL DETAIL USER ─── */}
        {isInfoModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Detail kader dasawisma
                </h2>

                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="text-blue-100 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Nama Lengkap
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedUser.nama_lengkap}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Role
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">
                    {selectedUser.roles}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Email
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedUser.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Nomor Telepon
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedUser.nomor_telpon || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    NIK
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedUser.nik || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Tempat Lahir
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedUser.tempat_lahir || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Tanggal Lahir
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedUser.tanggal_lahir
                      ? new Date(selectedUser.tanggal_lahir).toLocaleDateString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Alamat
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedUser.alamat || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Created At
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formattedDate(selectedUser.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Updated At
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formattedDate(selectedUser.updated_at)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
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
