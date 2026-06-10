// Mengubah tanggal menjadi format Indonesia yang mudah dibaca,
// mis. "2024-03-15" → "15 Maret 2024". Mengembalikan "-" jika tanggal kosong/invalid.
export const formattedDate = (tanggal) => {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  // Cek apakah hasil parsing tanggal valid.
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Mengubah tanggal menjadi format "YYYY-MM-DD" untuk dipasang ke <input type="date">.
// Mengembalikan string kosong jika tanggal kosong/invalid.
export const formatDateInput = (tanggal) => {
  if (!tanggal) return "";

  const date = new Date(tanggal);

  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
