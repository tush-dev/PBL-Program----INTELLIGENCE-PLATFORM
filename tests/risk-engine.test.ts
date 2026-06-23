import { describe, it, expect } from "vitest";
import { classifyRisk, calculateCompositeRisk } from "../src/lib/engines/risk-engine";

describe("Risk Engine", () => {
  describe("classifyRisk", () => {
    it("classifies >= 75 as On Track", () => {
      const result = classifyRisk(75);
      expect(result.riskLevel).toBe("On Track");
    });

    it("classifies >= 60 as Behind", () => {
      const result = classifyRisk(60);
      expect(result.riskLevel).toBe("Behind");
    });

    it("classifies 74 as Behind", () => {
      const result = classifyRisk(74);
      expect(result.riskLevel).toBe("Behind");
    });

    it("classifies >= 35 as At Risk", () => {
      const result = classifyRisk(35);
      expect(result.riskLevel).toBe("At Risk");
    });

    it("classifies 59 as At Risk", () => {
      const result = classifyRisk(59);
      expect(result.riskLevel).toBe("At Risk");
    });

    it("classifies < 35 as Critical", () => {
      const result = classifyRisk(34);
      expect(result.riskLevel).toBe("Critical");
    });

    it("classifies 0 as Critical", () => {
      const result = classifyRisk(0);
      expect(result.riskLevel).toBe("Critical");
    });

    it("classifies 100 as On Track", () => {
      const result = classifyRisk(100);
      expect(result.riskLevel).toBe("On Track");
    });
  });

  describe("calculateCompositeRisk", () => {
    it("calculates weighted composite score", () => {
      const result = calculateCompositeRisk(80, 70, 60);
      expect(result.riskScore).toBeGreaterThan(0);
      expect(["On Track", "Behind", "At Risk", "Critical"]).toContain(
        result.riskLevel
      );
    });

    it("returns On Track for high values", () => {
      const result = calculateCompositeRisk(90, 85, 80);
      expect(result.riskLevel).toBe("On Track");
    });

    it("returns Critical for low values", () => {
      const result = calculateCompositeRisk(20, 15, 10);
      expect(result.riskLevel).toBe("Critical");
    });

    it("is deterministic - same inputs produce same outputs", () => {
      const a = calculateCompositeRisk(65, 55, 45);
      const b = calculateCompositeRisk(65, 55, 45);
      expect(a.riskScore).toBe(b.riskScore);
      expect(a.riskLevel).toBe(b.riskLevel);
    });
  });
});
