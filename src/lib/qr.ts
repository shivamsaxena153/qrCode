import QRCode from "qrcode";
import type { QrConfig } from "./types";
import { normalizeEmail, normalizeUrl } from "./validate";

const QUIET_ZONE_MODULES = 4;

export function buildPayload(config: QrConfig): string {
  if (config.mode === "text") return config.value;

  if (config.mode === "url") {
    const normalized = normalizeUrl(config.value);
    if (!normalized) throw new Error("Enter a valid http or https URL.");
    return normalized;
  }

  const email = normalizeEmail(config.value);
  if (!email) throw new Error("Enter a valid email address.");
  return `mailto:${encodeURIComponent(email).replace("%40", "@")}`;
}

export function renderQr(
  payload: string,
  ecc: QrConfig["ecc"],
  background: QrConfig["background"],
  size = 1024,
): HTMLCanvasElement {
  const qr = QRCode.create(payload, { errorCorrectionLevel: ecc });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is not available in this browser.");

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, size, size);
  if (background === "white") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
  }

  const moduleCount = qr.modules.size;
  const fullGridSize = moduleCount + QUIET_ZONE_MODULES * 2;
  const moduleSize = Math.floor(size / fullGridSize);
  if (moduleSize < 1) throw new Error("The QR code is too dense to render at this size.");

  const renderedSize = fullGridSize * moduleSize;
  const offset = Math.floor((size - renderedSize) / 2);
  context.fillStyle = "#17211d";

  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (qr.modules.get(row, column)) {
        context.fillRect(
          offset + (column + QUIET_ZONE_MODULES) * moduleSize,
          offset + (row + QUIET_ZONE_MODULES) * moduleSize,
          moduleSize,
          moduleSize,
        );
      }
    }
  }

  return canvas;
}