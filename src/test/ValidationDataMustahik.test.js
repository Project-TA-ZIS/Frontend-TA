import { describe, it, expect } from "vitest";
import { ValidationDataMustahik } from "../utils/ValidationDataMustahik";

const dataValid = {
  nama: "Andi",
  telp: "08123456789",
  jenisKelamin: "Laki-laki",
  alamat: "Bandung",
  kategori: "Fakir",
  nik: "3201234567890123", // 16 digit
  statusPernikahan: "Belum Menikah",
  statusPekerjaan: "tidak tetap",
  penghasilan: "0-500000",
  tempatLahir: "Bandung",
  tanggalLahir: "2000-01-01",
};

describe("ValidationDataMustahik", () => {
  it("tidak ada error jika data valid", () => {
    expect(ValidationDataMustahik(dataValid)).toEqual({});
  });

  it("error jika nama kosong", () => {
    expect(ValidationDataMustahik({ ...dataValid, nama: "" }).nama).toBe(
      "Nama lengkap wajib diisi!",
    );
  });

  it("error jika nomor telepon kurang dari 10 digit", () => {
    expect(ValidationDataMustahik({ ...dataValid, telp: "0812" }).telp).toBe(
      "Nomor telepon tidak valid!",
    );
  });

  it("error jika jenis kelamin belum dipilih", () => {
    expect(
      ValidationDataMustahik({ ...dataValid, jenisKelamin: "" }).jenisKelamin,
    ).toBe("Jenis kelamin wajib dipilih!");
  });

  it("error jika kategori belum dipilih", () => {
    expect(ValidationDataMustahik({ ...dataValid, kategori: "" }).kategori).toBe(
      "Kategori wajib dipilih!",
    );
  });

  it("error jika NIK tidak 16 digit", () => {
    expect(ValidationDataMustahik({ ...dataValid, nik: "123" }).nik).toBe(
      "NIK harus 16 digit!",
    );
  });

  it("error jika tanggal lahir tidak valid", () => {
    expect(
      ValidationDataMustahik({ ...dataValid, tanggalLahir: "bukan-tanggal" })
        .tanggalLahir,
    ).toBe("Tanggal lahir tidak valid!");
  });
});
