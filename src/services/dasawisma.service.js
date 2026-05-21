import api from "./api";

async function getAllAnggotaDasawisma() {
  const res = await api.get("/dasawisma/get/getAllAnggota");
  return res.data;
}

async function getAnggotaDasawismaById(id) {
  const res = await api.get(`/dasawisma/get/getAnggota/${id}`);
  return res.data;
}

async function createAnggotaDasawisma(payload) {
  const res = await api.post("/dasawisma/post/createAnggota", payload);
  return res.data;
}

async function updateAnggotaDasawisma(id, payload) {
  const res = await api.put(`/dasawisma/update/updateAnggota/${id}`, payload);
  return res.data;
}

async function deleteAnggotaDasawisma(id) {
  const res = await api.delete(`/dasawisma/delete/deleteAnggota/${id}`);
  return res.data;
}

async function updatePassword(arg1, arg2) {
  // Backward-compatible:
  // - preferred usage: updatePassword(payload)
  // - legacy usage:   updatePassword(id, payload)
  const payload = arg2 ?? arg1;
  const res = await api.put(`/dasawisma/update/updatePassword`, payload);
  return res.data;
}

const dasawismaService = {
  getAllAnggotaDasawisma,
  getAnggotaDasawismaById,
  createAnggotaDasawisma,
  updateAnggotaDasawisma,
  deleteAnggotaDasawisma,
  updatePassword,
};

export default dasawismaService;
