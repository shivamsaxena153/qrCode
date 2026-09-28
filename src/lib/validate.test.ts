import { describe, expect, it } from "vitest";
import { buildPayload } from "./qr";
import { normalizeEmail, normalizeUrl } from "./validate";

describe("normalizeUrl", () => {
  it("adds https and canonicalizes a bare domain", () => {
    expect(normalizeUrl(" example.com/path ")).toBe("https://example.com/path");
  });

  it("preserves valid http URLs", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects unsupported protocols and malformed input", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeUrl("https://")).toBeNull();
    expect(normalizeUrl("   ")).toBeNull();
  });
});

describe("normalizeEmail", () => {
  it("trims a valid recipient address", () => {
    expect(normalizeEmail(" hello@example.com ")).toBe("hello@example.com");
  });

  it("rejects incomplete addresses", () => {
    expect(normalizeEmail("not-an-email")).toBeNull();
    expect(normalizeEmail("hello@localhost")).toBeNull();
  });
});

describe("buildPayload", () => {
  it("encodes text verbatim", () => {
    expect(buildPayload({ mode: "text", value: "  hello\nworld  ", ecc: "M", background: "white" }))
      .toBe("  hello\nworld  ");
  });

  it("encodes a normalized URL", () => {
    expect(buildPayload({ mode: "url", value: "example.com", ecc: "M", background: "white" }))
      .toBe("https://example.com/");
  });

  it("encodes an email recipient as a mailto URI", () => {
    expect(buildPayload({ mode: "email", value: "hello@example.com", ecc: "M", background: "white" }))
      .toBe("mailto:hello@example.com");
  });
});