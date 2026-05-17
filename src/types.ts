export type Severity = "low" | "medium" | "high" | "critical";

export type DocumentType =
  | "Employment Agreement"
  | "Rental Agreement"
  | "SaaS Terms"
  | "Freelance Contract"
  | "Privacy Policy"
  | "Vendor Agreement"
  | "Unknown";

export type AffectedParty =
  | "Individual"
  | "Employee"
  | "Freelancer"
  | "Startup"
  | "Consumer"
  | "Vendor"
  | "Unknown";

export type RiskCategory =
  | "Ownership"
  | "Employment"
  | "Renewal"
  | "Liability"
  | "Privacy"
  | "Dispute resolution"
  | "Termination"
  | "Payment"
  | "Compliance"
  | "Ambiguity"
  | "Other";

export type ClauseRisk = {
  id: string;
  title: string;
  category: RiskCategory | string;
  severity: Severity;
  confidence: number;
  sourceText: string;
  plainEnglish: string;
  whyItMatters: string;
  futureScenario: string;
  affectedPartyImpact: string;
  suggestedQuestion: string;
  negotiationRewrite: string;
  evidenceLocation: string;
  tags: string[];
};

export type FutureScenario = {
  id: string;
  title: string;
  scenario: string;
  relatedRisks: string[];
  severity: Severity;
};

export type ObligationEvent = {
  timeframe: "Today" | "30 days" | "90 days" | "12 months" | "Other" | string;
  title: string;
  description: string;
  relatedRisks: string[];
};

export type TopRisk = {
  title: string;
  severity: Severity;
  whyItMatters: string;
  action: string;
};

export type NegotiationSuggestion = {
  riskTitle: string;
  question: string;
  saferWording: string;
  priority: Severity;
};

export type Transparency = {
  analysisMethod: string[];
  riskCategoriesChecked: string[];
  limitations: string[];
  disclaimer: string;
};

export type RiskReport = {
  id: string;
  createdAt: string;
  documentTitle: string;
  documentType: DocumentType;
  affectedParty: AffectedParty;
  inputSource: string;
  engineMode: "Gemini document intelligence" | "Sample fallback report" | string;
  model: string;
  overallRiskScore: number;
  overallRiskLabel: Severity;
  executiveSummary: string;
  whatThisMeans: string;
  reviewBeforeSigning: string[];
  severityBreakdown: Record<Severity, number>;
  topRisks: TopRisk[];
  clauseRisks: ClauseRisk[];
  futureScenarios: FutureScenario[];
  obligationTimeline: ObligationEvent[];
  negotiationSuggestions: NegotiationSuggestion[];
  transparency: Transparency;
};
