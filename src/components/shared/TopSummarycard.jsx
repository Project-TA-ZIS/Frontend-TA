/**
 * Kartu ringkasan untuk halaman Manajemen ZIS.
 *
 * Props:
 * - label    : teks kecil di atas (mis. "TOTAL PENERIMAAN ZIS")
 * - value    : nilai utama yang sudah diformat (string/number)
 * - valueClassName : kelas warna/ukuran untuk nilai (default abu gelap)
 * - subtext  : teks kecil opsional di bawah nilai (mis. "Terakhir diperbarui: ...")
 */
const TopSummaryCard = ({
  label,
  value,
  valueClassName = "text-xl font-extrabold text-gray-900",
  subtext,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <h3 className={valueClassName}>{value}</h3>
      {subtext ? <p className="text-xs text-gray-500 mt-1">{subtext}</p> : null}
    </div>
  );
};

export default TopSummaryCard;