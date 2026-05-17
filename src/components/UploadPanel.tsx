import { FileUp, TextSelect } from "lucide-react";
import { affectedParties, documentTypes } from "../lib/analyzer";
import type { AffectedParty, DocumentType } from "../types";

type UploadPanelProps = {
  documentType: DocumentType;
  affectedParty: AffectedParty;
  contractText: string;
  selectedFile: File | null;
  onDocumentTypeChange: (value: DocumentType) => void;
  onAffectedPartyChange: (value: AffectedParty) => void;
  onContractTextChange: (value: string) => void;
  onFileChange: (value: File | null) => void;
};

export function UploadPanel({
  affectedParty,
  contractText,
  documentType,
  selectedFile,
  onAffectedPartyChange,
  onContractTextChange,
  onDocumentTypeChange,
  onFileChange,
}: UploadPanelProps) {
  const fileMeta = selectedFile ? getFileMeta(selectedFile) : null;

  return (
    <div className="upload-panel">
      <div className="input-row">
        <label className={`upload-card ${selectedFile ? "has-file" : ""}`}>
          <input
            aria-label="Upload contract"
            type="file"
            accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.doc"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
          <span className="upload-icon">
            <FileUp size={22} />
          </span>
          <strong>{selectedFile?.name || "Upload PDF, DOCX, TXT, CSV, MD, or scanned image"}</strong>
          {fileMeta ? (
            <div className="file-meta">
              <span>{fileMeta.kind}</span>
              <span>{fileMeta.size}</span>
              <small>{fileMeta.note}</small>
            </div>
          ) : (
            <small>PDF contracts, DOCX agreements, TXT/MD exports, CSV policy tables, and PNG/JPG/WebP scans.</small>
          )}
        </label>

        <label className="text-card">
          <span>
            <TextSelect size={18} />
            Paste contract text
          </span>
          <textarea
            value={contractText}
            onChange={(event) => onContractTextChange(event.target.value)}
            placeholder="Paste clauses, terms, offer language, privacy text, or a rough contract excerpt..."
          />
        </label>
      </div>

      <div className="selector-grid">
        <label>
          <span>Document type</span>
          <select
            value={documentType}
            onChange={(event) => onDocumentTypeChange(event.target.value as DocumentType)}
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Affected party</span>
          <select
            value={affectedParty}
            onChange={(event) => onAffectedPartyChange(event.target.value as AffectedParty)}
          >
            {affectedParties.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function getFileMeta(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const size = formatBytes(file.size);

  if (extension === "pdf" || file.type === "application/pdf") {
    return {
      kind: "PDF document",
      size,
      note: "Gemini document intelligence will inspect this file directly.",
    };
  }

  if (extension === "docx") {
    return {
      kind: "DOCX agreement",
      size,
      note: "LexGuard will extract text from DOCX before AI analysis.",
    };
  }

  if (["txt", "md", "csv"].includes(extension)) {
    return {
      kind: `${extension.toUpperCase()} text file`,
      size,
      note: "LexGuard will analyze the file as plain text.",
    };
  }

  if (["png", "jpg", "jpeg", "webp"].includes(extension) || file.type.startsWith("image/")) {
    return {
      kind: "Scanned image",
      size,
      note: "Gemini document intelligence will inspect this file directly.",
    };
  }

  if (extension === "doc") {
    return {
      kind: "Legacy DOC file",
      size,
      note: "Legacy .doc files are not supported in this MVP. Please upload PDF or DOCX.",
    };
  }

  return {
    kind: file.type || "Unknown file type",
    size,
    note: "Unsupported files will be rejected before analysis.",
  };
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
