import React, { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { formatRupiah } from "../../../utils/formatRupiah";
import { formattedDate } from "../../../utils/formattedDate";

const PAGE_SIZE = 5; // jumlah baris per halaman

// Tabel transaksi kas yang dapat diurutkan (sort) per kolom dan dibagi halaman
// (pagination). Props: data = daftar transaksi, onEdit = aksi tombol edit,
// showAction = tampilkan kolom aksi atau tidak.
export default function KasTable({ data = [], onEdit, showAction = true }) {
  const [page, setPage] = useState(1);

  // Konfigurasi pengurutan: kolom (key) & arah (asc/desc).
  const [sortConfig, setSortConfig] = useState({
    key: "tanggal",
    direction: "desc",
  });

  // Kembali ke halaman 1 setiap kali data berubah. Memakai pola "sesuaikan
  // state saat render" (bandingkan data sebelumnya) yang lebih disarankan
  // React daripada memanggil setState di dalam useEffect.
  const [prevData, setPrevData] = useState(data);
  if (prevData !== data) {
    setPrevData(data);
    setPage(1);
  }

  // Atur pengurutan saat header kolom diklik. Siklusnya: asc → desc → tanpa urut.
  const handleSort = (key) => {
    if (sortConfig.key !== key) {
      setSortConfig({
        key,
        direction: "asc",
      });
      return;
    }

    if (sortConfig.direction === "asc") {
      setSortConfig({
        key,
        direction: "desc",
      });
      return;
    }

    if (sortConfig.direction === "desc") {
      setSortConfig({
        key: null,
        direction: null,
      });
    }
  };

  // Data hasil pengurutan sesuai sortConfig (tanggal & nominal diurut numerik,
  // teks diurut alfabet). Dihitung ulang saat data atau konfigurasi berubah.
  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return [...data];
    }

    return [...data].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "tanggal") {
        aValue = new Date(a.tanggal).getTime();
        bValue = new Date(b.tanggal).getTime();
      }

      if (sortConfig.key === "nominal") {
        aValue = Number(a.nominal);
        bValue = Number(b.nominal);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }

      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [data, sortConfig]);

  // Pilih ikon panah pada header kolom sesuai status pengurutan kolom tsb.
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} />;
    }

    if (sortConfig.direction === "asc") {
      return <ChevronUp size={14} />;
    }

    if (sortConfig.direction === "desc") {
      return <ChevronDown size={14} />;
    }

    return <ArrowUpDown size={14} />;
  };

  // Hitung total halaman & pastikan halaman aktif tidak melebihi batas.
  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  // Ambil potongan data untuk halaman yang sedang ditampilkan saja.
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;

    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, safePage]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                No
              </th>

              <th
                onClick={() => handleSort("tanggal")}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100
                ${
                  sortConfig.key === "tanggal"
                    ? "text-[#10B981]"
                    : "text-gray-500"
                }
              `}
              >
                <div className="flex items-center justify-center gap-1">
                  TANGGAL
                  {renderSortIcon("tanggal")}
                </div>
              </th>

              <th
                onClick={() => handleSort("namaAnggota")}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100
                ${
                  sortConfig.key === "namaAnggota"
                    ? "text-[#10B981]"
                    : "text-gray-500"
                }
              `}
              >
                <div className="flex items-center justify-center gap-1">
                  NAMA
                  {renderSortIcon("namaAnggota")}
                </div>
              </th>

              <th
                onClick={() => handleSort("sumber")}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100
                ${
                  sortConfig.key === "sumber"
                    ? "text-[#10B981]"
                    : "text-gray-500"
                }
              `}
              >
                <div className="flex items-center justify-center gap-1">
                  SUMBER
                  {renderSortIcon("sumber")}
                </div>
              </th>

              <th
                onClick={() => handleSort("deskripsi")}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100
                ${
                  sortConfig.key === "deskripsi"
                    ? "text-[#10B981]"
                    : "text-gray-500"
                }
              `}
              >
                <div className="flex items-center justify-center gap-1">
                  DESKRIPSI
                  {renderSortIcon("deskripsi")}
                </div>
              </th>

              <th
                onClick={() => handleSort("jenis")}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100
                ${
                  sortConfig.key === "jenis"
                    ? "text-[#10B981]"
                    : "text-gray-500"
                }
              `}
              >
                <div className="flex items-center justify-center gap-1">
                  JENIS
                  {renderSortIcon("jenis")}
                </div>
              </th>

              <th
                onClick={() => handleSort("nominal")}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100
                ${
                  sortConfig.key === "nominal"
                    ? "text-[#10B981]"
                    : "text-gray-500"
                }
              `}
              >
                <div className="flex items-center justify-center gap-1">
                  NOMINAL (RP)
                  {renderSortIcon("nominal")}
                </div>
              </th>

              {showAction && (
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-36">
                  AKSI
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={showAction ? 8 : 7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Belum ada transaksi kas yang tercatat.
                </td>
              </tr>
            )}

            {paginatedData.map((trx, index) => (
              <tr
                key={`${trx.jenis}-${trx.id}`}
                className="hover:bg-emerald-50/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E]">
                  {index + 1 + (safePage - 1) * PAGE_SIZE}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 tracking-wider text-center">
                  {formattedDate(trx.tanggal)}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                  {trx.namaAnggota || "-"}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                  {trx.sumber || "-"}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                  {trx.deskripsi}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      trx.jenis === "Pemasukan"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {trx.jenis}
                  </span>
                </td>

                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-extrabold text-center ${
                    trx.jenis === "Pemasukan"
                      ? "text-[#10B981]"
                      : "text-[#EF4444]"
                  }`}
                >
                  Rp {formatRupiah(trx.nominal).replace("Rp", "").trim()}
                </td>

                {showAction && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit?.(trx)}
                        className="text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between m-6">
          <p className="text-xs text-gray-400 font-bold">
            Halaman {safePage} dari {totalPages}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
  );
}
