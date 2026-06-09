// Mengubah angka menjadi format mata uang Rupiah, mis. 10000 → "Rp 10.000".
// Memakai Intl.NumberFormat bawaan browser dengan locale Indonesia (id-ID).
export const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    // Tampilkan desimal hanya jika angkanya pecahan (bukan bilangan bulat).
    minimumFractionDigits: Number.isInteger(angka) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(angka);
};
