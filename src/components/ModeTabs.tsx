import { Link2, Mail, Type } from "lucide-react";
import type { QrMode } from "../lib/types";

interface ModeTabsProps {
  mode: QrMode;
  onChange: (mode: QrMode) => void;
}

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="QR content type">
      <button
        aria-selected={mode === "text"}
        className={mode === "text" ? "mode-tab is-active" : "mode-tab"}
        onClick={() => onChange("text")}
        role="tab"
        type="button"
      >
        <span className="mode-mark"><Type size={15} /></span> Text
      </button>
      <button
        aria-selected={mode === "url"}
        className={mode === "url" ? "mode-tab is-active" : "mode-tab"}
        onClick={() => onChange("url")}
        role="tab"
        type="button"
      >
        <span className="mode-mark"><Link2 size={15} /></span> URL
      </button>
      <button
        aria-selected={mode === "email"}
        className={mode === "email" ? "mode-tab is-active" : "mode-tab"}
        onClick={() => onChange("email")}
        role="tab"
        type="button"
      >
        <span className="mode-mark"><Mail size={15} /></span> Email
      </button>
    </div>
  );
}