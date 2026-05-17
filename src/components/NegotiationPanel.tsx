import { MessageSquareText } from "lucide-react";
import type { NegotiationSuggestion } from "../types";

export function NegotiationPanel({ suggestions }: { suggestions: NegotiationSuggestion[] }) {
  return (
    <section className="glass-card negotiation-panel">
      <div className="panel-title">
        <MessageSquareText size={19} />
        <div>
          <span className="eyebrow">Negotiation section</span>
          <h3>Questions that create leverage</h3>
          <p>Use these before signing or during redline review.</p>
        </div>
      </div>
      <div className="negotiation-list">
        {suggestions.slice(0, 4).map((suggestion) => (
          <article key={`${suggestion.riskTitle}-${suggestion.question}`}>
            <span className={`severity-badge ${suggestion.priority}`}>{suggestion.priority}</span>
            <span>{suggestion.riskTitle}</span>
            <p>{suggestion.question}</p>
            <small>{suggestion.saferWording}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
