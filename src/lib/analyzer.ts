import { mockRisks } from "../data/mockRisks";
import type {
  AffectedParty,
  ClauseRisk,
  DocumentType,
  NegotiationSuggestion,
  RiskReport,
  Severity,
} from "../types";

export const documentTypes: DocumentType[] = [
  "Employment Agreement",
  "Rental Agreement",
  "SaaS Terms",
  "Freelance Contract",
  "Privacy Policy",
  "Vendor Agreement",
];

export const affectedParties: AffectedParty[] = [
  "Individual",
  "Employee",
  "Freelancer",
  "Startup",
  "Consumer",
  "Vendor",
];

type AnalyzeInput = {
  text: string;
  fileName?: string;
  documentType: DocumentType;
  affectedParty: AffectedParty;
};

const severityWeight: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const keywordMap: Record<string, string[]> = {
  "broad-ip-assignment": ["ip", "intellectual", "invention", "ownership", "work product", "assignment"],
  "non-compete-restriction": ["non-compete", "compete", "competitive", "restriction", "twelve months"],
  "automatic-renewal": ["renew", "renewal", "cancel", "notice", "term"],
  "one-sided-arbitration": ["arbitration", "dispute", "venue", "injunctive", "court"],
  "unilateral-termination": ["terminate", "termination", "convenience", "without cause"],
  "broad-indemnity": ["indemnify", "defend", "hold harmless", "losses", "claims"],
  "excessive-data-sharing": ["data", "privacy", "personal", "share", "partners", "analytics"],
  "vague-liability-limitation": ["liability", "damages", "consequential", "limitation", "cap"],
};

const documentBoosts: Partial<Record<DocumentType, string[]>> = {
  "Employment Agreement": ["non-compete-restriction", "broad-ip-assignment", "unilateral-termination"],
  "Freelance Contract": ["broad-ip-assignment", "broad-indemnity", "unilateral-termination"],
  "SaaS Terms": ["automatic-renewal", "vague-liability-limitation", "excessive-data-sharing"],
  "Privacy Policy": ["excessive-data-sharing", "vague-liability-limitation"],
  "Vendor Agreement": ["broad-indemnity", "automatic-renewal", "unilateral-termination"],
  "Rental Agreement": ["automatic-renewal", "unilateral-termination", "broad-indemnity"],
};

