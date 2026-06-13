import React, { useEffect, useMemo, useState } from "react";
import PageTransition from "../../components/shared/PageTransition";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import {
  createMuzakki,
  deleteMuzakki,
  getAllMuzakki,
  updateMuzakki,
} from "../../services/muzakki.service";
import Swal from "sweetalert2";
import { formatDateInput } from "../../utils/formattedDate";
import { ValidationDataMuzakki } from "../../utils/ValidationDataMuzakki";

// Halaman kelola Muzzaki (pemberi zakat): tabel + tambah/edit/hapus via modal,
// dengan pencarian dan pagination.
export default function KelolaMuzzaki() {
  // ─── States ───
  const [muzzakiList, setMuzzakiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State form input
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telp: "",
    alamat: "",
    npwp: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "laki-laki",
    pekerjaan: "",
  });

  // Ubah kode jenis kelamin menjadi label tampilan.
  const toGenderLabel = (value) => {
    if (value === "laki-laki") return "Laki-laki";
    if (value === "perempuan") return "Perempuan";
    return value ?? "-";
  };

  // Ubah satu data muzakki dari format server → format baris tabel/form.
  const mapApiToRow = (item) => ({
    id: String(item?.id ?? ""),
    nama: item?.nama_lengkap ?? "-",
    email: item?.email ?? "-",
    telp: item?.nomor_telpon ?? "-",
    alamat: item?.alamat ?? "",
    npwp: item?.npwp ?? "",
    nik: item?.nik ?? "",
    tempatLahir: item?.tempat_lahir ?? "",
    tanggalLahir: formatDateInput(item?.tanggal_lahir),
    jenisKelamin: item?.jenis_kelamin ?? "laki-laki",
    pekerjaan: item?.pekerjaan ?? "",
  });

  // Kebalikan mapApiToRow: ubah isi form → format yang dikirim ke server.
  const mapFormToApi = (form) => ({
    nama_lengkap: form.nama,
    email: form.email,
    nomor_telpon: form.telp,
    alamat: form.alamat,
    npwp: form.npwp,
    nik: form.nik,
    tempat_lahir: form.tempatLahir,
    tanggal_lahir: form.tanggalLahir,
    jenis_kelamin: form.jenisKelamin,
    pekerjaan: form.pekerjaan,
  });

  // Ambil semua data muzakki dari server lalu ubah ke format baris tabel.
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await getAllMuzakki();
      const rows = Array.isArray(res?.data) ? res.data.map(mapApiToRow) : [];
      setMuzzakiList(rows);
    } catch (err) {
      // BE mengembalikan 404 jika data kosong
      if (err?.response?.status === 404) {
        setMuzzakiList([]);
        return;
      }
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat data muzzaki",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Muat data muzakki saat halaman pertama dibuka.
  useEffect(() => {
    loadData();
  }, []);

  // ─── Filter Pencarian ───
  // Saring daftar muzakki sesuai kata kunci (nama atau ID).
  const filteredMuzzaki = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return muzzakiList.filter(
      (item) =>
        item.nama.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [muzzakiList, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMuzzaki.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedMuzzaki = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMuzzaki.slice(start, start + PAGE_SIZE);
  }, [filteredMuzzaki, safePage]);

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
    setFormData({
      nama: "",
      email: "",
      telp: "",
      alamat: "",
      npwp: "",
      nik: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "laki-laki",
      pekerjaan: "",
    });
    setIsModalOpen(true);
  };

  // Buka modal mode EDIT: isi form dengan data baris yang dipilih.
  const handleEditClick = (item) => {
    setErrors({});
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      email: item.email,
      telp: item.telp,
      alamat: item.alamat,
      npwp: item.npwp,
      nik: item.nik,
      tempatLahir: item.tempatLahir,
      tanggalLahir: formatDateInput(item.tanggalLahir),
      jenisKelamin: item.jenisKelamin,
      pekerjaan: item.pekerjaan,
    });
    setIsModalOpen(true);
  };

  // Hapus data muzakki setelah konfirmasi, lalu muat ulang tabel.
  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data Muzakki yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMuzakki(id);
      await loadData();
      Swal.fire({
        title: "Berhasil!",
        text: "Data Muzakki berhasil dihapus.",
        icon: "success",
        showConfirmButton: false,
      });
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menghapus muzzaki",
      );
    }
  };

  // Simpan form: validasi, lalu update (edit) atau buat baru (tambah).
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = ValidationDataMuzakki(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const payload = mapFormToApi(formData);
      if (editingId) {
        try {
          await updateMuzakki(editingId, payload);

          await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Akun muzakki berhasil di update",
            confirmButtonColor: "#10B981",
          });
          setErrorMsg("");
        } catch (error) {
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            "Gagal mengupdate data muzzaki";
          setErrorMsg(msg);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: msg || "Terjadi kesalahan pada server",
            confirmButtonColor: "#EF4444",
          });
          return;
        }
      } else {
        try {
          await createMuzakki(payload);

          await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Akun muzakki berhasil dibuat",
            confirmButtonColor: "#10B981",
          });
          setErrorMsg("");
        } catch (error) {
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            "Gagal membuat data muzzaki";
          setErrorMsg(msg);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: msg,
            confirmButtonColor: "#EF4444",
          });
          return;
        }
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        nama: "",
        email: "",
        telp: "",
        alamat: "",
        npwp: "",
        nik: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "laki-laki",
        pekerjaan: "",
      });

      await loadData();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;
      setErrorMsg(msg || "Gagal menyimpan data muzzaki");

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: msg || "Terjadi kesalahan pada server",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  // Tutup modal dengan konfirmasi & kosongkan form.
  const handleCloseModal = () => {
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
          email: "",
          telp: "",
          alamat: "",
          npwp: "",
          nik: "",
          tempatLahir: "",
          tanggalLahir: "",
          jenisKelamin: "laki-laki",
          pekerjaan: "",
        });
      }
    });
    setErrorMsg("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Kelola Muzzaki
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Beberapa Muzzaki yang sudah Terdaftar
          </p>
        </div>

        {/* ─── Tombol Tambah ─── */}
        <div className="mb-8">
          <button
            onClick={handleTambahClick}
            className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm text-sm"
          >
            <Plus size={18} strokeWidth={3} />
            Tambah Muzzaki
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
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NO.TELP
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
                ) : filteredMuzzaki.length > 0 ? (
                  paginatedMuzzaki.map((item, index) => (
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
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {item.telp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider ${
                            item.jenisKelamin === "laki-laki"
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
                        Belum ada data muzzaki. Klik tombol "Tambah Muzzaki"
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
                  {editingId ? "Edit Data Muzzaki" : "Tambah Muzzaki Baru"}
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
                          Alamat Email
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="email@contoh.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Alamat
                          <span className="text-red-500"> *</span>
                        </label>
                        <textarea
                          type="text"
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full resize-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="Bandung, Jawa Barat"
                        />
                        {errors.alamat && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.alamat}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
                    <h4 className="text-base font-extrabold text-gray-900 mb-4">
                      Identitas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
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
                          placeholder="3201123456789001"
                        />
                        {errors.nik && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.nik}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          NPWP
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="text"
                          name="npwp"
                          value={formData.npwp}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="15.555.678.9-015.000"
                        />
                        {errors.npwp && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.npwp}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
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
                          value={formatDateInput(formData.tanggalLahir)}
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

                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 mb-4">
                      Lainnya
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Pekerjaan
                          <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="text"
                          name="pekerjaan"
                          value={formData.pekerjaan}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                          placeholder="Karyawan Swasta"
                        />
                        {errors.pekerjaan && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5 pl-1">
                            {errors.pekerjaan}
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
