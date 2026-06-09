import { create } from "zustand";

// Nama-nama kunci penyimpanan di localStorage.
const TOKEN_KEY = "dasawisma_token";
const LEGACY_TOKEN_KEY = "token"; // kunci lama, untuk kompatibilitas
const USER_KEY = "dasawisma_user";

// Ambil token awal dari localStorage saat aplikasi pertama dibuka.
function getInitialToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    null
  );
}

// Ambil data user awal dari localStorage (di-parse dari JSON).
function getInitialUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Jika JSON rusak, kembalikan null agar aplikasi tidak crash.
    return null;
  }
}

// Store global (Zustand) untuk menyimpan status autentikasi di seluruh aplikasi.
const useAuthStore = create((set) => ({
  // ─── STATE ───
  user: getInitialUser(),
  token: getInitialToken(),
  role: getInitialUser()?.roles || null,
  isBootstrapping: false, // true saat sedang memuat ulang data user

  // Simpan data saat login sukses: token + user → localStorage & state.
  setLogin: (userData, token) => {
    // Reset dulu state lama agar tidak ada sisa data user sebelumnya.
    set({
      user: null,
      token: null,
      role: null,
    });

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);

    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }

    set({
      user: userData || null,
      token,
      role: userData?.roles || null,
    });
  },

  // Perbarui data user (mis. setelah memuat ulang profil dari server).
  setUser: (userData) => {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ user: userData || null, role: userData?.roles || null });
  },

  // Set status sedang memuat data user (dipakai ProtectedRoute agar tidak
  // salah redirect sebelum data user siap).
  setBootstrapping: (isBootstrapping) => {
    set({ isBootstrapping });
  },

  // Logout: hapus semua data dari localStorage/sessionStorage & kosongkan state.
  setLogout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.clear();
    set({ user: null, token: null, role: null, isBootstrapping: false });
  },
}));

export default useAuthStore;
