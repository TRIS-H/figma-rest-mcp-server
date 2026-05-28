import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAuthFilePath, getCacheRoot, getDataDir, getRuntimePaths } from "../src/paths.js";

describe("runtime paths", () => {
  it("stores runtime data under the user home hidden directory", () => {
    const homeDir = path.join("tmp", "home");

    expect(getDataDir({ homeDir })).toBe(path.join(homeDir, ".figma-rest-mcp-server"));
    expect(getAuthFilePath({ homeDir })).toBe(path.join(homeDir, ".figma-rest-mcp-server", "auth.json"));
    expect(getCacheRoot({ homeDir })).toBe(path.join(homeDir, ".figma-rest-mcp-server", ".figma-cache"));
    expect(getRuntimePaths({ homeDir })).toEqual({
      dataDir: path.join(homeDir, ".figma-rest-mcp-server"),
      authFile: path.join(homeDir, ".figma-rest-mcp-server", "auth.json"),
      cacheRoot: path.join(homeDir, ".figma-rest-mcp-server", ".figma-cache")
    });
  });
});
