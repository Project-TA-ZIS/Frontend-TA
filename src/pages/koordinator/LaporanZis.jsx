import React, { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import penyaluranZISService from "../../services/pengeluaranZIS.service";
import totalZISService from "../../services/totalZIS.service";
import mustahikService from "../../services/mustahik.service";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoDasawisma from "../../assets/logo.png";

const ITEMS_PER_PAGE = 5;

export default function LaporanZIS() {
  // State untuk filter dan pencarian
  const [filterKategori, setFilterKategori] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [zisData, setZisData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalZIS, setTotalZIS] = useState([]);
  const [totalPenerimaan, setTotalPenerimaan] = useState(0);
  const [totalPenyaluran, setTotalPenyaluran] = useState(0);
  const [saldoZIS, setSaldoZIS] = useState(0);
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const parseDateSafe = (dateLike) => {
    if (!dateLike) return null;
    const raw = String(dateLike).trim();
    if (!raw) return null;
    const d = raw.includes("T") ? new Date(raw) : new Date(`${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const loadZISData = async () => {
    try {
      setIsLoading(true);

      const results = await Promise.allSettled([
        pemasukanZISService.getAllPemasukanZIS(),
        penyaluranZISService.getAllPengeluaranZIS(),
        mustahikService.getAllMustahik(),
      ]);

      const is404 = (err) => err?.response?.status === 404;

      let pemasukan = [];
      let pengeluaran = [];
      let mustahikArr = [];

      // PEMASUKAN
      if (results[0].status === "fulfilled") {
        pemasukan = normalizeArray(results[0].value).map((item) => ({
          id: `PZ-${item?.id ?? ""}`,
          tanggal:
            item?.tanggal_penghimpunan ?? item?.created_at ?? item?.updated_at,
          nama: item?.nama_muzakki ?? "-",
          kategori: item?.kategori ?? "-",
          jumlah: Number(item?.jumlah ?? 0),
          tipe: "Pemasukan",
        }));
      }

      // PENGELUARAN
      if (results[1].status === "fulfilled") {
        pengeluaran = normalizeArray(results[1].value).map((item) => ({
          id: `KZ-${item?.id ?? ""}`,
          tanggal:
            item?.tanggal_penyaluran ?? item?.created_at ?? item?.updated_at,
          mustahik_id: item?.mustahik_id ?? null,
          nama: "-",
          kategori: item?.kategori ?? "-",
          jumlah: Number(item?.jumlah ?? 0),
          deskripsi: item?.deskripsi ?? "",
          tipe: "Pengeluaran",
        }));
      }

      // MUSTAHIK (untuk nama pengeluaran)
      if (results[2].status === "fulfilled") {
        mustahikArr = normalizeArray(results[2].value);
      } else if (results[2].status === "rejected" && is404(results[2].reason)) {
        mustahikArr = [];
      }

      const mustahikNameById = new Map(
        (mustahikArr || []).map((m) => [String(m?.id), m?.nama_lengkap || "-"]),
      );

      pengeluaran = pengeluaran.map((item) => ({
        ...item,
        nama:
          mustahikNameById.get(String(item?.mustahik_id ?? "")) || item.nama,
      }));

      const combinedData = [...pemasukan, ...pengeluaran].sort((a, b) => {
        const da = parseDateSafe(a?.tanggal)?.getTime() ?? 0;
        const db = parseDateSafe(b?.tanggal)?.getTime() ?? 0;
        return db - da;
      });

      // TOTAL PEMASUKAN
      const totalMasuk = pemasukan.reduce(
        (acc, item) => acc + Number(item.jumlah),
        0,
      );

      // TOTAL PENGELUARAN
      const totalKeluar = pengeluaran.reduce(
        (acc, item) => acc + Number(item.jumlah),
        0,
      );

      setTotalPenerimaan(totalMasuk);
      setTotalPenyaluran(totalKeluar);

      setZisData(combinedData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTotalZIS = async () => {
    try {
      const res = await totalZISService.getTotalZISbyKategori();
      const resSaldoZIS = await totalZISService.getTotalZIS();

      setTotalZIS(res.data || []);

      // AMBIL TOTAL SALDO
      setSaldoZIS(Number(resSaldoZIS.data.total_uang_zis || 0));
      setSaldoUpdatedAt(resSaldoZIS.data.updated_at || "");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadZISData();
    loadTotalZIS();
  }, []);

  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );

    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

  const filteredData = useMemo(() => {
    return (zisData || []).filter((item) => {
      // SEARCH
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (item.nama || "").toString().toLowerCase().includes(q) ||
        (item.kategori || "").toString().toLowerCase().includes(q) ||
        (item.tipe || "").toString().toLowerCase().includes(q) ||
        (item.id || "").toString().toLowerCase().includes(q);

      // FILTER KATEGORI
      const matchKategori = filterKategori
        ? item.kategori?.toLowerCase().includes(filterKategori.toLowerCase())
        : true;

      // FILTER TIPE
      const matchTipe = filterTipe ? item.tipe === filterTipe : true;

      // FILTER BULAN
      const matchBulan = filterBulan
        ? parseDateSafe(item.tanggal)?.toLocaleString("id-ID", {
            month: "long",
          }) === filterBulan
        : true;

      // FILTER TAHUN
      const matchTahun = filterTahun
        ? (parseDateSafe(item.tanggal)?.getFullYear?.() ?? "").toString() ===
          filterTahun
        : true;

      return (
        matchSearch && matchKategori && matchTipe && matchBulan && matchTahun
      );
    });
  }, [
    zisData,
    searchQuery,
    filterKategori,
    filterTipe,
    filterBulan,
    filterTahun,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterKategori, filterTipe, filterBulan, filterTahun]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE),
  );

  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, safePage]);

  const handleDownloadPDF = () => {
    Swal.fire({
      title: "Unduh Riwayat ZIS",
      text: "Apakah Anda ingin mengunduh riwayat ZIS dalam format PDF?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Unduh PDF",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10B981",
    }).then((result) => {
      if (result.isConfirmed) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // ================= HEADER =================

        // Tulisan kiri
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(15, 118, 110);
        doc.text("DASAWISMA", 14, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("LENTENG AGUNG", 14, 27);

        // Logo kanan
        const logoWidth = 80;
        const logoHeight = 25;

        doc.addImage(
          logoDasawisma,
          "PNG",
          pageWidth - logoWidth, // posisi kanan
          10,
          logoWidth,
          logoHeight,
        );

        // Garis bawah
        doc.setDrawColor(220);
        doc.line(20, 36, pageWidth - 14, 36);

        // tanggal cetak
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120);

        doc.text(
          `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
          20,
          43,
        );

        autoTable(doc, {
          startY: 50,
          head: [
            [
              "No",
              "tanggal",
              "nama",
              "kategori",
              "Deskripsi",
              "Tipe",
              "jumlah",
            ],
          ],
          body: filteredData.map((tx, index) => [
            index + 1,
            formattedDate(tx.tanggal),
            tx.nama || "-",
            tx.kategori || "-",
            tx.deskripsi || "-",
            tx.tipe || "-",
            formatRupiah(tx.jumlah),
          ]),
          styles: {
            fontSize: 9,
          },
          headStyles: {
            fillColor: [16, 185, 129], // emerald
          },
        });

        const totalPemasukan = filteredData
          .filter((item) => item.tipe?.toLowerCase() === "pemasukan")
          .reduce((sum, item) => sum + Number(item.jumlah || 0), 0);

        const totalPengeluaran = filteredData
          .filter((item) => item.tipe?.toLowerCase() === "pengeluaran")
          .reduce((sum, item) => sum + Number(item.jumlah || 0), 0);

        const total = filteredData.reduce(
          (sum, item) => sum + Number(item.jumlah || 0),
          0,
        );
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        doc.text(
          `Total Pemasukan: ${formatRupiah(totalPemasukan)}`,
          14,
          finalY,
        );

        doc.text(
          `Total Pengeluaran: ${formatRupiah(totalPengeluaran)}`,
          14,
          finalY + 7,
        );

        doc.text(`Total Transaksi: ${formatRupiah(total)}`, 14, finalY + 14);

        // Save
        doc.save(`riwayat-zis-${Date.now()}.pdf`);
      }
    });
  };

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-gray-50 p-6 md:p-10"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── Header ─── */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Manajemen ZIS
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Kelola penerimaan dan penyaluran dana ZIS secara transparan.
          </p>
        </div>

        {/* ─── Top Summary Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              TOTAL PENERIMAAN ZIS
            </p>
            <h3 className="text-xl font-extrabold text-gray-900">
              {formatRupiah(totalPenerimaan)}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              TOTAL PENYALURAN
            </p>
            <h3 className="text-3xl font-extrabold text-[#EF4444]">
              {formatRupiah(totalPenyaluran)}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              SALDO ZIS
            </p>
            <h3 className="text-xl font-extrabold text-[#0F766E]">
              {formatRupiah(saldoZIS)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Terakhir diperbarui: {formattedDate(saldoUpdatedAt) || "N/A"}
            </p>
          </div>
        </div>

        {/* ─── Bottom Summary Cards (Kategori Breakdown) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Zakat Fitrah Beras
            </p>

            <h3 className="text-xl font-extrabold text-gray-900">
              {getTotalByKategori("zakat fitrah beras")} Kg
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Zakat Fitrah Uang
            </p>

            <h3 className="text-xl font-extrabold text-gray-900">
              {formatRupiah(getTotalByKategori("zakat fitrah uang"))}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Zakat Maal
            </p>

            <h3 className="text-lg font-extrabold text-gray-900">
              {formatRupiah(getTotalByKategori("zakat mal"))}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Infaq
            </p>

            <h3 className="text-lg font-extrabold text-gray-900">
              {formatRupiah(getTotalByKategori("infaq"))}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Shodaqoh
            </p>

            <h3 className="text-lg font-extrabold text-gray-900">
              {formatRupiah(getTotalByKategori("shodaqoh"))}
            </h3>
          </div>
        </div>

        {/* ─── Filter & Action Bar ─── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 mt-5">
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block px-4 py-2.5 font-semibold outline-none"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="">Kategori ZIS</option>
              <option value="zakat mal">Zakat Maal</option>
              <option value="zakat fitrah">Zakat Fitrah</option>
              <option value="infaq">Infaq</option>
              <option value="shodaqoh">Sedekah</option>
            </select>

            <select
              className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block px-4 py-2.5 font-semibold outline-none"
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
            >
              <option value="">Tipe</option>
              <option value="Pemasukan">Pemasukan</option>
              <option value="Pengeluaran">Pengeluaran</option>
            </select>

            <select
              className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block px-4 py-2.5 font-semibold outline-none"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option value="">Bulan</option>
              <option value="April">April</option>
              <option value="Maret">Maret</option>
            </select>

            {/* PERUBAHAN: Input text diganti menjadi dropdown Select */}
            <select
              className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block px-4 py-2.5 font-semibold outline-none w-28"
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

          {/* Action Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm w-full md:w-auto"
          >
            <Download size={16} />
            Unduh Data
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
            className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-4 py-3 font-semibold outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ─── Table ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    no
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TANGGAL
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    NAMA
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    KATEGORI
                  </th>
                  {/* NOMINAL tetap di kanan, tapi padding disesuaikan agar tidak terlalu mepet */}
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                    NOMINAL (RP)
                  </th>
                  {/* TIPE diubah menjadi text-center agar memiliki jarak alami dari Nominal */}
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    TIPE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-sm font-semibold text-gray-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-[#10B981]">
                        {(safePage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formattedDate(item.tanggal)}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {item.nama}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {item.kategori}
                      </td>

                      <td
                        className={`px-8 py-4 text-sm font-bold text-right ${
                          item.tipe === "Pemasukan"
                            ? "text-[#10B981]"
                            : "text-[#EF4444]"
                        }`}
                      >
                        {formatRupiah(item.jumlah)}
                      </td>

                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.tipe === "Pemasukan"
                                ? "bg-[#10B981]"
                                : "bg-[#EF4444]"
                            }`}
                          ></span>

                          <span
                            className={`text-sm font-bold ${
                              item.tipe === "Pemasukan"
                                ? "text-[#10B981]"
                                : "text-[#EF4444]"
                            }`}
                          >
                            {item.tipe}
                          </span>
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
                        Belum ada data transaksi ZIS. Klik tombol "Catat
                        Pemasukan ZIS" atau "Catat Pengeluaran ZIS" untuk
                        menambahkan data pertama Anda.
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between m-10">
              <p className="text-sm text-gray-500 font-medium">
                Halaman {safePage} dari {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    safePage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Sebelumnya
                </button>

                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    safePage === totalPages
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
      </div>
    </PageTransition>
  );
}
