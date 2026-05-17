import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, MessageCircleQuestion, Quote, RefreshCcw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { ClauseRisk } from "../types";

type ClauseRiskCardProps = {
  risk: ClauseRisk;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ClauseRiskCard({ defaultOpen = false, isOpen: controlledOpen, onOpenChange, risk }: ClauseRiskCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <motion.article className="clause-card glass-card" layout whileHover={{ y: -4 }}>
      <button className="clause-summary" onClick={() => setIsOpen(!isOpen)} type="button">
        <div>
          <div className="clause-meta">
            <span className={`severity-badge ${risk.severity}`}>{risk.severity}</span>
            <span>{risk.category}</span>
            <span>{risk.confidence}% confidence</span>
          </div>
          <h4>{risk.title}</h4>
          <p className="clause-collapsed-summary">{risk.plainEnglish}</p>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="collapse-icon">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            className="clause-expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="excerpt-box">
              <Quote size={16} />
              <p>{risk.sourceText}</p>
              <small>{risk.evidenceLocation}</small>
            </div>
            <InfoBlock icon={<Quote size={17} />} title="Plain-English explanation" text={risk.plainEnglish} />
            <InfoBlock icon={<AlertTriangle size={17} />} title="Why it matters" text={risk.whyItMatters} />
            <InfoBlock icon={<RefreshCcw size={17} />} title="Future risk" text={risk.futureScenario} />
            <InfoBlock
              icon={<MessageCircleQuestion size={17} />}
              title="What to ask before signing"
              text={risk.suggestedQuestion}
            />
            <InfoBlock
              icon={<Sparkles size={17} />}
              title="Suggested safer wording"
              text={risk.negotiationRewrite}
            />
            <div className="tag-row">
              {risk.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function InfoBlock({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <div className="info-block">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}
