import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Info,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import Swal from "sweetalert2";
import Select from "react-select";
import { formatRupiah } from "../../utils/formatRupiah";
import pengeluaranService from "../../services/pengeluaranDasawisma.service";
import pemasukanDasawismaService from "../../services/pemasukanDasawisma.service";
import dasawismaService from "../../services/dasawisma.service";
import totalKasDasawismaService from "../../services/totalKasDasawisma.service";
import KasSummaryCards from "../../components/shared/KasSummaryCards";
import { exportKasDasawismaPdf } from "../../utils/exportKasDasawismaPdf";
import {
  formatThousands,
  parseThousandsToNumber,
} from "../../utils/formatThousands";
import KasTable from "../../components/shared/kasTable";

// Halaman Kelola Kas (koordinator): catat/edit transaksi kas (pemasukan &
// pengeluaran), lihat ringkasan saldo, filter, dan unduh PDF.
export default function KelolaKas() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchAnggota] = useState("");
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [saldoKasDasawisma, setSaldoKasDasawisma] = useState(0);
  const [errors, setErrors] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editForm, setEditForm] = useState({
    tanggal: "",
    deskripsi: "",
    nominal: "",
    jenis: "",
    sumber: "",
    namaAnggota: "",
  });
  // ─── States Data & Modal ───
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: "",
    deskripsi: "",
    jenis: "Pemasukan",
    nominal: "",
    tipePemasukan: "IURAN",
    anggota_dasawisma_id: "",
  });
  const [filterJenis, setFilterJenis] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  // Validasi form catat transaksi; anggota wajib dipilih khusus pemasukan iuran.
  const validateForm = () => {
    const newErrors = {};

    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal transaksi wajib diisi";
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi kegiatan wajib diisi";
    }

    if (!formData.nominal) {
      newErrors.nominal = "Nominal wajib diisi";
    }

    if (
      formData.jenis === "Pemasukan" &&
      formData.tipePemasukan === "IURAN" &&
      !formData.anggota_dasawisma_id
    ) {
      newErrors.anggota_dasawisma_id = "Silakan pilih anggota Dasawisma";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Amankan teks agar tidak ditafsirkan sebagai HTML (cegah XSS) saat
  // ditampilkan di dalam dialog SweetAlert berformat HTML.
  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  // Susun detail tambahan (kategori & saldo tersedia) dari error server, mis.
  // saat pengeluaran melebihi saldo — untuk ditampilkan di dialog error.
  const kasSaldoErrorDetails = (err) => {
    const data = err?.response?.data;
    const saldo = data?.saldo_tersedia;
    const kategori = data?.kategori;

    if (saldo === undefined && !kategori) return null;

    const parts = [];
    if (kategori)
      parts.push(`<div><b>Kategori:</b> ${escapeHtml(kategori)}</div>`);
    if (saldo !== undefined) {
      const saldoNum = Number(saldo);
      parts.push(
        `<div><b>Saldo tersedia:</b> ${escapeHtml(formatRupiah(Number.isNaN(saldoNum) ? 0 : saldoNum))}</div>`,
      );
    }

    return { html: parts.join("") };
  };

  // Ambil daftar anggota (untuk dropdown pemilihan anggota saat iuran).
  const loadAnggotaDasawisma = async () => {
    try {
      const res = await dasawismaService.getAllAnggotaDasawisma();

      setAnggotaList(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };
  // Ubah daftar anggota menjadi opsi dropdown {value, label}.
  const anggotaOptions = anggotaList.map((anggota) => ({
    value: anggota.id,
    label: anggota.nama_lengkap,
  }));

  // Update field form; khusus nominal, otomatis diformat ribuan saat diketik.
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nominal") {
      setFormData((prev) => ({
        ...prev,
        [name]: formatThousands(value),
      }));
      return;
    }
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Saring transaksi sesuai filter jenis, bulan, dan tahun.
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const matchesJenis =
        !filterJenis || filterJenis === "Semua" || trx.jenis === filterJenis;

      const matchesBulan = filterBulan
        ? new Date(trx.tanggal).toLocaleString("id-ID", {
            month: "long",
          }) === filterBulan
        : true;

      const matchesTahun = filterTahun
        ? new Date(trx.tanggal).getFullYear().toString() === filterTahun
        : true;

      return matchesJenis && matchesBulan && matchesTahun;
    });
  }, [transactions, filterJenis, filterBulan, filterTahun]);

  // ─── Load Data ───
  // Muat data kas: ambil pemasukan & pengeluaran, seragamkan bentuknya, gabung +
  // urutkan dari terbaru, lalu hitung ringkasan (masuk/keluar/saldo).
  const loadKasData = async () => {
    try {
      let pemasukanData = [];
      let pengeluaranData = [];

      try {
        const pemasukanRes =
          await pemasukanDasawismaService.getAllPemasukanKas();

        pemasukanData = (pemasukanRes.data || []).map((item) => ({
          id: item.id,
          tanggal: item.tanggal_penghimpunan,
          deskripsi: item.deskripsi,
          namaAnggota: item.nama_anggota,
          sumber: item.sumber,
          jenis: "Pemasukan",
          nominal: Number(item.jumlah),
        }));
      } catch {
        console.log("Pemasukan kosong");
      }

      try {
        const pengeluaranRes = await pengeluaranService.getAllPengeluaran();

        pengeluaranData = (pengeluaranRes.data || []).map((item) => ({
          id: item.id,
          tanggal: item.tanggal_penyaluran,
          deskripsi: item.deskripsi,
          jenis: "Pengeluaran",
          nominal: Number(item.jumlah),
        }));
      } catch {
        console.log("Pengeluaran kosong");
      }

      const allTransactions = [...pemasukanData, ...pengeluaranData];

      allTransactions.sort((a, b) => {
        const timeA = a.tanggal ? new Date(a.tanggal).getTime() : 0;
        const timeB = b.tanggal ? new Date(b.tanggal).getTime() : 0;

        return timeB - timeA;
      });

      setTransactions(allTransactions);

      const totalMasuk = pemasukanData.reduce(
        (acc, curr) => acc + curr.nominal,
        0,
      );

      const totalKeluar = pengeluaranData.reduce(
        (acc, curr) => acc + curr.nominal,
        0,
      );

      setSummary({
        pemasukan: totalMasuk,
        pengeluaran: totalKeluar,
        saldo: totalMasuk - totalKeluar,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal memuat data kas",
      });
    }
  };

  // Ambil saldo total kas dasawisma + waktu terakhir diperbarui dari server.
  const loadTotalKasDasawisma = async () => {
    try {
      const res = await totalKasDasawismaService.getTotalKasDasawisma();
      setSaldoKasDasawisma(Number(res.data?.jumlah_keseluruhan || 0));
      setSaldoUpdatedAt(res.data?.updated_at || "");
    } catch {
      console.log("Gagal memuat total kas dasawisma");
    }
  };

  // Simpan transaksi baru: validasi, kirim ke endpoint pemasukan/pengeluaran
  // sesuai jenis, lalu muat ulang data & saldo.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const nominal = parseThousandsToNumber(formData.nominal);

      if (formData.jenis === "Pemasukan") {
        await pemasukanDasawismaService.createPemasukanKas({
          jumlah: nominal,
          deskripsi: formData.deskripsi,
          sumber: formData.tipePemasukan,
          tanggal_penghimpunan: formData.tanggal,

          anggota_dasawisma_id:
            formData.tipePemasukan === "IURAN"
              ? Number(formData.anggota_dasawisma_id)
              : null,
        });
      } else {
        await pengeluaranService.createPengeluaran({
          jumlah: nominal,
          deskripsi: formData.deskripsi,
          tanggal_penyaluran: formData.tanggal,
        });
      }

      await loadKasData();
      await loadTotalKasDasawisma();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Transaksi berhasil ditambahkan",
        confirmButtonColor: "#10B981",
      });

      setIsModalOpen(false);

      setFormData({
        tanggal: "",
        deskripsi: "",
        jenis: "Pemasukan",
        nominal: "",
        tipePemasukan: "IURAN",
        anggota_dasawisma_id: "",
      });
    } catch (error) {
      console.log(error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Terjadi kesalahan pada server";
      const extra = kasSaldoErrorDetails(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        ...(extra
          ? { html: `<div>${escapeHtml(msg)}</div><br/>${extra.html}` }
          : { text: msg }),
        confirmButtonColor: "#10B981",
      });
    }
  };

  // Buka modal edit: isi form edit dengan data transaksi yang dipilih.
  const handleEdit = (trx) => {
    setSelectedTransaction(trx);

    setEditForm({
      tanggal: trx.tanggal || "",
      deskripsi: trx.deskripsi || "",
      nominal: formatThousands(trx.nominal || 0),
      jenis: trx.jenis || "",
      sumber: trx.sumber || "",
      namaAnggota: trx.namaAnggota || "",
    });

    setIsEditModalOpen(true);
  };

  // Simpan hasil edit transaksi setelah konfirmasi, lalu muat ulang data & saldo.
  const handleSaveEdit = async () => {
    const result = await Swal.fire({
      title: "Simpan perubahan?",
      text: "Data transaksi akan diperbarui.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10B981",
    });

    if (!result.isConfirmed) return;

    try {
      if (selectedTransaction.jenis === "Pemasukan") {
        const payload = {
          jumlah: parseThousandsToNumber(editForm.nominal),
          deskripsi: editForm.deskripsi,
          tanggal_penghimpunan: editForm.tanggal,
        };

        await pemasukanDasawismaService.updatePemasukanKas(
          selectedTransaction.id,
          payload,
        );
      } else {
        const payload = {
          jumlah: parseThousandsToNumber(editForm.nominal),
          deskripsi: editForm.deskripsi,
          tanggal_penyaluran: editForm.tanggal,
        };
        await pengeluaranService.updatePengeluaran(
          selectedTransaction.id,
          payload,
        );
      }

      await loadKasData();
      await loadTotalKasDasawisma();

      setIsEditModalOpen(false);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Transaksi berhasil diperbarui",
        confirmButtonColor: "#10B981",
      });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Terjadi kesalahan saat memperbarui data";
      const extra = kasSaldoErrorDetails(error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        ...(extra
          ? { html: `<div>${escapeHtml(msg)}</div><br/>${extra.html}` }
          : { text: msg }),
        confirmButtonColor: "#10B981",
      });
    }
  };

  // Tutup modal catat transaksi dengan konfirmasi & kosongkan form.
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

      setFormData({
        tanggal: "",
        deskripsi: "",
        jenis: "Pemasukan",
        nominal: "",
        tipePemasukan: "IURAN",
        anggota_dasawisma_id: "",
      });
    }
  };

  // Tutup modal edit dengan konfirmasi & kembalikan isi form ke data semula.
  const handleCloseEditModal = async () => {
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
      setIsEditModalOpen(false);

      setEditForm({
        tanggal: selectedTransaction.tanggal || "",
        deskripsi: selectedTransaction.deskripsi || "",
        nominal: formatThousands(selectedTransaction.nominal || 0),
        jenis: selectedTransaction.jenis || "",
        sumber: selectedTransaction.sumber || "",
        namaAnggota: selectedTransaction.namaAnggota || "",
      });
    }
  };

  // ─── useEffect ───
  // Saat halaman dibuka: muat data kas, daftar anggota, dan total saldo.
  // Dibungkus fungsi async di dalam effect agar pemanggilan loader (yang
  // memperbarui state) berjalan asinkron, bukan sinkron saat render.
  useEffect(() => {
    const init = async () => {
      await loadKasData();
      await loadAnggotaDasawisma();
      await loadTotalKasDasawisma();
    };
    init();
  }, []);

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-gray-50 p-6 md:p-10"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Manajemen Kas Dasawisma
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Kelola penerimaan dan penyaluran dana Kas secara transparan.
          </p>
        </div>

        {/* Summary Cards (Data Real-time) */}
        <KasSummaryCards
          pemasukan={summary.pemasukan}
          pengeluaran={summary.pengeluaran}
          saldoKas={saldoKasDasawisma}
          saldoUpdatedAt={saldoUpdatedAt}
        />

        {/* Action Bar & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Filter Dropdowns - Mobile pakai Grid agar rapi */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            {/* select Jenis Kas (Memakan 2 kolom di mobile agar panjang) */}
            <select
              className="col-span-2 md:col-span-1 bg-white border border-gray-200 text-gray-700 text-sm md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-auto"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Jenis Kas (Semua)</option>
              <option value="Pemasukan">Kas Pemasukan</option>
              <option value="Pengeluaran">Kas Pengeluaran</option>
            </select>

            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-28"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option value="">Bulan</option>
              <option value="April">April</option>
              <option value="Maret">Maret</option>
            </select>

            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-28"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
            >
              <option value="">Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Action Buttons - Berjejer rapi di mobile */}
          <div className="grid grid-cols-2 md:flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <button
              onClick={() =>
                exportKasDasawismaPdf({
                  historyData: filteredTransactions,
                  totalKasDaswisma: saldoKasDasawisma,
                })
              }
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-3 rounded-lg text-sm md:text-sm transition-all hover:bg-gray-50 shadow-sm w-full md:w-auto"
            >
              <Download size={16} /> Unduh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2 px-3 rounded-lg text-sm md:text-sm transition-all hover:bg-[#059669] shadow-sm w-full md:w-auto"
            >
              <Plus size={16} strokeWidth={2.5} /> Catat
            </button>
          </div>
        </div>

        {/* INI BAGIAN TABLE, JANGAN DI REFACTORING LAGI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <KasTable data={filteredTransactions} onEdit={handleEdit} />
          </div>
        </div>

        {/* ─── MODAL POP-UP CATAT TRANSAKSI ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            {/* Menggunakan max-h-[90vh] agar modal tetap bisa di-scroll jika layar kecil */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Header Modal - Dikecilkan padding-nya */}
              <div className="bg-[#0F766E] px-5 py-4 flex items-center justify-between flex-shrink-0">
                <h2 className="text-base md:text-lg font-bold text-white">
                  Catat Transaksi Kas
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-emerald-100 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body - Menggunakan space-y-3 (rapat) untuk mobile */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-5 space-y-3 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Tanggal Transaksi
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      // required
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                    {errors.tanggal && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.tanggal}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Jenis Transaksi
                      <span className="text-red-500"> *</span>
                    </label>
                    <select
                      name="jenis"
                      value={formData.jenis}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                    >
                      <option value="Pemasukan">KAS MASUK (PEMASUKAN)</option>
                      <option value="Pengeluaran">
                        KAS KELUAR (PENGELUARAN)
                      </option>
                    </select>
                  </div>

                  {formData.jenis === "Pemasukan" && (
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Tipe Pemasukan
                        <span className="text-red-500"> *</span>
                      </label>
                      <select
                        name="tipePemasukan"
                        value={formData.tipePemasukan}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                      >
                        <option value="IURAN">Iuran Anggota</option>
                        <option value="LAINNYA">Lainnya</option>
                      </select>
                    </div>
                  )}

                  {formData.jenis === "Pemasukan" &&
                    formData.tipePemasukan === "IURAN" && (
                      <div>
                        <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Cari Anggota Dasawisma
                          <span className="text-red-500"> *</span>
                        </label>
                        <Select
                          options={
                            searchAnggota
                              ? anggotaOptions.filter((item) =>
                                  item.label
                                    .toLowerCase()
                                    .includes(searchAnggota.toLowerCase()),
                                )
                              : anggotaOptions.slice(0, 3)
                          }
                          placeholder="Cari nama anggota..."
                          onChange={(selectedOption) =>
                            setFormData((prev) => ({
                              ...prev,
                              anggota_dasawisma_id: selectedOption?.value || "",
                            }))
                          }
                          className="text-sm"
                        />
                        {errors.anggota_dasawisma_id && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.anggota_dasawisma_id}
                          </p>
                        )}
                      </div>
                    )}

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Deskripsi Kegiatan
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      name="deskripsi"
                      //required
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="Contoh: Pembelian Sapu..."
                    />
                    {errors.deskripsi && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.deskripsi}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Nominal (Rp)
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9.]*"
                      name="nominal"
                      // required
                      value={formData.nominal}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="0"
                    />
                    {errors.nominal && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.nominal}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Tombol - Dikecilkan padding-nya */}
                <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#0F766E] p-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">
                Detail Transaksi Kas
              </h2>

              <button
                onClick={() => handleCloseEditModal()}
                className="text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500">
                  Jenis Transaksi
                </label>
                <input
                  disabled
                  value={editForm.jenis}
                  className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">
                  Nama Anggota
                </label>
                <input
                  disabled
                  value={editForm.namaAnggota}
                  className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">
                  Sumber
                </label>
                <input
                  disabled
                  value={editForm.sumber}
                  className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={editForm.tanggal?.split("T")[0]}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tanggal: e.target.value,
                    })
                  }
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">
                  Deskripsi
                </label>
                <input
                  value={editForm.deskripsi}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      deskripsi: e.target.value,
                    })
                  }
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">
                  Nominal
                </label>
                <input
                  value={editForm.nominal}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      nominal: formatThousands(e.target.value),
                    })
                  }
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                />
              </div>
            </div>

            <div className="border-t p-4 flex justify-end gap-2">
              <button
                onClick={() => handleCloseEditModal()}
                className="px-5 py-2 rounded-xl bg-gray-100 font-bold"
              >
                Batal
              </button>

              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#10B981] text-white font-bold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
