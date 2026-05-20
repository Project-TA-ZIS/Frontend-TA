import api from "./api";

async function getTotalZISbyKategori() {
  const res = await api.get("/totalZIS/get/getTotalZISByKategori");
  return res.data;
}

async function getTotalZIS() {
  const res = await api.get("/totalZIS/get/getTotalAllPemasukanZIS");
  return res.data;
}

const totalZISService = {
  getTotalZISbyKategori,
  getTotalZIS,
};

export default totalZISService;