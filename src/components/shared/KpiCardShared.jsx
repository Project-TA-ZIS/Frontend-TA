import React from "react";
import { ChevronRight } from "lucide-react";

// Kartu KPI (indikator) dengan ikon di kiri + label & angka di kanan.
// Dipakai di dashboard. Props: label, value (angka), icon (komponen ikon).
// Opsional: onDetailClick → bila diisi, muncul tombol "Lihat Detail".
export default function KpiCardShared({
  label,
  value,
  icon: IconComponent,
  onDetailClick,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow font-['Manrope']">
      <div className="flex items-center gap-5">
        {/* Box Wadah Ikon Berwarna Hijau Lembut */}
        {IconComponent && (
          <div className="w-14 h-14 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-[#10B981] shrink-0">
            <IconComponent size={28} strokeWidth={2.5} />
          </div>
        )}

        {/* Detail Angka & Label */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-extrabold text-gray-900 leading-none">
            {value}
          </h3>
        </div>
      </div>

      {/* Tombol "Lihat Detail" di kanan bawah (hanya muncul bila onDetailClick diberikan) */}
      {onDetailClick && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onDetailClick}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#10B981] hover:text-[#059669] transition-colors"
          >
            Lihat Detail
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
