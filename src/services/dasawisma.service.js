import api from "./api";

async function getAllAnggotaDasawisma() {
  const res = await api.get("/dasawisma/get/getAllAnggota");
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

const dasawismaService = {
  getAllAnggotaDasawisma,
  createAnggotaDasawisma,
  updateAnggotaDasawisma,
  deleteAnggotaDasawisma,
};

export default dasawismaService;
