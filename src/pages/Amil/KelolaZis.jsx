import React, { useEffect, useMemo, useState } from "react";
import PageTransition from "../../components/shared/PageTransition";
import { Download, Edit, Plus, Search, X } from "lucide-react";
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
import {
  formatThousands,
  parseThousandsToNumber,
} from "../../utils/formatThousands";

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

  const formatSaldoValue = (kategoriLike, value) => {
    const k = (kategoriLike || "").toString().toLowerCase();
    const n = Number(value);
    if (Number.isNaN(n)) return "-";

    if (k.includes("beras")) {
      return `${formatThousands(String(n))} Kg`;
    }

    return formatRupiah(n);
  };

  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  const saldoErrorDetails = (err) => {
    const data = err?.response?.data;
    const saldo = data?.saldo_tersedia;
    const kategori = data?.kategori;

    if (saldo === undefined && !kategori) return null;

    const parts = [];
    if (kategori)
      parts.push({ label: "Kategori", value: String(kategori) || "-" });
    if (saldo !== undefined)
      parts.push({
        label: "Saldo tersedia",
        value: formatSaldoValue(kategori, saldo),
      });

    if (!parts.length) return null;

    const html = parts
      .map(
        (p) =>
          `<div><b>${escapeHtml(p.label)}:</b> ${escapeHtml(p.value)}</div>`,
      )
      .join("");

    return { html };
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

  const findOptionByIdOrName = (options, id, name) => {
    if (!Array.isArray(options) || options.length === 0) return null;

    const idStr = id === undefined || id === null ? "" : String(id);
    if (idStr) {
      const byId = options.find((opt) => String(opt?.value) === idStr);
      if (byId) return byId;
    }

    const nameStr = (name || "").toString().trim();
    if (nameStr) {
      const byName = options.find(
        (opt) => (opt?.label || "").toString().trim() === nameStr,
      );
      if (byName) return byName;

      return { value: id ?? nameStr, label: nameStr };
    }

    return null;
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
        uniqueKey: `pemasukan-zis-${item.id}`,
        tanggal: item?.tanggal_penghimpunan ?? item?.created_at ?? null,
        muzakki_id:
          item?.muzakki_id ??
          item?.muzakkiId ??
          item?.id_muzakki ??
          item?.muzakki?.id ??
          null,
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
        mustahik_id:
          item?.mustahik_id ??
          item?.mustahikId ??
          item?.id_mustahik ??
          item?.mustahik?.id ??
          null,
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
      (item) =>
        item.tipe?.toLowerCase() === "pengeluaran" &&
        item.kategori !== "Zakat Fitrah Beras",
    )
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

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

    if (name === "nominal" && !isBeras) {
      setFormData((prev) => ({
        ...prev,
        [name]: formatThousands(value),
      }));
      return;
    }

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
        setFormData({
          tanggal: "",
          kategori: "Zakat Maal",
          deskripsi: "",
          nominal: "",
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const nominal = isBeras
        ? Number.parseFloat(formData.nominal) || 0
        : parseThousandsToNumber(formData.nominal);
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
      await loadTotalZIS();

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

      const extra = saldoErrorDetails(err);

      await Swal.fire({
        title: "Gagal",
        ...(extra
          ? { html: `<div>${escapeHtml(msg)}</div><br/>${extra.html}` }
          : { text: msg }),
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

  const handleDownloadPDF = () => {
    exportZISPdf({ historyData: filteredTransactions });
  };

  const isBeras = formData.kategori === "Zakat Fitrah Beras";

  useEffect(() => {
    loadTotalZIS();
    loadData();
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedZIS, setSelectedZIS] = useState(null);
  const [editForm, setEditForm] = useState({
    tanggal: "",
    deskripsi: "",
    nominal: "",
    jenis: "",
    sumber: "",
    nama: "",
  });

  const handleEdit = (trx) => {
    setSelectedZIS(trx);

    setSearchMuzakki("");
    setSearchMustahik("");

    setEditForm({
      tanggal: trx.tanggal || "",
      deskripsi: trx.deskripsi || "",
      nominal: formatThousands(trx.nominal || 0),
      jenis: trx.tipe || "",
      sumber: trx.kategori || "",
      nama: trx.nama || "",
    });

    if (trx.tipe === "Pemasukan") {
      const muzakki = findOptionByIdOrName(
        muzakkiOptions,
        trx.muzakki_id,
        trx.nama,
      );
      setSelectedMuzakki(muzakki);
      setSelectedMustahik(null);
    } else {
      const mustahik = findOptionByIdOrName(
        mustahikOptions,
        trx.mustahik_id,
        trx.nama,
      );
      setSelectedMustahik(mustahik);
      setSelectedMuzakki(null);
    }

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedZIS(null);

    setSearchMuzakki("");
    setSearchMustahik("");
    setSelectedMuzakki(null);
    setSelectedMustahik(null);

    setEditForm({
      tanggal: "",
      deskripsi: "",
      nominal: "",
      jenis: "",
      sumber: "",
      nama: "",
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (!selectedZIS) return;

      const kategoriApi = toApiKategori(editForm.sumber);
      const jumlah = parseThousandsToNumber(editForm.nominal);

      if (!editForm.tanggal) {
        await Swal.fire({
          icon: "warning",
          title: "Validasi",
          text: "Tanggal wajib diisi",
          confirmButtonColor: "#10B981",
        });
        return;
      }

      if (!editForm.deskripsi?.trim()) {
        await Swal.fire({
          icon: "warning",
          title: "Validasi",
          text: "Deskripsi wajib diisi",
          confirmButtonColor: "#10B981",
        });
        return;
      }

      if (!jumlah || jumlah <= 0) {
        await Swal.fire({
          icon: "warning",
          title: "Validasi",
          text: "Nominal wajib diisi dan harus > 0",
          confirmButtonColor: "#10B981",
        });
        return;
      }

      if (selectedZIS.tipe === "Pemasukan") {
        const muzakkiId = selectedMuzakki?.value ?? null;
        if (!muzakkiId) {
          await Swal.fire({
            icon: "warning",
            title: "Validasi",
            text: "Silakan pilih muzakki",
            confirmButtonColor: "#10B981",
          });
          return;
        }

        await pemasukanZISService.updatePemasukanZIS(selectedZIS.id, {
          muzakki_id: muzakkiId,
          nama_muzakki: selectedMuzakki?.label ?? editForm.nama ?? "",
          kategori: kategoriApi,
          jumlah,
          deskripsi: editForm.deskripsi,
          tanggal_penghimpunan: editForm.tanggal,
        });
      } else {
        const mustahikId = selectedMustahik?.value ?? null;
        if (!mustahikId) {
          await Swal.fire({
            icon: "warning",
            title: "Validasi",
            text: "Silakan pilih mustahik",
            confirmButtonColor: "#10B981",
          });
          return;
        }

        await pengeluaranZISService.updatePengeluaranZIS(selectedZIS.id, {
          mustahik_id: mustahikId,
          kategori: kategoriApi,
          jumlah,
          deskripsi: editForm.deskripsi,
          tanggal_penyaluran: editForm.tanggal,
        });
      }

      await loadData();
      await loadTotalZIS();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data berhasil diperbarui",
      });

      handleCloseEditModal();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal mengupdate data";
      const extra = saldoErrorDetails(error);
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

  useEffect(() => {
    if (!isEditModalOpen || !selectedZIS) return;

    if (selectedZIS.tipe === "Pemasukan") {
      if (!selectedMuzakki) {
        setSelectedMuzakki(
          findOptionByIdOrName(
            muzakkiOptions,
            selectedZIS.muzakki_id,
            selectedZIS.nama,
          ),
        );
      }
      return;
    }

    if (!selectedMustahik) {
      setSelectedMustahik(
        findOptionByIdOrName(
          mustahikOptions,
          selectedZIS.mustahik_id,
          selectedZIS.nama,
        ),
      );
    }
  }, [
    isEditModalOpen,
    selectedZIS,
    muzakkiOptions,
    mustahikOptions,
    selectedMuzakki,
    selectedMustahik,
  ]);

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
          <div className="flex flex-col xl:flex-row gap-2 w-full xl:w-auto">
            {/* Tombol Download */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm w-full xl:w-auto"
            >
              <Download size={16} />
              Unduh Data
            </button>

            {/* Tombol Tambah */}
            <div className="grid grid-cols-2 gap-2 w-full xl:w-auto">
              <button
                onClick={() => openModal("PEMASUKAN")}
                className="flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-[#059669] shadow-sm transition-all"
              >
                <Plus size={18} strokeWidth={2.5} />
                Pemasukan
              </button>

              <button
                onClick={() => openModal("PENGELUARAN")}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-all"
              >
                <Plus size={18} strokeWidth={2.5} />
                Pengeluaran
              </button>
            </div>
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
                    NO
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
                    DESKRIPSI
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    NOMINAL (RP)
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    TIPE
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                    Aksi
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
                      key={trx.uniqueKey}
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
                      <td className="px-6 py-4 text-sm font-medium text-gray-600 text-center">
                        {trx.deskripsi}
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(trx)}
                            className="text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                            title="Edit"
                          >
                            <Edit size={15} />
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
                        Data ZIS belum tersedia. Klik tombol "Pemasukan" atau
                        "Pengeluaran" untuk menambahkan data pertama Anda.
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between m-6">
              <p className="text-xs text-gray-400 font-bold">
                Halaman {safePage} dari {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    safePage <= 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    safePage >= totalPages
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
                  onClick={handleCloseModal}
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
                    <span className="text-red-500"> *</span>
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
                    <span className="text-red-500"> *</span>
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
                    Kategori
                    <span className="text-red-500"> *</span>
                  </label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="Zakat Maal">Zakat Maal</option>
                    <option value="Zakat Fitrah Uang">Zakat Fitrah Uang</option>
                    <option value="Zakat Fitrah Beras">
                      Zakat Fitrah Beras
                    </option>
                    <option value="Infaq">Infaq</option>
                    <option value="Sedekah">Sedekah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Deskripsi
                    <span className="text-red-500"> *</span>
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
                    {isBeras ? "Jumlah Beras (KG)" : "Jumlah (Rp)"}
                    <span className="text-red-500"> *</span>
                  </label>

                  <input
                    type={isBeras ? "number" : "text"}
                    name="nominal"
                    required
                    step={isBeras ? "0.1" : undefined}
                    inputMode={isBeras ? undefined : "numeric"}
                    pattern={isBeras ? undefined : "[0-9.]*"}
                    value={formData.nominal}
                    onChange={handleInputChange}
                    placeholder={isBeras ? "Contoh: 2.5" : "0"}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
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
                <div>
                  <label className="text-xs font-bold text-gray-500">
                    {editForm.jenis === "Pemasukan" ? "Muzakki" : "Mustahik"}
                    <span className="text-red-500"> *</span>
                  </label>

                  {editForm.jenis === "Pemasukan" ? (
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
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">
                  Sumber
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  value={editForm.sumber}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      sumber: e.target.value,
                    })
                  }
                  className="w-full mt-1 bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="Zakat Maal">Zakat Maal</option>
                  <option value="Zakat Fitrah Uang">Zakat Fitrah Uang</option>
                  <option value="Zakat Fitrah Beras">Zakat Fitrah Beras</option>
                  <option value="Infaq">Infaq</option>
                  <option value="Sedekah">Sedekah</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">
                  Tanggal
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="date"
                  value={
                    editForm.tanggal
                      ? new Date(editForm.tanggal).toISOString().split("T")[0]
                      : ""
                  }
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
                  <span className="text-red-500"> *</span>
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
                  <span className="text-red-500"> *</span>
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
