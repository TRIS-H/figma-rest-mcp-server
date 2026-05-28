#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

const AUTH_FILE = path.resolve(process.cwd(), "auth.json");

const rl = createInterface({ input, output });
hideInput();

try {
  /** 交互输入避免把 Figma PAT 放进 shell history 或项目文件之外的日志。 */
  const token = (await rl.question("请输入 Figma Personal Access Token: ")).trim();
  output.write("\n");

  if (!token) {
    throw new Error("Figma PAT 不能为空");
  }

  /** auth.json 是跨平台本地凭据文件，已通过 .gitignore 防止误提交。 */
  const auth = {
    figmaPat: token
  };

  await mkdir(path.dirname(AUTH_FILE), { recursive: true });
  await writeFile(AUTH_FILE, `${JSON.stringify(auth, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log(`已写入 ${AUTH_FILE}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`写入 Figma PAT 失败：${message}`);
  process.exitCode = 1;
} finally {
  showInput();
  rl.close();
}

/** 隐藏终端输入，避免 token 在输入时回显。 */
function hideInput() {
  if (!input.isTTY) return;
  input.setRawMode(true);
  input.on("data", suppressEcho);
}

/** 恢复终端输入模式，确保脚本结束后终端可正常使用。 */
function showInput() {
  if (!input.isTTY) return;
  input.off("data", suppressEcho);
  input.setRawMode(false);
}

/** 捕获 Ctrl+C 并保持终端换行，不处理其它输入内容。 */
function suppressEcho(chunk) {
  const bytes = Buffer.from(chunk);
  if (bytes.includes(3)) {
    output.write("\n");
    process.exit(130);
  }
}
