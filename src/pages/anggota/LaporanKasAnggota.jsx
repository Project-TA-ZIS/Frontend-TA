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

export default function LaporanKasAnggota() {
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
      setSaldoKasDasawisma(Number(res.data?.jumlah_keseluruhan || 0));
      setSaldoUpdatedAt(res.data?.updated_at || "");
    } catch (error) {
      console.log("Gagal memuat total kas dasawisma");
    }
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-6">
          {/* Filter Dropdowns - Mobile pakai Grid agar rapi */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            {/* KUNCI: col-span-2 membuat filter ini panjang penuh di mobile, kembali normal di desktop */}
            <select
              className="col-span-2 md:col-span-1 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-3 md:px-4 py-2 md:py-2.5 font-semibold shadow-sm outline-none w-full md:w-auto cursor-pointer transition-all"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Jenis Kas (Semua)</option>
              <option value="Pemasukan">Kas Pemasukan</option>
              <option value="Pengeluaran">Kas Pengeluaran</option>
            </select>

            <select
              className="bg-white border border-gray-200 text-gray-700 text-xs md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-3 md:px-4 py-2 md:py-2.5 font-semibold shadow-sm outline-none w-full md:w-28 cursor-pointer transition-all"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option value="">Bulan</option>
              <option value="April">April</option>
              <option value="Maret">Maret</option>
            </select>

            <select
              className="bg-white border border-gray-200 text-gray-700 text-xs md:text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-3 md:px-4 py-2 md:py-2.5 font-semibold shadow-sm outline-none w-full md:w-28 cursor-pointer transition-all"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
            >
              <option value="">Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center w-full md:w-auto mt-1 md:mt-0">
            <button
              onClick={() =>
                exportKasDasawismaPdf({
                  historyData: filteredTransactions,
                  totalKasDaswisma: saldoKasDasawisma,
                })
              }
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 md:py-2.5 px-4 rounded-lg text-xs md:text-sm transition-all hover:bg-gray-50 shadow-sm active:scale-95"
            >
              <Download size={16} className="md:w-[18px] md:h-[18px]" /> Unduh
              Data
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TANGGAL
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                    NAMA
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                    SUMBER
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                    DESKRIPSI
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    JENIS
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                    NOMINAL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 md:px-6 py-8 text-center text-xs md:text-sm text-gray-500"
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
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-bold text-[#0F766E]">
                      {index + 1}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-600 tracking-wider">
                      {formattedDate(trx.tanggal)}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-900">
                      {trx.namaAnggota || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-900">
                      {trx.sumber || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-900 line-clamp-2 md:line-clamp-none min-w-[150px]">
                      {trx.deskripsi}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 md:px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider ${trx.jenis === "Pemasukan" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                      >
                        {trx.jenis}
                      </span>
                    </td>
                    <td
                      className={`px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-extrabold text-right ${trx.jenis === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"}`}
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
      </div>
    </PageTransition>
  );
}
