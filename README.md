# LexGuard

AI Rights & Contract Intelligence System

LexGuard is a hackathon-ready contract intelligence prototype that helps users understand legal and quasi-legal documents before signing. It is not a generic summarizer: it extracts risky clauses, explains practical consequences, maps future obligations, and suggests negotiation questions.

## What It Does

- Analyzes pasted or uploaded legal documents with Gemini.
- Supports PDF, DOCX, TXT, MD, CSV, PNG, JPG/JPEG, and WebP scans.
- Detects risky clauses such as broad IP assignment, automatic renewal, arbitration, indemnity, privacy/data sharing, termination, and liability exposure.
- Produces severity-based risk reports with source excerpts, plain-English explanations, future scenarios, obligation timelines, and negotiation suggestions.
- Includes a transparent methodology panel and legal-awareness disclaimer.
- Keeps a deterministic sample fallback report for demos without an API key.

## Architecture

```text
React + Vite frontend
  -> POST /api/analyze-contract
  -> Express server
  -> Gemini API via @google/genai
  -> structured JSON risk report
  -> sessionStorage
  -> /report
```

The Gemini API key is used only by the server. The frontend never uses `VITE_GEMINI_API_KEY` and never exposes the secret in browser JavaScript.

## AI Model And Reasoning Workflow

LexGuard uses Gemini, configurable through:

```bash
GEMINI_MODEL=gemini-2.5-flash
```

The backend sends Gemini a structured legal-risk prompt that asks it to:

- extract important clauses
- classify risk categories
- detect hidden liabilities and one-sided obligations
- reason about future real-world consequences
- generate severity labels and confidence scores
- produce negotiation questions and safer wording
- return strict JSON compatible with the report UI

Server-side normalization then clamps scores, normalizes severities, fills safe fallbacks, and keeps the output readable and consistent.

## Local Setup

1. Create a local `.env` file:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=8787
```

2. Install dependencies:

```bash
npm install
```

3. Run the client and server:

```bash
npm run dev
```

4. Open:

[http://localhost:5173](http://localhost:5173)

## Scripts

```bash
npm run dev      # run Express API and Vite client
npm run build    # build frontend into dist
npm start        # run Express server and serve dist if present
```

## Google Cloud Run Deployment

This repo includes a lightweight Dockerfile for Cloud Run.

Recommended deployment flow:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud run deploy lexguard \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-2.5-flash \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

Create the secret first:

```bash
printf "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
```

Do not commit `.env` or API keys.

## Legal Safety

LexGuard provides legal awareness, not legal advice. It helps identify clauses worth reviewing, but it does not replace a qualified legal professional.
