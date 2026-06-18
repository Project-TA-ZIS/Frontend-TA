import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── MOCK BATAS TERLUAR (service API & SweetAlert) ───
vi.mock("../services/dasawisma.service", () => ({
  default: {
    getAnggotaDasawismaByRW: vi.fn(),
    deleteAnggotaDasawisma: vi.fn(),
    createAnggotaDasawisma: vi.fn(),
    updateAnggotaByPJ: vi.fn(),
    getAnggotaDasawismaById: vi.fn(),
  },
}));

vi.mock("../services/rw.service", () => ({
  default: { getAllRw: vi.fn() },
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

import AnggotaDasawisma from "../pages/koordinator/AnggotaDasawisma";
import dasawismaService from "../services/dasawisma.service";
import rwService from "../services/rw.service";

// Satu anggota dalam format respons server.
const anggotaDariServer = {
  id: 1,
  rw_id: 1,
  nama_rw: "01",
  nama_lengkap: "Siti Kader",
  roles: "kader dasawisma",
  email: "siti@kader.com",
  nomor_telpon: "081234567890",
};

describe("Halaman AnggotaDasawisma (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dasawismaService.getAnggotaDasawismaByRW.mockResolvedValue({
      data: [anggotaDariServer],
    });
    dasawismaService.createAnggotaDasawisma.mockResolvedValue({});
    dasawismaService.deleteAnggotaDasawisma.mockResolvedValue({});
    // Daftar RW untuk dropdown pada form.
    rwService.getAllRw.mockResolvedValue({ data: [{ id: 1, nama_rw: "01" }] });
  });

  it("memuat data anggota & daftar RW lalu menampilkannya di tabel", async () => {
    render(<AnggotaDasawisma />);

    expect(await screen.findByText("Siti Kader")).toBeInTheDocument();
    expect(screen.getByText("siti@kader.com")).toBeInTheDocument();
    expect(dasawismaService.getAnggotaDasawismaByRW).toHaveBeenCalledTimes(1);
    expect(rwService.getAllRw).toHaveBeenCalledTimes(1);
  });

  it("alur tambah kader: isi form + pilih RW lalu simpan memanggil createAnggotaDasawisma", async () => {
    const user = userEvent.setup();
    render(<AnggotaDasawisma />);
    await screen.findByText("Siti Kader");

    await user.click(screen.getByRole("button", { name: /Tambah Kader/i }));

    await user.type(screen.getByPlaceholderText("email@contoh.com"), "kader@contoh.com");
    await user.type(screen.getByPlaceholderText("Minimal 6 karakter"), "rahasia123");
    await user.type(screen.getByPlaceholderText("Masukkan nama lengkap..."), "Kader Baru");
    await user.type(screen.getByPlaceholderText("08xxxxxxxxxx"), "081234567890");

    // Dua dropdown di mode tambah: [0] = RW, [1] = Role (default sudah benar).
    const dropdowns = screen.getAllByRole("combobox");
    await user.selectOptions(dropdowns[0], "1");

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(dasawismaService.createAnggotaDasawisma).toHaveBeenCalledWith({
        rw_id: "1",
        nama_lengkap: "Kader Baru",
        email: "kader@contoh.com",
        nomor_telpon: "081234567890",
        password: "rahasia123",
        roles: "kader dasawisma",
      });
    });

    // Setelah sukses, data dimuat ulang.
    expect(dasawismaService.getAnggotaDasawismaByRW).toHaveBeenCalledTimes(2);
  });

  it("validasi terintegrasi: simpan form kosong menampilkan error & tidak memanggil service", async () => {
    const user = userEvent.setup();
    render(<AnggotaDasawisma />);
    await screen.findByText("Siti Kader");

    await user.click(screen.getByRole("button", { name: /Tambah Kader/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(await screen.findByText("Nama lengkap wajib diisi!")).toBeInTheDocument();
    expect(dasawismaService.createAnggotaDasawisma).not.toHaveBeenCalled();
  });

  it("alur hapus: konfirmasi lalu memanggil deleteAnggotaDasawisma dengan id yang benar", async () => {
    const user = userEvent.setup();
    render(<AnggotaDasawisma />);
    await screen.findByText("Siti Kader");

    await user.click(screen.getByTitle("Hapus"));

    await waitFor(() => {
      expect(dasawismaService.deleteAnggotaDasawisma).toHaveBeenCalledWith("1");
    });
  });
});
