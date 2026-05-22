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

export default function KelolaMuzzaki() {
  // ─── States ───
  const [muzzakiList, setMuzzakiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

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

  const toGenderLabel = (value) => {
    if (value === "laki-laki") return "Laki-laki";
    if (value === "perempuan") return "Perempuan";
    return value ?? "-";
  };

  const toDateOnly = (value) => {
    if (!value) return "";
    const raw = String(value);
    // jika ISO string, ambil yyyy-mm-dd
    if (raw.includes("T")) return raw.slice(0, 10);
    return raw;
  };

  const mapApiToRow = (item) => ({
    id: String(item?.id ?? ""),
    nama: item?.nama_lengkap ?? "-",
    email: item?.email ?? "-",
    telp: item?.nomor_telpon ?? "-",
    alamat: item?.alamat ?? "",
    npwp: item?.npwp ?? "",
    nik: item?.nik ?? "",
    tempatLahir: item?.tempat_lahir ?? "",
    tanggalLahir: toDateOnly(item?.tanggal_lahir),
    jenisKelamin: item?.jenis_kelamin ?? "laki-laki",
    pekerjaan: item?.pekerjaan ?? "",
  });

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

  useEffect(() => {
    loadData();
  }, []);

  // ─── Filter Pencarian ───
  const filteredMuzzaki = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return muzzakiList.filter(
      (item) =>
        item.nama.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [muzzakiList, searchQuery]);

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTambahClick = () => {
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

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      email: item.email,
      telp: item.telp,
      alamat: item.alamat,
      npwp: item.npwp,
      nik: item.nik,
      tempatLahir: item.tempatLahir,
      tanggalLahir: item.tanggalLahir,
      jenisKelamin: item.jenisKelamin,
      pekerjaan: item.pekerjaan,
    });
    setIsModalOpen(true);
  };

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
        timer: 1500,
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

  const validateForm = () => {
    let newErrors = {};

    if (!(formData.nama || "").trim()) {
      newErrors.nama = "Nama lengkap wajib diisi!";
    }

    if (!(formData.email || "").trim()) {
      newErrors.email = "Alamat email wajib diisi!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || "")) {
      newErrors.email = "Format email tidak valid!";
    }

    if (!(formData.telp || "").trim()) {
      newErrors.telp = "Nomor telepon wajib diisi!";
    } else if (!/^[0-9]+$/.test(formData.telp || "")) {
      newErrors.telp = "Nomor telepon hanya boleh angka!";
    } else if ((formData.telp || "").length < 10) {
      newErrors.telp = "Nomor telepon tidak valid!";
    }

    if (!(formData.nik || "").trim()) {
      newErrors.nik = "NIK wajib diisi!";
    } else if (!/^[0-9]+$/.test(formData.nik || "")) {
      newErrors.nik = "NIK hanya boleh angka!";
    } else if ((formData.nik || "").length !== 16) {
      newErrors.nik = "NIK harus 16 digit!";
    }

    if (!(formData.tempatLahir || "").trim()) {
      newErrors.tempatLahir = "Tempat lahir wajib diisi!";
    }

    if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi!";
    }

    if (!(formData.pekerjaan || "").trim()) {
      newErrors.pekerjaan = "Pekerjaan wajib diisi!";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrorMsg("");

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
        } catch (error) {
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            "Gagal membuat data muzzaki";
          setErrorMsg(msg);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Terjadi kesalahan pada server",
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
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

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
            Muzzaki
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
                    ID
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
                  filteredMuzzaki.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">
                        {item.id}
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

                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 mb-4">
                      Lainnya
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Pekerjaan
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
