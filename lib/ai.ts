import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model can be overridden via ANTHROPIC_MODEL env var without a code change.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function extractJson<T>(text: string): T {
  // Claude may wrap JSON in prose or fences despite instructions; extract the first {...} block.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI response did not contain JSON");
  return JSON.parse(match[0]) as T;
}

// ---------------------------------------------------------------------------
// 1. Capital Readiness Assessment
// ---------------------------------------------------------------------------

export interface ProjectForScoring {
  companyName: string;
  country: string;
  sector: string;
  description: string;
  fundingRequirement: number;
  currency: string;
  instrument: string;
  desiredTenorMonths?: number | null;
  existingEquity?: number | null;
  revenue?: number | null;
  ebitda?: number | null;
  existingDebt?: number | null;
  hasCollateral: boolean;
  hasOfftakeContracts: boolean;
  hasGovApprovals: boolean;
  documentCategories: string[];
}

export interface AssessmentResult {
  score: number;
  sponsorScore: number;
  financialScore: number;
  projectEconomicsScore: number;
  securityScore: number;
  regulatoryScore: number;
  governanceScore: number;
  narrative: string;
  missingDocuments: string[];
}

const REQUIRED_DOC_CATEGORIES = [
  "FINANCIAL_STATEMENTS",
  "BUSINESS_PLAN",
  "FEASIBILITY_STUDY",
  "FINANCIAL_MODEL",
  "LICENCE",
  "GOV_APPROVAL",
];

