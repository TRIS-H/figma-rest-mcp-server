import os from "node:os";
import path from "node:path";

const APP_DIR_NAME = ".figma-rest-mcp-server";

/** 用户数据目录配置，测试时可注入 homeDir。 */
export interface UserDataPathOptions {
  homeDir?: string;
}

/** 返回当前用户下固定的 MCP 数据目录，避免写入 npm 包安装目录。 */
export function getDataDir(options: UserDataPathOptions = {}): string {
  return path.join(options.homeDir ?? os.homedir(), APP_DIR_NAME);
}

/** 返回 Figma PAT 明文凭据文件路径。 */
export function getAuthFilePath(options: UserDataPathOptions = {}): string {
  return path.join(getDataDir(options), "auth.json");
}

/** 返回 Figma 快照缓存目录路径。 */
export function getCacheRoot(options: UserDataPathOptions = {}): string {
  return path.join(getDataDir(options), ".figma-cache");
}

/** 汇总 CLI paths 子命令需要展示的所有路径。 */
export function getRuntimePaths(options: UserDataPathOptions = {}) {
  const dataDir = getDataDir(options);
  return {
    dataDir,
    authFile: path.join(dataDir, "auth.json"),
    cacheRoot: path.join(dataDir, ".figma-cache")
  };
}
