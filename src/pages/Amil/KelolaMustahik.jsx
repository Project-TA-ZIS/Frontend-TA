import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import {
  createMustahik,
  deleteMustahik,
  getAllMustahik,
  updateMustahik,
} from "../../services/mustahik.service";
import Swal from "sweetalert2";
import { formatDateInput } from "../../utils/formattedDate";
import { ValidationDataMustahik } from "../../utils/ValidationDataMustahik";

// Ubah kode jenis kelamin menjadi label tampilan.
const toGenderLabel = (value) => {
  if (value === "laki-laki") return "Laki-laki";
  if (value === "perempuan") return "Perempuan";
  return value ?? "-";
};

// Ubah kode kategori (asnaf) menjadi label tampilan yang rapi.
const toKategoriLabel = (value) => {
  const v = (value || "").toString().trim().toLowerCase();
  if (!v) return "-";
  if (v === "fisabilillah") return "Fisabilillah";
  if (v === "berhutang") return "Berhutang";
  if (v === "musafir") return "Musafir";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

// Ubah satu data mustahik dari format server → format baris tabel/form.
const mapApiToRow = (item) => ({
  id: String(item?.id ?? ""),
  nama: item?.nama_lengkap ?? "-",
  telp: item?.nomor_telpon ?? "-",
  alamat: item?.alamat ?? "",
  nik: item?.nik ?? "",
  tempatLahir: item?.tempat_lahir ?? "",
  tanggalLahir: formatDateInput(item?.tanggal_lahir),
  kategori: item?.kategori ?? "fakir",
  jenisKelamin: item?.jenis_kelamin ?? "laki-laki",
});

// Kebalikan mapApiToRow: ubah isi form → format yang dikirim ke server.
const mapFormToApi = (form) => ({
  nama_lengkap: form.nama,
  nomor_telpon: form.telp,
  alamat: form.alamat,
  nik: (form.nik || "").trim() || null,
  tempat_lahir: form.tempatLahir,
  tanggal_lahir: form.tanggalLahir || null,
  jenis_kelamin: form.jenisKelamin,
  kategori: form.kategori,
});

// Halaman kelola Mustahik (penerima zakat): tabel + tambah/edit/hapus via modal,
// dengan pencarian dan pagination.
export default function KelolaMustahik() {
  // ─── States ───
  const [mustahikList, setMustahikList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State form input (Disesuaikan dengan kolom Mustahik)
  // Mengembalikan objek form kosong (nilai default) — dipakai saat tambah/reset.
  const getEmptyFormData = () => ({
    nama: "",
    telp: "",
    alamat: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    kategori: "fakir",
    jenisKelamin: "laki-laki",
  });

  const [formData, setFormData] = useState(getEmptyFormData);

  // Ambil semua data mustahik dari server lalu ubah ke format baris tabel.
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await getAllMustahik();
      const rows = Array.isArray(res?.data) ? res.data.map(mapApiToRow) : [];
      setMustahikList(rows);
    } catch (err) {
      if (err?.response?.status === 404) {
        setMustahikList([]);
        return;
      }
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;
      setErrorMsg(msg || "Gagal memuat data mustahik");
    } finally {
      setIsLoading(false);
    }
  };

  // Muat data mustahik saat halaman pertama dibuka.
  useEffect(() => {
    loadData();
  }, []);

  // ─── Filter Pencarian ───
  // Saring daftar mustahik sesuai kata kunci (nama, ID, atau kategori).
  const filteredMustahik = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return mustahikList.filter(
      (item) =>
        item.nama.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.kategori || "").toString().toLowerCase().includes(q),
    );
  }, [mustahikList, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMustahik.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const paginatedMustahik = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMustahik.slice(start, start + PAGE_SIZE);
  }, [filteredMustahik, safePage]);

  // ─── Handlers ───
  // Update field form saat user mengetik.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Buka modal mode TAMBAH: kosongkan form.
  const handleTambahClick = () => {
    setErrors({});
    setEditingId(null);
    setFormData(getEmptyFormData());
    setIsModalOpen(true);
  };

  // Buka modal mode EDIT: isi form dengan data baris yang dipilih.
  const handleEditClick = (item) => {
    setErrors({});
    setEditingId(item.id);
    setFormData({
      nama: item.nama ?? "",
      telp: item.telp ?? "",
      alamat: item.alamat ?? "",
      nik: item.nik ?? "",
      tempatLahir: item.tempatLahir ?? "",
      tanggalLahir: item.tanggalLahir ?? "",
      kategori: item.kategori ?? "fakir",
      jenisKelamin: item.jenisKelamin ?? "laki-laki",
    });
    setIsModalOpen(true);
  };

  // Hapus data mustahik setelah konfirmasi, lalu muat ulang tabel.
  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data Mustahik yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteMustahik(id);
      await Swal.fire({
        title: "Berhasil!",
        text: "Data Mustahik berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      await loadData();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;
      setErrorMsg(msg || "Gagal menghapus mustahik");
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: msg || "Gagal menghapus mustahik",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  // Simpan form: validasi, lalu update (edit) atau buat baru (tambah).
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = ValidationDataMustahik(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrorMsg("");
    setErrors({});

    try {
      const payload = mapFormToApi(formData);
      if (editingId) {
        await updateMustahik(editingId, payload);
      } else {
        await createMustahik(payload);
      }
      setIsModalOpen(false);
      setEditingId(null);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: editingId
          ? "Data Mustahik berhasil diperbarui"
          : "Data Mustahik berhasil ditambahkan",
        confirmButtonColor: "#10B981",
      });

      setFormData(getEmptyFormData());

      await loadData();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;
      setErrorMsg(msg || "Gagal menyimpan data mustahik");
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: msg || "Gagal menyimpan data mustahik",
        confirmButtonColor: "#EF4444",
      });
    }
  };
  // Tutup modal dengan konfirmasi & kosongkan form.
  const handleCloseModal = () => {
    setErrors({});
    Swal.fire({
      title: "Tutup Form?",
      text: "Perubahan yang belum disimpan akan hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Ya, Tutup",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
          nama: "",
          telp: "",
          alamat: "",
          nik: "",
          tempatLahir: "",
          tanggalLahir: "",
          kategori: "fakir",
          jenisKelamin: "laki-laki",
        });
      }
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Kelola Mustahik
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Beberapa Mustahik yang sudah Terdaftar
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
            Tambah Mustahik
          </button>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari data warga atau transaksi..."
            className="bg-gray-200/60 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-5 py-3.5 font-medium outline-none transition-all placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* ─── Table ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center w-20">
                    NO
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NAMA
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NO.TELP
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    KATEGORI
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    JENIS KELAMIN
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
                ) : filteredMustahik.length > 0 ? (
                  paginatedMustahik.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">
                        {index + 1 + (safePage - 1) * PAGE_SIZE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {item.telp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider bg-gray-100 text-gray-700">
                          {toKategoriLabel(item.kategori)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider ${
                            (item.jenisKelamin || "").toLowerCase() ===
                            "laki-laki"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-pink-50 text-pink-600"
                          }`}
                        >
                          {toGenderLabel(item.jenisKelamin)}
                        </span>
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
                        Belum ada data mustahik. Klik tombol "Tambah Mustahik"
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between m-6">
              <p className="text-xs text-gray-400 font-bold">
                Halaman {safePage} dari {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    safePage <= 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    safePage >= totalPages
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {editingId ? "Edit Data Mustahik" : "Tambah Mustahik Baru"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex-1 overflow-hidden flex flex-col"
              >
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* ─── Section: Informasi Dasar ─── */}
                  <div className="border-b border-gray-100 pb-6">
                    <h4 className="text-base font-extrabold text-gray-900 mb-4">
                      Informasi Dasar
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Nama Lengkap
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="text"
                          name="nama"
                          required
                          value={formData.nama}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="Masukkan nama lengkap..."
                        />
                        {errors.nama && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.nama}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Jenis Kelamin
                          <span className="text-red-500"> *</span>
                        </label>
                        <select
                          name="jenisKelamin"
                          required
                          value={formData.jenisKelamin}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold cursor-pointer"
                        >
                          <option value="laki-laki">Laki-laki</option>
                          <option value="perempuan">Perempuan</option>
                        </select>
                        {errors.jenisKelamin && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.jenisKelamin}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Nomor Telepon
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="text"
                          name="telp"
                          required
                          value={formData.telp}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="08xxxxxxxxxx"
                        />
                        {errors.telp && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.telp}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Kategori (Asnaf)
                          <span className="text-red-500"> *</span>
                        </label>
                        <select
                          name="kategori"
                          required
                          value={formData.kategori}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold cursor-pointer"
                        >
                          <option value="fakir">Fakir</option>
                          <option value="miskin">Miskin</option>
                          <option value="amil">Amil</option>
                          <option value="mualaf">Mualaf</option>
                          <option value="berhutang">Berhutang</option>
                          <option value="fisabilillah">Fisabilillah</option>
                          <option value="musafir">Musafir</option>
                        </select>
                        {errors.kategori && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.kategori}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Alamat
                          <span className="text-red-500"> *</span>
                        </label>
                        <textarea
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full resize-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="Bandung,Jawa Barat..."
                        />
                        {errors.alamat && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.alamat}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── Section: Identitas ─── */}
                  <div className="border-b border-gray-100 pb-6">
                    <h4 className="text-base font-extrabold text-gray-900 mb-4">
                      Identitas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          NIK
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="text"
                          name="nik"
                          value={formData.nik}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="Masukkan NIK..."
                        />
                        {errors.nik && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.nik}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── Section: Kelahiran ─── */}
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 mb-4">
                      Kelahiran
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Tempat Lahir
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="text"
                          name="tempatLahir"
                          value={formData.tempatLahir}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="Bandung"
                        />
                        {errors.tempatLahir && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.tempatLahir}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Tanggal Lahir
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="date"
                          name="tanggalLahir"
                          value={formData.tanggalLahir}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                        />
                        {errors.tanggalLahir && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.tanggalLahir}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0">
                  <div className="flex justify-end gap-3">
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
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
