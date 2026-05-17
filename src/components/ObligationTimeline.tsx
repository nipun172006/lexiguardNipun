import { GitCommitVertical } from "lucide-react";
import type { RiskReport } from "../types";

export function ObligationTimeline({ report }: { report: RiskReport }) {
  return (
    <section className="report-section timeline-panel glass-card">
      <div className="panel-title">
        <GitCommitVertical size={19} />
        <div>
          <span className="eyebrow">Obligation timeline</span>
          <h3>When risk becomes real</h3>
          <p>Some clauses create obligations after signing, renewal, termination, or dispute.</p>
        </div>
      </div>
      <div className="timeline-list">
        {report.obligationTimeline.map((event) => (
          <article className="timeline-item" key={`${event.timeframe}-${event.title}`}>
            <span className="timeline-dot" />
            <div className="timeline-date">{event.timeframe}</div>
            <div>
              <h4>{event.title}</h4>
              <p>{event.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
