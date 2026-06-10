import React, { useMemo, useState } from "react";
import { ArrowUpDown, ChevronUp, ChevronDown, Edit } from "lucide-react";

import { formatRupiah } from "../../../utils/formatRupiah";
import { formattedDate } from "../../../utils/formattedDate";

const PAGE_SIZE = 5;

export default function ZisTable({
  data = [],
  isLoading = false,
  searchQuery = "",
  onEdit,
  showActions = true,
}) {
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: "tanggal",
    direction: "desc",
  });

  const [prevData, setPrevData] = useState(data);

  if (prevData !== data) {
    setPrevData(data);
    setPage(1);
  }

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

    setSortConfig({
      key: null,
      direction: null,
    });
  };

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

  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return [...data];
    }

    return [...data].sort((a, b) => {
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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;

    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, safePage]);

  const sortableHeader = (label, key) => (
    <th
      onClick={() => handleSort(key)}
      className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100
      ${sortConfig.key === key ? "text-[#10B981]" : "text-gray-500"}`}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {renderSortIcon(key)}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                NO
              </th>

              {sortableHeader("TANGGAL", "tanggal")}
              {sortableHeader("NAMA", "nama")}
              {sortableHeader("KATEGORI", "kategori")}
              {sortableHeader("DESKRIPSI", "deskripsi")}
              {sortableHeader("NOMINAL (RP)", "nominal")}
              {sortableHeader("TIPE", "tipe")}

              {showActions && (
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
                  AKSI
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={showActions ? 8 : 7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Memuat data...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((trx, index) => (
                <tr
                  key={trx.uniqueKey}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="px-6 py-4 text-center text-sm font-bold text-[#0F766E]">
                    {index + 1 + (safePage - 1) * PAGE_SIZE}
                  </td>

                  <td className="px-6 py-4 text-center text-sm">
                    {trx.tanggal ? formattedDate(new Date(trx.tanggal)) : "-"}
                  </td>

                  <td className="px-6 py-4 text-center text-sm font-bold">
                    {trx.nama}
                  </td>

                  <td className="px-6 py-4 text-center text-sm">
                    {trx.kategori}
                  </td>

                  <td className="px-6 py-4 text-center text-sm">
                    {trx.deskripsi}
                  </td>

                  <td
                    className={`px-6 py-4 text-center text-sm font-bold ${
                      trx.tipe === "Pemasukan"
                        ? "text-[#10B981]"
                        : "text-[#EF4444]"
                    }`}
                  >
                    {trx.kategori === "Zakat Fitrah Beras"
                      ? `${trx.nominal} KG`
                      : formatRupiah(trx.nominal).replace("Rp", "").trim()}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          trx.tipe === "Pemasukan"
                            ? "bg-[#10B981]"
                            : "bg-[#EF4444]"
                        }`}
                      />

                      <span
                        className={`text-xs font-bold ${
                          trx.tipe === "Pemasukan"
                            ? "text-[#10B981]"
                            : "text-[#EF4444]"
                        }`}
                      >
                        {trx.tipe}
                      </span>
                    </div>
                  </td>

                  {showActions && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onEdit?.(trx)}
                        className="text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                      >
                        <Edit size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showActions ? 8 : 7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {searchQuery
                    ? `Tidak ada data yang cocok dengan pencarian "${searchQuery}"`
                    : "Data ZIS belum tersedia"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between m-6">
          <p className="text-xs text-gray-400 font-bold">
            Halaman {safePage} dari {totalPages}
          </p>

          <div className="flex items-center gap-1.5">
            <button
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
