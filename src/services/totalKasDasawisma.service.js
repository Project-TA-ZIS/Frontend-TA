import api from "./api";

// Ambil total/saldo kas dasawisma saat ini.
async function getTotalKasDasawisma() {
  const res = await api.get("/totalKasDasawisma/get/getTotalKasDasawisma");
  return res.data;
}

async function getTotalKasDasawismaByRW() {
  const res = await api.get(`/totalKasDasawisma/get/getTotalKasDasawismaByRW`);
  return res.data;
}

// Diekspor sebagai satu objek service.
const totalKasDasawismaService = {
  getTotalKasDasawisma,
  getTotalKasDasawismaByRW,
};

export default totalKasDasawismaService;
