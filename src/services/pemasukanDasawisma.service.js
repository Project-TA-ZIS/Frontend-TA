import api from "./api";

// Ambil seluruh data pemasukan kas dasawisma.
export async function getAllPemasukanKas() {
  const res = await api.get(
    "/pemasukanDasawisma/get/getAllPemasukan",
  );

  return res.data;
}

// Tambah data pemasukan kas dasawisma baru.
export async function createPemasukanKas(payload) {
  const res = await api.post(
    "/pemasukanDasawisma/post/createPemasukan",
    payload,
  );

  return res.data;
}

// Ambil total/saldo kas dasawisma saat ini.
export async function getTotalKas() {
  const res = await api.get("/totalKasDasawisma/get/getTotalKasDasawisma");

  return res.data;
}

// Ubah data pemasukan kas berdasarkan id.
export async function updatePemasukanKas(id, payload) {
  await api.put(
    `/pemasukanDasawisma/update/updatePemasukan/${id}`,
    payload,
  );
}

// Kumpulan fungsi pemasukan kas dasawisma diekspor sebagai satu objek service.
const pemasukanDasawismaService = {
  getAllPemasukanKas,
  createPemasukanKas,
  getTotalKas,
  updatePemasukanKas,
}

export default pemasukanDasawismaService;
