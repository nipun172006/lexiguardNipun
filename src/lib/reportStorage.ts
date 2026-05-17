import type { RiskReport } from "../types";
import { runMockAnalysis } from "./analyzer";

export const ANALYSIS_STORAGE_KEY = "lexguard-analysis-result";

export const sampleContract =
  "This agreement includes intellectual property assignment, non-compete restrictions, automatic renewal, arbitration, indemnify and hold harmless obligations, termination for convenience, data sharing with partners, and limitation of liability language.";

export function createSampleReport(): RiskReport {
  return runMockAnalysis({
    text: sampleContract,
    documentType: "Freelance Contract",
    affectedParty: "Freelancer",
  });
}

export function saveReport(report: RiskReport) {
  window.sessionStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(report));
}

export function loadStoredReport(): RiskReport | null {
  const stored = window.sessionStorage.getItem(ANALYSIS_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as RiskReport;
  } catch {
    window.sessionStorage.removeItem(ANALYSIS_STORAGE_KEY);
    return null;
  }
}
