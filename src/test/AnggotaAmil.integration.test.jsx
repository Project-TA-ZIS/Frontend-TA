import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── MOCK BATAS TERLUAR (hanya service API & SweetAlert) ───
// Komponen anak (AmilTable, modal form) & validasi TIDAK di-mock —
// itulah yang membedakan integration test dari unit test.
vi.mock("../services/amil.service", () => ({
  default: {
    getAllAmil: vi.fn(),
    createAmil: vi.fn(),
    updateAmil: vi.fn(),
    deleteAmil: vi.fn(),
  },
}));

// SweetAlert: semua dialog langsung dianggap "dikonfirmasi" agar alur berlanjut.
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

import AnggotaAmil from "../pages/koordinator/AnggotaAmil";
import amilService from "../services/amil.service";

// Satu data amil dalam format respons server (snake_case).
const amilDariServer = {
  id: "1",
  nama_lengkap: "Budi Amil",
  email: "budi@amil.com",
  nomor_telpon: "081234567890",
  alamat: "Bandung",
};

describe("Halaman AnggotaAmil (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: server mengembalikan satu data amil.
    amilService.getAllAmil.mockResolvedValue({ data: [amilDariServer] });
    amilService.createAmil.mockResolvedValue({});
    amilService.deleteAmil.mockResolvedValue({});
  });

  it("memuat data dari service dan menampilkannya di tabel", async () => {
    render(<AnggotaAmil />);

    // Data dari server muncul di tabel (komponen AmilTable yang asli yang merender).
    expect(await screen.findByText("Budi Amil")).toBeInTheDocument();
    expect(screen.getByText("budi@amil.com")).toBeInTheDocument();
    expect(amilService.getAllAmil).toHaveBeenCalledTimes(1);
  });

  it("alur tambah amil: isi form lalu simpan memanggil createAmil dengan payload benar", async () => {
    const user = userEvent.setup();
    render(<AnggotaAmil />);
    await screen.findByText("Budi Amil"); // tunggu load awal selesai

    // Buka modal tambah.
    await user.click(screen.getByRole("button", { name: /Tambah Amil/i }));

    // Isi form (input asli dari modal).
    await user.type(screen.getByPlaceholderText("email@contoh.com"), "amil@contoh.com");
    await user.type(screen.getByPlaceholderText("Minimal 6 karakter"), "rahasia123");
    await user.type(screen.getByPlaceholderText("Masukkan nama lengkap..."), "Amil Baru");
    await user.type(screen.getByPlaceholderText("08xxxxxxxxxx"), "081234567890");
    await user.type(screen.getByPlaceholderText("Bandung, Jawa Barat"), "Jakarta");

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    // Service dipanggil dengan payload yang sudah dipetakan ke format server.
    await waitFor(() => {
      expect(amilService.createAmil).toHaveBeenCalledWith({
        nama_lengkap: "Amil Baru",
        email: "amil@contoh.com",
        password: "rahasia123",
        nomor_telpon: "081234567890",
        alamat: "Jakarta",
      });
    });

    // Setelah sukses, data dimuat ulang (getAllAmil dipanggil lagi).
    expect(amilService.getAllAmil).toHaveBeenCalledTimes(2);
  });

  it("validasi terintegrasi: simpan form kosong menampilkan error & tidak memanggil service", async () => {
    const user = userEvent.setup();
    render(<AnggotaAmil />);
    await screen.findByText("Budi Amil");

    await user.click(screen.getByRole("button", { name: /Tambah Amil/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    // Pesan error dari ValidateAnggotaAmil (yang asli) tampil di layar.
    expect(await screen.findByText("Nama lengkap wajib diisi!")).toBeInTheDocument();
    // Karena validasi gagal, service tidak boleh terpanggil.
    expect(amilService.createAmil).not.toHaveBeenCalled();
  });

  it("alur hapus: konfirmasi lalu memanggil deleteAmil dengan id yang benar", async () => {
    const user = userEvent.setup();
    render(<AnggotaAmil />);
    await screen.findByText("Budi Amil");

    // Tombol hapus ada di dalam baris tabel (title="Hapus").
    await user.click(screen.getByTitle("Hapus"));

    await waitFor(() => {
      expect(amilService.deleteAmil).toHaveBeenCalledWith("1");
    });
  });
});
