import api from "./api";

// Ambil seluruh data mustahik (penerima zakat).
export async function getAllMustahik() {
  const res = await api.get("/mustahik/get/getAllMustahik");
  return res.data;
}

// Tambah data mustahik baru.
export async function createMustahik(payload) {
  const res = await api.post("/mustahik/post/createMustahik", payload);
  return res.data;
}

// Ubah data mustahik berdasarkan id.
export async function updateMustahik(id, payload) {
  const res = await api.put(`/mustahik/put/editMustahik/${id}`, payload);
  return res.data;
}

// Hapus data mustahik berdasarkan id.
export async function deleteMustahik(id) {
  const res = await api.delete(`/mustahik/delete/deleteMustahik/${id}`);
  return res.data;
}

// Kumpulan fungsi CRUD mustahik diekspor sebagai satu objek service.
const mustahikService = {
  getAllMustahik,
  createMustahik,
  updateMustahik,
  deleteMustahik
};

export default mustahikService;
