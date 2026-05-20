import api from "./api";

async function getAllPemasukanZIS() {
  const res = await api.get("/pemasukanZIS/get/getAllPemasukanZIS");
  return res.data;
}

async function createPemasukanZIS(data) {
  const res = await api.post("/pemasukanZIS/add/addPemasukanZIS", data);
  return res.data;
}

export async function addPemasukanZIS(payload) {
  return createPemasukanZIS(payload);
}

async function updatePemasukanZIS(id, data) {
  const res = await api.put(`/pemasukanZIS/update/updatePemasukanZIS/${id}`, data);
  return res.data;
}

const pemasukanZISService = {
  getAllPemasukanZIS,
  createPemasukanZIS,
  addPemasukanZIS,
  updatePemasukanZIS,
};

export default pemasukanZISService;
