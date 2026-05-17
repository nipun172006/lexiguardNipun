import { motion } from "framer-motion";
import { ArrowRight, FileWarning, GitBranch, Radar, ShieldAlert, Sparkles } from "lucide-react";

type HeroSectionProps = {
  onAnalyzeClick: () => void;
  onSampleReportClick: () => void;
};

const previewStats = [
  { label: "Risk Score", value: "82", detail: "High", tone: "danger" },
  { label: "Risky clauses", value: "7", detail: "found", tone: "violet" },
  { label: "Future obligations", value: "3", detail: "flagged", tone: "blue" },
  { label: "Negotiation", value: "2", detail: "openings", tone: "mint" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection({ onAnalyzeClick, onSampleReportClick }: HeroSectionProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-screen-glow" aria-hidden="true" />
      <div className="hero-inner">
        <motion.div
          className="hero-copy"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.div className="hero-pill" variants={fadeUp}>
            <span className="pulse-dot" />
            AI Rights & Contract Intelligence System
          </motion.div>
          <motion.h1 variants={fadeUp}>Know the risk before you sign.</motion.h1>
          <motion.p variants={fadeUp}>
            LexGuard detects hidden liabilities, unfair clauses, privacy risks, and future obligations in
            contracts before they become expensive surprises.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp}>
            <button className="primary-btn" onClick={onAnalyzeClick} type="button">
              <Sparkles size={18} />
              Analyze a contract
            </button>
            <button className="secondary-btn" onClick={onSampleReportClick} type="button">
              View sample report
              <ArrowRight size={17} />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-preview"
          initial={{ opacity: 0, y: 34, rotateX: 7 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <div className="preview-topbar">
            <span className="window-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="preview-title">
              <Radar size={15} />
              Future-risk radar
            </span>
            <span className="live-badge">Gemini-ready</span>
          </div>

          <div className="preview-grid">
            <motion.article className="risk-orb-card" whileHover={{ y: -4 }}>
              <div className="risk-orb">
                <strong>82</strong>
                <span>High</span>
              </div>
              <div>
                <span className="eyebrow">Overall risk</span>
                <h2>Future exposure detected</h2>
                <p>Ownership, renewal, indemnity, privacy, and mobility risks are concentrated in the draft.</p>
              </div>
            </motion.article>

            <div className="preview-stat-grid">
              {previewStats.map((stat, index) => (
                <MetricCard index={index} key={stat.label} stat={stat} />
              ))}
            </div>

            <div className="preview-alerts">
              <PreviewAlert icon={<ShieldAlert size={17} />} title="Broad indemnity" text="Open-ended defense costs." />
              <PreviewAlert icon={<GitBranch size={17} />} title="Auto renewal" text="30-day cancellation trap." />
              <PreviewAlert icon={<FileWarning size={17} />} title="IP assignment" text="May capture prior work." />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({ index, stat }: { index: number; stat: (typeof previewStats)[number] }) {
  return (
    <motion.article
      className={`preview-stat ${stat.tone}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 + index * 0.08 }}
      whileHover={{ y: -5, scale: 1.01 }}
    >
      <span>{stat.label}</span>
      <div>
        <strong>{stat.value}</strong>
        <small>{stat.detail}</small>
      </div>
    </motion.article>
  );
}

function PreviewAlert({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="preview-alert">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}
