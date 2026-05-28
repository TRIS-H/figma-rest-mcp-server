import { mkdir, mkdtemp, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { clearCacheRoot, getAuthFilePath, getCacheRoot, getDataDir, getRuntimePaths } from "../src/paths.js";

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

  it("clears and recreates the cache directory", async () => {
    const homeDir = await mkdtemp(path.join(tmpdir(), "figma-cache-clear-test-"));
    const cacheRoot = getCacheRoot({ homeDir });
    await mkdir(cacheRoot, { recursive: true });
    await writeFile(path.join(cacheRoot, "snapshot.json"), "{}", "utf8");

    await expect(clearCacheRoot({ homeDir })).resolves.toBe(cacheRoot);
    await expect(readdir(cacheRoot)).resolves.toEqual([]);
  });

  it("creates an empty cache directory when it does not exist", async () => {
    const homeDir = await mkdtemp(path.join(tmpdir(), "figma-cache-clear-test-"));
    const cacheRoot = getCacheRoot({ homeDir });

    await expect(clearCacheRoot({ homeDir })).resolves.toBe(cacheRoot);
    await expect(readdir(cacheRoot)).resolves.toEqual([]);
  });
});
