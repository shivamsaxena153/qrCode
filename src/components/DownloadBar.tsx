import { Download } from "lucide-react";
import type { ExportFormat } from "../lib/types";

interface DownloadBarProps {
  format: ExportFormat;
  disabled: boolean;
  onDownload: () => void;
}

export default function DownloadBar({ format, disabled, onDownload }: DownloadBarProps) {
  return (
    <button className="download-button" disabled={disabled} onClick={onDownload} type="button">
      <Download size={17} strokeWidth={2} />
      <span>Download {format.toUpperCase()}</span>
      <span className="download-size">1024 px</span>
    </button>
  );
}