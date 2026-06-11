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
import totalZISService from "../../services/totalZIS.service";
import BottomSummaryCards from "../../components/shared/BottomSummarycards";
import { exportZISPdf } from "../../utils/exportZISPdf";
import {
  formatThousands,
  parseThousandsToNumber,
} from "../../utils/formatThousands";
import { formatDateInput, formattedDate } from "../../utils/formattedDate";
import ModalsEditZIS from "../../components/shared/ZIS/ModalsEditZIS";
import ModalsNewDataZIS from "../../components/shared/ZIS/ModalsNewDataZIS";
import ZisTable from "../../components/shared/ZIS/ZISTable";
import { validationDataZIS } from "../../utils/ValidationDataZIS";

// Halaman Kelola ZIS (Amil): catat pemasukan/pengeluaran ZIS via modal, lihat
// ringkasan total, daftar transaksi dengan filter/pencarian/pagination, unduh PDF.
export default function KelolaZis() {
  // ─── States ───
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setErrorMsg] = useState("");
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
  const [errors, setErrors] = useState({});

  // Ubah nama kategori dari format server → format tampilan (UI).
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

  // Kebalikan toUiKategori: format UI → format server (sebelum dikirim ke API).
  const toApiKategori = (kategoriUi) => {
    const k = (kategoriUi || "").toString().trim().toLowerCase();
    if (k === "zakat maal" || k === "zakat mal") return "zakat mal";
    if (k === "zakat fitrah uang") return "zakat fitrah uang";
    if (k === "zakat fitrah beras") return "zakat fitrah beras";
    if (k === "infaq") return "infaq";
    if (k === "sedekah" || k === "shodaqoh") return "shodaqoh";
    return "infaq";
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

  // Format nilai saldo: KG untuk zakat fitrah beras, Rupiah untuk lainnya.
  const formatSaldoValue = (kategoriLike, value) => {
    const k = (kategoriLike || "").toString().toLowerCase();
    const n = Number(value);
    if (Number.isNaN(n)) return "-";

    if (k.includes("beras")) {
      return `${formatThousands(String(n))} Kg`;
    }

    return formatRupiah(n);
  };

  // Amankan teks agar tidak ditafsirkan sebagai HTML (cegah XSS) di dialog HTML.
  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  // Susun detail (kategori & saldo tersedia) dari error server, mis. saat
  // penyaluran melebihi saldo — untuk ditampilkan di dialog error.
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

  // Pastikan hasil dari API selalu berbentuk array.
  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  // Ubah daftar muzakki menjadi opsi dropdown untuk react-select.
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

  // Batasi opsi dropdown: 3 teratas bila belum mengetik, atau hasil pencarian.
  const limitedOptions = (options, query) => {
    const q = (query || "").toString().trim().toLowerCase();
    if (!q) return options.slice(0, 3);
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  };

  // Cari opsi dropdown yang cocok berdasarkan id; jika tidak ada, cocokkan nama.
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

  // Muat semua data ZIS (muzakki, mustahik, pemasukan, pengeluaran) sekaligus,
  // lalu gabungkan jadi 1 daftar transaksi terurut tanggal.
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
        const da = new Date(a?.tanggal || 0).getTime();
        const db = new Date(b?.tanggal || 0).getTime();

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

  const totalPenyaluran = transactions
    .filter(
      (item) =>
        item.tipe?.toLowerCase() === "pengeluaran" &&
        item.kategori !== "Zakat Fitrah Beras",
    )
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

  // ─── Filter & Search Logic ───
  // Saring transaksi sesuai pencarian + filter (kategori, tipe, bulan, tahun).
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return (transactions || []).filter((trx) => {
      const nama = (trx?.nama || "").toString().toLowerCase();
      const id = (trx?.id || "").toString().toLowerCase();
      const kategori = (trx?.kategori || "").toString().toLowerCase();
      const tipe = (trx?.tipe || "").toString().toLowerCase();
      const d = formatDateInput(trx?.tanggal);

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
  // ─── Handlers ───
  // Update field form; khusus nominal (selain beras) diformat ribuan saat diketik.
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nominal" && !isBeras) {
      setFormData((prev) => ({
        ...prev,
        [name]: formatThousands(value),
      }));
      return;
    }
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Buka modal dalam mode tertentu (PEMASUKAN/PENGELUARAN) & reset isian form.
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

  // Tutup modal dengan konfirmasi & kosongkan form.
  const handleCloseModal = () => {
    setErrors({});
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

  // Simpan transaksi ZIS: validasi nominal/tanggal/penerima, lalu kirim ke
  // endpoint pemasukan (muzakki) atau pengeluaran (mustahik) sesuai mode modal.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const nominal = isBeras
        ? Number.parseFloat(formData.nominal) || 0
        : parseThousandsToNumber(formData.nominal);
      const kategoriApi = toApiKategori(formData.kategori);

      const validationErrors = validationDataZIS({
        formData,
        modalMode,
        selectedMuzakki,
        selectedMustahik,
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});

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

  // Ambil nilai total satu kategori dari hasil rekap server.
  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );

    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

  // Unduh data transaksi yang sedang tampil ke PDF.
  const handleDownloadPDF = () => {
    exportZISPdf({ historyData: filteredTransactions });
  };

  // Penanda apakah kategori terpilih adalah zakat fitrah beras (satuan KG).
  const isBeras = formData.kategori === "Zakat Fitrah Beras";

  // Saat halaman pertama dibuka, muat rekap total & seluruh data transaksi.
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

  // Buka modal edit: isi form edit + pilih ulang muzakki/mustahik sesuai transaksi.
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

  // Tutup modal edit & kosongkan form edit beserta pilihan muzakki/mustahik.
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

  // Simpan hasil edit transaksi ZIS: validasi, lalu update ke server.
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
        <ZisTable
          data={filteredTransactions}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          showActions={true}
        />
      </div>

      <ModalsNewDataZIS
        isOpen={isModalOpen}
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleCloseModal={handleCloseModal}
        isSubmitting={isSubmitting}
        isBeras={isBeras}
        selectedMuzakki={selectedMuzakki}
        setSelectedMuzakki={setSelectedMuzakki}
        selectedMustahik={selectedMustahik}
        setSelectedMustahik={setSelectedMustahik}
        muzakkiOptions={muzakkiOptions}
        mustahikOptions={mustahikOptions}
        searchMuzakki={searchMuzakki}
        setSearchMuzakki={setSearchMuzakki}
        searchMustahik={searchMustahik}
        setSearchMustahik={setSearchMustahik}
        limitedOptions={limitedOptions}
        errors={errors}
      />

      <ModalsEditZIS
        isOpen={isEditModalOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        selectedMuzakki={selectedMuzakki}
        setSelectedMuzakki={setSelectedMuzakki}
        selectedMustahik={selectedMustahik}
        setSelectedMustahik={setSelectedMustahik}
        muzakkiOptions={muzakkiOptions}
        mustahikOptions={mustahikOptions}
        searchMuzakki={searchMuzakki}
        setSearchMuzakki={setSearchMuzakki}
        searchMustahik={searchMustahik}
        setSearchMustahik={setSearchMustahik}
        limitedOptions={limitedOptions}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />
    </PageTransition>
  );
}
