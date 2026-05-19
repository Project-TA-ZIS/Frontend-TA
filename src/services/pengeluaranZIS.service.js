import api from "./api";

async function getAllPengeluaranZIS() {
  const res = await api.get("/pengeluaranZIS/get/getAllPengeluaranZIS");
  return res.data;
}

export default {
  getAllPengeluaranZIS,
};
