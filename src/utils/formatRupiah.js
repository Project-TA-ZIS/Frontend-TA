export const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: Number.isInteger(angka) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(angka);
};