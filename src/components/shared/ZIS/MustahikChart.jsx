import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Daftar 7 kategori (asnaf) + warna konsisten untuk tiap potongan pie.
const ASNAF = [
  { key: "fakir", label: "Fakir", color: "#0F766E" },
  { key: "miskin", label: "Miskin", color: "#10B981" },
  { key: "amil", label: "Amil", color: "#34D399" },
  { key: "mualaf", label: "Mualaf", color: "#6EE7B7" },
  { key: "berhutang", label: "Berhutang", color: "#F59E0B" },
  { key: "fisabilillah", label: "Fisabilillah", color: "#3B82F6" },
  { key: "musafir", label: "Musafir", color: "#8B5CF6" },
];

// Tooltip kustom: tampilkan nama kategori + jumlah orang saat hover.
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm font-['Manrope']">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ background: item.payload.color }}
        />
        <span className="text-gray-500">{item.name}:</span>
        <span className="font-bold text-gray-800">{item.value} orang</span>
      </div>
    </div>
  );
};

// Grafik lingkaran (pie) sebaran Mustahik berdasarkan kategori asnaf.
// Props: data = array mustahik mentah dari server (punya field `kategori`).
export default function MustahikChart({ data = [] }) {
  // Hitung jumlah mustahik per kategori asnaf.
  const chartData = useMemo(() => {
    const counts = ASNAF.reduce((acc, a) => ({ ...acc, [a.key]: 0 }), {});

    (data || []).forEach((item) => {
      const kategori = (item?.kategori || "").toString().trim().toLowerCase();
      if (kategori in counts) counts[kategori] += 1;
    });

    return ASNAF.map((a) => ({
      name: a.label,
      value: counts[a.key],
      color: a.color,
    })).filter((row) => row.value > 0); // sembunyikan kategori tanpa data
  }, [data]);

  const total = chartData.reduce((sum, row) => sum + row.value, 0);

  // Tampilan saat belum ada data sama sekali.
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm font-medium text-gray-400">
        Belum ada data mustahik untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] font-['Manrope']">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {chartData.map((row) => (
              <Cell key={row.name} fill={row.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16, fontWeight: 700 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
