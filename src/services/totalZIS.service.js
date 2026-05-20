import { apiPublic } from "./apiPublic";

async function getTotalZISbyKategori() {
  const res = await apiPublic.get("/totalZIS/get/getTotalZISByKategori");
  return res.data;
}

async function getTotalZIS() {
  const res = await apiPublic.get("/totalZIS/get/getTotalAllPemasukanZIS");
  return res.data;
}

const totalZISService = {
  getTotalZISbyKategori,
  getTotalZIS,
};

export default totalZISService;