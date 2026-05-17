import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, FileText, Play, ShieldQuestion } from "lucide-react";
import { affectedParties, documentTypes } from "../lib/analyzer";
import type { AffectedParty, DocumentType, RiskReport } from "../types";
import { AnalysisProgress } from "./AnalysisProgress";
import { UploadPanel } from "./UploadPanel";

type ContractAnalyzerProps = {
  onReportReady: (report: RiskReport) => void;
  onSampleReport: () => void;
};

const sampleText =
  "The signer assigns all intellectual property, agrees not to compete for twelve months, accepts automatic renewal, binding arbitration, broad indemnify obligations, data sharing with partners, and limitation of liability.";

export function ContractAnalyzer({ onReportReady, onSampleReport }: ContractAnalyzerProps) {
  const [documentType, setDocumentType] = useState<DocumentType>(documentTypes[0]);
  const [affectedParty, setAffectedParty] = useState<AffectedParty>(affectedParties[0]);
  const [contractText, setContractText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const canAnalyze = Boolean(contractText.trim() || selectedFile);

  const runAnalysis = async () => {
    if (!canAnalyze || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      const [report] = await Promise.all([requestAnalysis(), delay(2400)]);
      onReportReady(report);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Gemini analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const requestAnalysis = async () => {
    const response = await fetch("/api/analyze-contract", {
      method: "POST",
      body: selectedFile ? createAnalysisFormData(selectedFile) : JSON.stringify(createJsonPayload()),
      headers: selectedFile ? undefined : { "Content-Type": "application/json" },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof payload.error === "string"
          ? payload.error
          : "Real AI analysis could not complete. Please try again or use the sample report.",
      );
    }

    return payload as RiskReport;
  };

  const createAnalysisFormData = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("affectedParty", affectedParty);
    if (contractText.trim()) {
      formData.append("pastedText", contractText.trim());
    }
    return formData;
  };

  const createJsonPayload = () => ({
    text: contractText.trim(),
    documentType,
    affectedParty,
  });

  const updateText = (value: string) => {
    setContractText(value);
    setAnalysisError("");
  };

  const updateFile = (file: File | null) => {
    setSelectedFile(file);
    setAnalysisError("");
  };

  return (
    <div className="analyzer-grid">
      <motion.div
        className="analyzer-copy"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="section-kicker">Analyze flow</span>
        <h2>Upload, paste, and run a risk radar in seconds.</h2>
        <p>
          LexGuard now sends real contracts to a server-side Gemini analyzer, keeps your API key out of the
          browser, and falls back to a clearly labeled sample report only when you choose it.
        </p>
        <div className="trust-row">
          <span>
            <ShieldQuestion size={16} />
            Legal awareness
          </span>
          <span>
            <FileText size={16} />
            Evidence-backed excerpts
          </span>
        </div>
      </motion.div>

      <motion.div
        className="analyzer-panel glass-card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <AnalysisProgress key="progress" />
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <UploadPanel
                affectedParty={affectedParty}
                contractText={contractText}
                documentType={documentType}
                selectedFile={selectedFile}
                onAffectedPartyChange={setAffectedParty}
                onContractTextChange={updateText}
                onDocumentTypeChange={setDocumentType}
                onFileChange={updateFile}
              />
              {analysisError ? (
                <motion.div
                  className="analysis-error-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div>
                    <AlertTriangle size={18} />
                    <strong>Real AI analysis could not complete.</strong>
                  </div>
                  <p>{analysisError}</p>
                  <div className="error-actions">
                    <button className="ghost-btn" disabled={!canAnalyze} onClick={runAnalysis} type="button">
                      Try again
                    </button>
                    <button className="secondary-btn" onClick={onSampleReport} type="button">
                      View sample report
                    </button>
                  </div>
                </motion.div>
              ) : null}
              <div className="analyzer-actions">
                <button className="ghost-btn" onClick={() => updateText(sampleText)} type="button">
                  Load sample text
                </button>
                <button className="primary-btn run-btn" disabled={!canAnalyze} onClick={runAnalysis} type="button">
                  <Play size={17} />
                  Run Risk Analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