export async function generateCapitalReadinessAssessment(
  project: ProjectForScoring
): Promise<AssessmentResult> {
  const missingDocuments = REQUIRED_DOC_CATEGORIES.filter(
    (c) => !project.documentCategories.includes(c)
  );

  const system = `You are the Capital Readiness analytical engine for Geneses Capital Exchange, a structured-finance platform connecting African projects with global capital.
You produce an INTERNAL analytical assessment only. It is NOT a securities rating, credit rating, or investment recommendation, and must never be presented as one.
You never promise or imply guaranteed funding.
Score each category 0-100 based strictly on the information provided. Where information is missing, score conservatively and note the gap in the narrative rather than assuming favorable facts.
Respond with ONLY a single JSON object, no prose before or after, no markdown fences, matching exactly this shape:
{
  "sponsorScore": number,
  "financialScore": number,
  "projectEconomicsScore": number,
  "securityScore": number,
  "regulatoryScore": number,
  "governanceScore": number,
  "narrative": string
}
The narrative should be 150-250 words, written for an internal transaction professional, covering strengths, weaknesses, and what would most improve capital readiness. Do not use the words "guaranteed" or "will receive funding".`;

  const user = `Project data:
Company: ${project.companyName}
Country: ${project.country}
Sector: ${project.sector}
Description: ${project.description}
Funding requirement: ${project.fundingRequirement} ${project.currency}
Instrument sought: ${project.instrument}
Desired tenor (months): ${project.desiredTenorMonths ?? "not specified"}
Existing equity: ${project.existingEquity ?? "not disclosed"}
Revenue: ${project.revenue ?? "not disclosed"}
EBITDA: ${project.ebitda ?? "not disclosed"}
Existing debt: ${project.existingDebt ?? "not disclosed"}
Has collateral: ${project.hasCollateral}
Has offtake/contracts: ${project.hasOfftakeContracts}
Has government approvals: ${project.hasGovApprovals}
Documents on file: ${project.documentCategories.join(", ") || "none uploaded"}
Missing standard documents: ${missingDocuments.join(", ") || "none"}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  const parsed = extractJson<Omit<AssessmentResult, "score" | "missingDocuments">>(text);

  const weights = {
    sponsorScore: 0.2,
    financialScore: 0.25,
    projectEconomicsScore: 0.2,
    securityScore: 0.15,
    regulatoryScore: 0.1,
    governanceScore: 0.1,
  };
  const score = Math.round(
    parsed.sponsorScore * weights.sponsorScore +
      parsed.financialScore * weights.financialScore +
      parsed.projectEconomicsScore * weights.projectEconomicsScore +
      parsed.securityScore * weights.securityScore +
      parsed.regulatoryScore * weights.regulatoryScore +
      parsed.governanceScore * weights.governanceScore
  );

  return { ...parsed, score, missingDocuments };
}

// ---------------------------------------------------------------------------
// 2. Capital Matching — objective compatibility scoring + AI rationale
// ---------------------------------------------------------------------------

export interface MandateForMatching {
  institutionName: string;
  minTicket: number;
  maxTicket: number;
  preferredCountries: string[];
  preferredSectors: string[];
  instruments: string[];
  minTenorMonths?: number | null;
  maxTenorMonths?: number | null;
  currency: string;
}

export interface MatchFactors {
  geography: boolean;
  sector: boolean;
  ticketSize: boolean;
  instrument: boolean;
  currency: boolean;
  tenor: boolean;
}

export function computeCompatibilityScore(
  project: ProjectForScoring,
  mandate: MandateForMatching
): { score: number; factors: MatchFactors } {
  const factors: MatchFactors = {
    geography: mandate.preferredCountries.length === 0 || mandate.preferredCountries.includes(project.country),
    sector: mandate.preferredSectors.length === 0 || mandate.preferredSectors.includes(project.sector),
    ticketSize: project.fundingRequirement >= mandate.minTicket && project.fundingRequirement <= mandate.maxTicket,
    instrument: mandate.instruments.length === 0 || mandate.instruments.includes(project.instrument),
    currency: mandate.currency === project.currency,
    tenor:
      !project.desiredTenorMonths ||
      ((mandate.minTenorMonths ?? 0) <= project.desiredTenorMonths &&
        project.desiredTenorMonths <= (mandate.maxTenorMonths ?? 999)),
  };

  const weights: Record<keyof MatchFactors, number> = {
    geography: 20,
    sector: 20,
    ticketSize: 25,
    instrument: 20,
    currency: 5,
    tenor: 10,
  };

  const score = Object.entries(factors).reduce(
    (sum, [key, ok]) => sum + (ok ? weights[key as keyof MatchFactors] : 0),
    0
  );

  return { score, factors };
}

export async function generateMatchRationale(
  project: ProjectForScoring,
  mandate: MandateForMatching,
  factors: MatchFactors,
  score: number
): Promise<string> {
  const system = `You are the capital-matching analyst assistant for Geneses Capital Exchange. Given a project and a capital provider's mandate plus objective compatibility factors, write a concise 2-3 sentence internal rationale for a transaction professional deciding whether to release this match. Never state or imply the match guarantees funding. Respond with plain text only, no JSON, no markdown.`;

  const user = `Project: ${project.companyName} (${project.sector}, ${project.country}) seeking ${project.fundingRequirement} ${project.currency} via ${project.instrument}.
Capital provider: ${mandate.institutionName}, ticket range ${mandate.minTicket}-${mandate.maxTicket} ${mandate.currency}, sectors: ${mandate.preferredSectors.join(", ") || "any"}, countries: ${mandate.preferredCountries.join(", ") || "any"}.
Objective compatibility score: ${score}/100.
Factors met: ${Object.entries(factors).filter(([, v]) => v).map(([k]) => k).join(", ") || "none"}.
Factors not met: ${Object.entries(factors).filter(([, v]) => !v).map(([k]) => k).join(", ") || "none"}.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system,
    messages: [{ role: "user", content: user }],
  });

  return response.content.find((b) => b.type === "text")?.text ?? "";
}

// ---------------------------------------------------------------------------
// 3. Drafting assistance (executive summary)
// ---------------------------------------------------------------------------

export async function draftExecutiveSummary(project: ProjectForScoring): Promise<string> {
  const system = `You are a structured-finance drafting assistant for Geneses Capital Exchange. Draft a professional, factual executive summary (300-400 words) for an information memorandum based only on the data given. Do not invent facts, financial figures, or guarantees. Flag clearly with "[TO CONFIRM]" any point that would need sponsor confirmation. This draft will be reviewed and edited by a human analyst before use — write it as a strong first draft, not a final document. Respond with plain text only.`;

  const user = `Company: ${project.companyName}
Country: ${project.country}
Sector: ${project.sector}
Description: ${project.description}
Funding requirement: ${project.fundingRequirement} ${project.currency}
Instrument sought: ${project.instrument}
Revenue: ${project.revenue ?? "not disclosed"}
EBITDA: ${project.ebitda ?? "not disclosed"}
Collateral available: ${project.hasCollateral}
Offtake/contracts in place: ${project.hasOfftakeContracts}
Government approvals: ${project.hasGovApprovals}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 900,
    system,
    messages: [{ role: "user", content: user }],
  });

  return response.content.find((b) => b.type === "text")?.text ?? "";
}
