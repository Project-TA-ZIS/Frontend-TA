import api from "./api";
import { apiPublic } from "./apiPublic";

async function getAllPengeluaranZIS() {
  const res = await apiPublic.get("/pengeluaranZIS/get/getAllPengeluaranZIS");
  return res.data;
}

async function createPengeluaranZIS(data) {
  const res = await api.post("/pengeluaranZIS/add/addPengeluaranZIS", data);
  return res.data;
}

export async function addPengeluaranZIS(payload) {
  return createPengeluaranZIS(payload);
}

async function updatePengeluaranZIS(id, data) {
  const res = await api.put(`/pengeluaranZIS/update/updatePengeluaranZIS/${id}`, data);
  return res.data;
}

const pengeluaranZISService = {
  getAllPengeluaranZIS,
  createPengeluaranZIS,
  addPengeluaranZIS,
  updatePengeluaranZIS,
};

export default pengeluaranZISService;