import { apiPublic } from "./apiPublic";

// Ambil rekap total ZIS dikelompokkan per kategori (pakai apiPublic → tanpa login).
async function getTotalZISbyKategori() {
  const res = await apiPublic.get("/totalZIS/get/getTotalZISByKategori");
  return res.data;
}

// Ambil total keseluruhan pemasukan ZIS (saldo ZIS).
async function getTotalZIS() {
  const res = await apiPublic.get("/totalZIS/get/getTotalAllPemasukanZIS");
  return res.data;
}

// Diekspor sebagai satu objek service.
const totalZISService = {
  getTotalZISbyKategori,
  getTotalZIS,
};

export default totalZISService;
