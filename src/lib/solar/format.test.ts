import { describe, expect, it } from "vitest";
import { formatInr } from "./format";

describe("formatInr", () => {
  it("groups in lakhs and crores", () => {
    expect(formatInr(1234)).toBe("₹1,234");
    expect(formatInr(420000)).toBe("₹4,20,000");
    expect(formatInr(10000000)).toBe("₹1,00,00,000");
  });

  it("compacts from one lakh upwards", () => {
    expect(formatInr(815000, { compact: true })).toBe("₹8.2L");
    expect(formatInr(400000, { compact: true })).toBe("₹4L");
    expect(formatInr(12500000, { compact: true })).toBe("₹1.25Cr");
    expect(formatInr(50000, { compact: true })).toBe("₹50,000");
  });

  it("handles signs, bare numbers and missing values", () => {
    expect(formatInr(-1500)).toBe("-₹1,500");
    expect(formatInr(50000, { bare: true })).toBe("50,000");
    expect(formatInr(null)).toBe("—");
    expect(formatInr(Number.NaN)).toBe("—");
  });
});
