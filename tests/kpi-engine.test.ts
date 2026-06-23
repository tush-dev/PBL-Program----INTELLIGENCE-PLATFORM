import { describe, it, expect } from "vitest";
import { classifyRisk } from "../src/lib/engines/risk-engine";

describe("KPI Helpers", () => {
  describe("classifyRisk (KPI threshold validation)", () => {
    it("on track threshold is exactly 75", () => {
      expect(classifyRisk(75).riskLevel).toBe("On Track");
      expect(classifyRisk(74.99).riskLevel).toBe("Behind");
    });

    it("behind threshold is 60-74", () => {
      expect(classifyRisk(60).riskLevel).toBe("Behind");
      expect(classifyRisk(74).riskLevel).toBe("Behind");
    });

    it("at risk threshold is 35-59", () => {
      expect(classifyRisk(35).riskLevel).toBe("At Risk");
      expect(classifyRisk(59).riskLevel).toBe("At Risk");
    });

    it("critical threshold is below 35", () => {
      expect(classifyRisk(34.99).riskLevel).toBe("Critical");
      expect(classifyRisk(0).riskLevel).toBe("Critical");
    });
  });
});
