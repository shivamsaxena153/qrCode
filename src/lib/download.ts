import type { ExportFormat, QrBackground } from "./types";

function canvasToBlob(canvas: HTMLCanvasElement, format: ExportFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image file."))),
      format === "png" ? "image/png" : "image/jpeg",
      0.94,
    );
  });
}

export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  background: QrBackground,
): Promise<void> {
  let exportCanvas = canvas;

  if (format === "jpeg" || background === "white") {
    exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const context = exportCanvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is not available in this browser.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 1024, 1024);
    context.imageSmoothingEnabled = false;
    context.drawImage(canvas, 0, 0, 1024, 1024);
  }

  const blob = await canvasToBlob(exportCanvas, format);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `qr-code.${format}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}