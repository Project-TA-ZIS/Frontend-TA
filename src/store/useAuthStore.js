import { create } from "zustand";

const TOKEN_KEY = "dasawisma_token";
const LEGACY_TOKEN_KEY = "token";
const USER_KEY = "dasawisma_user";

function getInitialToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    null
  );
}

function getInitialUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  role: getInitialUser()?.roles || null,
  isBootstrapping: false,

  // Fungsi untuk menyimpan data saat login sukses
  setLogin: (userData, token) => {
    // reset state lama dulu
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

  setUser: (userData) => {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ user: userData || null, role: userData?.roles || null });
  },

  setBootstrapping: (isBootstrapping) => {
    set({ isBootstrapping });
  },

  // Fungsi untuk menghapus data saat logout
  setLogout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.clear();
    set({ user: null, token: null, role: null, isBootstrapping: false });
  },
}));

export default useAuthStore;
