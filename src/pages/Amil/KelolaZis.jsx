import React, { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, X } from "lucide-react";
import PageTransition from "../../components/PageTransition";
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
    if (k.includes("zakat fitrah")) return "Zakat Fitrah";
    if (k === "infaq") return "Infaq";
    if (k === "shodaqoh") return "Sedekah";
    return kategoriApi;
  };

  const toApiKategori = (kategoriUi) => {
    const k = (kategoriUi || "").toString().trim().toLowerCase();
    if (k === "zakat maal" || k === "zakat mal") return "zakat mal";
    if (k === "zakat fitrah") return "zakat fitrah uang";
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
        id: `PZ-${item?.id ?? ""}`,
        tanggal: item?.tanggal_penghimpunan ?? item?.created_at ?? null,
        nama:
          item?.nama_muzakki ||
          muzakkiSafe.find((m) => String(m?.id) === String(item?.muzakki_id))
            ?.nama_lengkap ||
          "-",
        kategori: toUiKategori(item?.kategori),
        nominal: Number(item?.jumlah ?? 0),
        tipe: "Pemasukan",
      }));

      const pengeluaranRows = (
        Array.isArray(pengeluaranArr) ? pengeluaranArr : []
      ).map((item) => ({
        id: `KZ-${item?.id ?? ""}`,
        tanggal: item?.tanggal_penyaluran ?? item?.created_at ?? null,
        nama: mustahikNameById.get(String(item?.mustahik_id)) || "-",
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

  useEffect(() => {
    loadTotalZIS();
    loadData();
  }, []);

  // ─── Perhitungan Otomatis (Real-time) ───
  const totalPenerimaan = transactions
    .filter((t) => t.tipe === "Pemasukan")
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPenyaluran = transactions
    .filter((t) => t.tipe === "Pengeluaran")
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

  const openModal = (mode) => {
    setModalMode(mode);
    setErrorMsg("");
    setIsModalOpen(true);
    setSearchMuzakki("");
    setSearchMustahik("");
    setSelectedMuzakki(null);
    setSelectedMustahik(null);
    setFormData({
      tanggal: "",
      kategori: "Zakat Maal",
      deskripsi: "",
      nominal: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const nominal = Number.parseFloat(formData.nominal) || 0;
      const kategoriApi = toApiKategori(formData.kategori);

      if (!formData.tanggal) {
        setErrorMsg("Tanggal wajib diisi");
        return;
      }

      if (!nominal || nominal <= 0) {
        setErrorMsg("Jumlah wajib diisi dan harus > 0");
        return;
      }

      if (modalMode === "PEMASUKAN") {
        const muzakkiId = selectedMuzakki?.value ?? null;
        if (!muzakkiId) {
          setErrorMsg("Silakan pilih muzakki (minimal ketik untuk mencari)");
          return;
        }
        await addPemasukanZIS({
          muzakki_id: muzakkiId,
          kategori: kategoriApi,
          jumlah: nominal,
          deskripsi: formData.deskripsi || "",
          tanggal_penghimpunan: formData.tanggal,
        });
      } else {
        const mustahikId = selectedMustahik?.value ?? null;
        if (!mustahikId) {
          setErrorMsg("Silakan pilih mustahik (minimal ketik untuk mencari)");
          return;
        }
        await addPengeluaranZIS({
          mustahik_id: mustahikId,
          kategori: kategoriApi,
          jumlah: nominal,
          deskripsi: formData.deskripsi || "",
          tanggal_penyaluran: formData.tanggal,
        });
      }

      setIsModalOpen(false);
      setFormData({
        tanggal: "",
        kategori: "Zakat Maal",
        deskripsi: "",
        nominal: "",
      });
      await loadData();

      await Swal.fire({
        title: "Berhasil",
        text:
          modalMode === "PEMASUKAN"
            ? "Pemasukan ZIS berhasil disimpan"
            : "Pengeluaran ZIS berhasil disimpan",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10B981",
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Gagal menyimpan transaksi ZIS";
      setErrorMsg(msg);

      await Swal.fire({
        title: "Gagal",
        text: msg,
        icon: "error",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#10B981",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );

    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

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

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* ─── Top Summary Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              TOTAL PENERIMAAN ZIS
            </p>
            <h3 className="text-3xl font-extrabold text-[#10B981]">
              {formatRupiah(totalPenerimaan)}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              TOTAL PENGELUARAN
            </p>
            <h3 className="text-3xl font-extrabold text-[#EF4444]">
              {formatRupiah(totalPenyaluran)}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              SALDO ZIS
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900">
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
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 mt-5">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <select
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="">Kategori ZIS</option>
              <option value="Zakat Maal">Zakat Maal</option>
              <option value="Zakat Fitrah">Zakat Fitrah</option>
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
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-all">
              <Download size={18} /> Unduh Data
            </button>
            <button
              onClick={() => openModal("PEMASUKAN")}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-[#059669] shadow-sm transition-all"
            >
              <Plus size={18} strokeWidth={2.5} /> Pemasukan
            </button>
            <button
              onClick={() => openModal("PENGELUARAN")}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-all"
            >
              <Plus size={18} strokeWidth={2.5} /> Pengeluaran
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
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    ID TRANSAKSI
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    TANGGAL
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NAMA
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    KATEGORI
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NOMINAL (RP)
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
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
                      key={trx.id}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">
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
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                        {trx.nama}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600 text-center">
                        {trx.kategori}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${trx.tipe === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"}`}
                      >
                        {formatRupiah(trx.nominal).replace("Rp", "").trim()}
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
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-sm font-medium text-gray-500"
                    >
                      Data tidak ditemukan.
                    </td>
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

        {/* ─── MODAL POP-UP CATAT ZIS ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {modalMode === "PEMASUKAN"
                    ? "Catat Pemasukan ZIS"
                    : "Catat Pengeluaran ZIS"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {modalMode === "PEMASUKAN"
                      ? "Tanggal Penghimpunan"
                      : "Tanggal Penyaluran"}
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
                    {modalMode === "PEMASUKAN" ? "Muzakki" : "Mustahik"}
                  </label>

                  {modalMode === "PEMASUKAN" ? (
                    <Select
                      options={limitedOptions(muzakkiOptions, searchMuzakki)}
                      placeholder="Cari muzakki..."
                      onInputChange={(value) => setSearchMuzakki(value)}
                      value={selectedMuzakki}
                      onChange={(opt) => setSelectedMuzakki(opt)}
                      isClearable
                      className="text-sm"
                    />
                  ) : (
                    <Select
                      options={limitedOptions(mustahikOptions, searchMustahik)}
                      placeholder="Cari mustahik..."
                      onInputChange={(value) => setSearchMustahik(value)}
                      value={selectedMustahik}
                      onChange={(opt) => setSelectedMustahik(opt)}
                      isClearable
                      className="text-sm"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Sumber Dana (Kategori)
                  </label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="Zakat Maal">Zakat Maal</option>
                    <option value="Zakat Fitrah">Zakat Fitrah</option>
                    <option value="Infaq">Infaq</option>
                    <option value="Sedekah">Sedekah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    placeholder="Masukkan deskripsi..."
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Jumlah (Rp)
                  </label>
                  <input
                    type="number"
                    name="nominal"
                    required
                    value={formData.nominal}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
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
