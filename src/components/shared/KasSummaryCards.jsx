import { formatRupiah } from "../../utils/formatRupiah";
import { formattedDate } from "../../utils/formattedDate";

/**
 * Kartu ringkasan tunggal (komponen lokal, tidak diekspor).
 * Gaya asli Kas: p-6, nilai text-3xl, rata tengah di mobile.
 */
const KasSummaryCard = ({
  label,
  value,
  valueClassName = "text-3xl font-extrabold text-gray-900",
  subtext,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center md:text-left">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <h3 className={valueClassName}>{value}</h3>
      {subtext ? <p className="text-xs text-gray-500 mt-1">{subtext}</p> : null}
    </div>
  );
};

/**
 * Blok 3 kartu ringkasan halaman Manajemen Kas Dasawisma:
 * - Total Kas Masuk (hijau)
 * - Total Pengeluaran (merah)
 * - Saldo Kas Saat Ini (dengan subteks "Terakhir diperbarui")
 *
 * Komponen ini murni presentational — nilai dihitung di induk lalu
 * dikirim lewat props.
 *
 * Props:
 * - pemasukan, pengeluaran, saldoKas : number
 * - saldoUpdatedAt : string (tanggal mentah)
 */
const KasSummaryCards = ({
  pemasukan,
  pengeluaran,
  saldoKas,
  saldoUpdatedAt,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <KasSummaryCard
        label="TOTAL KAS MASUK"
        value={formatRupiah(pemasukan)}
        valueClassName="text-3xl font-extrabold text-[#10B981]"
      />
      <KasSummaryCard
        label="TOTAL PENGELUARAN"
        value={formatRupiah(pengeluaran)}
        valueClassName="text-3xl font-extrabold text-[#EF4444]"
      />
      <KasSummaryCard
        label="SALDO KAS SAAT INI"
        value={formatRupiah(saldoKas)}
        subtext={`Terakhir diperbarui: ${formattedDate(saldoUpdatedAt) || "N/A"}`}
      />
    </div>
  );
};

export default KasSummaryCards;