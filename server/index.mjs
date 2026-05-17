import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import multer from "multer";
import { analyzeContractWithGemini } from "./geminiAnalyzer.mjs";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

app.use(cors({ origin: true }));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "LexGuard AI analyzer",
  });
});

app.post("/api/analyze-contract", (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      handleUploadError(error, res);
      return;
    }

    handleAnalyzeContract(req, res).catch(next);
  });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error("[LexGuard] Server error", error);
  res.status(500).json({ error: "Unexpected server error. Please try again." });
});

app.listen(PORT, () => {
  console.log(`[LexGuard] API running on http://localhost:${PORT}`);
  console.log("[LexGuard] Set GEMINI_API_KEY server-side in .env for real analysis.");
});

async function handleAnalyzeContract(req, res) {
  const documentType = normalizeString(req.body.documentType, "Unknown");
  const affectedParty = normalizeString(req.body.affectedParty, "Unknown");
  const pastedText = normalizeString(req.body.pastedText ?? req.body.text, "");
  const fileNameFromBody = normalizeString(req.body.fileName, "");
  const file = req.file ?? null;

  if (!file && !pastedText) {
    res.status(400).json({ error: "Please paste contract text or upload a supported document." });
    return;
  }

  try {
    const prepared = file ? await prepareUploadedFile(file, pastedText) : preparePastedText(pastedText, fileNameFromBody);

    if (!prepared.text && !prepared.file) {
      res.status(400).json({ error: "Please paste contract text or upload a supported document." });
      return;
    }

    const report = await analyzeContractWithGemini({
      documentType,
      affectedParty,
      fileName: prepared.fileName || fileNameFromBody,
      inputSource: prepared.inputSource,
      text: prepared.text,
      file: prepared.file,
    });

    res.json(report);
  } catch (error) {
    if (error?.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    if (error?.code === "MISSING_API_KEY") {
      res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      return;
    }

    console.error("[LexGuard] Gemini analysis failed", error);
    res.status(502).json({ error: "Gemini analysis failed. Please try again or use the sample report." });
  }
}

async function prepareUploadedFile(file, pastedText) {
  const info = detectFileSupport(file);

  if (info.error) {
    const error = new Error(info.error);
    error.status = info.status;
    throw error;
  }

  if (info.kind === "pdf" || info.kind === "image") {
    return {
      fileName: file.originalname,
      inputSource: info.kind === "pdf" ? "uploaded pdf" : "uploaded image scan",
      text: pastedText ? `Additional pasted context:\n${pastedText}` : "",
      file: {
        buffer: file.buffer,
        mimeType: info.mimeType,
      },
    };
  }

  if (info.kind === "docx") {
    const extracted = await mammoth.extractRawText({ buffer: file.buffer });
    const text = joinText(extracted.value, pastedText);
    return {
      fileName: file.originalname,
      inputSource: "uploaded docx",
      text,
      file: null,
    };
  }

  return {
    fileName: file.originalname,
    inputSource: "uploaded text file",
    text: joinText(file.buffer.toString("utf8"), pastedText),
    file: null,
  };
}

function preparePastedText(text, fileName) {
  return {
    fileName: fileName || "Pasted contract text",
    inputSource: "pasted text",
    text,
    file: null,
  };
}

function detectFileSupport(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const mimeType = normalizeMimeType(file.mimetype, extension);

  if (extension === ".doc") {
    return {
      status: 400,
      error: "Legacy .doc files are not supported in this MVP. Please upload PDF or DOCX.",
    };
  }

  if (extension === ".pdf" || file.mimetype === "application/pdf") {
    return { kind: "pdf", mimeType: "application/pdf" };
  }

  if (
    extension === ".docx" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return {
      kind: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  }

  if ([".txt", ".md", ".csv"].includes(extension) || ["text/plain", "text/markdown", "text/csv"].includes(file.mimetype)) {
    return { kind: "text", mimeType: "text/plain" };
  }

  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension) || file.mimetype.startsWith("image/")) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
      return {
        status: 400,
        error: "Unsupported file type. Please upload PDF, DOCX, TXT, MD, CSV, PNG, JPG, or WebP.",
      };
    }

    return { kind: "image", mimeType };
  }

  return {
    status: 400,
    error: "Unsupported file type. Please upload PDF, DOCX, TXT, MD, CSV, PNG, JPG, or WebP.",
  };
}

function normalizeMimeType(mimeType, extension) {
  if (mimeType && mimeType !== "application/octet-stream") return mimeType;

  const byExtension = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  };

  return byExtension[extension] || mimeType || "application/octet-stream";
}

function handleUploadError(error, res) {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "File is too large. Please upload a file under 50 MB." });
    return;
  }

  res.status(400).json({ error: "Unable to read uploaded file. Please try again." });
}

function joinText(primary, extra) {
  return [primary, extra ? `Additional pasted context:\n${extra}` : ""]
    .map((value) => normalizeString(value, ""))
    .filter(Boolean)
    .join("\n\n");
}

function normalizeString(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}
