import api from "./api";

// Ambil seluruh data anggota (kader) dasawisma.
async function getAllAnggotaDasawisma() {
  const res = await api.get("/dasawisma/get/getAllAnggota");
  return res.data;
}

// Ambil 1 data anggota dasawisma berdasarkan id.
async function getAnggotaDasawismaById(id) {
  const res = await api.get(`/dasawisma/get/getAnggota/${id}`);
  return res.data;
}

// Tambah data anggota dasawisma baru.
async function createAnggotaDasawisma(payload) {
  const res = await api.post("/dasawisma/post/createAnggota", payload);
  return res.data;
}

// Ubah data anggota dasawisma berdasarkan id.
async function updateAnggotaDasawisma(id, payload) {
  const res = await api.put(`/dasawisma/update/updateAnggota/${id}`, payload);
  return res.data;
}

// Hapus data anggota dasawisma berdasarkan id.
async function deleteAnggotaDasawisma(id) {
  const res = await api.delete(`/dasawisma/delete/deleteAnggota/${id}`);
  return res.data;
}

// Ubah password anggota. Dibuat fleksibel agar mendukung dua cara pemanggilan:
// - cara baru:  updatePassword(payload)
// - cara lama:  updatePassword(id, payload)
async function updatePassword(arg1, arg2) {
  // Jika arg2 ada (cara lama), pakai arg2; jika tidak, pakai arg1 (cara baru).
  const payload = arg2 ?? arg1;
  const res = await api.put(`/dasawisma/update/updatePassword`, payload);
  return res.data;
}

// Kumpulan fungsi CRUD anggota dasawisma diekspor sebagai satu objek service.
const dasawismaService = {
  getAllAnggotaDasawisma,
  getAnggotaDasawismaById,
  createAnggotaDasawisma,
  updateAnggotaDasawisma,
  deleteAnggotaDasawisma,
  updatePassword,
};

export default dasawismaService;
