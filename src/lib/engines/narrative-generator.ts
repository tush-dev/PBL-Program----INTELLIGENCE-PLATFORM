import type { ReviewSummary } from "@/types";

export interface NarrativeGenerator {
  generateNarrative(summary: ReviewSummary): Promise<string>;
  generateGrantNarrative(data: {
    grantName: string;
    financialSummary: string;
    outcomeSummary: string;
    recommendations: string[];
  }): Promise<string>;
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

  async generateGrantNarrative(data: {
    grantName: string;
    financialSummary: string;
    outcomeSummary: string;
    recommendations: string[];
  }): Promise<string> {
    const parts: string[] = [
      `Grant Report: ${data.grantName}`,
      `\nFinancial Summary:\n${data.financialSummary}`,
      `\nOutcome Summary:\n${data.outcomeSummary}`,
    ];

    if (data.recommendations.length > 0) {
      parts.push(`\nRecommendations:\n${data.recommendations.map((r) => `• ${r}`).join("\n")}`);
    }

    return parts.join("\n\n");
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

  async generateGrantNarrative(data: {
    grantName: string;
    financialSummary: string;
    outcomeSummary: string;
    recommendations: string[];
  }): Promise<string> {
    if (!this.apiKey) {
      return new RuleBasedGenerator().generateGrantNarrative(data);
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
                  "You are a grant reporting specialist. Generate a professional grant report narrative from the given structured data. Be concise and data-driven.",
              },
              {
                role: "user",
                content: JSON.stringify(data),
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

      const data_ = await response.json();
      return data_.choices[0]?.message?.content || "";
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
