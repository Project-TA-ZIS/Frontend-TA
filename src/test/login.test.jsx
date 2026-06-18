import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── MOCK DEPENDENSI ───
// Login memakai useNavigate; kita ganti dengan fungsi tiruan agar bisa
// memeriksa "halaman mana yang dituju" tanpa benar-benar pindah halaman.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Ganti auth.service agar TIDAK menembak backend sungguhan.
vi.mock("../services/auth.service", () => ({
  default: { requestPasswordReset: vi.fn() },
  login: vi.fn(),
  getMe: vi.fn(),
}));

// Diimpor SETELAH vi.mock agar Login memakai versi mock di atas.
import Login from "../pages/auth/Login";
import { login as loginRequest, getMe } from "../services/auth.service";

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // reset riwayat pemanggilan tiap test
    localStorage.clear();
  });

  it("menampilkan form login (email, password, tombol masuk)", () => {
    render(<Login />);

    expect(screen.getByPlaceholderText("admin@dasawisma.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Masuk ke Dashboard/i }),
    ).toBeInTheDocument();
  });

  it("menampilkan pesan error jika login gagal", async () => {
    // Buat loginRequest gagal (seolah email/password salah).
    loginRequest.mockRejectedValueOnce({
      response: { data: { message: "Email atau password salah" } },
    });

    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByPlaceholderText("admin@dasawisma.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "rahasia");
    await user.click(screen.getByRole("button", { name: /Masuk ke Dashboard/i }));

    // Pesan error muncul di layar.
    expect(
      await screen.findByText("Email atau password salah"),
    ).toBeInTheDocument();
    // Tidak boleh pindah halaman saat gagal.
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("login sukses sebagai amil mengarahkan ke /amil/dashboard", async () => {
    loginRequest.mockResolvedValueOnce({ token: "token-palsu" });
    getMe.mockResolvedValueOnce({ user: { roles: "amil zakat" } });

    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByPlaceholderText("admin@dasawisma.com"), "amil@b.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "rahasia");
    await user.click(screen.getByRole("button", { name: /Masuk ke Dashboard/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/amil/dashboard");
    });
  });
});
