import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Search, AlertCircle, CheckCircle2, X } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import LogoDasawisma from "../../assets/Logo.svg";
import LogoDasawismaPNG from "../../assets/Logo.png";
import Footer from "../../components/layout/Footer";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import muzakkiService from "../../services/muzakki.service";
import totalZISService from "../../services/totalZIS.service";
import Swal from "sweetalert2";
import NavbarUmum from "../../components/shared/NavbarUmum";
import BottomSummaryCards from "../../components/shared/BottomSummarycards";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";
import { exportZISPdf } from "../../utils/exportZISPdf";
import ZisTable from "../../components/shared/ZIS/ZISTable";

// Halaman ZIS publik (tanpa login): ringkasan total ZIS + fitur cek riwayat
// transaksi pribadi dengan verifikasi NIK + 4 digit terakhir nomor HP.
export default function ManajemenZis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // State untuk mengontrol Modal Popup Nomor HP
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [modalError, setModalError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [totalZIS, setTotalZIS] = useState([]);
  const [saldoZIS, setSaldoZIS] = useState(0);
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Muat rekap total ZIS per kategori dan total saldo ZIS dari server.
  const loadTotalZIS = async () => {
    try {
      const res = await totalZISService.getTotalZISbyKategori();
      const resSaldoZIS = await totalZISService.getTotalZIS();

      setTotalZIS(res.data || []);
      setSaldoZIS(Number(resSaldoZIS.data.total_uang_zis || 0));
      setSaldoUpdatedAt(resSaldoZIS.data.updated_at || "");
    } catch (error) {
      console.log(error);
    }
  };

  // Pastikan hasil dari API selalu berbentuk array.
  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  // Muat semua transaksi ZIS (untuk perhitungan total penerimaan/penyaluran).
  const loadData = async () => {
    try {
      const [pemasukanRes, pengeluaranRes] = await Promise.all([
        pemasukanZISService.getAllPemasukanZIS(),
        pengeluaranZISService.getAllPengeluaranZIS(),
      ]);

      const pemasukanRows = normalizeArray(pemasukanRes).map((item) => ({
        nominal: Number(item.jumlah || 0),
        kategori: item.kategori || "-",
        tipe: "Pemasukan",
      }));

      const pengeluaranRows = normalizeArray(pengeluaranRes).map((item) => ({
        nominal: Number(item.jumlah || 0),
        kategori: item.kategori || "-",
        tipe: "Pengeluaran",
      }));

      setTransactions([...pemasukanRows, ...pengeluaranRows]);
    } catch (error) {
      console.log(error);
    }
  };

  // Saat halaman pertama dibuka, muat rekap total & seluruh data transaksi.
  useEffect(() => {
    loadTotalZIS();
    loadData();
  }, []);

  // Ambil nilai total satu kategori dari hasil rekap server.
  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );
    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

  // ─── Perhitungan Otomatis (Real-time) ───
  // Total penerimaan = jumlah semua pemasukan (kecuali zakat fitrah beras/KG).
  const totalPenerimaan = transactions
    .filter((item) => {
      const kategori = item.kategori?.trim().toLowerCase();

      return (
        item.tipe?.toLowerCase() === "pemasukan" &&
        kategori !== "zakat fitrah beras"
      );
    })
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

  const totalPenyaluran = transactions
    .filter((item) => {
      const kategori = item.kategori?.trim().toLowerCase();

      return (
        item.tipe?.toLowerCase() === "pengeluaran" &&
        kategori !== "zakat fitrah beras"
      );
    })
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

  // ─── TAHAP 1: Klik "Cari Data" (Validasi NIK & Buka Modal) ───
  // Validasi NIK terisi, lalu buka modal verifikasi nomor HP.
  const handleSearchClick = async (e) => {
    e.preventDefault();
    setAlertMessage(null);
    setModalError("");

    if (!searchQuery.trim()) {
      setAlertMessage({
        type: "warning",
        text: "NIK wajib diisi terlebih dahulu!",
      });
      return;
    }

    // NIK terisi, buka modal popup nomor HP
    setPhoneDigits("");

    try {
      await muzakkiService.getMuzakkiByNik(searchQuery.trim());
      setShowPhoneModal(true);
    } catch (error) {
      setAlertMessage({
        type: "error",
        text: "Data NIK tidak ditemukan.",
      });
    }
  };

  // ─── TAHAP 2: Klik "Verifikasi" di dalam Modal (Eksekusi API) ───
  // Verifikasi 4 digit terakhir HP, lalu ambil riwayat transaksi berdasarkan NIK.
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!phoneDigits || phoneDigits.length !== 4) {
      setModalError("4 digit terakhir nomor telepon wajib diisi lengkap!");
      return;
    }

    // Lolos verifikasi awal, tutup modal dan mulai loading
    setShowPhoneModal(false);

    setIsLoading(true);
    setShowTable(false);

    try {
      const res = await pemasukanZISService.getPemasukanZISByNIK({
        nik: searchQuery,
        last_phone_digits: phoneDigits,
      });

      const data = res?.data || [];

      if (data.length === 0) {
        setAlertMessage({
          type: "error",
          text: "Tidak ada riwayat transaksi dengan NIK tersebut.",
        });
        return;
      }

      const mappedData = data.map((item) => {
        const tipeRaw = (item.tipe || item.jenis_transaksi || "").toLowerCase();

        return {
          id: `${item.id}`,
          tanggal:
            item.tanggal_penghimpunan || item.created_at || item.updated_at,
          nama: item.nama_muzakki || "-",
          deskripsi: item.deskripsi || "-",
          kategori: item.kategori || "-",
          nominal: Number(item.jumlah || 0),

          tipe:
            tipeRaw.includes("keluar") ||
            tipeRaw.includes("pengeluaran") ||
            tipeRaw.includes("penyaluran")
              ? "Pengeluaran"
              : "Pemasukan",
        };
      });

      setHistoryData(mappedData);
      setPage(1);
      setShowTable(true);

      setAlertMessage({
        type: "success",
        text: `${mappedData.length} transaksi berhasil ditemukan.`,
      });

      // Hilangkan notifikasi sukses setelah 3 detik
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.log(error);
      setShowTable(false);
      setAlertMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat mencari data ke server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Unduh riwayat transaksi yang ditemukan ke PDF.
  const handleDownloadPDF = () => {
    exportZISPdf({ historyData });
  };

  // Hitung total halaman & ambil potongan data untuk halaman aktif (pagination).
  const totalPages = Math.max(1, Math.ceil(historyData.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedHistoryData = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return historyData.slice(start, start + PAGE_SIZE);
  }, [historyData, safePage]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col relative">
        {/* ─── NAVBAR PUBLIK ─── */}
        <NavbarUmum />

        {/* ─── KONTEN UTAMA ─── */}
        <main className="w-full px-6 md:px-12 lg:px-20 py-8 flex-1">
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F766E] mb-2">
              Manajemen ZIS
            </h2>
            <p className="text-gray-500 font-medium">
              Kelola penerimaan dan penyaluran dana ZIS secara transparan.
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

          {/* ─── FORM PENCARIAN ─── */}
          <div className="flex flex-col items-center justify-center mt-12 mb-8">
            <p className="text-[#0F766E] font-bold text-center mb-4">
              Cari riwayat transaksi ZIS berdasarkan NIK Anda
            </p>

            <form
              onSubmit={handleSearchClick}
              className="flex flex-col gap-3 w-full max-w-2xl"
            >
              {/* Notifikasi Linear (Hanya muncul jika ada error NIK/Sukses) */}
              {alertMessage && (
                <div
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
                    alertMessage.type === "error"
                      ? "bg-red-50 text-red-600 border border-red-200/50"
                      : alertMessage.type === "success"
                        ? "bg-[#F0FDF4] text-[#0F766E] border border-[#10B981]/30"
                        : "bg-amber-50 text-amber-700 border border-amber-200/50"
                  }`}
                >
                  {alertMessage.type === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {alertMessage.text}
                </div>
              )}

              {/* Baris Input NIK */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <div className="relative flex-1 w-full">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Masukkan NIK Anda..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim() === "") setShowTable(false);
                    }}
                    className="w-full bg-gray-100 border border-gray-200/60 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold px-8 py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 shrink-0 w-full sm:w-auto"
                >
                  {isLoading ? "Memproses..." : "Cari Data"}
                </button>
              </div>
            </form>
          </div>

          {/* ─── TABEL TRANSAKSI ─── */}
          {showTable && (
            <div>
              <div className="mb-[10px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F766E]">
                      Riwayat Transaksi
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Data transaksi ZIS berdasarkan NIK{" "}
                      <span className="font-extrabold text-gray-500">
                        {searchQuery}
                      </span>{" "}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg text-xs transition-all hover:bg-gray-50 shadow-sm"
                  >
                    <Download size={14} /> Unduh Data
                  </button>
                </div>
              </div>
              <ZisTable
                data={paginatedHistoryData}
                isLoading={isLoading}
                searchQuery={searchQuery}
                showActions={false}
              />
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* ─── CUSTOM MODAL POPUP (VERIFIKASI NOMOR HP) ─── */}
      {showPhoneModal && (
        // PERBAIKAN: Menambahkan font-['Manrope'] di sini agar teks modal seragam
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-['Manrope']">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 relative">
              {/* Tombol Close (Silang) */}
              <button
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#10B981] mb-4">
                <AlertCircle size={24} strokeWidth={2.5} />
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 mb-1.5">
                Verifikasi Akses
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                Untuk keamanan privasi, silakan masukkan{" "}
                <span className="font-bold text-gray-700">
                  4 digit terakhir nomor telepon
                </span>{" "}
                yang terdaftar pada NIK Anda.
              </p>

              {/* Peringatan Error Lokal di Modal */}
              {modalError && (
                <p className="text-[11px] font-bold text-red-500 mb-3 bg-red-50 p-2 rounded-lg text-center">
                  {modalError}
                </p>
              )}

              <form onSubmit={handleVerifyPhone}>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  4 Digit Terakhir Nomor Telepon
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  value={phoneDigits}
                  onChange={(e) =>
                    setPhoneDigits(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-xl py-3 px-4 text-center text-2xl tracking-[0.5em] font-extrabold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white focus:border-[#0F766E] transition-all mb-6"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPhoneModal(false)}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-3 rounded-xl text-xs transition-all shadow-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm active:scale-95"
                  >
                    Verifikasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
