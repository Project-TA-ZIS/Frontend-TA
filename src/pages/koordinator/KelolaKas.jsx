import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Info,
  Plus,
  Search,
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
import KasTable from "../../components/shared/Dasawisma/kasTable";
import { formatDateInput } from "../../utils/formattedDate";
import EditTransactionModal from "../../components/shared/Dasawisma/EditModals";
import CreateDataModal from "../../components/shared/Dasawisma/CreateDataModal";
import useAuthStore from "../../store/useAuthStore";
import MonthList from "../../utils/monthList";
import { getAvailableYears } from "../../utils/getAvailableYears";
import KasFilterBar from "../../components/shared/Dasawisma/KasFilterBar";
import { validateEditKasDasawisma } from "../../utils/validateEditKasDasawisma";

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
    anggota_dasawisma_id: "",
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
    namaAnggota: "",
  });
  const [filterJenis, setFilterJenis] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const user = useAuthStore((s) => s.user) || {};
  const [dasawismaFound, setDasawismaFound] = useState(true);

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

  const validateEditForm = () => {
    const newErrors = {};

    if (!editForm.tanggal) {
      newErrors.tanggal = "Tanggal transaksi wajib diisi";
    }

    if (!editForm.deskripsi?.trim()) {
      newErrors.deskripsi = "Deskripsi kegiatan wajib diisi";
    }

    if (!editForm.nominal) {
      newErrors.nominal = "Nominal wajib diisi";
    }

    if (
      editForm.jenis === "Pemasukan" &&
      editForm.sumber === "IURAN" &&
      !editForm.anggota_dasawisma_id
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "sumber" && value === "LAINNYA") {
        updated.anggota_dasawisma_id = "";
        updated.namaAnggota = "";
      }

      return updated;
    });
  };

  // Saring transaksi sesuai filter jenis, bulan, dan tahun.
  const tahunList = getAvailableYears(transactions);

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
          anggota_dasawisma_id: item.anggota_dasawisma_id,
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
          sumber: "Uang Kas Dasawisma",
          nominal: Number(item.jumlah),
          namaAnggota: item.nama_anggota,
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
          nama_anggota: user.nama_lengkap,
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
        namaAnggota: "",
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
  const handleEdit =  async (trx) => {
    setSelectedTransaction(trx);

    setEditForm({
      tanggal: trx.tanggal || "",
      deskripsi: trx.deskripsi || "",
      nominal: formatThousands(trx.nominal || 0),
      jenis: trx.jenis || "",
      sumber: trx.sumber || "",
      namaAnggota: trx.namaAnggota || "",
      anggota_dasawisma_id: trx.anggota_dasawisma_id || "",
    });

      try {
        await dasawismaService.getAnggotaDasawismaById(trx.anggota_dasawisma_id);
        setDasawismaFound(true);
      } catch (error) {
        setDasawismaFound(false); 
      }
    setIsEditModalOpen(true);
  };

  // Simpan hasil edit transaksi setelah konfirmasi, lalu muat ulang data & saldo.
  const handleSaveEdit = async () => {
    const validationErrors = validateEditKasDasawisma(editForm);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    if (
      editForm.jenis === "Pemasukan" &&
      editForm.sumber === "IURAN" &&
      !editForm.anggota_dasawisma_id
    ) {
      toast.error("Silahkan pilih anggota dasawisma");
      return;
    }

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
          sumber: editForm.sumber,
          deskripsi: editForm.deskripsi,
          tanggal_penghimpunan: editForm.tanggal,
          anggota_dasawisma_id: editForm.anggota_dasawisma_id,
        };
        await pemasukanDasawismaService.updatePemasukanKas(
          selectedTransaction.id,
          payload,
        );
      } else {
        const payload = {
          jumlah: parseThousandsToNumber(editForm.nominal),
          sumber: editForm.sumber,
          deskripsi: editForm.deskripsi,
          tanggal_penyaluran: editForm.tanggal,
          anggota_dasawisma_id: editForm.anggota_dasawisma_id,
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
        namaAnggota: "",
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
      setErrors({});

      setEditForm({
        tanggal: selectedTransaction.tanggal || "",
        deskripsi: selectedTransaction.deskripsi || "",
        nominal: formatThousands(selectedTransaction.nominal || 0),
        jenis: selectedTransaction.jenis || "",
        sumber: selectedTransaction.sumber || "",
        namaAnggota: selectedTransaction.namaAnggota || "",
        anggota_dasawisma_id: selectedTransaction.anggota_dasawisma_id || "",
      });
    }
  };

  const handleCloseCreateDataModal = async () => {
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
        namaAnggota: "",
      });

      setErrors({});
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
        <KasFilterBar
          filterJenis={filterJenis}
          setFilterJenis={setFilterJenis}
          filterBulan={filterBulan}
          setFilterBulan={setFilterBulan}
          filterTahun={filterTahun}
          setFilterTahun={setFilterTahun}
          MonthList={MonthList}
          tahunList={tahunList}
          onExport={() =>
            exportKasDasawismaPdf({
              historyData: filteredTransactions,
              totalKasDaswisma: saldoKasDasawisma,
            })
          }
          onAdd={() => setIsModalOpen(true)}
        />

         {/* ─── Search Bar ─── */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari data anggota atau transaksi..."
            className="bg-gray-200/60 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-5 py-3.5 font-medium outline-none transition-all placeholder-gray-400"
            // value={searchQuery}
            // onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* INI BAGIAN TABLE, JANGAN DI REFACTORING LAGI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <KasTable data={filteredTransactions} onEdit={handleEdit} />
          </div>
        </div>

        {/* ─── MODAL POP-UP CATAT TRANSAKSI ─── */}
        <CreateDataModal
          isOpen={isModalOpen}
          onClose={handleCloseCreateDataModal}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          anggotaOptions={anggotaOptions}
          onSave={handleSubmit}
          handleInputChange={handleInputChange}
          userData={user}
        />
      </div>

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editForm={editForm}
        setEditForm={setEditForm}
        errors={errors}
        anggotaOptions={anggotaOptions}
        onSave={handleSaveEdit}
        handleEditInputChange={handleEditInputChange}
        dasawismaFound={dasawismaFound}
      />
    </PageTransition>
  );
}
