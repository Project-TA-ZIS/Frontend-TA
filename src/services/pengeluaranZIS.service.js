import api from "./api";
import { apiPublic } from "./apiPublic";

// Ambil seluruh data pengeluaran/penyaluran ZIS (pakai apiPublic → tanpa login).
async function getAllPengeluaranZIS() {
  const res = await apiPublic.get("/pengeluaranZIS/get/getAllPengeluaranZIS");
  return res.data;
}

// Tambah data pengeluaran ZIS (butuh login → pakai instance api ber-token).
async function createPengeluaranZIS(data) {
  const res = await api.post("/pengeluaranZIS/add/addPengeluaranZIS", data);
  return res.data;
}

// Alias agar lebih mudah dipakai dari komponen (sama dengan createPengeluaranZIS).
export async function addPengeluaranZIS(payload) {
  return createPengeluaranZIS(payload);
}

// Ubah data pengeluaran ZIS berdasarkan id.
async function updatePengeluaranZIS(id, data) {
  const res = await api.put(`/pengeluaranZIS/update/updatePengeluaranZIS/${id}`, data);
  return res.data;
}

// Kumpulan fungsi pengeluaran ZIS diekspor sebagai satu objek service.
const pengeluaranZISService = {
  getAllPengeluaranZIS,
  createPengeluaranZIS,
  addPengeluaranZIS,
  updatePengeluaranZIS,
};

export default pengeluaranZISService;
