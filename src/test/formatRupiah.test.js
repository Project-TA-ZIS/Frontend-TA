import { describe, it, expect } from "vitest";
import { formatRupiah } from "../utils/formatRupiah";

// Intl bisa memakai spasi non-breaking ( ); kita normalkan agar mudah dicek.
const normal = (s) => s.replace(/ /g, " ");

describe("formatRupiah", () => {
  it("memformat bilangan bulat tanpa desimal", () => {
    const hasil = normal(formatRupiah(10000));
    expect(hasil).toContain("Rp");
    expect(hasil).toContain("10.000");
  });

  it("memformat nilai 0", () => {
    expect(normal(formatRupiah(0))).toContain("0");
  });

  it("memformat angka pecahan dengan satu desimal (pemisah koma)", () => {
    expect(normal(formatRupiah(1500.5))).toContain("1.500,5");
  });
});