export function runMockAnalysis(input: AnalyzeInput): RiskReport {
  const normalizedText = input.text.toLowerCase();
  const boostedIds = new Set(documentBoosts[input.documentType] ?? []);

  const risks = mockRisks.map((risk) => {
    const keywords = keywordMap[risk.id] ?? [];
    const keywordHits = keywords.filter((keyword) => normalizedText.includes(keyword)).length;
    const typeBoost = boostedIds.has(risk.id) ? 4 : 0;
    const textBoost = Math.min(keywordHits * 2, 6);
    const partyBoost = partyRiskBoost(input.affectedParty, risk);
    const confidence = Math.min(98, risk.confidence + typeBoost + textBoost + partyBoost);

    return {
      ...risk,
      confidence,
      affectedPartyImpact: tailorImpact(risk, input.affectedParty),
    };
  });

  const sortedRisks = [...risks].sort(
    (a, b) => severityWeight[b.severity] - severityWeight[a.severity] || b.confidence - a.confidence,
  );

  const score = Math.min(
    94,
    Math.round(
      46 +
        sortedRisks.reduce((total, risk) => total + severityWeight[risk.severity] * 1.5, 0) +
        (input.text.length > 400 ? 3 : 0),
    ),
  );
  const severityBreakdown = createSeverityBreakdown(sortedRisks);
  const topRisks = sortedRisks.slice(0, 3).map((risk) => ({
    title: risk.title,
    severity: risk.severity,
    whyItMatters: risk.whyItMatters,
    action: risk.suggestedQuestion,
  }));
  const negotiationSuggestions: NegotiationSuggestion[] = sortedRisks.slice(0, 5).map((risk) => ({
    riskTitle: risk.title,
    question: risk.suggestedQuestion,
    saferWording: risk.negotiationRewrite,
    priority: risk.severity,
  }));

  return {
    id: "lexguard-demo-report",
    createdAt: new Date().toISOString(),
    documentTitle: input.fileName ?? "Sample contract risk report",
    documentType: input.documentType,
    affectedParty: input.affectedParty,
    inputSource: input.fileName ? "uploaded sample file" : "sample pasted text",
    engineMode: "Sample fallback report",
    model: "local mock analyzer",
    overallRiskScore: score,
    overallRiskLabel: scoreToLabel(score),
    executiveSummary:
      "LexGuard found concentrated risk around future control, payment exposure, dispute leverage, data movement, and obligations that survive signing.",
    whatThisMeans:
      "This sample report demonstrates the LexGuard analysis format using deterministic, curated risk patterns. It is useful for demo continuity, but it is not a substitute for real AI analysis of an uploaded document.",
    reviewBeforeSigning: [
      "Limit IP transfer to paid deliverables created specifically under the agreement.",
      "Ask for notice and explicit opt-in before renewal or long-tail obligations activate.",
      "Narrow indemnity, dispute, privacy, and termination language before signing.",
    ],
    severityBreakdown,
    topRisks,
    clauseRisks: sortedRisks,
    futureScenarios: [
      {
        id: "leave-job",
        title: "If you leave this job in 6 months...",
        scenario:
          "The non-compete and IP language could follow you into the next role and create uncertainty around side projects.",
        relatedRisks: ["non-compete-restriction", "broad-ip-assignment"],
        severity: "high",
      },
      {
        id: "cancel-renewal",
        title: "If you cancel after renewal...",
        scenario:
          "The renewal clause may trigger a new term before you notice the deadline, keeping payment or service duties alive.",
        relatedRisks: ["automatic-renewal", "vague-liability-limitation"],
        severity: "high",
      },
      {
        id: "ownership-dispute",
        title: "If your client disputes ownership...",
        scenario:
          "Broad assignment and indemnity language can turn a delivery disagreement into ownership and defense-cost exposure.",
        relatedRisks: ["broad-ip-assignment", "broad-indemnity"],
        severity: "critical",
      },
      {
        id: "data-partners",
        title: "If your data is shared with partners...",
        scenario:
          "Broad sharing permissions may make it harder to trace, delete, or restrict downstream use of sensitive information.",
        relatedRisks: ["excessive-data-sharing", "vague-liability-limitation"],
        severity: "medium",
      },
    ],
    obligationTimeline: [
      {
        timeframe: "Today",
        title: "Signing decision",
        description: "Clarify ownership, liability, data use, and termination mechanics before accepting.",
        relatedRisks: ["broad-ip-assignment", "broad-indemnity"],
      },
      {
        timeframe: "30 days",
        title: "Cancellation window",
        description: "A missed notice date can trigger renewal or keep obligations alive.",
        relatedRisks: ["automatic-renewal"],
      },
      {
        timeframe: "90 days",
        title: "Review period",
        description: "Audit data sharing, payment status, and any restrictive covenant exposure.",
        relatedRisks: ["excessive-data-sharing", "unilateral-termination"],
      },
      {
        timeframe: "12 months",
        title: "Surviving exposure",
        description: "Non-compete, renewal, indemnity, and liability terms may still affect future choices.",
        relatedRisks: ["non-compete-restriction", "broad-indemnity", "automatic-renewal"],
      },
    ],
    negotiationSuggestions,
    transparency: {
      analysisMethod: [
        "Sample fallback report",
        "Deterministic keyword matching",
        "Curated risk taxonomy mapping",
        "Scenario-based consequence templates",
        "Negotiation recommendation mapping",
      ],
      riskCategoriesChecked: [
        "Ownership",
        "Future work",
        "Renewal",
        "Dispute resolution",
        "Termination",
        "Liability",
        "Privacy",
      ],
      limitations: [
        "This sample uses deterministic heuristics and curated mock clauses.",
        "It does not inspect a real uploaded document.",
        "Jurisdiction-specific interpretation requires a qualified professional.",
        "This is legal awareness, not legal advice.",
      ],
      disclaimer:
        "LexGuard provides legal awareness, not legal advice. Consult a qualified legal professional before making legal decisions.",
    },
  };
}

function createSeverityBreakdown(risks: ClauseRisk[]): Record<Severity, number> {
  return risks.reduce(
    (breakdown, risk) => {
      breakdown[risk.severity] += 1;
      return breakdown;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>,
  );
}

function scoreToLabel(score: number): Severity {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

function partyRiskBoost(party: AffectedParty, risk: ClauseRisk) {
  if (party === "Employee" && ["non-compete-restriction", "broad-ip-assignment"].includes(risk.id)) return 3;
  if (party === "Freelancer" && ["broad-ip-assignment", "unilateral-termination"].includes(risk.id)) return 3;
  if (party === "Startup" && ["broad-indemnity", "vague-liability-limitation"].includes(risk.id)) return 2;
  if (party === "Consumer" && ["automatic-renewal", "excessive-data-sharing"].includes(risk.id)) return 3;
  if (party === "Vendor" && ["broad-indemnity", "unilateral-termination"].includes(risk.id)) return 3;
  return 0;
}

function tailorImpact(risk: ClauseRisk, party: AffectedParty) {
  return `${party} impact: ${risk.affectedPartyImpact}`;
}
