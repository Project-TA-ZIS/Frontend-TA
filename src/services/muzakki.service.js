import api from "./api";

export async function getAllMuzakki() {
  const res = await api.get("/muzakki/get/getAllMuzakki");
  return res.data;
}

export async function createMuzakki(payload) {
  const res = await api.post("/muzakki/post/createMuzakki", payload);
  return res.data;
}

export async function updateMuzakki(id, payload) {
  const res = await api.put(`/muzakki/put/editMuzakki/${id}`, payload);
  return res.data;
}

export async function deleteMuzakki(id) {
  const res = await api.delete(`/muzakki/delete/deleteMuzakki/${id}`);
  return res.data;
}

const muzakkiService = {
  getAllMuzakki,
  createMuzakki,
  updateMuzakki,
  deleteMuzakki
};

export default muzakkiService;
