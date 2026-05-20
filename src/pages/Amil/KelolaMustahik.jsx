import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import {
  createMustahik,
  deleteMustahik,
  getAllMustahik,
  updateMustahik,
} from "../../services/mustahik.service";
import Swal from "sweetalert2";

const toGenderLabel = (value) => {
  if (value === "laki-laki") return "Laki-laki";
  if (value === "perempuan") return "Perempuan";
  return value ?? "-";
};

const toKategoriLabel = (value) => {
  const v = (value || "").toString().trim().toLowerCase();
  if (!v) return "-";
  if (v === "fisabilillah") return "Fisabilillah";
  if (v === "berhutang") return "Berhutang";
  if (v === "musafir") return "Musafir";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const toDateOnly = (value) => {
  if (!value) return "";
  const raw = String(value);
  if (raw.includes("T")) return raw.slice(0, 10);
  return raw;
};

const mapApiToRow = (item) => ({
  id: String(item?.id ?? ""),
  nama: item?.nama_lengkap ?? "-",
  telp: item?.nomor_telpon ?? "-",
  alamat: item?.alamat ?? "",
  nik: item?.nik ?? "",
  tempatLahir: item?.tempat_lahir ?? "",
  tanggalLahir: toDateOnly(item?.tanggal_lahir),
  kategori: item?.kategori ?? "fakir",
  jenisKelamin: item?.jenis_kelamin ?? "laki-laki",
});

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

export default function KelolaMustahik() {
  // ─── States ───
  const [mustahikList, setMustahikList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State form input (Disesuaikan dengan kolom Mustahik)
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

  useEffect(() => {
    loadData();
  }, []);

  // ─── Filter Pencarian ───
  const filteredMustahik = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return mustahikList.filter(
      (item) =>
        item.nama.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.kategori || "").toString().toLowerCase().includes(q),
    );
  }, [mustahikList, searchQuery]);

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTambahClick = () => {
    setEditingId(null);
    setFormData(getEmptyFormData());
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
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

    if (!formData.jenisKelamin) {
      newErrors.jenisKelamin = "Jenis kelamin wajib dipilih!";
    }

    if (!(formData.alamat || "").trim()) {
      newErrors.alamat = "Alamat wajib diisi!";
    }

    if (!(formData.npwp || "").trim()) {
      newErrors.npwp = "NPWP wajib diisi!";
    }

    if (!(formData.nik || "").trim()) {
      newErrors.nik = "NIK wajib diisi!";
    } else if (!/^[0-9]+$/.test(formData.nik)) {
      newErrors.nik = "NIK hanya boleh angka!";
    } else if (formData.nik.length !== 16) {
      newErrors.nik = "NIK harus 16 digit!";
    }

    if (!(formData.tempatLahir || "").trim()) {
      newErrors.tempatLahir = "Tempat lahir wajib diisi!";
    }

    if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi!";
    } else if (isNaN(Date.parse(formData.tanggalLahir))) {
      newErrors.tanggalLahir = "Tanggal lahir tidak valid!";
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

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
            Mustahik
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
                  filteredMustahik.map((item, index) => (
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
          </div>
        </div>

        {/* ─── MODAL POP-UP TAMBAH / EDIT DATA ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
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
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="p-6 overflow-y-auto space-y-5">
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.nama}
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.telp}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Alamat
                      </label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full resize-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold"
                        placeholder="Masukkan alamat..."
                      />
                      {errors.alamat && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.alamat}
                        </p>
                      )}
                    </div>

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
                        placeholder="Masukkan NIK..."
                      />
                      {errors.nik && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.nik}
                        </p>
                      )}
                    </div>

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
                        placeholder="Masukkan tempat lahir..."
                      />
                      {errors.tempatLahir && (
                        <p className="text-red-500 text-xs mt-1">
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.tanggalLahir}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Jenis Kelamin
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.jenisKelamin}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Kategori (Asnaf)
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.kategori}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-white">
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
