#!/usr/bin/env node
import { execFile } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SERVICE = "figma-mcp-server";
const ACCOUNT = "figma-pat";

if (process.platform !== "darwin") {
  console.error("当前脚本只支持 macOS Keychain。Windows 支持需要先实现 Credential Manager 读取逻辑。");
  process.exit(1);
}

const rl = createInterface({ input, output });
hideInput();

try {
  /** 交互输入避免把 Figma PAT 放进 shell history 或项目文件。 */
  const token = (await rl.question("请输入 Figma Personal Access Token: ")).trim();
  output.write("\n");

  if (!token) {
    throw new Error("Figma PAT 不能为空");
  }

  await execFileAsync("security", ["add-generic-password", "-a", ACCOUNT, "-s", SERVICE, "-w", token, "-U"]);
  console.log(`已写入 macOS Keychain：service=${SERVICE}, account=${ACCOUNT}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`写入 Figma PAT 失败：${message}`);
  process.exitCode = 1;
} finally {
  showInput();
  rl.close();
}

function hideInput() {
  if (!input.isTTY) return;
  input.setRawMode(true);
  input.on("data", suppressEcho);
}

function showInput() {
  if (!input.isTTY) return;
  input.off("data", suppressEcho);
  input.setRawMode(false);
}

function suppressEcho(chunk) {
  const bytes = Buffer.from(chunk);
  if (bytes.includes(3)) {
    output.write("\n");
    process.exit(130);
  }
}
