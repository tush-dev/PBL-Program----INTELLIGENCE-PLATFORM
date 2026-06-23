import { describe, it, expect } from "vitest";
import { classifyRisk } from "../src/lib/engines/risk-engine";

describe("Review Summary Logic", () => {
  describe("Risk Classification (used in review generation)", () => {
    it("produces deterministic results", () => {
      const results = Array.from({ length: 10 }, () => classifyRisk(72));
      const first = results[0];
      results.forEach((r) => {
        expect(r.riskLevel).toBe(first.riskLevel);
        expect(r.riskReason).toBe(first.riskReason);
      });
    });

    it("produces correct reasons for each level", () => {
      expect(classifyRisk(80).riskReason).toContain("target");
      expect(classifyRisk(65).riskReason).toContain("60-74");
      expect(classifyRisk(45).riskReason).toContain("35-59");
      expect(classifyRisk(20).riskReason).toContain("35");
    });
  });
});
