import React, { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Info,
  Edit,
  Trash2,
} from "lucide-react";

const PAGE_SIZE = 5;

export default function AmilTable({
  data = [],
  isLoading = false,
  searchQuery = "",
  onInfo,
  onEdit,
  onDelete,
  canView = true,
  canEdit = true,
  canDelete = true,
}) {
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: "nama",
    direction: "asc",
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
      let aValue = a[sortConfig.key] ?? "";
      let bValue = b[sortConfig.key] ?? "";

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
      className={`px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100 ${
        sortConfig.key === key ? "text-[#10B981]" : "text-gray-500"
      }`}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {renderSortIcon(key)}
      </div>
    </th>
  );

  const showActions = canView || canEdit || canDelete;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-20">
                NO
              </th>

              {sortableHeader("Nama Lengkap", "nama")}
              {sortableHeader("Email", "email")}
              {sortableHeader("No. Telp", "telp")}
              {sortableHeader("Alamat", "alamat")}

              {showActions && (
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-36">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="px-6 py-8 text-center text-xs font-bold text-gray-400"
                >
                  Memuat data...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-emerald-50/20 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#10B981] text-center">
                    {index + 1 + (safePage - 1) * PAGE_SIZE}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-[12px] font-bold text-gray-900 text-center">
                    {item.nama}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-[12px] font-bold text-gray-900 text-center">
                    {item.email}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500 text-center">
                    {item.telp}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500 text-center">
                    {item.alamat}
                  </td>

                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                          <button
                            onClick={() => onEdit?.(item)}
                            className="text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onDelete?.(item.id)}
                            className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="px-6 py-8 text-center text-xs font-medium text-gray-400"
                >
                  {searchQuery
                    ? `Tidak ada data yang cocok dengan pencarian "${searchQuery}"`
                    : "Belum ada data anggota amil. Klik tombol Tambah Anggota untuk menambahkan data anggota amil baru."}
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
