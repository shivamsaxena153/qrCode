import type { EccLevel, ExportFormat, QrBackground } from "../lib/types";

const eccLevels: { value: EccLevel; label: string; detail: string }[] = [
  { value: "L", label: "L", detail: "7%" },
  { value: "M", label: "M", detail: "15%" },
  { value: "Q", label: "Q", detail: "25%" },
  { value: "H", label: "H", detail: "30%" },
];

interface QrControlsProps {
  ecc: EccLevel;
  onEccChange: (ecc: EccLevel) => void;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  background: QrBackground;
  onBackgroundChange: (background: QrBackground) => void;
}

export default function QrControls({
  ecc,
  onEccChange,
  format,
  onFormatChange,
  background,
  onBackgroundChange,
}: QrControlsProps) {
  return (
    <div className="controls-section">
      <div className="control-block">
        <div className="control-heading">
          <span className="field-label">Error correction</span>
          <span className="control-note">More damage recovery, denser code</span>
        </div>
        <div className="ecc-options" role="radiogroup" aria-label="Error correction level">
          {eccLevels.map((level) => (
            <button
              aria-checked={ecc === level.value}
              className={ecc === level.value ? "ecc-option is-selected" : "ecc-option"}
              key={level.value}
              onClick={() => onEccChange(level.value)}
              role="radio"
              type="button"
            >
              <span>{level.label}</span>
              <small>{level.detail}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="control-divider" />

      <div className="export-settings">
        <div className="control-block">
          <div className="control-heading">
            <span className="field-label">File format</span>
          </div>
          <div className="format-options" role="group" aria-label="File format">
            {(["png", "jpeg"] as const).map((option) => (
              <button
                aria-pressed={format === option}
                className={format === option ? "format-option is-selected" : "format-option"}
                key={option}
                onClick={() => onFormatChange(option)}
                type="button"
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {format === "png" && (
          <label className="transparency-option">
            <input
              checked={background === "transparent"}
              onChange={(event) => onBackgroundChange(event.target.checked ? "transparent" : "white")}
              type="checkbox"
            />
            <span className="checkmark" aria-hidden="true" />
            Transparent background
          </label>
        )}
        {format === "jpeg" && <p className="jpeg-note">JPEG exports with a white background.</p>}
      </div>
    </div>
  );
}