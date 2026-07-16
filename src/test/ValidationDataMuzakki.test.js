import { describe, it, expect } from "vitest";
import { ValidationDataMuzakki } from "../utils/ValidationDataMuzakki";

const dataValid = {
  nama: "Budi",
  email: "budi@contoh.com",
  telp: "08123456789",
  alamat: "Jakarta",
  npwp: "012345678901234", // 15 digit
  nik: "3201234567890123", // 16 digit
  tempatLahir: "Jakarta",
  tanggalLahir: "1990-01-01",
  pekerjaan: "Pegawai",
};

describe("ValidationDataMuzakki", () => {
  it("tidak ada error jika data valid", () => {
    expect(ValidationDataMuzakki(dataValid)).toEqual({});
  });

  it("error jika format email salah", () => {
    expect(ValidationDataMuzakki({ ...dataValid, email: "salah" }).email).toBe(
      "Format email tidak valid!",
    );
  });

  it("error jika NIK tidak 16 digit", () => {
    expect(ValidationDataMuzakki({ ...dataValid, nik: "123" }).nik).toBe(
      "NIK harus 16 digit!",
    );
  });

  it("error jika telepon kurang dari 10 digit", () => {
    expect(ValidationDataMuzakki({ ...dataValid, telp: "0812" }).telp).toBe(
      "Nomor telepon minimal 10 digit!",
    );
  });

  it("error jika pekerjaan kosong", () => {
    expect(
      ValidationDataMuzakki({ ...dataValid, pekerjaan: "" }).pekerjaan,
    ).toBe("Pekerjaan wajib diisi!");
  });
});
