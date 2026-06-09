// Memformat input angka menjadi format ribuan dengan titik, mis. "1000000" → "1.000.000".
// Berguna untuk tampilan input nominal agar mudah dibaca user saat mengetik.
export const formatThousands = (value) => {
  // Ambil hanya digit angka (buang huruf, titik, simbol, dll).
  const digitsOnly = String(value ?? "").replace(/[^0-9]/g, "");
  if (!digitsOnly) return "";

  // Buang angka 0 di depan, tapi sisakan satu 0 bila semuanya nol.
  const normalized = digitsOnly.replace(/^0+(?=\d)/, "");

  // Sisipkan titik sebagai pemisah setiap 3 digit dari belakang.
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Kebalikan dari formatThousands: mengubah "1.000.000" → angka 1000000.
// Dipakai sebelum data nominal dikirim ke server.
export const parseThousandsToNumber = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^0-9]/g, "");
  if (!digitsOnly) return 0;
  return Number(digitsOnly);
};
