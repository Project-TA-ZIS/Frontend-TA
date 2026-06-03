import api from "./api";

export async function getAllPemasukanKas() {
  const res = await api.get(
    "/pemasukanDasawisma/get/getAllPemasukan",
  );

  return res.data;
}

export async function createPemasukanKas(payload) {
  const res = await api.post(
    "/pemasukanDasawisma/post/createPemasukan",
    payload,
  );

  return res.data;
}

export async function getTotalKas() {
  const res = await api.get("/totalKasDasawisma/get/getTotalKasDasawisma");

  return res.data;
}

export async function updatePemasukanKas(id, payload) {
  const res = await api.put(
    `/pemasukanDasawisma/update/updatePemasukan/${id}`,
    payload,
  );
}

const pemasukanDasawismaService = {
  getAllPemasukanKas,
  createPemasukanKas,
  getTotalKas,
  updatePemasukanKas,
}

export default pemasukanDasawismaService;