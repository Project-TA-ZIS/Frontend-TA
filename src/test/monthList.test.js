import { describe, it, expect } from "vitest";
import MonthList from "../utils/monthList";

describe("MonthList", () => {
  it("berisi tepat 12 bulan", () => {
    expect(MonthList).toHaveLength(12);
  });

  it("dimulai dari Januari dan diakhiri Desember", () => {
    expect(MonthList[0]).toEqual({ value: "Januari", label: "Januari" });
    expect(MonthList[11]).toEqual({ value: "Desember", label: "Desember" });
  });

  it("setiap item memiliki value dan label yang sama", () => {
    MonthList.forEach((bulan) => {
      expect(bulan.value).toBe(bulan.label);
    });
  });
});
