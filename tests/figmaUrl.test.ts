import { describe, expect, it } from "vitest";
import { normalizeNodeId, parseFigmaLocation } from "../src/figmaUrl.js";

describe("parseFigmaLocation", () => {
  it("parses design URLs with node ids", () => {
    expect(
      parseFigmaLocation({
        figmaUrl: "https://www.figma.com/design/AbCdEf123456/File-Name?node-id=1-2"
      })
    ).toEqual({ fileKey: "AbCdEf123456", nodeId: "1:2" });
  });

  it("prefers explicit fileKey and nodeId", () => {
    expect(parseFigmaLocation({ fileKey: "FileKey_123", nodeId: "3-4" })).toEqual({
      fileKey: "FileKey_123",
      nodeId: "3:4"
    });
  });
});

describe("normalizeNodeId", () => {
  it("normalizes URL node id separators", () => {
    expect(normalizeNodeId("12-34")).toBe("12:34");
    expect(normalizeNodeId("12:34")).toBe("12:34");
  });
});
