import api from "./api";

export async function login({ email, password }) {
  const res = await api.post("/auth/post/login", { email, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get("/auth/get/me");
  return res.data;
}

export async function requestPasswordReset({ email }) {
  const res = await api.post("/auth/post/forgot-password", { email });
  return res.data;
}

export async function resetPassword({ token, newPassword }) {
  const res = await api.post("/auth/post/reset-password", {
    token,
    newPassword,
  });
  return res.data;
}

export async function validateResetToken(token) {
  const res = await api.get(`/auth/get/validate-reset-token/${token}`);
  return res.data;
}

const authService = {
  login,
  getMe,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
};

export default authService;
