import { describe, it, expect } from "vitest";
import { ValidationEditZIS } from "../utils/ValidationEditZIS";

const dataValid = {
  tanggal: "2024-01-01",
  deskripsi: "Penyaluran zakat",
  nominal: "75000",
};

describe("ValidationEditZIS", () => {
  it("tidak ada error jika data valid", () => {
    expect(ValidationEditZIS(dataValid)).toEqual({});
  });

  it("error jika tanggal kosong", () => {
    expect(ValidationEditZIS({ ...dataValid, tanggal: "" }).tanggal).toBe(
      "Tanggal wajib diisi",
    );
  });

  it("error jika deskripsi kosong", () => {
    expect(ValidationEditZIS({ ...dataValid, deskripsi: "  " }).deskripsi).toBe(
      "Deskripsi wajib diisi",
    );
  });

  it("error jika nominal kosong", () => {
    expect(ValidationEditZIS({ ...dataValid, nominal: "" }).nominal).toBe(
      "Nominal wajib diisi",
    );
  });

  it("error jika nominal <= 0", () => {
    expect(ValidationEditZIS({ ...dataValid, nominal: "0" }).nominal).toBe(
      "Nominal harus lebih dari 0",
    );
  });
});
