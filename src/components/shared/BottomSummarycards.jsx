import SummaryCard from "./TopSummarycard";
import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";

/**
 * Seluruh blok kartu ringkasan halaman Manajemen ZIS:
 * - Grup 1 (Top): Total Penerimaan, Total Penyaluran, Saldo ZIS
 * - Grup 2 (Bottom): Zakat Fitrah Beras, Zakat Fitrah Uang
 * - Grup 3 (Bottom): Zakat Maal, Infaq, Shodaqoh
 *
 * Komponen ini murni presentational — semua nilai dihitung di induk
 * lalu dikirim lewat props.
 *
 * Props:
 * - totalPenerimaan, totalPenyaluran, saldoZIS : number
 * - saldoUpdatedAt : string (tanggal mentah)
 * - getTotalByKategori : (kategoriApi: string) => number
 */
const BottomSummaryCards = ({
  totalPenerimaan,
  totalPenyaluran,
  saldoZIS,
  saldoUpdatedAt,
  getTotalByKategori,
}) => {
  return (
    <>
      {/* ─── Top Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 shrink-0">
        <SummaryCard
          label="TOTAL PENERIMAAN ZIS"
          value={formatRupiah(totalPenerimaan)}
          valueClassName="text-xl font-extrabold text-[#0F766E]"
        />
        <SummaryCard
          label="TOTAL PENYALURAN"
          value={formatRupiah(totalPenyaluran)}
          valueClassName="text-xl font-extrabold text-[#EF4444]"
        />
        <SummaryCard
          label="SALDO ZIS"
          value={formatRupiah(saldoZIS)}
          valueClassName="text-xl font-extrabold text-gray-900"
          subtext={`Terakhir diperbarui: ${formattedDate(saldoUpdatedAt) || "N/A"}`}
        />
      </div>

      {/* ─── Bottom Summary Cards (Zakat Fitrah) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 shrink-0">
        <SummaryCard
          label="Zakat Fitrah Beras"
          value={`${getTotalByKategori("zakat fitrah beras")} Kg`}
        />
        <SummaryCard
          label="Zakat Fitrah Uang"
          value={formatRupiah(getTotalByKategori("zakat fitrah uang"))}
        />
      </div>

      {/* ─── Bottom Summary Cards (Maal / Infaq / Shodaqoh) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 shrink-0">
        <SummaryCard
          label="Zakat Maal"
          value={formatRupiah(getTotalByKategori("zakat mal"))}
          valueClassName="text-lg font-extrabold text-gray-900"
        />
        <SummaryCard
          label="Infaq"
          value={formatRupiah(getTotalByKategori("infaq"))}
          valueClassName="text-lg font-extrabold text-gray-900"
        />
        <SummaryCard
          label="Shodaqoh"
          value={formatRupiah(getTotalByKategori("shodaqoh"))}
          valueClassName="text-lg font-extrabold text-gray-900"
        />
      </div>
    </>
  );
};

export default BottomSummaryCards;