import api from "./api";

// Ambil seluruh data amil zakat.
async function getAllAmil() {
  const res = await api.get("/amil/get/getAllAmil");
  return res.data;
}

// Ambil 1 data amil berdasarkan id.
async function getAmilById(id) {
  const res = await api.get(`/amil/get/getAmil/${id}`);
  return res.data;
}

// Tambah data amil baru.
async function createAmil(payload) {
  const res = await api.post("/amil/post/createAmil", payload);
  return res.data;
}

// Ubah data amil berdasarkan id.
async function updateAmil(id, payload) {
  const res = await api.put(`/amil/put/updateAmil/${id}`, payload);
  return res.data;
}

// Hapus data amil berdasarkan id.
async function deleteAmil(id) {
  const res = await api.delete(`/amil/delete/deleteAmil/${id}`);
  return res.data;
}

// Ubah password akun amil.
async function updateAmilPassword(payload) {
  const res = await api.put("/amil/put/updateAmilPassword", payload);
  return res.data;
}

// Kumpulan fungsi CRUD amil diekspor sebagai satu objek service.
const amilService = {
  getAllAmil,
  getAmilById,
  createAmil,
  updateAmil,
  deleteAmil,
  updateAmilPassword,
};

export default amilService;
