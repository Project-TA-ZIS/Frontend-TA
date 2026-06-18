import { describe, it, expect } from "vitest";
import { getAvailableYears } from "../utils/getAvailableYears";

describe("getAvailableYears", () => {
  const data = [
    { tanggal: "2023-01-10T12:00:00" },
    { tanggal: "2024-05-20T12:00:00" },
    { tanggal: "2023-12-31T12:00:00" }, // tahun yang sama (harus dihilangkan duplikatnya)
    { tanggal: "" }, // diabaikan
    { tanggal: null }, // diabaikan
  ];

  it("mengembalikan daftar tahun unik dan urut dari terbaru ke terlama", () => {
    expect(getAvailableYears(data)).toEqual([2024, 2023]);
  });

  it("mendukung nama field tanggal yang berbeda", () => {
    const d = [{ createdAt: "2022-06-01T12:00:00" }];
    expect(getAvailableYears(d, "createdAt")).toEqual([2022]);
  });

  it("mengembalikan array kosong jika data kosong", () => {
    expect(getAvailableYears([])).toEqual([]);
  });
});
