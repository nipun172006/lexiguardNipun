import { motion } from "framer-motion";
import { BrainCircuit, FileScan, ListChecks, Radar } from "lucide-react";

const steps = [
  { icon: FileScan, label: "Scanning clause patterns", delay: 0 },
  { icon: BrainCircuit, label: "Mapping future obligations", delay: 0.2 },
  { icon: Radar, label: "Projecting risk scenarios", delay: 0.4 },
  { icon: ListChecks, label: "Preparing negotiation prompts", delay: 0.6 },
];

export function AnalysisProgress() {
  return (
    <motion.div
      className="analysis-progress"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="scan-orb">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        <Radar size={34} />
      </div>
      <div className="progress-copy">
        <span className="eyebrow">LexGuard analysis running</span>
        <h3>Building the evidence-backed risk report.</h3>
        <p>Sending the document to server-side Gemini intelligence across ownership, renewal, arbitration, privacy, liability, and future obligations.</p>
      </div>
      <div className="progress-steps">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <motion.div
              className="progress-step"
              key={step.label}
              initial={{ opacity: 0.35, x: -8 }}
              animate={{ opacity: [0.45, 1, 0.7], x: 0 }}
              transition={{ duration: 1.2, delay: step.delay, repeat: Infinity, repeatType: "mirror" }}
            >
              <Icon size={17} />
              <span>{step.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
