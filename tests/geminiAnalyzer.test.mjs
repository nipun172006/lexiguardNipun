import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clampScore,
  createFallbackReportFromError,
  ensureArray,
  normalizeReport,
  normalizeSeverity,
  safeJsonParse,
} from "../server/geminiAnalyzer.mjs";

describe("Gemini analyzer response normalization", () => {
  it("parses strict JSON and fenced JSON responses safely", () => {
    assert.deepEqual(safeJsonParse('{"ok":true,"score":92}'), { ok: true, score: 92 });
    assert.deepEqual(safeJsonParse('```json\n{"engineMode":"Gemini document intelligence"}\n```'), {
      engineMode: "Gemini document intelligence",
    });
  });

  it("normalizes severity labels and clamps scores", () => {
    assert.equal(normalizeSeverity("CRITICAL"), "critical");
    assert.equal(normalizeSeverity("unknown", "low"), "low");
    assert.equal(clampScore(140), 100);
    assert.equal(clampScore(-12), 0);
    assert.equal(clampScore("68"), 68);
  });

  it("keeps arrays predictable for optional model fields", () => {
    assert.deepEqual(ensureArray(undefined), []);
    assert.deepEqual(ensureArray("single item"), ["single item"]);
    assert.deepEqual(ensureArray(["a", "b"]), ["a", "b"]);
  });

  it("derives a consistent overall risk score from clause evidence", () => {
    const report = normalizeReport(
      {
        overallRiskScore: 0,
        overallRiskLabel: "low",
        clauseRisks: [
          {
            id: "broad-ip-assignment",
            title: "Broad IP assignment",
            category: "Ownership",
            severity: "critical",
            confidence: 94,
            sourceText:
              "The contractor assigns all intellectual property, inventions, source code, designs, documents, and improvements created during the engagement to the company.",
            plainEnglish: "This may transfer more ownership than expected.",
            whyItMatters: "It can affect reusable assets and future work.",
            futureScenario: "A later ownership dispute could limit portfolio or product use.",
            affectedPartyImpact: "The freelancer may lose leverage over their work.",
            suggestedQuestion: "Can assignment be limited to paid final deliverables?",
            negotiationRewrite: "Transfer only paid final deliverables created under this agreement.",
            evidenceLocation: "Pasted text",
            tags: ["ip", "ownership"],
          },
          {
            id: "automatic-renewal",
            title: "Automatic renewal",
            category: "Renewal",
            severity: "high",
            confidence: 90,
            sourceText: "This agreement renews automatically every year unless cancelled thirty days before renewal.",
            plainEnglish: "Missing the window can lock the signer into another term.",
            whyItMatters: "This can create future payment or service obligations.",
            futureScenario: "The freelancer may remain bound after an unnoticed renewal date.",
            affectedPartyImpact: "The freelancer may lose cancellation leverage.",
            suggestedQuestion: "Can renewal require explicit opt-in?",
            negotiationRewrite: "Renewal requires written approval from both parties.",
            evidenceLocation: "Pasted text",
            tags: ["renewal"],
          },
        ],
      },
      {
        documentType: "Freelance Contract",
        affectedParty: "Freelancer",
        documentTitle: "Test contract",
        inputSource: "pasted text",
        model: "gemini-2.5-flash",
      },
    );

    assert.equal(report.engineMode, "Gemini document intelligence");
    assert.equal(report.overallRiskScore, 88);
    assert.equal(report.overallRiskLabel, "critical");
    assert.equal(report.severityBreakdown.critical, 1);
    assert.equal(report.severityBreakdown.high, 1);
    assert.match(report.clauseRisks[0].sourceText, /contractor assigns all intellectual property/i);
  });

  it("creates an honest non-mock error report when Gemini cannot complete", () => {
    const report = createFallbackReportFromError(new Error("Gemini analysis failed."), {
      documentType: "Vendor Agreement",
      affectedParty: "Startup",
      inputSource: "uploaded pdf",
      model: "gemini-2.5-flash",
    });

    assert.equal(report.engineMode, "Gemini document intelligence");
    assert.equal(report.model, "gemini-2.5-flash");
    assert.equal(report.inputSource, "uploaded pdf");
    assert.equal(report.clauseRisks.length, 0);
    assert.match(report.whatThisMeans, /Gemini analysis failed/);
  });
});
