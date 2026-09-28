import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { renderQr } from "../lib/qr";
import type { EccLevel, QrBackground } from "../lib/types";

interface QrPreviewProps {
  payload: string;
  ecc: EccLevel;
  background: QrBackground;
  hasValidInput: boolean;
}

export default function QrPreview({ payload, ecc, background, hasValidInput }: QrPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setRenderError(null);

    if (!hasValidInput) return;

    try {
      const rendered = renderQr(payload, ecc, background, 320);
      context.drawImage(rendered, 0, 0);
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "Could not render this QR code.");
    }
  }, [background, ecc, hasValidInput, payload]);

  return (
    <section className="preview-panel" aria-label="QR code preview">
      <div className="preview-topline">
        <span className="preview-label">LIVE PREVIEW</span>
        <span className={hasValidInput && !renderError ? "live-indicator is-live" : "live-indicator"}>
          <span /> {hasValidInput && !renderError ? "Ready" : "Waiting for input"}
        </span>
      </div>
      <div className={`qr-stage${background === "transparent" ? " is-transparent" : ""}`}>
        {hasValidInput && !renderError ? (
          <canvas aria-label="Generated QR code" className="qr-canvas" height={320} ref={canvasRef} width={320} />
        ) : (
          <div className="preview-empty" ref={(element) => {
            if (element && canvasRef.current) {
              canvasRef.current.width = 320;
              canvasRef.current.height = 320;
            }
          }}>
            <div className="empty-code"><ScanLine size={31} strokeWidth={1.4} /></div>
            <span>{renderError ?? "Your QR code will appear here"}</span>
          </div>
        )}
      </div>
      <div className="preview-footer">
        <span><span className="footer-dot" /> PRIVATE BY DESIGN</span>
        <span>1024 × 1024 PX EXPORT</span>
      </div>
    </section>
  );
}