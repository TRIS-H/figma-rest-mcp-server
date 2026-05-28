import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDefaultAuthFilePath, parseAuthFile, readFigmaPatFromAuthFile } from "../src/auth.js";
import { getAuthFilePath } from "../src/paths.js";

describe("readFigmaPatFromAuthFile", () => {
  it("reads figmaPat from auth.json", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "figma-auth-test-"));
    const authFile = getAuthFilePath({ homeDir: root });
    await mkdir(path.dirname(authFile), { recursive: true });
    await writeFile(authFile, JSON.stringify({ figmaPat: "  figd_test_token  " }), "utf8");

    await expect(readFigmaPatFromAuthFile({ homeDir: root })).resolves.toBe("figd_test_token");
  });

  it("reports missing auth.json clearly", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "figma-auth-test-"));

    await expect(readFigmaPatFromAuthFile({ homeDir: root })).rejects.toThrow("无法读取 auth.json");
  });

  it("uses the user data directory by default", () => {
    expect(getDefaultAuthFilePath()).toContain(".figma-rest-mcp-server");
  });
});

describe("parseAuthFile", () => {
  it("reports invalid JSON clearly", () => {
    expect(() => parseAuthFile("{", "auth.json")).toThrow("不是合法 JSON");
  });

  it("requires a non-empty figmaPat field", () => {
    expect(() => parseAuthFile("{}", "auth.json")).toThrow("figmaPat");
    expect(() => parseAuthFile(JSON.stringify({ figmaPat: "" }), "auth.json")).toThrow("figmaPat");
  });
});
