import api from "./api";

async function getAllPengeluaran() {
  const res = await api.get("/pengeluaranDasawisma/get/getAllPengeluaran");
  return res.data;
}

async function createPengeluaran(payload) {
  const res = await api.post(
    "/pengeluaranDasawisma/post/createPengeluaran",
    payload,
  );
  return res.data;
}

async function updatePengeluaran(id, payload) {
  const res = await api.put(
    `/pengeluaranDasawisma/update/updatePengeluaran/${id}`,
    payload,
  );
  return res.data;
}

const pengeluaranDasawismaService = {
  getAllPengeluaran,
  createPengeluaran,
  updatePengeluaran,
};

export default pengeluaranDasawismaService;
