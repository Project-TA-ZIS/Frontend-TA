import api from "./api";

// Ambil seluruh data pengeluaran kas dasawisma.
async function getAllPengeluaran() {
  const res = await api.get("/pengeluaranDasawisma/get/getAllPengeluaran");
  return res.data;
}

// Tambah data pengeluaran kas dasawisma baru.
async function createPengeluaran(payload) {
  const res = await api.post(
    "/pengeluaranDasawisma/post/createPengeluaran",
    payload,
  );
  return res.data;
}

// Ubah data pengeluaran kas berdasarkan id.
async function updatePengeluaran(id, payload) {
  const res = await api.put(
    `/pengeluaranDasawisma/update/updatePengeluaran/${id}`,
    payload,
  );
  return res.data;
}

// Kumpulan fungsi pengeluaran kas dasawisma diekspor sebagai satu objek service.
const pengeluaranDasawismaService = {
  getAllPengeluaran,
  createPengeluaran,
  updatePengeluaran,
};

export default pengeluaranDasawismaService;
