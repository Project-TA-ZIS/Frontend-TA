import api from "./api";

async function getAllAmil() {
  const res = await api.get("/amil/get/getAllAmil");
  return res.data;
}

async function createAmil(payload) {
  const res = await api.post("/amil/post/createAmil", payload);
  return res.data;
}

async function updateAmil(id, payload) {
  const res = await api.put(`/amil/put/updateAmil/${id}`, payload);
  return res.data;
}

async function deleteAmil(id) {
  const res = await api.delete(`/amil/delete/deleteAmil/${id}`);
  return res.data;
}

async function updateAmilPassword(payload) {
  const res = await api.put("/amil/put/updateAmilPassword", payload);
  return res.data;
}

const amilService = {
  getAllAmil,
  createAmil,
  updateAmil,
  deleteAmil,
  updateAmilPassword,
};

export default amilService;
