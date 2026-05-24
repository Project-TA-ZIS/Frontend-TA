import React, { useEffect, useMemo, useState } from "react";
import PageTransition from "../../components/shared/PageTransition";
import { Download, Plus, Search, X } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import muzakkiService from "../../services/muzakki.service";
import mustahikService from "../../services/mustahik.service";
import pemasukanZISService, {
  addPemasukanZIS,
} from "../../services/pemasukanZIS.service";
import pengeluaranZISService, {
  addPengeluaranZIS,
} from "../../services/pengeluaranZIS.service";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";
import totalZISService from "../../services/totalZIS.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoDasawisma from "../../assets/logo.png";
import BottomSummaryCards from "../../components/shared/BottomSummarycards";
import { exportZISPdf } from "../../utils/exportZISPdf";

const PAGE_SIZE = 5;

export default function KelolaZis() {
  // ─── States ───
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [muzakkiList, setMuzakkiList] = useState([]);
  const [mustahikList, setMustahikList] = useState([]);

  // States Filter
  const [filterKategori, setFilterKategori] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [filterTipe, setFilterTipe] = useState("");

  // States Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("PEMASUKAN"); // PEMASUKAN | PENGELUARAN
  const [searchMuzakki, setSearchMuzakki] = useState("");
  const [searchMustahik, setSearchMustahik] = useState("");
  const [selectedMuzakki, setSelectedMuzakki] = useState(null);
  const [selectedMustahik, setSelectedMustahik] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: "",
    kategori: "Zakat Maal",
    deskripsi: "",
    nominal: "",
  });
  const [saldoZIS, setSaldoZIS] = useState(0);
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [totalZIS, setTotalZIS] = useState([]);

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

  const toApiKategori = (kategoriUi) => {
    const k = (kategoriUi || "").toString().trim().toLowerCase();
    if (k === "zakat maal" || k === "zakat mal") return "zakat mal";
    if (k === "zakat fitrah uang") return "zakat fitrah uang";
    if (k === "zakat fitrah beras") return "zakat fitrah beras";
    if (k === "infaq") return "infaq";
    if (k === "sedekah" || k === "shodaqoh") return "shodaqoh";
    return "infaq";
  };

  const parseDateSafe = (dateLike) => {
    if (!dateLike) return null;
    const safe = String(dateLike).trim();
    if (!safe) return null;
    const looksLikeDateTime = safe.includes("T") || /\d{2}:\d{2}/.test(safe);
    const d = looksLikeDateTime ? new Date(safe) : new Date(`${safe}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const muzakkiOptions = useMemo(() => {
    return (muzakkiList || []).map((m) => ({
      value: m?.id,
      label: `${m?.nama_lengkap ?? "-"}`,
    }));
  }, [muzakkiList]);

  const mustahikOptions = useMemo(() => {
    return (mustahikList || []).map((m) => ({
      value: m?.id,
      label: `${m?.nama_lengkap ?? "-"}`,
    }));
  }, [mustahikList]);

  const limitedOptions = (options, query) => {
    const q = (query || "").toString().trim().toLowerCase();
    if (!q) return options.slice(0, 3);
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  };

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const settled = await Promise.allSettled([
        muzakkiService.getAllMuzakki(),
        mustahikService.getAllMustahik(),
        pemasukanZISService.getAllPemasukanZIS(),
        pengeluaranZISService.getAllPengeluaranZIS(),
      ]);

      const is404 = (err) => err?.response?.status === 404;

      const pickArr = (idx) => {
        const r = settled[idx];
        if (r.status === "fulfilled") return normalizeArray(r.value);
        if (is404(r.reason)) return [];
        return null;
      };

      const muzakkiArr = pickArr(0);
      const mustahikArr = pickArr(1);
      const pemasukanArr = pickArr(2);
      const pengeluaranArr = pickArr(3);

      const muzakkiSafe = Array.isArray(muzakkiArr) ? muzakkiArr : [];
      const mustahikSafe = Array.isArray(mustahikArr) ? mustahikArr : [];
      const mustahikNameById = new Map(
        mustahikSafe.map((m) => [String(m?.id), m?.nama_lengkap || "-"]),
      );

      const pemasukanRows = (
        Array.isArray(pemasukanArr) ? pemasukanArr : []
      ).map((item) => ({
        id: `${item?.id ?? ""}`,
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
        tanggal: item?.tanggal_penyaluran ?? item?.created_at ?? null,
        nama: item?.nama_mustahik || "-",
        kategori: toUiKategori(item?.kategori),
        nominal: Number(item?.jumlah ?? 0),
        tipe: "Pengeluaran",
        deskripsi: item?.deskripsi ?? "",
      }));

      const combined = [...pemasukanRows, ...pengeluaranRows].sort((a, b) => {
        const da = parseDateSafe(a?.tanggal)?.getTime() ?? 0;
        const db = parseDateSafe(b?.tanggal)?.getTime() ?? 0;
        return db - da;
      });

      setMuzakkiList(muzakkiSafe);
      setMustahikList(mustahikSafe);
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
  const totalPenerimaan = transactions
    .filter(
      (item) =>
        item.tipe?.toLowerCase() === "pemasukan" &&
        item.kategori !== "Zakat Fitrah Beras",
    )
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

  const totalPenyaluran = transactions
    .filter(
      (t) => t.tipe === "Pengeluaran" && t.kategori !== "Zakat Fitrah Beras",
    )
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoTotal = totalPenerimaan - totalPenyaluran;

  // Fungsi hitung per kategori (Hanya menghitung Pemasukan)
  const calcTotalKategori = (kategori) => {
    return transactions
      .filter((t) => t.kategori === kategori && t.tipe === "Pemasukan")
      .reduce((acc, curr) => acc + curr.nominal, 0);
  };

  // ─── Filter & Search Logic ───
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return (transactions || []).filter((trx) => {
      const nama = (trx?.nama || "").toString().toLowerCase();
      const id = (trx?.id || "").toString().toLowerCase();
      const kategori = (trx?.kategori || "").toString().toLowerCase();
      const tipe = (trx?.tipe || "").toString().toLowerCase();
      const d = parseDateSafe(trx?.tanggal);

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
        ? d?.toLocaleString("id-ID", { month: "long" }) === filterBulan
        : true;

      const matchesTahun = filterTahun
        ? (d?.getFullYear?.() ?? "").toString() === filterTahun
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

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterKategori, filterBulan, filterTahun, filterTipe]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, safePage]);

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );

    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

  const isBeras = formData.kategori === "Zakat Fitrah Beras";

  useEffect(() => {
    loadTotalZIS();
    loadData();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

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
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 mt-5">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="">Kategori ZIS</option>
              <option value="Zakat Maal">Zakat Maal</option>
              <option value="Zakat Fitrah Uang">Zakat Fitrah Uang</option>
              <option value="Zakat Fitrah Beras">Zakat Fitrah Beras</option>
              <option value="Infaq">Infaq</option>
              <option value="Sedekah">Sedekah</option>
            </select>
            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option value="">Bulan</option>
              <option value="April">April</option>
              <option value="Maret">Maret</option>
            </select>
            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
            >
              <option value="">Tahun</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
            >
              <option value="">Tipe</option>
              <option value="Pemasukan">Pemasukan</option>
              <option value="Pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <button
              onClick={() => exportZISPdf({ historyData: filteredTransactions })}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm w-full md:w-auto"
            >
              <Download size={16} />
              Unduh Data
            </button>
          </div>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    NO
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    TANGGAL
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    NAMA
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    KATEGORI
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    NOMINAL (RP)
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    TIPE
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
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((trx, index) => (
                    <tr
                      key={`${trx.tipe}-${trx.id}`}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E]">
                        {index + 1 + (safePage - 1) * PAGE_SIZE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                        {trx.tanggal
                          ? new Date(trx.tanggal).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[12px] font-bold text-gray-900 text-center">
                        {trx.nama}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600 text-center">
                        {trx.kategori}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${trx.tipe === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"}`}
                      >
                        {trx.kategori === "Zakat Fitrah Beras"
                          ? `${trx.nominal} KG`
                          : formatRupiah(trx.nominal).replace("Rp", "").trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${trx.tipe === "Pemasukan" ? "bg-[#10B981]" : "bg-[#EF4444]"}`}
                          ></span>
                          <span
                            className={`text-xs font-bold ${trx.tipe === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"}`}
                          >
                            {trx.tipe}
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
                        Data ZIS belum tersedia. Klik tombol "Pemasukan" atau
                        "Pengeluaran" untuk menambahkan data pertama Anda.
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination (maks 5 data per halaman) */}
        <div className="flex items-center justify-between mb-10">
          <p className="text-sm font-medium text-gray-500">
            Halaman <span className="font-bold text-gray-700">{safePage}</span>{" "}
            dari <span className="font-bold text-gray-700">{totalPages}</span>{" "}
            (total{" "}
            <span className="font-bold text-gray-700">
              {filteredTransactions.length}
            </span>{" "}
            data)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
