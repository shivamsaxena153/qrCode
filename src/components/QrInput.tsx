import { Link2, Mail, Type } from "lucide-react";
import type { QrMode } from "../lib/types";

interface QrInputProps {
  mode: QrMode;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

export default function QrInput({ mode, value, onChange, error }: QrInputProps) {
  const isUrl = mode === "url";
  const isEmail = mode === "email";
  const schemeMatch = isUrl ? value.match(/^[a-z][a-z\d+.-]*:\/\//i) : null;
  const urlPrefix = schemeMatch?.[0] ?? "https://";
  const urlValue = schemeMatch ? value.slice(urlPrefix.length) : value;

  function handleUrlChange(input: string) {
    const pastedUrl = input.match(/^[a-z][a-z\d+.-]*:\/\//i);
    onChange(pastedUrl ? input : input ? `${urlPrefix}${input}` : "");
  }

  return (
    <div className="input-section">
      <label className="field-label" htmlFor="qr-value">
        {isUrl ? <Link2 size={15} /> : isEmail ? <Mail size={15} /> : <Type size={15} />}
        {isUrl ? "Your link" : isEmail ? "Recipient email" : "Your content"}
      </label>
      {isUrl ? (
        <div className={error ? "url-input-shell has-error" : "url-input-shell"}>
          <span className="url-prefix" aria-hidden="true">{urlPrefix}</span>
          <input
            aria-describedby={error ? "input-feedback" : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="url"
            className="text-input url-input"
            id="qr-value"
            inputMode="url"
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder="example.com"
            type="text"
            value={urlValue}
          />
        </div>
      ) : isEmail ? (
        <input
          aria-describedby={error ? "input-feedback" : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="email"
          className={error ? "text-input has-error" : "text-input"}
          id="qr-value"
          onChange={(event) => onChange(event.target.value)}
          placeholder="name@example.com"
          type="email"
          value={value}
        />
      ) : (
        <textarea
          className="text-input text-area"
          id="qr-value"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type anything you want to share..."
          rows={5}
          value={value}
        />
      )}
      <div className={error ? "input-feedback is-error" : "input-feedback"} id="input-feedback" aria-live="polite">
        {error ?? (isUrl
          ? "Enter a domain or paste a full URL."
          : isEmail
            ? "Scanning opens a new email draft."
            : `${value.length} characters`)}
      </div>
    </div>
  );
}