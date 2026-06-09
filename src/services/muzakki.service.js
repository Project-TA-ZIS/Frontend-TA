import api from "./api";

// Ambil seluruh data muzakki (pemberi zakat).
export async function getAllMuzakki() {
  const res = await api.get("/muzakki/get/getAllMuzakki");
  return res.data;
}

// Tambah data muzakki baru.
export async function createMuzakki(payload) {
  const res = await api.post("/muzakki/post/createMuzakki", payload);
  return res.data;
}

// Ubah data muzakki berdasarkan id.
export async function updateMuzakki(id, payload) {
  const res = await api.put(`/muzakki/put/editMuzakki/${id}`, payload);
  return res.data;
}

// Hapus data muzakki berdasarkan id.
export async function deleteMuzakki(id) {
  const res = await api.delete(`/muzakki/delete/deleteMuzakki/${id}`);
  return res.data;
}

// Kumpulan fungsi CRUD muzakki diekspor sebagai satu objek service.
const muzakkiService = {
  getAllMuzakki,
  createMuzakki,
  updateMuzakki,
  deleteMuzakki
};

export default muzakkiService;
