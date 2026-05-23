import React from "react";

export default function KpiCardShared({ label, value, icon: IconComponent }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow font-['Manrope']">
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
  );
}