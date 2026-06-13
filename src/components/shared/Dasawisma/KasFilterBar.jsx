import { Download, Plus } from "lucide-react";

const KasFilterBar = ({
  filterJenis,
  setFilterJenis,
  filterBulan,
  setFilterBulan,
  filterTahun,
  setFilterTahun,
  MonthList,
  tahunList,
  onExport,
  onAdd,
  onEdit = true,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      {/* Filters */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
        <select
          className="col-span-2 md:col-span-1 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-auto"
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
        >
          <option value="Semua">Jenis Kas (Semua)</option>
          <option value="Pemasukan">Kas Pemasukan</option>
          <option value="Pengeluaran">Kas Pengeluaran</option>
        </select>

        <select
          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-28"
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
        >
          <option value="">Bulan</option>
          {MonthList.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] px-3 py-2 font-semibold shadow-sm outline-none w-full md:w-28"
          value={filterTahun}
          onChange={(e) => setFilterTahun(e.target.value)}
        >
          <option value="">Tahun</option>
          {tahunList.map((tahun) => (
            <option key={tahun} value={tahun}>
              {tahun}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:flex items-center gap-2 md:gap-3 w-full md:w-auto">
        <button
          onClick={onExport}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-3 rounded-lg text-sm transition-all hover:bg-gray-50 shadow-sm w-full md:w-auto"
        >
          <Download size={16} />
          Unduh
        </button>
        {onEdit && (
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2 px-3 rounded-lg text-sm transition-all hover:bg-[#059669] shadow-sm w-full md:w-auto"
          >
            <Plus size={16} strokeWidth={2.5} />
            Catat
          </button>
        )}
      </div>
    </div>
  );
};

export default KasFilterBar;
