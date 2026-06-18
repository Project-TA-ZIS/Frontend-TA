import { describe, it, expect } from "vitest";
import { validationDataZIS } from "../utils/ValidationDataZIS";

const base = {
  formData: {
    tanggal: "2024-01-01",
    kategori: "Zakat",
    deskripsi: "Zakat fitrah",
    nominal: "50000",
  },
  modalMode: "PEMASUKAN",
  selectedMuzakki: { id: 1 },
  selectedMustahik: null,
};

describe("validationDataZIS", () => {
  it("tidak ada error jika data pemasukan valid", () => {
    expect(validationDataZIS(base)).toEqual({});
  });

  it("error jika tanggal kosong", () => {
    const e = validationDataZIS({
      ...base,
      formData: { ...base.formData, tanggal: "" },
    });
    expect(e.tanggal).toBe("Tanggal wajib diisi");
  });

  it("error jika PEMASUKAN tanpa memilih muzakki", () => {
    const e = validationDataZIS({ ...base, selectedMuzakki: null });
    expect(e.muzakki).toBe("Muzakki wajib dipilih");
  });

  it("error jika PENGELUARAN tanpa memilih mustahik", () => {
    const e = validationDataZIS({
      ...base,
      modalMode: "PENGELUARAN",
      selectedMuzakki: null,
      selectedMustahik: null,
    });
    expect(e.mustahik).toBe("Mustahik wajib dipilih");
  });

  it("error jika nominal <= 0", () => {
    const e = validationDataZIS({
      ...base,
      formData: { ...base.formData, nominal: "0" },
    });
    expect(e.nominal).toBe("Nominal harus lebih dari 0");
  });

  it("error jika kategori kosong", () => {
    const e = validationDataZIS({
      ...base,
      formData: { ...base.formData, kategori: "" },
    });
    expect(e.kategori).toBe("Kategori wajib dipilih");
  });
});
