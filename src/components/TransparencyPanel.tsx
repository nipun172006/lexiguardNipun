import { Eye, Info } from "lucide-react";
import type { ReactNode } from "react";
import type { RiskReport } from "../types";

const defaultCheckedCategories = [
  "Ownership",
  "Renewal",
  "Liability",
  "Dispute resolution",
  "Privacy",
  "Termination",
  "Ambiguity",
];

const defaultLimitations = [
  "Legal awareness, not legal advice.",
  "May miss context outside the uploaded document.",
  "Jurisdiction-specific interpretation requires a professional.",
  "OCR or scan quality can affect extraction.",
  "AI outputs should be reviewed before decisions.",
];

export function TransparencyPanel({ report }: { report: RiskReport }) {
  const limitations = uniqueStrings([...report.transparency.limitations, ...defaultLimitations]);
  const categories = uniqueStrings([...report.transparency.riskCategoriesChecked, ...defaultCheckedCategories]);

  return (
    <section className="report-section transparency-panel glass-card" id="transparency">
      <div className="panel-title">
        <Eye size={19} />
        <div>
          <span className="eyebrow">Transparency / methodology</span>
          <h3>How LexGuard reached this analysis</h3>
          <p>Designed to show what was inspected, how the result was reasoned through, and where caution remains.</p>
        </div>
      </div>

      <div className="transparency-grid">
        <TransparencyCard title="Input used">
          <TransparencyItem label="Document type" value={report.documentType} />
          <TransparencyItem label="Affected party" value={report.affectedParty} />
          <TransparencyItem label="Input source" value={report.inputSource} />
          <TransparencyItem label="Engine / model" value={`${report.engineMode} / ${report.model}`} />
        </TransparencyCard>

        <TransparencyCard title="Analysis method">
          <TagList items={report.transparency.analysisMethod} />
        </TransparencyCard>

        <TransparencyCard title="What was checked">
          <TagList items={categories} />
        </TransparencyCard>

        <TransparencyCard title="Limitations" icon={<Info size={17} />}>
          <ul className="transparency-list">
            {limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </TransparencyCard>
      </div>
    </section>
  );
}

function TransparencyCard({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <article className="transparency-card">
      <div className="transparency-card-title">
        {icon}
        <h4>{title}</h4>
      </div>
      {children}
    </article>
  );
}

function TransparencyItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="transparency-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="tag-row">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
