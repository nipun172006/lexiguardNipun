import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import type { RiskReport } from "../types";

export function FutureScenarioPanel({ report }: { report: RiskReport }) {
  const titleById = new Map(report.clauseRisks.map((risk) => [risk.id, risk.title]));

  return (
    <section className="report-section future-panel">
      <div className="section-row-heading">
        <div>
          <span className="section-kicker">Future Risk Simulator</span>
          <h3>What could happen later?</h3>
          <p>Scenario-based consequences mapped to flagged clauses.</p>
        </div>
        <span className="mini-chip">
          <Clock3 size={15} />
          Scenario map
        </span>
      </div>
      <div className="scenario-grid">
        {report.futureScenarios.slice(0, 4).map((scenario, index) => (
          <motion.article
            className="scenario-card glass-card"
            key={scenario.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
          >
            <span className="scenario-number">0{index + 1}</span>
            <span className={`severity-badge ${scenario.severity}`}>{scenario.severity}</span>
            <h4>{scenario.title}</h4>
            <p>{scenario.scenario}</p>
            <div className="tag-row">
              {scenario.relatedRisks.map((id) => (
                <span key={id}>{titleById.get(id) ?? id}</span>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
