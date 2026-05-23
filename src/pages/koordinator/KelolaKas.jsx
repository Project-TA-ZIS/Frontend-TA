import React, { useEffect, useMemo, useState } from "react";
import { Download, Plus, X } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import Swal from "sweetalert2";
import Select from "react-select";
import { formattedDate } from "../../utils/formattedDate";
import { formatRupiah } from "../../utils/formatRupiah";
import pengeluaranService from "../../services/pengeluaranDasawisma.service";
import pemasukanDasawismaService from "../../services/pemasukanDasawisma.service";
import dasawismaService from "../../services/dasawisma.service";
import totalKasDasawismaService from "../../services/totalKasDasawisma.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoDasawisma from "../../assets/logo.png";
import KasSummaryCards from "../../components/shared/KasSummaryCards";
import { exportKasDasawismaPdf } from "../../utils/exportKasDasawismaPdf";

export default function KelolaKas() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchAnggota, setSearchAnggota] = useState("");
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [saldoKasDasawisma, setSaldoKasDasawisma] = useState(0);

  const loadAnggotaDasawisma = async () => {
    try {
      const res = await dasawismaService.getAllAnggotaDasawisma();

      setAnggotaList(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };
  const anggotaOptions = anggotaList.map((anggota) => ({
    value: anggota.id,
    label: anggota.nama_lengkap,
  }));

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filterJenis, setFilterJenis] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

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
      } catch (error) {
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
      } catch (error) {
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

  const loadTotalKasDasawisma = async () => {
    try {
      const res = await totalKasDasawismaService.getTotalKasDasawisma();
      setSaldoKasDasawisma(res.data?.jumlah_keseluruhan || 0);
      setSaldoUpdatedAt(res.data?.updated_at || "");
    } catch (error) {
      console.log("Gagal memuat total kas dasawisma");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.jenis === "Pemasukan") {
        await pemasukanDasawismaService.createPemasukanKas({
          jumlah: Number(formData.nominal),
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
          jumlah: Number(formData.nominal),
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
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.response?.data?.message || "Terjadi kesalahan pada server",
      });
    }
  };

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

  const handleDownloadPDF = () => {
    exportKasDasawismaPdf({ historyData: filteredTransactions });
  };

  // ─── useEffect ───
  useEffect(() => {
    loadKasData();
    loadAnggotaDasawisma();
    loadTotalKasDasawisma();
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
              className="col-span-2 md:col-span-1 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-auto"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Jenis Kas (Semua)</option>
              <option value="Pemasukan">Kas Pemasukan</option>
              <option value="Pengeluaran">Kas Pengeluaran</option>
            </select>

            <select
              className="bg-white border border-gray-200 text-gray-700 text-xs md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-28"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option value="">Bulan</option>
              <option value="April">April</option>
              <option value="Maret">Maret</option>
            </select>

            <select
              className="bg-white border border-gray-200 text-gray-700 text-xs md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-28"
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
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-3 rounded-lg text-xs md:text-sm transition-all hover:bg-gray-50 shadow-sm w-full md:w-auto"
            >
              <Download size={16} /> Unduh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2 px-3 rounded-lg text-xs md:text-sm transition-all hover:bg-[#059669] shadow-sm w-full md:w-auto"
            >
              <Plus size={16} strokeWidth={2.5} /> Catat
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TANGGAL
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    NAMA
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    sumber
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    DESKRIPSI
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    JENIS
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                    NOMINAL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Belum ada transaksi kas yang tercatat.
                    </td>
                  </tr>
                )}

                {filteredTransactions.map((trx, index) => (
                  <tr
                    key={`${trx.jenis}-${trx.id}`}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 tracking-wider">
                      {formattedDate(trx.tanggal)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {trx.namaAnggota || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {trx.sumber || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {trx.deskripsi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${trx.jenis === "Pemasukan" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                      >
                        {trx.jenis}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-extrabold text-right ${trx.jenis === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"}`}
                    >
                      {trx.jenis === "Pemasukan" ? "+" : "-"}{" "}
                      {formatRupiah(trx.nominal).replace("Rp", "").trim()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── MODAL POP-UP CATAT TRANSAKSI ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Catat Transaksi Kas
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Jenis Transaksi
                  </label>
                  <select
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="Pemasukan">KAS MASUK (PEMASUKAN)</option>
                    <option value="Pengeluaran">
                      KAS KELUAR (PENGELUARAN)
                    </option>
                  </select>
                </div>

                {formData.jenis === "Pemasukan" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Tipe Pemasukan
                    </label>

                    <select
                      name="tipePemasukan"
                      value={formData.tipePemasukan}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                    >
                      <option value="IURAN">Iuran Anggota</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>
                )}

                {formData.jenis === "Pemasukan" &&
                  formData.tipePemasukan === "IURAN" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Cari Anggota Dasawisma
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
                        onInputChange={(value) => setSearchAnggota(value)}
                        value={
                          anggotaOptions.find(
                            (item) =>
                              item.value === formData.anggota_dasawisma_id,
                          ) || null
                        }
                        onChange={(selectedOption) => {
                          setFormData((prev) => ({
                            ...prev,
                            anggota_dasawisma_id: selectedOption?.value || "",
                          }));
                        }}
                        className="text-sm"
                      />
                    </div>
                  )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Deskripsi Kegiatan
                  </label>
                  <input
                    type="text"
                    name="deskripsi"
                    required
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Contoh: Pembelian Sapu..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    name="nominal"
                    required
                    value={formData.nominal}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669]"
                  >
                    Simpan Transaksi
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
