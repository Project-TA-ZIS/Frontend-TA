import { describe, it, expect } from "vitest";
import { validateEditKasDasawisma } from "../utils/validateEditKasDasawisma";

const dataValid = {
  tanggal: "2024-01-01",
  deskripsi: "Iuran warga",
  nominal: "50000",
  jenis: "Pengeluaran",
  sumber: "",
  anggota_dasawisma_id: "",
};

describe("validateEditKasDasawisma", () => {
  it("tidak ada error jika data valid", () => {
    expect(validateEditKasDasawisma(dataValid)).toEqual({});
  });

  it("error jika tanggal kosong", () => {
    const e = validateEditKasDasawisma({ ...dataValid, tanggal: "" });
    expect(e.tanggal).toBe("Tanggal transaksi wajib diisi");
  });

  it("error jika deskripsi kosong", () => {
    const e = validateEditKasDasawisma({ ...dataValid, deskripsi: "   " });
    expect(e.deskripsi).toBe("Deskripsi kegiatan wajib diisi");
  });

  it("error jika nominal kosong", () => {
    const e = validateEditKasDasawisma({ ...dataValid, nominal: "" });
    expect(e.nominal).toBe("Nominal wajib diisi");
  });

  it("error jika nominal <= 0", () => {
    const e = validateEditKasDasawisma({ ...dataValid, nominal: "0" });
    expect(e.nominal).toBe("Nominal harus lebih dari 0");
  });

  it("error jika pemasukan IURAN tanpa memilih anggota dasawisma", () => {
    const e = validateEditKasDasawisma({
      ...dataValid,
      jenis: "Pemasukan",
      sumber: "IURAN",
      anggota_dasawisma_id: "",
    });
    expect(e.anggota_dasawisma_id).toBe("Silakan pilih anggota Dasawisma");
  });
});
