import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAuthFile, readFigmaPatFromAuthFile } from "../src/auth.js";

describe("readFigmaPatFromAuthFile", () => {
  it("reads figmaPat from auth.json", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "figma-auth-test-"));
    await writeFile(path.join(root, "auth.json"), JSON.stringify({ figmaPat: "  figd_test_token  " }), "utf8");

    await expect(readFigmaPatFromAuthFile({ projectRoot: root })).resolves.toBe("figd_test_token");
  });

  it("reports missing auth.json clearly", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "figma-auth-test-"));

    await expect(readFigmaPatFromAuthFile({ projectRoot: root })).rejects.toThrow("无法读取 auth.json");
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
