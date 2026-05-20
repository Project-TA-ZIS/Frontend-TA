import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, Search } from "lucide-react";
import PageTransition from "../../components/PageTransition";
import Footer from "../../components/layout/Footer";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import penyaluranZISService from "../../services/pengeluaranZIS.service";
import totalZISService from "../../services/totalZIS.service";
import Swal from "sweetalert2";

export default function ManajemenZis() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [zisData, setZisData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalZIS, setTotalZIS] = useState([]);
  const [totalPenerimaan, setTotalPenerimaan] = useState(0);
  const [totalPenyaluran, setTotalPenyaluran] = useState(0);
  const [saldoZIS, setSaldoZIS] = useState(0);
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const searchPemasukanByNIK = async () => {
    try {
      if (!searchQuery.trim()) {
        Swal.fire({
          icon: "warning",
          title: "NIK wajib diisi",
          text: "Masukkan NIK terlebih dahulu",
          confirmButtonColor: "#10B981",
        });

        return;
      }

      const { value: lastPhone } = await Swal.fire({
        title: "Verifikasi Nomor Telepon",
        text: "Masukkan 4 digit terakhir nomor telepon",
        input: "text",
        inputPlaceholder: "****",
        inputAttributes: {
          maxlength: 4,
        },
        confirmButtonText: "Verifikasi",
        confirmButtonColor: "#10B981",
        showCancelButton: true,
        cancelButtonText: "Batal",
        inputValidator: (value) => {
          if (!value) {
            return "4 digit terakhir wajib diisi!";
          }

          if (value.length !== 4) {
            return "Harus 4 digit!";
          }
        },
      });

      if (!lastPhone) return;

      setIsLoading(true);

      const res = await pemasukanZISService.getPemasukanZISByNIK({
        nik: searchQuery,
        last_phone_digits: lastPhone,
      });

      const data = res?.data || [];

      if (data.length === 0) {
        setShowTable(false);

        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan",
          text: "Tidak ada riwayat transaksi dengan NIK tersebut.",
          confirmButtonColor: "#EF4444",
        });

        return;
      }

      const mappedData = data.map((item) => ({
        id: `PZ-${item.id}`,
        tanggal:
          item.tanggal_penghimpunan || item.created_at || item.updated_at,
        nama: item.nama_muzakki || "-",
        kategori: item.kategori || "-",
        nominal: Number(item.jumlah || 0),
        tipe: "Pemasukan",
      }));

      setHistoryData(mappedData);
      setShowTable(true);

      Swal.fire({
        icon: "success",
        title: "Data ditemukan",
        text: `${mappedData.length} transaksi ditemukan`,
        confirmButtonColor: "#10B981",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
      setShowTable(false);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat mencari data.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  // const loadZISData = async () => {
  //   try {
  //     setIsLoading(true);

  //     const results = await Promise.allSettled([
  //       pemasukanZISService.getAllPemasukanZIS(),
  //       penyaluranZISService.getAllPengeluaranZIS(),
  //     ]);

  //     const is404 = (err) => err?.response?.status === 404;

  //     let pemasukan = [];
  //     let pengeluaran = [];
  //     let mustahikArr = [];

  //     // PEMASUKAN
  //     if (results[0].status === "fulfilled") {
  //       pemasukan = normalizeArray(results[0].value).map((item) => ({
  //         id: `PZ-${item?.id ?? ""}`,
  //         tanggal:
  //           item?.tanggal_penghimpunan ?? item?.created_at ?? item?.updated_at,
  //         nama: item?.nama_muzakki ?? "-",
  //         kategori: item?.kategori ?? "-",
  //         jumlah: Number(item?.jumlah ?? 0),
  //         tipe: "Pemasukan",
  //       }));
  //     }

  //     // PENGELUARAN
  //     if (results[1].status === "fulfilled") {
  //       pengeluaran = normalizeArray(results[1].value).map((item) => ({
  //         id: `KZ-${item?.id ?? ""}`,
  //         tanggal:
  //           item?.tanggal_penyaluran ?? item?.created_at ?? item?.updated_at,
  //         mustahik_id: item?.mustahik_id ?? null,
  //         nama: "-",
  //         kategori: item?.kategori ?? "-",
  //         jumlah: Number(item?.jumlah ?? 0),
  //         deskripsi: item?.deskripsi ?? "",
  //         tipe: "Pengeluaran",
  //       }));
  //     }

  //     // MUSTAHIK (untuk nama pengeluaran)
  //     if (results[2].status === "fulfilled") {
  //       mustahikArr = normalizeArray(results[2].value);
  //     } else if (results[2].status === "rejected" && is404(results[2].reason)) {
  //       mustahikArr = [];
  //     }

  //     const mustahikNameById = new Map(
  //       (mustahikArr || []).map((m) => [String(m?.id), m?.nama_lengkap || "-"]),
  //     );

  //     pengeluaran = pengeluaran.map((item) => ({
  //       ...item,
  //       nama:
  //         mustahikNameById.get(String(item?.mustahik_id ?? "")) || item.nama,
  //     }));

  //     const combinedData = [...pemasukan, ...pengeluaran].sort((a, b) => {
  //       const da = parseDateSafe(a?.tanggal)?.getTime() ?? 0;
  //       const db = parseDateSafe(b?.tanggal)?.getTime() ?? 0;
  //       return db - da;
  //     });

  //     // TOTAL PEMASUKAN
  //     const totalMasuk = pemasukan.reduce(
  //       (acc, item) => acc + Number(item.jumlah),
  //       0,
  //     );

  //     // TOTAL PENGELUARAN
  //     const totalKeluar = pengeluaran.reduce(
  //       (acc, item) => acc + Number(item.jumlah),
  //       0,
  //     );

  //     setTotalPenerimaan(totalMasuk);
  //     setTotalPenyaluran(totalKeluar);

  //     setZisData(combinedData);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
    // loadZISData();
    loadTotalZIS();
  }, []);

  const getTotalByKategori = (kategori) => {
    const found = totalZIS.find(
      (item) => item.kategori.toLowerCase() === kategori.toLowerCase(),
    );

    return found ? Number(found.jumlah_keseluruhan) : 0;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <nav className="w-full bg-[#F0FDF4] px-6 md:px-12 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F766E] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-extrabold text-[#0F766E] text-lg leading-tight tracking-wide">
                DASAWISMA
              </h1>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                LENTENG AGUNG
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#F0FDF4] rounded-xl p-1 border border-emerald-100/50">
            <Link
              to="/"
              className="px-6 py-2 rounded-lg text-gray-500 hover:bg-white hover:text-[#0F766E] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Home
            </Link>
            <Link
              to="/dashboard-publik"
              className="px-6 py-2 rounded-lg text-gray-500 hover:bg-white hover:text-[#0F766E] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/zis-publik"
              className="px-6 py-2 rounded-lg bg-white text-[#0F766E] shadow-sm font-bold text-xs uppercase tracking-wider transition-all"
            >
              Laporan ZIS
            </Link>
          </div>

          <div>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              Masuk
            </button>
          </div>
        </nav>

        {/* ─── KONTEN UTAMA (full width) ─── */}
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

          {/* SEARCH & SUBMIT FORM */}
          <div className="flex flex-col items-center justify-center mt-10 mb-6">
            <p className="text-[#0F766E] font-bold text-center mb-4">
              Masukkan NIK dan 4 digit terakhir nomor telepon untuk melihat
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchPemasukanByNIK();
              }}
              className="flex items-center gap-3 w-full max-w-xl"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />

                <input
                  type="text"
                  placeholder="Cari riwayat transaksi anda"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200/60 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
                />
              </div>

              <button
                type="submit"
                className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 shrink-0"
              >
                Cari Data
              </button>
            </form>
          </div>

          {/* TABEL TRANSAKSI */}
          {showTable && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* HEADER TABLE */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F766E]">
                    Riwayat Transaksi
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Data transaksi ZIS berdasarkan NIK
                  </p>
                </div>

                <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm transition-all hover:bg-gray-50 shadow-sm">
                  <Download size={18} />
                  Unduh Data
                </button>
              </div>

              {/* TABLE */}
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
    </PageTransition>
  );
}
