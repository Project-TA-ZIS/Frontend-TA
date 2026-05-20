import api from "./api";
import { apiPublic } from "./apiPublic";

async function getAllPemasukanZIS() {
  const res = await apiPublic.get("/pemasukanZIS/get/getAllPemasukanZIS");
  return res.data;
}

async function getPemasukanZISByNIK(data) {
  const res = await apiPublic.get(
    `/pemasukanZIS/get/getRiwayatPemasukanZISByNik`,
    { params: data },
  );
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
  const res = await api.put(
    `/pemasukanZIS/update/updatePemasukanZIS/${id}`,
    data,
  );
  return res.data;
}

const pemasukanZISService = {
  getAllPemasukanZIS,
  getPemasukanZISByNIK,
  createPemasukanZIS,
  addPemasukanZIS,
  updatePemasukanZIS,
};

export default pemasukanZISService;
