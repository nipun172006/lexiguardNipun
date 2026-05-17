import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, FileText, Scale, ShieldAlert } from "lucide-react";
import type { ClauseRisk, RiskReport, Severity } from "../types";
import { ClauseRiskCard } from "./ClauseRiskCard";
import { FutureScenarioPanel } from "./FutureScenarioPanel";
import { NegotiationPanel } from "./NegotiationPanel";
import { ObligationTimeline } from "./ObligationTimeline";
import { TransparencyPanel } from "./TransparencyPanel";

type RiskDashboardProps = {
  report: RiskReport;
};

const severityOrder: Severity[] = ["critical", "high", "medium", "low"];
const severityWeight: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function RiskDashboard({ report }: RiskDashboardProps) {
  const sortedRisks = useMemo(() => sortRisksBySeverity(report.clauseRisks), [report.clauseRisks]);
  const initialExpandedIds = useMemo(() => new Set(sortedRisks.slice(0, 2).map((risk) => risk.id)), [sortedRisks]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(initialExpandedIds);

  const criticalCount = report.severityBreakdown.critical ?? sortedRisks.filter((risk) => risk.severity === "critical").length;
  const highestExposureCategory = sortedRisks[0]?.category ?? "Not detected";
  const topRisks = report.topRisks.slice(0, 3);
  const breakdownTotal = severityOrder.reduce((total, severity) => total + (report.severityBreakdown[severity] ?? 0), 0);

  const expandAll = () => setExpandedIds(new Set(sortedRisks.map((risk) => risk.id)));
  const collapseAll = () => setExpandedIds(new Set());
  const setRiskOpen = (riskId: string, isOpen: boolean) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (isOpen) {
        next.add(riskId);
      } else {
        next.delete(riskId);
      }
      return next;
    });
  };

  return (
    <motion.div
      className="risk-dashboard"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="report-summary-card glass-card">
        <span className="section-kicker">Executive summary</span>
        <div className="summary-copy">
          <p>{report.executiveSummary}</p>
          <p>{report.whatThisMeans}</p>
        </div>
        <div className="review-list">
          <span className="eyebrow">Review before signing</span>
          <ul>
            {report.reviewBeforeSigning.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="report-section snapshot-section">
        <div className="section-row-heading">
          <div>
            <span className="section-kicker">Risk snapshot</span>
            <h3>A calm read on the risk surface.</h3>
          </div>
          <span className={`severity-badge ${report.overallRiskLabel}`}>{report.overallRiskLabel}</span>
        </div>
        <div className="snapshot-grid">
          <MetricCard label="Overall risk score" value={report.overallRiskScore} helper={report.overallRiskLabel} />
          <MetricCard label="Critical findings" value={criticalCount} helper="highest urgency" />
          <MetricCard label="Clauses scanned" value={report.clauseRisks.length} helper="findings returned" />
          <MetricCard label="Highest exposure" value={highestExposureCategory} helper="top category" />
        </div>
        <SeverityBar breakdown={report.severityBreakdown} total={breakdownTotal} />
      </section>

      <section className="report-section top-risks glass-card">
        <div className="panel-title">
          <ShieldAlert size={19} />
          <div>
            <span className="eyebrow">Start here</span>
            <h3>The highest-impact clauses to review before signing.</h3>
          </div>
        </div>
        <div className="top-risk-grid">
          {topRisks.map((risk) => (
            <article className="top-risk-card" key={risk.title}>
              <span className={`severity-badge ${risk.severity}`}>{risk.severity}</span>
              <h4>{risk.title}</h4>
              <p>{risk.whyItMatters}</p>
              <small>{risk.action}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="report-section clause-evidence-section">
        <div className="section-row-heading">
          <div>
            <span className="section-kicker">Clause evidence</span>
            <h3>Each finding is tied back to document language and translated into plain-English impact.</h3>
          </div>
          <span className="mini-chip">
            <FileText size={15} />
            {sortedRisks.length} findings
          </span>
        </div>
        <div className="clause-controls" aria-label="Clause card controls">
          <button className="ghost-btn" onClick={expandAll} type="button">
            Expand all
          </button>
          <button className="ghost-btn" onClick={collapseAll} type="button">
            Collapse all
          </button>
        </div>
        <div className="clause-list">
          {sortedRisks.map((risk) => (
            <ClauseRiskCard
              isOpen={expandedIds.has(risk.id)}
              key={risk.id}
              onOpenChange={(isOpen) => setRiskOpen(risk.id, isOpen)}
              risk={risk}
            />
          ))}
        </div>
      </section>

      <FutureScenarioPanel report={report} />
      <ObligationTimeline report={report} />
      <NegotiationPanel suggestions={report.negotiationSuggestions} />
      <TransparencyPanel report={report} />

      <div className="legal-awareness glass-card">
        <Scale size={18} />
        <span>
          LexGuard provides legal awareness, not legal advice. It helps identify clauses worth reviewing, but it
          does not replace a qualified legal professional.
        </span>
      </div>
    </motion.div>
  );
}

function MetricCard({ helper, label, value }: { helper: string; label: string; value: number | string }) {
  return (
    <article className={`snapshot-card glass-card ${typeof value === "string" ? "text-value" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

function SeverityBar({ breakdown, total }: { breakdown: Record<Severity, number>; total: number }) {
  return (
    <div className="severity-bar-card glass-card">
      <div className="severity-bar-header">
        <span className="eyebrow">Severity distribution</span>
        <small>{total} total findings</small>
      </div>
      <div className="severity-bar" aria-label="Severity distribution">
        {severityOrder.map((severity) => {
          const count = breakdown[severity] ?? 0;
          const width = total > 0 ? `${Math.max(4, (count / total) * 100)}%` : "0%";
          return count > 0 ? <span className={severity} key={severity} style={{ width }} /> : null;
        })}
      </div>
      <div className="severity-breakdown-row">
        {severityOrder.map((severity) => (
          <span key={severity}>
            <i className={`severity-dot ${severity}`} />
            {severity} {breakdown[severity] ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
}

function sortRisksBySeverity(risks: ClauseRisk[]) {
  return [...risks].sort(
    (a, b) => severityWeight[b.severity] - severityWeight[a.severity] || b.confidence - a.confidence,
  );
}
