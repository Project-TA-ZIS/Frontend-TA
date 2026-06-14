import React, { useEffect, useMemo, useState } from "react";
import PageTransition from "../../components/shared/PageTransition";
import { Download, Plus, Search, X } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";
import { formatRupiah } from "../../utils/formatRupiah";
import totalZISService from "../../services/totalZIS.service";
import BottomSummaryCards from "../../components/shared/BottomSummarycards";
import { exportZISPdf } from "../../utils/exportZISPdf";
import ZisTable from "../../components/shared/ZIS/ZISTable";
import { getAvailableYears } from "../../utils/getAvailableYears";
import { formatDateInput } from "../../utils/formattedDate";
import MonthList from "../../utils/monthList";
import ZisFilterBar from "../../components/shared/ZIS/ZisFilterBar";

// Halaman Laporan/Manajemen ZIS untuk anggota: menampilkan ringkasan total,
// daftar transaksi (pemasukan & pengeluaran) dengan filter, pencarian,
// pagination, serta tombol unduh PDF.
export default function LaporanZisAnggota() {
  // ─── States ───
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // States Filter
  const [filterKategori, setFilterKategori] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [filterTipe, setFilterTipe] = useState("");

  const [saldoZIS, setSaldoZIS] = useState(0);
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [totalZIS, setTotalZIS] = useState([]);

  // Ubah nama kategori dari format server → format tampilan (UI).
  // Contoh: "zakat mal" → "Zakat Maal", "shodaqoh" → "Sedekah".
  const toUiKategori = (kategoriApi) => {
    const k = (kategoriApi || "").toString().trim().toLowerCase();
    if (!k) return "-";
    if (k.includes("zakat mal")) return "Zakat Maal";
    if (k.includes("zakat fitrah uang")) return "Zakat Fitrah Uang";
    if (k.includes("zakat fitrah beras")) return "Zakat Fitrah Beras";
    if (k === "infaq") return "Infaq";
    if (k === "shodaqoh") return "Sedekah";
    return kategoriApi;
  };

  // Ubah string tanggal menjadi objek Date secara aman (null bila tidak valid).
  const parseDateSafe = (dateLike) => {
    if (!dateLike) return null;
    const safe = String(dateLike).trim();
    if (!safe) return null;
    const looksLikeDateTime = safe.includes("T") || /\d{2}:\d{2}/.test(safe);
    const d = looksLikeDateTime ? new Date(safe) : new Date(`${safe}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Pastikan hasil dari API selalu berbentuk array (server kadang membungkus
  // data di dalam properti .data).
  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  // Muat data ZIS (pemasukan & pengeluaran) lalu gabungkan jadi 1 daftar
  // transaksi terurut tanggal. Memakai Promise.allSettled agar 1 request gagal
  // tidak membatalkan lainnya.
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const settled = await Promise.allSettled([
        pemasukanZISService.getAllPemasukanZIS(),
        pengeluaranZISService.getAllPengeluaranZIS(),
      ]);

      // Anggap error 404 sebagai "data kosong" (bukan kegagalan fatal).
      const is404 = (err) => err?.response?.status === 404;

      // Ambil hasil 1 request: array bila sukses, [] bila 404, null bila error lain.
      const pickArr = (idx) => {
        const r = settled[idx];
        if (r.status === "fulfilled") return normalizeArray(r.value);
        if (is404(r.reason)) return [];
        return null;
      };

      const pemasukanArr = pickArr(0);
      const pengeluaranArr = pickArr(1);

      const pemasukanRows = (
        Array.isArray(pemasukanArr) ? pemasukanArr : []
      ).map((item) => ({
        id: `${item?.id ?? ""}`,
        uniqueKey: `pemasukan-zis-${item.id}`,
        tanggal: item?.tanggal_penghimpunan ?? item?.created_at ?? null,
        nama: item?.nama_muzakki || "-",
        kategori: toUiKategori(item?.kategori),
        nominal: Number(item?.jumlah ?? 0),
        tipe: "Pemasukan",
        deskripsi: item?.deskripsi ?? "",
      }));

      const pengeluaranRows = (
        Array.isArray(pengeluaranArr) ? pengeluaranArr : []
      ).map((item) => ({
        id: `${item?.id ?? ""}`,
        uniqueKey: `pengeluaran-zis-${item.id}`,
        tanggal: item?.tanggal_penyaluran ?? item?.created_at ?? null,
        nama: item?.nama_mustahik || "-",
        kategori: toUiKategori(item?.kategori),
        nominal: Number(item?.jumlah ?? 0),
        tipe: "Pengeluaran",
        deskripsi: item?.deskripsi ?? "",
      }));

      // Gabung pemasukan + pengeluaran, lalu urutkan dari tanggal terbaru.
      const combined = [...pemasukanRows, ...pengeluaranRows].sort((a, b) => {
        const da = parseDateSafe(a?.tanggal)?.getTime() ?? 0;
        const db = parseDateSafe(b?.tanggal)?.getTime() ?? 0;
        return db - da;
      });

      setTransactions(combined);

      const firstError = settled.find(
        (x) => x.status === "rejected" && !is404(x.reason),
      );
      if (firstError) {
        setErrorMsg(
          firstError.reason?.response?.data?.message ||
            firstError.reason?.response?.data?.error ||
            firstError.reason?.message ||
            "Gagal memuat sebagian data ZIS",
        );
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal memuat data ZIS",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Muat rekap total ZIS per kategori dan total saldo ZIS dari server.
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

  // ─── Perhitungan Otomatis (Real-time) ───
  // Total penerimaan = jumlah semua pemasukan (kecuali zakat fitrah beras/KG).
  const totalPenerimaan = transactions
    .filter(
      (item) =>
        item.tipe?.toLowerCase() === "pemasukan" &&
        item.kategori !== "Zakat Fitrah Beras",
    )
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

  // Total penyaluran = jumlah semua pengeluaran (kecuali zakat fitrah beras/KG).
  const totalPenyaluran = transactions
    .filter(
      (t) => t.tipe === "Pengeluaran" && t.kategori !== "Zakat Fitrah Beras",
    )
    .reduce((acc, curr) => acc + curr.nominal, 0);

  // Saldo = total penerimaan dikurangi total penyaluran.
  // ─── Filter & Search Logic ───
  // Saring daftar transaksi sesuai kata kunci pencarian + filter (kategori,
  // tipe, bulan, tahun). Dihitung ulang hanya saat data/filter berubah.
  const tahunList = getAvailableYears(transactions);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return (transactions || []).filter((trx) => {
      const nama = (trx?.nama || "").toString().toLowerCase();
      const id = (trx?.id || "").toString().toLowerCase();
      const kategori = (trx?.kategori || "").toString().toLowerCase();
      const tipe = (trx?.tipe || "").toString().toLowerCase();
      const tanggalDisplay = formatDateInput(trx?.tanggal);
      const tanggalFilter = new Date(trx?.tanggal);

      const matchesSearch =
        !q ||
        nama.includes(q) ||
        id.includes(q) ||
        kategori.includes(q) ||
        tipe.includes(q);

      const matchesKategori = filterKategori
        ? trx?.kategori === filterKategori
        : true;
      const matchesTipe = filterTipe ? trx?.tipe === filterTipe : true;

      const matchesBulan = filterBulan
        ? tanggalFilter.toLocaleString("id-ID", { month: "long" }) ===
          filterBulan
        : true;

      const matchesTahun = filterTahun
        ? tanggalFilter.getFullYear().toString() === filterTahun
        : true;
      return (
        matchesSearch &&
        matchesKategori &&
        matchesTipe &&
        matchesBulan &&
        matchesTahun
      );
    });
  }, [
    transactions,
    searchQuery,
    filterKategori,
    filterTipe,
    filterBulan,
    filterTahun,
  ]);

  // Ambil nilai total satu kategori dari hasil rekap server (totalZIS).
  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );

    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

  // Saat halaman pertama dibuka, muat rekap total & seluruh data transaksi.
  useEffect(() => {
    loadTotalZIS();
    loadData();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        {/* ─── Header ─── */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Manajemen ZIS
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Kelola penerimaan dan pengeluaran dana ZIS secara transparan.
          </p>
        </div>

        {/* ─── Summary Cards ─── */}
        <BottomSummaryCards
          totalPenerimaan={totalPenerimaan}
          totalPenyaluran={totalPenyaluran}
          saldoZIS={saldoZIS}
          saldoUpdatedAt={saldoUpdatedAt}
          getTotalByKategori={getTotalByKategori}
        />

        {/* ─── Filter & Action Bar ─── */}
        <ZisFilterBar
          filterKategori={filterKategori}
          setFilterKategori={setFilterKategori}
          filterBulan={filterBulan}
          setFilterBulan={setFilterBulan}
          filterTahun={filterTahun}
          setFilterTahun={setFilterTahun}
          filterTipe={filterTipe}
          setFilterTipe={setFilterTipe}
          MonthList={MonthList}
          tahunList={tahunList}
          onDownload={() => {
            exportZISPdf({
              historyData: filteredTransactions,
            });
          }}
          onTambahPemasukan={() => openModal("PEMASUKAN")}
          onTambahPengeluaran={() => openModal("PENGELUARAN")}
          onEdit={false}
        />

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
        <ZisTable
          data={filteredTransactions}
          isLoading={isLoading}
          searchQuery={searchQuery}
          showActions={false}
        />
      </div>
    </PageTransition>
  );
}
