import { describe, it, expect } from "vitest";
import { validateAnggotaDasawisma } from "../utils/ValidateAnggotaDasawisma";

const dataValid = {
  nama: "Siti Aminah",
  email: "siti@contoh.com",
  telp: "08123456789",
  nik: "3201234567890123", // 16 digit
  tanggal_lahir: "2000-01-01",
  tempat_lahir: "Jakarta",
  alamat: "Depok, Jawa Barat",
};

describe("validateAnggotaDasawisma", () => {
  it("tidak ada error jika semua data valid", () => {
    expect(validateAnggotaDasawisma(dataValid)).toEqual({});
  });

  it("error jika nama kosong", () => {
    const e = validateAnggotaDasawisma({ ...dataValid, nama: "" });
    expect(e.nama).toBe("Nama lengkap wajib diisi!");
  });

  it("error jika format email salah", () => {
    const e = validateAnggotaDasawisma({ ...dataValid, email: "salah" });
    expect(e.email).toBe("Format email tidak valid!");
  });

  it("error jika nomor telepon mengandung huruf", () => {
    const e = validateAnggotaDasawisma({ ...dataValid, telp: "08ab123" });
    expect(e.telp).toBe("Nomor telepon hanya boleh angka!");
  });

  it("error jika NIK bukan angka", () => {
    const e = validateAnggotaDasawisma({ ...dataValid, nik: "32012345abcd0123" });
    expect(e.nik).toBe("NIK hanya boleh angka!");
  });

  it("error jika NIK tidak 16 digit", () => {
    const e = validateAnggotaDasawisma({ ...dataValid, nik: "12345" });
    expect(e.nik).toBe("NIK harus 16 digit!");
  });

  it("error jika tanggal lahir kosong", () => {
    const e = validateAnggotaDasawisma({ ...dataValid, tanggal_lahir: "" });
    expect(e.tanggal_lahir).toBe("Tanggal lahir wajib diisi!");
  });
});
