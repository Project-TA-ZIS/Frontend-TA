import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";

// Kartu kecil penampil satu angka ringkasan kas (dipakai berulang di bawah).
const KasSummaryCard = ({
  label,
  value,
  valueClassName = "text-lg md:text-2xl font-extrabold text-gray-900",
  subtext,
  className = "",
}) => {
  return (
    // Padding dikecilkan (p-3.5) agar kartu lebih pipih dan hemat ruang vertikal di HP
    <div className={`bg-white p-3.5 md:p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center ${className}`}>
      <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1 line-clamp-1">
        {label}
      </p>
      {/* truncate tetap ada sebagai pengaman terakhir jika angka mencapai triliunan */}
      <h3 className={`${valueClassName} truncate`}>{value}</h3>
      {subtext ? <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5">{subtext}</p> : null}
    </div>
  );
};

// Tiga kartu ringkasan kas dasawisma: total masuk, total keluar, dan saldo.
// Nilai diterima dari komponen induk lewat props.
const KasSummaryCards = ({
  pemasukan,
  pengeluaran,
  saldoKas,
  saldoUpdatedAt,
}) => {
  return (
    // KUNCI: grid-cols-1 (3 menyusun ke bawah) di Mobile, md:grid-cols-3 (menyamping) di Desktop.
    // gap-3 (12px) membuat jarak antar kartu sangat rapat ala dashboard finansial.
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-8">
      <KasSummaryCard
        label="TOTAL KAS MASUK"
        value={formatRupiah(pemasukan)}
        valueClassName="text-m md:text-2xl font-extrabold text-[#10B981]"
      />
      
      <KasSummaryCard
        label="TOTAL PENGELUARAN"
        value={formatRupiah(pengeluaran)}
        valueClassName="text-m md:text-2xl font-extrabold text-[#EF4444]"
      />
      
      <KasSummaryCard
        label="SALDO KAS SAAT INI"
        value={formatRupiah(saldoKas)}
        subtext={`Diperbarui: ${formattedDate(saldoUpdatedAt) || "N/A"}`}
        valueClassName="text-m md:text-2xl font-extrabold text-gray-900"
      />
    </div>
  );
};

export default KasSummaryCards;