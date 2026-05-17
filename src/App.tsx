import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileSearch } from "lucide-react";
import { ContractAnalyzer } from "./components/ContractAnalyzer";
import { HeroSection } from "./components/HeroSection";
import { LexGuardLogo } from "./components/LexGuardLogo";
import { RiskDashboard } from "./components/RiskDashboard";
import { createSampleReport, loadStoredReport, saveReport } from "./lib/reportStorage";
import type { RiskReport } from "./types";

type RoutePath = "/" | "/analyzer" | "/report";

function App() {
  const [route, setRoute] = useState<RoutePath>(normalizePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (path: RoutePath, hash = "") => {
    const nextUrl = `${path}${hash}`;
    window.history.pushState({}, "", nextUrl);
    setRoute(path);

    window.setTimeout(() => {
      if (hash) {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const showSampleReport = () => {
    saveReport(createSampleReport());
    navigate("/report");
  };

  return (
    <div className="app-shell">
      <BackgroundField />
      <TopNav navigate={navigate} />
      <main className="page-main">
        {route === "/" ? (
          <LandingPage navigate={navigate} showSampleReport={showSampleReport} />
        ) : null}
        {route === "/analyzer" ? <AnalyzerPage navigate={navigate} showSampleReport={showSampleReport} /> : null}
        {route === "/report" ? <ReportPage navigate={navigate} /> : null}
      </main>
    </div>
  );
}

function LandingPage({
  navigate,
  showSampleReport,
}: {
  navigate: (path: RoutePath, hash?: string) => void;
  showSampleReport: () => void;
}) {
  return (
    <>
      <HeroSection onAnalyzeClick={() => navigate("/analyzer")} onSampleReportClick={showSampleReport} />
      <section className="landing-teaser page-inner" aria-label="How LexGuard works">
        <article className="teaser-card glass-card">
          <span className="eyebrow">Evidence first</span>
          <h2>Not a summary. A future-risk radar.</h2>
          <p>
            LexGuard turns contract language into clause evidence, future scenarios, obligation timing, and
            negotiation questions before a signature creates leverage for someone else.
          </p>
        </article>
        <article className="teaser-card glass-card">
          <span className="eyebrow">AI-ready</span>
          <h2>Real documents, server-side intelligence.</h2>
          <p>
            The MVP calls Gemini through a lightweight Node API, keeps secrets server-side, and still preserves
            a sample fallback for live demo resilience.
          </p>
        </article>
      </section>
    </>
  );
}

function AnalyzerPage({
  navigate,
  showSampleReport,
}: {
  navigate: (path: RoutePath) => void;
  showSampleReport: () => void;
}) {
  return (
    <section className="analyzer-page page-inner">
      <ContractAnalyzer
        onReportReady={(nextReport) => {
          saveReport(nextReport);
          navigate("/report");
        }}
        onSampleReport={showSampleReport}
      />
    </section>
  );
}

function ReportPage({ navigate }: { navigate: (path: RoutePath) => void }) {
  const [report] = useState<RiskReport>(() => loadStoredReport() ?? createSampleReport());

  useEffect(() => {
    saveReport(report);
  }, [report]);

  return (
    <section className="report-page">
      <div className="report-page-inner">
        <header className="report-route-header">
          <div>
            <button className="secondary-btn" onClick={() => navigate("/analyzer")} type="button">
              <ArrowLeft size={17} />
              Back to Analyzer
            </button>
            <div className="report-heading">
              <span className="section-kicker">Risk Report</span>
              <h2>Contract Risk Report</h2>
              <p>Evidence-backed analysis of clauses, obligations, and future exposure.</p>
            </div>
          </div>
          <div className="report-route-meta" aria-label="Report metadata">
            <span>{report.documentType}</span>
            <span>{report.affectedParty}</span>
            <span>{report.inputSource}</span>
            <span>{report.engineMode}</span>
            <span>{report.model}</span>
            <span>{formatReportDate(report.createdAt)}</span>
          </div>
        </header>
        <RiskDashboard report={report} />
      </div>
    </section>
  );
}

function TopNav({ navigate }: { navigate: (path: RoutePath, hash?: string) => void }) {
  return (
    <motion.header
      className="top-nav"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <LexGuardLogo onClick={(event) => handleRouteClick(event, () => navigate("/"))} />
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="/analyzer" onClick={(event) => handleRouteClick(event, () => navigate("/analyzer"))}>
          Analyzer
        </a>
        <a href="/report" onClick={(event) => handleRouteClick(event, () => navigate("/report"))}>
          Report
        </a>
        <a
          href="/report#transparency"
          onClick={(event) => handleRouteClick(event, () => navigate("/report", "#transparency"))}
        >
          Transparency
        </a>
      </nav>
      <button className="nav-cta" onClick={() => navigate("/analyzer")} type="button">
        <FileSearch size={17} />
        Analyze
      </button>
    </motion.header>
  );
}

function BackgroundField() {
  return (
    <div className="background-field" aria-hidden="true">
      <div className="grid-layer" />
      <motion.div
        className="ambient ambient-one"
        animate={{ x: [0, 24, -18, 0], y: [0, -20, 14, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ambient ambient-two"
        animate={{ x: [0, -20, 18, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="grain" />
    </div>
  );
}

function normalizePath(pathname: string): RoutePath {
  if (pathname === "/analyzer" || pathname === "/report") return pathname;
  return "/";
}

function handleRouteClick(event: MouseEvent<HTMLAnchorElement>, callback: () => void) {
  event.preventDefault();
  callback();
}

function formatReportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Generated now";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default App;
