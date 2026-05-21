import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, Search, AlertCircle, CheckCircle2, X } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import LogoDasawisma from "../../assets/Logo.svg";
import LogoDasawismaPNG from "../../assets/Logo.png";
import Footer from "../../components/layout/Footer";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import totalZISService from "../../services/totalZIS.service";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ManajemenZis() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);

  // State untuk mengontrol Modal Popup Nomor HP
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [modalError, setModalError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [totalZIS, setTotalZIS] = useState([]);
  const [totalPenerimaan, setTotalPenerimaan] = useState(0);
  const [totalPenyaluran, setTotalPenyaluran] = useState(0);
  const [saldoZIS, setSaldoZIS] = useState(0);
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [showTable, setShowTable] = useState(false);

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

  useEffect(() => {
    loadTotalZIS();
  }, []);

  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );
    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

  // ─── TAHAP 1: Klik "Cari Data" (Validasi NIK & Buka Modal) ───
  const handleSearchClick = (e) => {
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
    setShowPhoneModal(true);
  };

  // ─── TAHAP 2: Klik "Verifikasi" di dalam Modal (Eksekusi API) ───
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

      const mappedData = data.map((item) => ({
        id: `PZ-${item.id}`,
        tanggal:
          item.tanggal_penghimpunan || item.created_at || item.updated_at,
        nama: item.nama_muzakki || "-",
        deskripsi: item.deskripsi || "-",
        kategori: item.kategori || "-",
        nominal: Number(item.jumlah || 0),
        tipe: "Pemasukan",
      }));

      setHistoryData(mappedData);
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
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col relative">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <nav className="w-full bg-[#F0FDF4]/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-emerald-100/50 sticky top-0 z-50 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* ─── LOGO SVG ─── */}
            <img
              src={LogoDasawisma}
              alt="Logo Dasawisma"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
              // Memperbesar logo secara signifikan: h-12 (tinggi 48px) untuk layar kecil, h-16 (tinggi 64px) untuk layar medium ke atas.
              // w-auto memastikan aspek rasio logo tetap terjaga. object-contain untuk mencegah distorsi.
              className="h-15 md:h-17 w-auto object-contain drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* ─── BAGIAN TENGAH: MENU NAVIGASI ─── */}
          {/* Tambahan absolute left-1/2 dan -translate-x-1/2 akan memaksa elemen berada tepat di tengah layar */}
          <div className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full p-1.5 border border-emerald-100/60 shadow-[0_2px_10px_-4px_rgba(15,118,110,0.1)] absolute left-1/2 -translate-x-1/2">
            {/* Tautan HOME */}
            <Link
              to="/"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Home
            </Link>

            {/* Tautan DASHBOARD */}
            <Link
              to="/dashboard-publik"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/dashboard-publik"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Dashboard
            </Link>

            {/* Tautan LAPORAN ZIS */}
            <Link
              to="/zis-publik"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/zis-publik"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Laporan ZIS
            </Link>
          </div>

          <div>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-8 py-2.5 rounded-full text-sm transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Masuk
            </button>
          </div>
        </nav>

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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F766E]">
                    Riwayat Transaksi
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Data transaksi ZIS berdasarkan NIK {searchQuery}
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg text-xs transition-all hover:bg-gray-50 shadow-sm"
                >
                  <Download size={14} /> Unduh Data
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                        ID Transaksi
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                        Tanggal
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                        Nominal
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                        Tipe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {historyData.map((tx, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/40 transition-colors"
                      >
                        <td className="py-4 px-6 text-xs font-bold text-[#0F766E] text-center">
                          {tx.id}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-gray-400 text-center">
                          {formattedDate(tx.tanggal)}
                        </td>
                        <td className="py-4 px-6 text-xs font-extrabold text-gray-900">
                          {tx.nama_muzakki || tx.nama || "-"}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-gray-500">
                          {tx.kategori}
                        </td>
                        <td className="py-4 px-6 text-xs font-extrabold text-center text-[#0F766E]">
                          {formatRupiah(tx.nominal)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {tx.tipe}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
