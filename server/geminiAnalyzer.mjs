import { GoogleGenAI, createPartFromBase64 } from "@google/genai";

const DEFAULT_MODEL = "gemini-2.5-flash";
const LEGAL_DISCLAIMER =
  "LexGuard provides legal awareness, not legal advice. Consult a qualified legal professional before making legal decisions.";

const severityValues = new Set(["low", "medium", "high", "critical"]);
const documentTypes = new Set([
  "Employment Agreement",
  "Rental Agreement",
  "SaaS Terms",
  "Freelance Contract",
  "Privacy Policy",
  "Vendor Agreement",
  "Unknown",
]);
const affectedParties = new Set(["Individual", "Employee", "Freelancer", "Startup", "Consumer", "Vendor", "Unknown"]);

export async function analyzeContractWithGemini(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured on the server.");
    error.code = "MISSING_API_KEY";
    throw error;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildLegalRiskPrompt(input);
  const parts = [{ text: prompt }];

  if (input.text) {
    parts.push({ text: `\n\nDOCUMENT TEXT:\n${input.text}` });
  }

  if (input.file?.buffer && input.file?.mimeType) {
    parts.push(createPartFromBase64(input.file.buffer.toString("base64"), input.file.mimeType));
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.15,
    },
  });

  const responseText = typeof response.text === "function" ? response.text() : response.text;
  const parsed = safeJsonParse(responseText ?? "");

  if (!parsed) {
    const error = new Error("Gemini returned malformed JSON.");
    error.code = "MALFORMED_GEMINI_JSON";
    throw error;
  }

  return normalizeReport(parsed, {
    affectedParty: input.affectedParty,
    documentType: input.documentType,
    documentTitle: input.fileName || "Analyzed contract",
    inputSource: input.inputSource,
    model,
  });
}

