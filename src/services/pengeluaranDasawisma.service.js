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

const pengeluaranDasawismaService = {
  getAllPengeluaran,
  createPengeluaran,
};

export default pengeluaranDasawismaService;