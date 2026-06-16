import { describe, it, expect } from "vitest";
import { ValidateAnggotaAmil } from "./ValidateAnggotaAmil";

// Data yang valid sebagai titik awal; tiap test mengubah sebagian field saja.
const dataValid = {
  nama: "Budi Santoso",
  email: "budi@contoh.com",
  telp: "081234567890",
  alamat: "Bandung, Jawa Barat",
  password: "rahasia123",
};

describe("ValidateAnggotaAmil", () => {
  it("tidak ada error jika semua data valid (mode tambah)", () => {
    const errors = ValidateAnggotaAmil(dataValid, null);
    expect(errors).toEqual({});
  });

  it("memberi error jika nama kosong", () => {
    const errors = ValidateAnggotaAmil({ ...dataValid, nama: "" }, null);
    expect(errors.nama).toBe("Nama lengkap wajib diisi!");
  });

  it("memberi error jika format email salah", () => {
    const errors = ValidateAnggotaAmil({ ...dataValid, email: "bukan-email" }, null);
    expect(errors.email).toBe("Format email tidak valid!");
  });

  it("memberi error jika password kurang dari 6 karakter (mode tambah)", () => {
    const errors = ValidateAnggotaAmil({ ...dataValid, password: "123" }, null);
    expect(errors.password).toBe("Password minimal 6 karakter!");
  });

  it("TIDAK mengecek password saat mode edit (editingId ada)", () => {
    // saat edit, password kosong harus boleh
    const errors = ValidateAnggotaAmil({ ...dataValid, password: "" }, "id-123");
    expect(errors.password).toBeUndefined();
  });

  it("memberi error jika nomor telepon mengandung huruf", () => {
    const errors = ValidateAnggotaAmil({ ...dataValid, telp: "08abc12345" }, null);
    expect(errors.telp).toBe("Nomor telepon hanya boleh angka!");
  });

  it("memberi error jika nomor telepon kurang dari 10 digit", () => {
    const errors = ValidateAnggotaAmil({ ...dataValid, telp: "0812345" }, null);
    expect(errors.telp).toBe("Nomor telepon tidak valid!");
  });
});
