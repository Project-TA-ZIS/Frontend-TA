import api from "./api";

async function getTotalKasDasawisma() {
  const res = await api.get("/totalKasDasawisma/get/getTotalKasDasawisma");
  return res.data;
}

const totalKasDasawismaService = {
  getTotalKasDasawisma,
};

export default totalKasDasawismaService;