import api from "./api";

// Login: kirim email & password, server membalas token + data user.
export async function login({ email, password }) {
  const res = await api.post("/auth/post/login", { email, password });
  return res.data;
}

// Ambil data user yang sedang login (berdasarkan token yang dikirim).
export async function getMe() {
  const res = await api.get("/auth/get/me");
  return res.data;
}

// Minta link reset password dikirim ke email user.
export async function requestPasswordReset({ email }) {
  const res = await api.post("/auth/post/forgot-password", { email });
  return res.data;
}

// Reset password: kirim token (dari email) + password baru.
export async function resetPassword({ token, newPassword }) {
  const res = await api.post("/auth/post/reset-password", {
    token,
    newPassword,
  });
  return res.data;
}

// Cek apakah token reset password masih valid (belum kadaluarsa/terpakai).
export async function validateResetToken(token) {
  const res = await api.get(`/auth/get/validate-reset-token/${token}`);
  return res.data;
}

// Kumpulan fungsi auth diekspor sebagai satu objek service.
const authService = {
  login,
  getMe,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
};

export default authService;
