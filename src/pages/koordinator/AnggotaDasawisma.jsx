import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import dasawismaService from "../../services/dasawisma.service";
import Swal from "sweetalert2";

const roleUiToApi = (roleUi) => {
  if (roleUi === "Koordinator") return "koordinator dasawisma";
  if (roleUi === "Anggota Dasawisma") return "anggota dasawisma";
  return null;
};

const roleApiToUi = (roleApi) => {
  if (roleApi === "koordinator dasawisma") return "Koordinator";
  if (roleApi === "anggota dasawisma") return "Anggota Dasawisma";
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

export default function AnggotaDasawisma() {
  // ─── States ───
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State BARU: Untuk melacak ID mana yang sedang diedit (null = mode Tambah)
  const [editingId, setEditingId] = useState(null);

  // State untuk form input
  const [formData, setFormData] = useState({
    nama: "",
    role: "Anggota Dasawisma",
    email: "",
    telp: "",
    password: "",
  });

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler saat tombol "+ Dasawisma" diklik (Mode Tambah)
  const handleTambahClick = () => {
    setEditingId(null); // Pastikan tidak ada ID yang diedit
    setFormData({
      nama: "",
      role: "Anggota Dasawisma",
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
    setErrorMsg("");
    try {
      const roleApi = roleUiToApi(formData.role);
      if (!roleApi) {
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
        role: "Anggota Dasawisma",
        email: "",
        telp: "",
        password: "",
      });
      await loadData();
    } catch (err) {
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
            Anggota Dasawisma
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Beberapa Anggota Dasawisma yang sudah Terdaftar
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
            placeholder="Cari data warga berdasarkan nama atau ID..."
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
                    Nomor
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
                            item.role === "Koordinator" ||
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
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-sm font-medium text-gray-500"
                    >
                      Tidak ada data yang cocok dengan pencarian "{searchQuery}"
                    </td>
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
                  {editingId ? "Edit Data Anggota" : "Tambah Anggota Dasawisma"}
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
                    <option value="Anggota Dasawisma">Anggota Dasawisma</option>
                    <option value="Koordinator">Koordinator</option>
                  </select>
                </div>

                {/* <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    name="telp"
                    required
                    value={formData.telp}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                    placeholder="08xxxxxxxxxx"
                  />
                </div> */}

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
      </div>
    </PageTransition>
  );
}
