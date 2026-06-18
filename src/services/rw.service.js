import api from "./api";

export async function getAllRw() {
  const res = await api.get("/rw/get/getAllRw");
  return res.data;
}

// Diekspor sebagai satu objek service.
const rwService = {
  getAllRw,
};

export default rwService;
