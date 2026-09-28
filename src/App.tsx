import { useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import DownloadBar from "./components/DownloadBar";
import ModeTabs from "./components/ModeTabs";
import QrControls from "./components/QrControls";
import QrInput from "./components/QrInput";
import QrPreview from "./components/QrPreview";
import { downloadCanvas } from "./lib/download";
import { buildPayload, renderQr } from "./lib/qr";
import type { EccLevel, ExportFormat, QrBackground, QrMode } from "./lib/types";
import { normalizeEmail, normalizeUrl } from "./lib/validate";

export default function App() {
  const [mode, setMode] = useState<QrMode>("text");
  const [value, setValue] = useState("");
  const [ecc, setEcc] = useState<EccLevel>("M");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [background, setBackground] = useState<QrBackground>("white");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const normalizedUrl = mode === "url" ? normalizeUrl(value) : null;
  const normalizedEmail = mode === "email" ? normalizeEmail(value) : null;
  const inputError = mode === "url" && value.trim() && !normalizedUrl
    ? "Enter a valid http or https link."
    : mode === "email" && value.trim() && !normalizedEmail
      ? "Enter a valid email address."
      : null;
  const hasValidInput = mode === "text"
    ? value.length > 0
    : mode === "url"
      ? Boolean(normalizedUrl)
      : Boolean(normalizedEmail);
  const payload = hasValidInput ? buildPayload({ mode, value, ecc, background }) : "";

  async function handleDownload() {
    try {
      setDownloadError(null);
      const qrCanvas = renderQr(
        buildPayload({ mode, value, ecc, background }),
        ecc,
        format === "jpeg" ? "white" : background,
        1024,
      );
      await downloadCanvas(qrCanvas, format, background);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not download this QR code.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a aria-label="QR Studio home" className="brand" href="/">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>qr<span className="brand-light">studio</span></span>
        </a>
        <div className="topbar-note"><ShieldCheck size={15} /> Everything stays on your device</div>
      </header>

      <div className="workspace">
        <section className="editor-column" aria-labelledby="page-title">
          <div className="page-heading">
            <div className="eyebrow"><span /> YOUR CODE, YOUR WAY</div>
            <h1 id="page-title">Make it<br /><em>scannable.</em></h1>
            <p>Turn text, a link, or an email address into a QR code, ready to share anywhere.</p>
          </div>

          <div className="editor-form">
            <div className="field-heading">
              <span className="step-number">01</span>
              <span className="field-label">Choose what to encode</span>
            </div>
            <ModeTabs mode={mode} onChange={setMode} />
            <QrInput error={inputError} mode={mode} onChange={setValue} value={value} />

            <div className="section-rule" />

            <div className="field-heading controls-title">
              <span className="step-number">02</span>
              <span className="field-label">Tune your code</span>
            </div>
            <QrControls
              background={background}
              ecc={ecc}
              format={format}
              onBackgroundChange={setBackground}
              onEccChange={setEcc}
              onFormatChange={setFormat}
            />

            <DownloadBar disabled={!hasValidInput || Boolean(inputError)} format={format} onDownload={handleDownload} />
            {downloadError && <p className="download-error" role="alert">{downloadError}</p>}
            <div className="privacy-note"><ShieldCheck size={14} /> Your content is never sent to a server.</div>
          </div>
        </section>

        <section className="preview-column" aria-label="Preview and export">
          <div className="preview-heading">
            <span>THE RESULT</span>
            <ArrowUpRight size={16} />
          </div>
          <QrPreview background={format === "jpeg" ? "white" : background} ecc={ecc} hasValidInput={hasValidInput && !inputError} payload={payload} />
          <div className="preview-caption">
            <span className="caption-index">A / 01</span>
            <span>Built for the real world.<br />Sharp at any size.</span>
          </div>
        </section>
      </div>
      <footer className="page-footer">
        <span>QR STUDIO <span className="footer-separator">/</span> VERSION 1.0</span>
        <span>MADE FOR THE MOMENT YOU NEED IT</span>
      </footer>
    </main>
  );
}