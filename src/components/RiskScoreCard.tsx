import { Gauge, ShieldAlert } from "lucide-react";
import type { RiskReport } from "../types";

export function RiskScoreCard({ report }: { report: RiskReport }) {
  return (
    <section
      className="risk-score-card glass-card"
      style={{ "--score": `${report.overallRiskScore}%` } as React.CSSProperties}
    >
      <div className="score-ring">
        <div>
          <strong>{report.overallRiskScore}</strong>
          <span>{report.overallRiskLabel}</span>
        </div>
      </div>
      <div className="score-details">
        <span className="eyebrow">Overall risk score</span>
        <h3>{report.overallRiskLabel} future-risk density</h3>
        <p>{report.whatThisMeans}</p>
        <div className="score-meta">
          <span>
            <ShieldAlert size={15} />
            {report.clauseRisks.length} risky clauses
          </span>
          <span>
            <Gauge size={15} />
            {report.transparency.riskCategoriesChecked.length} categories
          </span>
        </div>
      </div>
    </section>
  );
}
