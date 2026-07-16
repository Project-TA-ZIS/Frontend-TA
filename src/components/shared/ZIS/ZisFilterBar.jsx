import { Download, Plus } from "lucide-react";

const ZisFilterBar = ({
  filterKategori,
  setFilterKategori,
  filterBulan,
  setFilterBulan,
  filterTahun,
  setFilterTahun,
  filterTipe,
  setFilterTipe,
  MonthList,
  tahunList,
  onDownload,
  onTambahPemasukan,
  onTambahPengeluaran,
  onEdit = true,
}) => {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 mt-5">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <select
          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
        >
          <option value="">Kategori ZIS</option>
          <option value="Zakat Maal">Zakat Maal</option>
          <option value="Infaq">Infaq</option>
          <option value="Sedekah">Shodaqoh</option>
        </select>

        <select
          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
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
          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer"
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

      {/* Action Button */}
      <div className="flex flex-col xl:flex-row gap-2 w-full xl:w-auto">
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm w-full xl:w-auto"
        >
          <Download size={16} />
          Unduh Data
        </button>
        
        {onEdit && (
          <div className="grid grid-cols-2 gap-2 w-full xl:w-auto">
            <button
              onClick={onTambahPemasukan}
              className="flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-[#059669] shadow-sm transition-all"
            >
              <Plus size={18} strokeWidth={2.5} />
              Pemasukan
            </button>

            <button
              onClick={onTambahPengeluaran}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-all"
            >
              <Plus size={18} strokeWidth={2.5} />
              Pengeluaran
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZisFilterBar;
