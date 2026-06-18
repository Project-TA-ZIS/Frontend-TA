import { describe, it, expect } from "vitest";
import {
  formatThousands,
  parseThousandsToNumber,
} from "../utils/formatThousands";

describe("formatThousands", () => {
  it("menyisipkan titik tiap 3 digit", () => {
    expect(formatThousands("1000000")).toBe("1.000.000");
  });

  it("membuang karakter selain angka", () => {
    expect(formatThousands("Rp 1.234 abc")).toBe("1.234");
  });

  it("membuang nol di depan, tapi menyisakan satu nol", () => {
    expect(formatThousands("000123")).toBe("123");
    expect(formatThousands("0000")).toBe("0");
  });

  it("mengembalikan string kosong jika tidak ada angka", () => {
    expect(formatThousands("abc")).toBe("");
    expect(formatThousands("")).toBe("");
    expect(formatThousands(null)).toBe("");
    expect(formatThousands(undefined)).toBe("");
  });
});

describe("parseThousandsToNumber", () => {
  it("mengubah string ribuan menjadi angka", () => {
    expect(parseThousandsToNumber("1.000.000")).toBe(1000000);
  });

  it("mengembalikan 0 jika tidak ada angka", () => {
    expect(parseThousandsToNumber("abc")).toBe(0);
    expect(parseThousandsToNumber("")).toBe(0);
  });
});
