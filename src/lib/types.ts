export type QrMode = "text" | "url" | "email";
export type EccLevel = "L" | "M" | "Q" | "H";
export type ExportFormat = "png" | "jpeg";
export type QrBackground = "white" | "transparent";

export interface QrConfig {
  mode: QrMode;
  value: string;
  ecc: EccLevel;
  background: QrBackground;
}