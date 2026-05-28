import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** auth.json 的文件结构，后续如需扩展其它认证字段可在这里集中维护。 */
export interface AuthFile {
  figmaPat: string;
}

/** 读取 auth.json 的可选配置，测试时可注入临时项目目录。 */
export interface AuthFileOptions {
  projectRoot?: string;
}

/** 默认 auth.json 路径固定在 MCP 项目根目录，避免受调用项目 cwd 影响。 */
export function getDefaultAuthFilePath(): string {
  return path.join(getProjectRoot(), "auth.json");
}

/** 从项目根目录的 auth.json 读取 Figma Personal Access Token。 */
export async function readFigmaPatFromAuthFile(options: AuthFileOptions = {}): Promise<string> {
  const authFilePath = path.join(options.projectRoot ?? getProjectRoot(), "auth.json");

  let raw: string;
  try {
    raw = await readFile(authFilePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`无法读取 auth.json，请先运行 pnpm figma:pat 或手动创建 ${authFilePath}: ${message}`);
  }

  const auth = parseAuthFile(raw, authFilePath);
  return auth.figmaPat;
}

/** 解析并校验 auth.json，避免空 token 或错误字段进入 Figma API 请求。 */
export function parseAuthFile(raw: string, authFilePath = "auth.json"): AuthFile {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${authFilePath} 不是合法 JSON: ${message}`);
  }

  if (!isRecord(value) || typeof value.figmaPat !== "string" || !value.figmaPat.trim()) {
    throw new Error(`${authFilePath} 必须包含非空字符串字段 figmaPat`);
  }

  return { figmaPat: value.figmaPat.trim() };
}

/** 根据编译后 dist/auth.js 的位置回推项目根目录。 */
function getProjectRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

/** 收窄 unknown 为普通对象，供 JSON 结构校验使用。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
