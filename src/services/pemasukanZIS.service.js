import api from "./api";
import { apiPublic } from "./apiPublic";

// Ambil seluruh data pemasukan ZIS (pakai apiPublic → bisa tanpa login).
async function getAllPemasukanZIS() {
  const res = await apiPublic.get("/pemasukanZIS/get/getAllPemasukanZIS");
  return res.data;
}

// Ambil riwayat pemasukan ZIS berdasarkan NIK muzakki.
async function getPemasukanZISByNIK(data) {
  const res = await apiPublic.get(
    `/pemasukanZIS/get/getRiwayatPemasukanZISByNik`,
    { params: data },
  );
  return res.data;
}

// Tambah data pemasukan ZIS (butuh login → pakai instance api ber-token).
async function createPemasukanZIS(data) {
  const res = await api.post("/pemasukanZIS/add/addPemasukanZIS", data);
  return res.data;
}

// Alias agar lebih mudah dipakai dari komponen (sama dengan createPemasukanZIS).
export async function addPemasukanZIS(payload) {
  return createPemasukanZIS(payload);
}

// Ubah data pemasukan ZIS berdasarkan id.
async function updatePemasukanZIS(id, data) {
  const res = await api.put(
    `/pemasukanZIS/update/updatePemasukanZIS/${id}`,
    data,
  );
  return res.data;
}

// Kumpulan fungsi pemasukan ZIS diekspor sebagai satu objek service.
const pemasukanZISService = {
  getAllPemasukanZIS,
  getPemasukanZISByNIK,
  createPemasukanZIS,
  addPemasukanZIS,
  updatePemasukanZIS,
};

export default pemasukanZISService;
