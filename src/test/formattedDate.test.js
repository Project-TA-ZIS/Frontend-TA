import { describe, it, expect } from "vitest";
import { formattedDate, formatDateInput } from "../utils/formattedDate";

// Catatan: dipakai jam 12 siang agar tidak terpengaruh perbedaan zona waktu
// (jika dipakai tengah malam UTC, tanggal bisa bergeser ke hari sebelumnya).

describe("formattedDate", () => {
  it("mengubah tanggal ke format Indonesia (15 Maret 2024)", () => {
    const hasil = formattedDate("2024-03-15T12:00:00");
    expect(hasil).toContain("15");
    expect(hasil).toContain("Maret");
    expect(hasil).toContain("2024");
  });

  it("mengembalikan '-' jika tanggal kosong/null", () => {
    expect(formattedDate("")).toBe("-");
    expect(formattedDate(null)).toBe("-");
  });

  it("mengembalikan '-' jika tanggal tidak valid", () => {
    expect(formattedDate("bukan-tanggal")).toBe("-");
  });
});

describe("formatDateInput", () => {
  it("mengubah tanggal ke format YYYY-MM-DD", () => {
    expect(formatDateInput("2024-03-15T12:00:00")).toBe("2024-03-15");
  });

  it("mengembalikan string kosong jika kosong/invalid", () => {
    expect(formatDateInput("")).toBe("");
    expect(formatDateInput("bukan-tanggal")).toBe("");
  });
});
