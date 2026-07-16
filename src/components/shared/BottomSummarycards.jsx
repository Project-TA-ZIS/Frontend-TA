import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";

// Kartu kecil penampil satu angka ringkasan (label di atas, nilai besar,
// teks kecil opsional di bawah). Dipakai berulang oleh BottomSummaryCards.
export const TopSummaryCard = ({
  label,
  value,
  valueClassName = "text-xl md:text-2xl font-extrabold text-gray-900",
  subtext,
  className = "",
}) => {
  return (
    <div className={`bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center ${className}`}>
      <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 line-clamp-1">
        {label}
      </p>
      <h3 className={`${valueClassName} truncate`}>{value}</h3>
      {subtext ? <p className="text-[9px] md:text-[10px] text-gray-500 mt-1">{subtext}</p> : null}
    </div>
  );
};

// Kumpulan kartu ringkasan ZIS: penerimaan, penyaluran, saldo, serta rincian
// per kategori (zakat fitrah, maal, infaq, sedekah). Nilai diterima via props.
const BottomSummaryCards = ({
  totalPenerimaan,
  totalPenyaluran,
  saldoZIS,
  saldoUpdatedAt,
  getTotalByKategori,
}) => {
  
  // PERUBAHAN: pb-4 diturunkan drastis menjadi pb-1 agar jarak bawah tidak memakan tempat.
  const scrollContainerClass = "flex md:grid md:grid-cols-2 gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden";
  
  const scrollItemClass = "shrink-0 w-[240px] sm:w-[280px] md:w-auto snap-start md:snap-align-none";

  return (
    // PERUBAHAN: Menggunakan flex-col dan gap-3 (jarak statis 12px yang presisi)
    <div className="flex flex-col gap-3 md:gap-4 mb-6">
      
      {/* ─── GROUP 1: Penerimaan & Penyaluran ─── */}
      <div className={scrollContainerClass}>
        <TopSummaryCard
          label="PENERIMAAN ZIS"
          value={formatRupiah(totalPenerimaan)}
          valueClassName="text-xl md:text-2xl font-extrabold text-[#0F766E]"
          className={scrollItemClass}
        />
        <TopSummaryCard
          label="PENYALURAN"
          value={formatRupiah(totalPenyaluran)}
          valueClassName="text-xl md:text-2xl font-extrabold text-[#EF4444]"
          className={scrollItemClass}
        />
      </div>
      
      {/* Saldo ZIS */}
      <TopSummaryCard
        label="SALDO ZIS SAAT INI"
        value={formatRupiah(saldoZIS)}
        valueClassName="text-2xl md:text-3xl font-extrabold text-gray-900"
        subtext={`Diperbarui: ${formattedDate(saldoUpdatedAt) || "N/A"}`}
        // mt-3 dan mb-2 dihapus. Biarkan Flex gap-3 yang mengatur jaraknya
        className="w-full" 
      />

      {/* ─── GROUP 3: Maal / Infaq / Shodaqoh ─── */}
      <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
        <TopSummaryCard
          label="Zakat Maal"
          value={formatRupiah(getTotalByKategori("zakat mal"))}
          valueClassName="text-xl md:text-2xl font-extrabold text-gray-900"
          className={scrollItemClass}
        />
        <TopSummaryCard
          label="Infaq"
          value={formatRupiah(getTotalByKategori("infaq"))}
          valueClassName="text-xl md:text-2xl font-extrabold text-gray-900"
          className={scrollItemClass}
        />
        <TopSummaryCard
          label="Shodaqoh"
          value={formatRupiah(getTotalByKategori("shodaqoh"))}
          valueClassName="text-xl md:text-2xl font-extrabold text-gray-900"
          className={scrollItemClass}
        />
      </div>
      
    </div>
  );
};

export default BottomSummaryCards;