export function safeJsonParse(value) {
  if (!value || typeof value !== "string") return null;

  const candidates = [
    value.trim(),
    value.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim(),
    value.slice(value.indexOf("{"), value.lastIndexOf("}") + 1),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

export function normalizeSeverity(value, fallback = "medium") {
  const normalized = String(value ?? "").toLowerCase();
  return severityValues.has(normalized) ? normalized : fallback;
}

export function clampScore(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function clampConfidence(value, fallback = 60) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const normalized = number > 0 && number <= 1 ? number * 100 : number;
  return clampScore(normalized, fallback);
}

export function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

export function createFallbackReportFromError(error, meta = {}) {
  const message = error instanceof Error ? error.message : "AI analysis failed.";
  return {
    id: `lexguard-error-${Date.now()}`,
    createdAt: new Date().toISOString(),
    documentTitle: meta.documentTitle || "Analysis unavailable",
    documentType: normalizeDocumentType(meta.documentType),
    affectedParty: normalizeAffectedParty(meta.affectedParty),
    inputSource: meta.inputSource || "unknown input",
    engineMode: "Gemini document intelligence",
    model: meta.model || process.env.GEMINI_MODEL || DEFAULT_MODEL,
    overallRiskScore: 0,
    overallRiskLabel: "low",
    executiveSummary: "AI analysis could not complete.",
    whatThisMeans: message,
    reviewBeforeSigning: ["Try again or use the sample fallback report for demo continuity."],
    severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
    topRisks: [],
    clauseRisks: [],
    futureScenarios: [],
    obligationTimeline: [],
    negotiationSuggestions: [],
    transparency: {
      analysisMethod: ["Gemini document understanding"],
      riskCategoriesChecked: [],
      limitations: [message],
      disclaimer: LEGAL_DISCLAIMER,
    },
  };
}

export function normalizeReport(raw, meta) {
  const clauseRisks = ensureArray(raw.clauseRisks).map((risk, index) => normalizeClauseRisk(risk, index));
  const fallbackBreakdown = createSeverityBreakdown(clauseRisks);
  const topRisks = normalizeTopRisks(raw.topRisks, clauseRisks);
  const reviewBeforeSigning = strings(raw.reviewBeforeSigning);
  const futureScenarios = ensureArray(raw.futureScenarios).map((scenario, index) => normalizeScenario(scenario, index));
  const obligationTimeline = ensureArray(raw.obligationTimeline).map((event, index) => normalizeTimelineEvent(event, index));
  const riskScore = normalizeOverallRiskScore(raw.overallRiskScore, raw.overallRiskLabel, clauseRisks);

  return {
    id: stringOr(raw.id, `lexguard-${Date.now()}`),
    createdAt: new Date().toISOString(),
    documentTitle: stringOr(raw.documentTitle, meta.documentTitle),
    documentType: normalizeDocumentType(raw.documentType ?? meta.documentType),
    affectedParty: normalizeAffectedParty(raw.affectedParty ?? meta.affectedParty),
    inputSource: meta.inputSource,
    engineMode: "Gemini document intelligence",
    model: meta.model,
    overallRiskScore: riskScore,
    overallRiskLabel: scoreToSeverity(riskScore),
    executiveSummary: stringOr(
      raw.executiveSummary,
      "LexGuard analyzed the document for clause-level risks, future obligations, and negotiation opportunities.",
    ),
    whatThisMeans: stringOr(
      raw.whatThisMeans,
      "Review the highlighted clauses before signing and ask for clarification where language is broad, one-sided, or ambiguous.",
    ),
    reviewBeforeSigning: reviewBeforeSigning.length
      ? reviewBeforeSigning
      : topRisks.map((risk) => risk.action).filter(Boolean),
    severityBreakdown: clauseRisks.length ? fallbackBreakdown : normalizeSeverityBreakdown(raw.severityBreakdown, fallbackBreakdown),
    topRisks,
    clauseRisks,
    futureScenarios: futureScenarios.length ? futureScenarios : createFallbackScenarios(clauseRisks),
    obligationTimeline: obligationTimeline.length ? obligationTimeline : createFallbackTimeline(clauseRisks),
    negotiationSuggestions: normalizeNegotiationSuggestions(raw.negotiationSuggestions, clauseRisks),
    transparency: normalizeTransparency(raw.transparency),
  };
}

function normalizeClauseRisk(risk, index) {
  return {
    id: stringOr(risk?.id, `risk-${index + 1}`),
    title: stringOr(risk?.title, `Risk ${index + 1}`),
    category: stringOr(risk?.category, "Other"),
    severity: normalizeSeverity(risk?.severity),
    confidence: clampConfidence(risk?.confidence, 60),
    sourceText: stringOr(risk?.sourceText, "Exact clause excerpt not detected in model output."),
    evidenceLocation: stringOr(risk?.evidenceLocation, "Location not detected"),
    plainEnglish: stringOr(risk?.plainEnglish, "This clause may create practical risk or ambiguity."),
    whyItMatters: stringOr(risk?.whyItMatters, "The clause may affect rights, obligations, leverage, or future exposure."),
    futureScenario: stringOr(risk?.futureScenario, "A future dispute could make this language important."),
    affectedPartyImpact: stringOr(risk?.affectedPartyImpact, "The selected party may carry additional risk or uncertainty."),
    suggestedQuestion: stringOr(risk?.suggestedQuestion, "Can this clause be clarified, narrowed, or made mutual?"),
    negotiationRewrite: stringOr(risk?.negotiationRewrite, "Use narrower, mutual, and clearly scoped wording."),
    tags: strings(risk?.tags),
  };
}

function normalizeScenario(scenario, index) {
  return {
    id: stringOr(scenario?.id, `scenario-${index + 1}`),
    title: stringOr(scenario?.title, `Future scenario ${index + 1}`),
    scenario: stringOr(scenario?.scenario, "This term could matter later if circumstances change."),
    relatedRisks: strings(scenario?.relatedRisks),
    severity: normalizeSeverity(scenario?.severity),
  };
}

function normalizeTimelineEvent(event, index) {
  const defaultFrames = ["Today", "30 days", "90 days", "12 months"];
  return {
    timeframe: stringOr(event?.timeframe, defaultFrames[index] || "Other"),
    title: stringOr(event?.title, `Obligation ${index + 1}`),
    description: stringOr(event?.description, "Review this timing before signing."),
    relatedRisks: strings(event?.relatedRisks),
  };
}

function createFallbackScenarios(clauseRisks) {
  return clauseRisks.slice(0, 4).map((risk, index) => ({
    id: `scenario-${index + 1}`,
    title: `If "${risk.title}" becomes a dispute...`,
    scenario: risk.futureScenario,
    relatedRisks: [risk.id],
    severity: risk.severity,
  }));
}

function createFallbackTimeline(clauseRisks) {
  const primaryRiskIds = clauseRisks.slice(0, 3).map((risk) => risk.id);
  return [
    {
      timeframe: "Today",
      title: "Signing decision",
      description: "Review the highest-severity findings and clarify broad or ambiguous terms before accepting.",
      relatedRisks: primaryRiskIds,
    },
    {
      timeframe: "30 days",
      title: "Notice and cancellation check",
      description: "Calendar renewal, notice, cancellation, payment, or termination windows that could activate soon.",
      relatedRisks: primaryRiskIds,
    },
    {
      timeframe: "90 days",
      title: "Operational review",
      description: "Re-check data sharing, payment exposure, deliverable ownership, and performance obligations.",
      relatedRisks: primaryRiskIds,
    },
    {
      timeframe: "12 months",
      title: "Long-tail exposure",
      description: "Confirm whether restrictions, indemnity, liability, renewal, or confidentiality obligations survive.",
      relatedRisks: primaryRiskIds,
    },
  ];
}

function normalizeTopRisks(topRisks, clauseRisks) {
  const normalized = ensureArray(topRisks).map((risk, index) => ({
    title: stringOr(risk?.title, clauseRisks[index]?.title ?? `Top risk ${index + 1}`),
    severity: normalizeSeverity(risk?.severity, clauseRisks[index]?.severity ?? "medium"),
    whyItMatters: stringOr(risk?.whyItMatters, clauseRisks[index]?.whyItMatters ?? "Worth reviewing before signing."),
    action: stringOr(risk?.action, clauseRisks[index]?.suggestedQuestion ?? "Ask for clearer, safer wording."),
  }));

  if (normalized.length) return normalized;

  return clauseRisks.slice(0, 3).map((risk) => ({
    title: risk.title,
    severity: risk.severity,
    whyItMatters: risk.whyItMatters,
    action: risk.suggestedQuestion,
  }));
}

function normalizeNegotiationSuggestions(suggestions, clauseRisks) {
  const normalized = ensureArray(suggestions).map((suggestion, index) => ({
    riskTitle: stringOr(suggestion?.riskTitle, clauseRisks[index]?.title ?? `Risk ${index + 1}`),
    question: stringOr(suggestion?.question, clauseRisks[index]?.suggestedQuestion ?? "Can this be clarified or narrowed?"),
    saferWording: stringOr(suggestion?.saferWording, clauseRisks[index]?.negotiationRewrite ?? "Use mutual, scoped language."),
    priority: normalizeSeverity(suggestion?.priority, clauseRisks[index]?.severity ?? "medium"),
  }));

  if (normalized.length) return normalized;

  return clauseRisks.slice(0, 4).map((risk) => ({
    riskTitle: risk.title,
    question: risk.suggestedQuestion,
    saferWording: risk.negotiationRewrite,
    priority: risk.severity,
  }));
}

function normalizeTransparency(transparency = {}) {
  return {
    analysisMethod: strings(transparency.analysisMethod).length
      ? strings(transparency.analysisMethod)
      : [
          "Gemini document understanding",
          "Clause extraction",
          "Risk taxonomy classification",
          "Scenario-based consequence reasoning",
          "Negotiation recommendation mapping",
        ],
    riskCategoriesChecked: strings(transparency.riskCategoriesChecked).length
      ? strings(transparency.riskCategoriesChecked)
      : [
          "Ownership",
          "Employment",
          "Renewal",
          "Liability",
          "Privacy",
          "Dispute resolution",
          "Termination",
          "Payment",
          "Compliance",
          "Ambiguity",
        ],
    limitations: strings(transparency.limitations).length
      ? strings(transparency.limitations)
      : [
          "Legal awareness, not legal advice.",
          "May miss context outside the uploaded document.",
          "Jurisdiction-specific interpretation requires a professional.",
          "OCR or scan quality can affect extraction.",
          "AI outputs should be reviewed before decisions.",
        ],
    disclaimer: stringOr(transparency.disclaimer, LEGAL_DISCLAIMER),
  };
}

function normalizeSeverityBreakdown(value, fallback) {
  return {
    critical: clampScore(value?.critical, fallback.critical),
    high: clampScore(value?.high, fallback.high),
    medium: clampScore(value?.medium, fallback.medium),
    low: clampScore(value?.low, fallback.low),
  };
}

function normalizeOverallRiskScore(score, label, clauseRisks = []) {
  const evidenceScore = scoreFromClauseRisks(clauseRisks);
  let normalizedScore;

  if (score !== undefined && score !== null && score !== "") {
    normalizedScore = clampScore(score);
  } else {
    const labelScores = {
      low: 18,
      medium: 42,
      high: 68,
      critical: 86,
    };

    normalizedScore = labelScores[normalizeSeverity(label, "medium")];
  }

  if (evidenceScore === null) return normalizedScore;

  return Math.max(normalizedScore, evidenceScore);
}

function scoreFromClauseRisks(risks) {
  if (!risks.length) return null;

  const severityFloors = {
    low: 18,
    medium: 42,
    high: 68,
    critical: 86,
  };
  const highestFloor = Math.max(...risks.map((risk) => severityFloors[normalizeSeverity(risk.severity, "medium")]));
  const volumeBump = Math.min(10, Math.max(0, risks.length - 1) * 2);

  return clampScore(highestFloor + volumeBump);
}

function createSeverityBreakdown(risks) {
  return risks.reduce(
    (breakdown, risk) => {
      breakdown[risk.severity] += 1;
      return breakdown;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

function scoreToSeverity(score) {
  const value = clampScore(score);
  if (value >= 75) return "critical";
  if (value >= 50) return "high";
  if (value >= 25) return "medium";
  return "low";
}

function normalizeDocumentType(value) {
  const normalized = stringOr(value, "Unknown");
  return documentTypes.has(normalized) ? normalized : "Unknown";
}

function normalizeAffectedParty(value) {
  const normalized = stringOr(value, "Unknown");
  return affectedParties.has(normalized) ? normalized : "Unknown";
}

function strings(value) {
  return ensureArray(value)
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function stringOr(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function buildLegalRiskPrompt(input) {
  return `You are LexGuard, an AI contract intelligence system.
Analyze the provided legal or quasi-legal document from the perspective of the affected party.
Your task is not to summarize generally.
Your task is to identify harmful, exploitative, ambiguous, one-sided, hidden, or high-risk clauses before the user signs.

Document context:
- Document type: ${input.documentType || "Unknown"}
- Affected party: ${input.affectedParty || "Unknown"}
- Input source: ${input.inputSource || "Unknown"}
- File name: ${input.fileName || "Not provided"}

You must:
- extract important clauses
- classify risks
- identify hidden liabilities
- identify unfavorable obligations
- detect ambiguous language
- detect broad IP transfers
- detect non-compete or restrictive covenants
- detect automatic renewal or cancellation traps
- detect one-sided arbitration or jurisdiction clauses
- detect broad indemnity obligations
- detect limitation of liability issues
- detect privacy or data sharing risks
- detect unilateral termination or unilateral change rights
- reason about future consequences
- explain implications in plain language
- suggest questions to ask before signing
- suggest safer wording
- provide severity and confidence
- be transparent about limitations

Important legal safety:
- Do not claim to provide legal advice.
- Do not state that something is illegal unless clearly supported.
- Use wording like "may", "could", "worth reviewing", and "may create exposure".
- Recommend consulting a qualified legal professional for final decisions.
- sourceText must be an exact excerpt from the document when possible.
- If exact location is unknown, use "Location not detected".
- If no exact excerpt can be found, say "Exact clause excerpt not detected in model output." Do not invent a quote.

Return only valid JSON with this shape and no markdown:
{
  "id": "string",
  "createdAt": "ISO date string",
  "documentTitle": "string",
  "documentType": "Employment Agreement | Rental Agreement | SaaS Terms | Freelance Contract | Privacy Policy | Vendor Agreement | Unknown",
  "affectedParty": "Individual | Employee | Freelancer | Startup | Consumer | Vendor | Unknown",
  "inputSource": "pasted text | uploaded pdf | uploaded docx | uploaded text file | uploaded image scan",
  "engineMode": "Gemini document intelligence",
  "model": "string",
  "overallRiskScore": 0,
  "overallRiskLabel": "low | medium | high | critical",
  "executiveSummary": "string",
  "whatThisMeans": "string",
  "reviewBeforeSigning": ["string"],
  "severityBreakdown": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "topRisks": [
    { "title": "string", "severity": "low | medium | high | critical", "whyItMatters": "string", "action": "string" }
  ],
  "clauseRisks": [
    {
      "id": "string",
      "title": "string",
      "category": "Ownership | Employment | Renewal | Liability | Privacy | Dispute resolution | Termination | Payment | Compliance | Ambiguity | Other",
      "severity": "low | medium | high | critical",
      "confidence": 0,
      "sourceText": "exact clause excerpt from the document",
      "evidenceLocation": "page/section if known, otherwise best estimate",
      "plainEnglish": "string",
      "whyItMatters": "string",
      "futureScenario": "string",
      "affectedPartyImpact": "string",
      "suggestedQuestion": "string",
      "negotiationRewrite": "string",
      "tags": ["string"]
    }
  ],
  "futureScenarios": [
    {
      "id": "string",
      "title": "string",
      "scenario": "string",
      "relatedRisks": ["string"],
      "severity": "low | medium | high | critical"
    }
  ],
  "obligationTimeline": [
    {
      "timeframe": "Today | 30 days | 90 days | 12 months | Other",
      "title": "string",
      "description": "string",
      "relatedRisks": ["string"]
    }
  ],
  "negotiationSuggestions": [
    {
      "riskTitle": "string",
      "question": "string",
      "saferWording": "string",
      "priority": "low | medium | high | critical"
    }
  ],
  "transparency": {
    "analysisMethod": ["Gemini document understanding", "Clause extraction", "Risk taxonomy classification", "Scenario-based consequence reasoning", "Negotiation recommendation mapping"],
    "riskCategoriesChecked": ["string"],
    "limitations": ["string"],
    "disclaimer": "${LEGAL_DISCLAIMER}"
  }
}`;
}
