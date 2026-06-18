import { describe, it, expect, beforeEach } from "vitest";
import useAuthStore from "../store/useAuthStore";

// Nama kunci localStorage (harus sama dengan yang ada di useAuthStore.js).
const TOKEN_KEY = "dasawisma_token";
const USER_KEY = "dasawisma_user";

// Store ini singleton (dibuat sekali). Reset state & localStorage tiap test
// agar test tidak saling memengaruhi.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useAuthStore.setState({
    user: null,
    token: null,
    role: null,
    isBootstrapping: false,
  });
});

describe("useAuthStore", () => {
  it("setLogin menyimpan user, token, dan role ke state", () => {
    const user = { nama: "Budi", roles: "amil zakat" };
    useAuthStore.getState().setLogin(user, "token-123");

    const state = useAuthStore.getState();
    expect(state.token).toBe("token-123");
    expect(state.user).toEqual(user);
    expect(state.role).toBe("amil zakat");
  });

  it("setLogin juga menulis token & user ke localStorage", () => {
    const user = { nama: "Budi", roles: "amil zakat" };
    useAuthStore.getState().setLogin(user, "token-123");

    expect(localStorage.getItem(TOKEN_KEY)).toBe("token-123");
    expect(JSON.parse(localStorage.getItem(USER_KEY))).toEqual(user);
  });

  it("setLogin tanpa data user: token tersimpan, user & role null", () => {
    useAuthStore.getState().setLogin(null, "token-saja");

    const state = useAuthStore.getState();
    expect(state.token).toBe("token-saja");
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    // user tidak ditulis ke localStorage saat userData null
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it("setUser memperbarui user dan role", () => {
    useAuthStore.getState().setUser({ nama: "Siti", roles: "kader dasawisma" });

    const state = useAuthStore.getState();
    expect(state.user).toEqual({ nama: "Siti", roles: "kader dasawisma" });
    expect(state.role).toBe("kader dasawisma");
    expect(JSON.parse(localStorage.getItem(USER_KEY))).toEqual({
      nama: "Siti",
      roles: "kader dasawisma",
    });
  });

  it("setUser(null) menghapus user dari localStorage", () => {
    useAuthStore.getState().setUser({ nama: "Siti" });
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it("setLogout mengosongkan state dan localStorage", () => {
    useAuthStore.getState().setLogin({ nama: "Budi", roles: "x" }, "token-123");
    useAuthStore.getState().setLogout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.role).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it("setBootstrapping mengubah status loading", () => {
    useAuthStore.getState().setBootstrapping(true);
    expect(useAuthStore.getState().isBootstrapping).toBe(true);

    useAuthStore.getState().setBootstrapping(false);
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });
});
