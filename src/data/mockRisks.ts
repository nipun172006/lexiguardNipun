import type { ClauseRisk } from "../types";

export const mockRisks: ClauseRisk[] = [
  {
    id: "broad-ip-assignment",
    title: "Broad IP assignment",
    category: "Ownership",
    severity: "critical",
    confidence: 94,
    sourceText:
      "All inventions, works, developments, ideas, designs, and improvements created before, during, or after the engagement shall belong exclusively to the company.",
    plainEnglish:
      "This may let the other party claim ownership of more work than the project actually requires.",
    whyItMatters:
      "Broad ownership language can reach side projects, pre-existing work, templates, and future improvements.",
    futureScenario:
      "If a client later disputes ownership, you may need to prove which work existed before the contract.",
    affectedPartyImpact:
      "You could lose leverage over reusable assets, portfolio work, or product ideas that were never meant to transfer.",
    suggestedQuestion:
      "Can the assignment be limited to deliverables created specifically for this agreement?",
    negotiationRewrite:
      "Rights transfer only for final paid deliverables created under this agreement, excluding pre-existing materials, tools, templates, and independent work.",
    evidenceLocation: "Section 4.1 - Intellectual Property",
    tags: ["ip", "ownership", "future work"],
  },
  {
    id: "non-compete-restriction",
    title: "Non-compete restriction",
    category: "Future work",
    severity: "high",
    confidence: 91,
    sourceText:
      "The signer shall not directly or indirectly provide services to any competing business for a period of twelve months following termination.",
    plainEnglish:
      "This can restrict where you work or who you can serve after the relationship ends.",
    whyItMatters:
      "The clause is broad because it covers direct and indirect services and does not clearly define competing business.",
    futureScenario:
      "If you leave in 6 months, the clause may still limit your next employer or client choices for another year.",
    affectedPartyImpact:
      "Career mobility, revenue, and fundraising options can be affected by a restriction that outlives the deal.",
    suggestedQuestion:
      "Can this be narrowed to named competitors, a shorter period, and only confidential information misuse?",
    negotiationRewrite:
      "The signer will not misuse confidential information. No general restriction applies to future employment, clients, or independent business activities.",
    evidenceLocation: "Section 8.3 - Restrictive Covenants",
    tags: ["non-compete", "employment", "mobility"],
  },
  {
    id: "automatic-renewal",
    title: "Automatic renewal",
    category: "Renewal",
    severity: "high",
    confidence: 88,
    sourceText:
      "This agreement automatically renews for successive annual terms unless written cancellation is received at least thirty days before renewal.",
    plainEnglish:
      "You may be locked into another term if you miss a cancellation deadline.",
    whyItMatters:
      "Automatic renewal can create unexpected payment obligations or continued service commitments.",
    futureScenario:
      "If you forget to cancel before the notice window, you may owe another full term.",
    affectedPartyImpact:
      "A missed date can turn a short test into a long commitment with real cost or operational drag.",
    suggestedQuestion:
      "Can renewal require an explicit opt-in or at least a reminder before the cancellation deadline?",
    negotiationRewrite:
      "Renewal occurs only after written confirmation from both parties no earlier than sixty days before the current term ends.",
    evidenceLocation: "Section 2.2 - Term and Renewal",
    tags: ["renewal", "notice", "fees"],
  },
  {
    id: "one-sided-arbitration",
    title: "One-sided arbitration",
    category: "Dispute resolution",
    severity: "medium",
    confidence: 84,
    sourceText:
      "All disputes must be resolved through binding arbitration, while the company may seek injunctive relief in any court of competent jurisdiction.",
    plainEnglish:
      "You may be forced into arbitration while the other party keeps court access for its preferred claims.",
    whyItMatters:
      "One-sided dispute rules can increase friction and reduce your practical ability to challenge unfair conduct.",
    futureScenario:
      "If a dispute escalates, you may face a forum that is less transparent and less convenient.",
    affectedPartyImpact:
      "The process can become expensive or strategically tilted before the merits are even discussed.",
    suggestedQuestion:
      "Can dispute procedures apply equally to both parties with a mutually convenient venue?",
    negotiationRewrite:
      "Any dispute process, venue, and interim relief rights apply equally to both parties.",
    evidenceLocation: "Section 12.5 - Arbitration",
    tags: ["arbitration", "venue", "fairness"],
  },
  {
    id: "unilateral-termination",
    title: "Unilateral termination",
    category: "Termination",
    severity: "high",
    confidence: 86,
    sourceText:
      "The company may terminate this agreement at any time for convenience without further obligation or payment beyond amounts it elects to approve.",
    plainEnglish:
      "The other party can exit easily while leaving payment or transition obligations unclear.",
    whyItMatters:
      "Convenience termination without defined payment can create unpaid work, stranded costs, or sudden loss of access.",
    futureScenario:
      "If the project is cancelled after heavy work, you may not recover time, expenses, or transition costs.",
    affectedPartyImpact:
      "Cash flow and delivery planning become fragile because the contract does not protect work already performed.",
    suggestedQuestion:
      "Can termination require notice and payment for work completed through the termination date?",
    negotiationRewrite:
      "Either party may terminate with fourteen days notice. Fees for approved work, committed expenses, and transition support remain payable.",
    evidenceLocation: "Section 10.1 - Termination for Convenience",
    tags: ["termination", "payment", "notice"],
  },
  {
    id: "broad-indemnity",
    title: "Broad indemnity",
    category: "Liability",
    severity: "critical",
    confidence: 92,
    sourceText:
      "Signer shall defend, indemnify, and hold harmless the company from any and all claims, losses, damages, liabilities, fees, costs, and expenses arising out of or related to this agreement.",
    plainEnglish:
      "You may be responsible for a very wide range of losses, including issues you did not directly cause.",
    whyItMatters:
      "Broad indemnity can create open-ended financial exposure that exceeds the contract value.",
    futureScenario:
      "If a third party files a claim, you may have to pay defense costs before responsibility is clear.",
    affectedPartyImpact:
      "A small agreement can become a large financial risk if defense duties and claim scope are uncapped.",
    suggestedQuestion:
      "Can indemnity be limited to third-party claims caused by proven breach, negligence, or willful misconduct?",
    negotiationRewrite:
      "Indemnity applies only to third-party claims finally determined to result from the indemnifying party's material breach, gross negligence, or willful misconduct.",
    evidenceLocation: "Section 11.2 - Indemnification",
    tags: ["indemnity", "liability", "uncapped"],
  },
  {
    id: "excessive-data-sharing",
    title: "Excessive data sharing",
    category: "Privacy",
    severity: "high",
    confidence: 89,
    sourceText:
      "We may share personal, usage, financial, device, and behavioral data with affiliates, partners, vendors, analytics providers, and other third parties for business purposes.",
    plainEnglish:
      "The document allows broad sharing of sensitive data across many categories of recipients.",
    whyItMatters:
      "Wide data sharing can affect privacy, security, profiling, and future control over personal or business information.",
    futureScenario:
      "If data is shared with partners, you may not know who has it or how long they keep it.",
    affectedPartyImpact:
      "Your personal, customer, or company information may travel farther than expected with limited opt-out rights.",
    suggestedQuestion:
      "Can sharing be limited to necessary service providers with clear retention, security, and opt-out terms?",
    negotiationRewrite:
      "Data may be shared only with subprocessors necessary to provide the service, under confidentiality, security, and deletion obligations.",
    evidenceLocation: "Section 6.4 - Data Sharing",
    tags: ["privacy", "data", "third parties"],
  },
  {
    id: "vague-liability-limitation",
    title: "Vague liability limitation",
    category: "Liability",
    severity: "medium",
    confidence: 82,
    sourceText:
      "In no event shall the company be liable for indirect, incidental, special, consequential, punitive, exemplary, or other damages, regardless of theory.",
    plainEnglish:
      "The other party limits many types of damages without clear carve-outs for serious failures.",
    whyItMatters:
      "A broad limitation can make recovery difficult even when the harm is foreseeable or severe.",
    futureScenario:
      "If a breach causes operational loss, the clause may block meaningful compensation.",
    affectedPartyImpact:
      "You may carry the downside while the responsible party has limited accountability.",
    suggestedQuestion:
      "Can the limitation exclude confidentiality breaches, IP misuse, data security failures, and unpaid fees?",
    negotiationRewrite:
      "Liability limits do not apply to confidentiality breaches, IP infringement, data security incidents, payment obligations, fraud, or willful misconduct.",
    evidenceLocation: "Section 11.4 - Limitation of Liability",
    tags: ["liability cap", "damages", "carve-outs"],
  },
];
