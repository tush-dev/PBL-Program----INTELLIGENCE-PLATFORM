import type { ReviewSummary, GrantNarrativeData } from "@/types";

export interface NarrativeGenerator {
  generateNarrative(summary: ReviewSummary): Promise<string>;
  generateGrantNarrative(data: GrantNarrativeData): Promise<string>;
}

export class RuleBasedGenerator implements NarrativeGenerator {
  async generateNarrative(summary: ReviewSummary): Promise<string> {
    const parts: string[] = [];

    parts.push(summary.executiveSummary);

    if (summary.achievements.length > 0) {
      parts.push(`\nKey Achievements:\n${summary.achievements.map((a) => `• ${a}`).join("\n")}`);
    }

    if (summary.gaps.length > 0) {
      parts.push(`\nAreas for Improvement:\n${summary.gaps.map((g) => `• ${g}`).join("\n")}`);
    }

    if (summary.priorityDistricts.length > 0) {
      parts.push(`\nPriority Districts:\n${summary.priorityDistricts.map((d) => `• ${d}`).join("\n")}`);
    }

    if (summary.priorityBlocks.length > 0) {
      parts.push(`\nPriority Blocks:\n${summary.priorityBlocks.map((b) => `• ${b}`).join("\n")}`);
    }

    parts.push(`\nDiscussion Points:\n${summary.discussionPoints.map((p) => `• ${p}`).join("\n")}`);

    return parts.join("\n\n");
  }

  async generateGrantNarrative(data: GrantNarrativeData): Promise<string> {
    const pblPct = data.pblCompletionPercent;
    const evPct = data.evidenceSubmissionPercent;
    const attPct = data.attendancePercent;
    const budPct = data.budgetUtilizationPercent;
    const lines: string[] = [];

    lines.push("Executive Summary");
    lines.push("");
    lines.push(
      `Grant ${data.grantName} (${data.grantCode}) was reported for ${data.reportingMonth} across ${data.coveredDistricts}. ` +
      `PBL completion reached ${pblPct}%, while evidence submission was ${evPct}% and attendance was ${attPct}%. ` +
      `Budget utilization stood at ${budPct}%, resulting in a ${data.riskStatus} classification.`
    );

    lines.push("");
    lines.push("Key Observations");
    lines.push("");

    if (pblPct >= 75) {
      lines.push(`• PBL completion exceeded the 75% target at ${pblPct}%.`);
    } else {
      lines.push(`• PBL completion is below the 75% target at ${pblPct}%.`);
    }

    if (evPct >= 60) {
      lines.push(`• Evidence submission is satisfactory at ${evPct}%.`);
    } else {
      lines.push(`• Evidence submission requires attention at ${evPct}%.`);
    }

    if (attPct >= 60) {
      lines.push(`• Attendance is satisfactory at ${attPct}%.`);
    } else {
      lines.push(`• Attendance is the lowest reported metric at ${attPct}%.`);
    }

    lines.push(`• Budget utilization is currently ${budPct}%.`);

    if (data.recommendations.length > 0 || data.topIssues.length > 0) {
      lines.push("");
      lines.push("Recommended Actions");
      lines.push("");

      for (const issue of data.topIssues) {
        if (issue.toLowerCase().includes("attendance")) {
          lines.push("• Strengthen attendance monitoring and follow-up activities.");
        } else if (issue.toLowerCase().includes("evidence")) {
          lines.push("• Improve evidence collection and submission processes.");
        } else if (issue.toLowerCase().includes("pbl") || issue.toLowerCase().includes("completion")) {
          lines.push("• Prioritize schools with low PBL completion rates.");
        } else if (issue.toLowerCase().includes("budget")) {
          lines.push("• Review grant spending plans to support program implementation.");
        }
      }
    }

    return lines.join("\n");
  }
}

export class GroqGenerator implements NarrativeGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
  }

  async generateNarrative(summary: ReviewSummary): Promise<string> {
    if (!this.apiKey) {
      return new RuleBasedGenerator().generateNarrative(summary);
    }

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content:
                  "You are a program analytics writer. Generate a concise, professional narrative from the given structured program review data. Focus on key insights, risks, and recommendations. Be factual and data-driven.",
              },
              {
                role: "user",
                content: JSON.stringify(summary),
              },
            ],
            temperature: 0.3,
            max_tokens: 1024,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch {
      return new RuleBasedGenerator().generateNarrative(summary);
    }
  }

  async generateGrantNarrative(data: GrantNarrativeData): Promise<string> {
    if (!this.apiKey) {
      return new RuleBasedGenerator().generateGrantNarrative(data);
    }

    const systemPrompt = [
      "You are a Program Intelligence Assistant for an educational NGO dashboard.",
      "Your job is to generate concise professional summaries from structured program data.",
      "",
      "IMPORTANT RULES:",
      "1. Use ONLY the data provided.",
      "2. NEVER invent numbers, districts, schools, grants, months, trends, reasons, or recommendations that are not supported by the input.",
      "3. If a metric is missing, do not mention it.",
      "4. Keep responses factual and professional.",
      "5. Do not claim causes unless explicitly present in the data.",
      "6. Recommendations must be based only on low-performing metrics.",
      "7. Keep output under 150 words.",
      "8. Write in donor-reporting style.",
      "9. Do not use markdown.",
      "10. Do not mention AI or LLM.",
      "",
      "Risk Thresholds:",
      "- On Track: >= 75",
      "- Behind: >= 60 and < 75",
      "- At Risk: >= 35 and < 60",
      "- Critical: < 35",
    ].join("\n");

    const userPrompt = [
      "Generate a monthly program narrative.",
      "",
      "Data:",
      "",
      `Grant Name: ${data.grantName}`,
      `Grant Code: ${data.grantCode}`,
      "",
      `Reporting Month: ${data.reportingMonth}`,
      "",
      "Districts Covered:",
      data.coveredDistricts.split(",").map((d) => d.trim()).join("\n"),
      "",
      `Budget Utilization: ${data.budgetUtilizationPercent}%`,
      `PBL Completion: ${data.pblCompletionPercent}%`,
      `Evidence Submission: ${data.evidenceSubmissionPercent}%`,
      `Attendance: ${data.attendancePercent}%`,
      "",
      `Risk Status: ${data.riskStatus}`,
      "",
      "Top Issues:",
      data.topIssues.map((i) => `- ${i}`).join("\n"),
      "",
      "Generate:",
      "1. Executive Summary",
      "2. Key Observations",
      "3. Recommended Actions",
    ].join("\n");

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1024,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || "";
    } catch {
      return new RuleBasedGenerator().generateGrantNarrative(data);
    }
  }
}

export function createNarrativeGenerator(): NarrativeGenerator {
  const useAI = process.env.USE_AI?.toLowerCase() === "true";
  if (useAI) {
    return new GroqGenerator();
  }
  return new RuleBasedGenerator();
}
