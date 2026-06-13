import React, { useEffect, useMemo, useState } from "react";
import { Download, Plus, X } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import Swal from "sweetalert2";
import pengeluaranService from "../../services/pengeluaranDasawisma.service";
import pemasukanDasawismaService from "../../services/pemasukanDasawisma.service";
import totalKasDasawismaService from "../../services/totalKasDasawisma.service";
import KasSummaryCards from "../../components/shared/KasSummaryCards";
import { exportKasDasawismaPdf } from "../../utils/exportKasDasawismaPdf";
import KasTable from "../../components/shared/Dasawisma/kasTable";
import { getAvailableYears } from "../../utils/getAvailableYears";
import MonthList from "../../utils/monthList";
import KasFilterBar from "../../components/shared/Dasawisma/KasFilterBar";

// Halaman Laporan/Manajemen Kas Dasawisma untuk anggota: ringkasan saldo,
// daftar transaksi kas (pemasukan & pengeluaran) dengan filter, dan unduh PDF.
export default function LaporanKasAnggota() {
  const [saldoUpdatedAt, setSaldoUpdatedAt] = useState("");
  const [saldoKasDasawisma, setSaldoKasDasawisma] = useState(0);

  // ─── States Data ───
  const [transactions, setTransactions] = useState([]);

  const [summary, setSummary] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
  });

  const [filterJenis, setFilterJenis] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  // Saring transaksi sesuai filter jenis, bulan, dan tahun. Dihitung ulang
  // hanya saat data atau filter berubah.
  const tahunList = getAvailableYears(transactions);

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
  // Muat data kas: ambil pemasukan & pengeluaran, ubah ke bentuk seragam,
  // gabung + urutkan dari terbaru, lalu hitung ringkasan (masuk/keluar/saldo).
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
          anggota_dasawisma_id: item.anggota_dasawisma_id,
        }));
      } catch {
        console.log("Pemasukan kosong");
      }

      try {
        const pengeluaranRes = await pengeluaranService.getAllPengeluaran();

        pengeluaranData = (pengeluaranRes.data || []).map((item) => ({
          id: item.id,
          tanggal: item.tanggal_penyaluran,
          deskripsi: item.deskripsi,
          jenis: "Pengeluaran",
          sumber: "Uang Kas Dasawisma",
          nominal: Number(item.jumlah),
          namaAnggota: item.nama_anggota,
        }));
      } catch {
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

  // Ambil saldo total kas dasawisma + waktu terakhir diperbarui dari server.
  const loadTotalKasDasawisma = async () => {
    try {
      const res = await totalKasDasawismaService.getTotalKasDasawisma();
      setSaldoKasDasawisma(Number(res.data?.jumlah_keseluruhan || 0));
      setSaldoUpdatedAt(res.data?.updated_at || "");
    } catch {
      console.log("Gagal memuat total kas dasawisma");
    }
  };

  // ─── useEffect ───
  // Saat halaman dibuka: muat data kas, daftar anggota, dan total saldo.
  // Dibungkus fungsi async di dalam effect agar pemanggilan loader (yang
  // memperbarui state) berjalan asinkron, bukan sinkron saat render.
  useEffect(() => {
    const init = async () => {
      await loadKasData();
      await loadTotalKasDasawisma();
    };
    init();
  }, []);

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-gray-50 p-6 md:p-10"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
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
        <KasFilterBar
          filterJenis={filterJenis}
          setFilterJenis={setFilterJenis}
          filterBulan={filterBulan}
          setFilterBulan={setFilterBulan}
          filterTahun={filterTahun}
          setFilterTahun={setFilterTahun}
          MonthList={MonthList}
          tahunList={tahunList}
          onExport={() =>
            exportKasDasawismaPdf({
              historyData: filteredTransactions,
              totalKasDaswisma: saldoKasDasawisma,
            })
          }
          onAdd={() => setIsModalOpen(true)}
          onEdit={false}
        />
        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {/* INI BAGIAN TABLE, JANGAN DI REFACTORING LAGI */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <KasTable data={filteredTransactions} showAction={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
