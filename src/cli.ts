#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { runServer } from "./server.js";
import { clearCacheRoot, getAuthFilePath, getRuntimePaths } from "./paths.js";

/** CLI 支持的子命令集合。 */
type Command = "serve" | "auth" | "paths" | "cache:clear" | "help";

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});

/** 解析 CLI 子命令；无参数默认启动 MCP stdio 服务，方便 Codex 直接调用。 */
async function main(): Promise<void> {
  const command = parseCommand(process.argv[2]);

  switch (command) {
    case "serve":
      await runServer();
      return;
    case "auth":
      await writeAuthFile();
      return;
    case "paths":
      printRuntimePaths();
      return;
    case "cache:clear":
      await clearCache();
      return;
    case "help":
      printHelp();
      return;
  }
}

/** 将命令行参数收敛为受支持的子命令。 */
function parseCommand(rawCommand?: string): Command {
  if (!rawCommand) return "serve";
  if (rawCommand === "serve" || rawCommand === "auth" || rawCommand === "paths" || rawCommand === "cache:clear") return rawCommand;
  return "help";
}

/** 交互式写入 auth.json，避免 Figma PAT 进入 shell history。 */
async function writeAuthFile(): Promise<void> {
  const authFile = getAuthFilePath();
  const rl = createInterface({ input, output });
  hideInput();

  try {
    const token = (await rl.question("请输入 Figma Personal Access Token: ")).trim();
    output.write("\n");

    if (!token) {
      throw new Error("Figma PAT 不能为空");
    }

    await mkdir(getRuntimePaths().dataDir, { recursive: true });
    await writeFile(authFile, `${JSON.stringify({ figmaPat: token }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    console.log(`已写入 ${authFile}`);
  } finally {
    showInput();
    rl.close();
  }
}

/** 输出运行时路径，便于用户排查 auth.json 和缓存位置。 */
function printRuntimePaths(): void {
  console.log(JSON.stringify(getRuntimePaths(), null, 2));
}

/** 清空并重建 Figma 快照缓存目录。 */
async function clearCache(): Promise<void> {
  const cacheRoot = await clearCacheRoot();
  console.log(`已清空 Figma 快照缓存：${cacheRoot}`);
}

/** 输出 CLI 帮助信息。 */
function printHelp(): void {
  console.log(`Usage:
  figma-rest-mcp serve   启动 stdio MCP Server
  figma-rest-mcp auth    写入或更新 Figma PAT
  figma-rest-mcp paths   查看 auth/cache 路径
  figma-rest-mcp cache:clear   清空 Figma 快照缓存

无参数默认等同于 figma-rest-mcp serve。`);
}

/** 隐藏终端输入，避免 token 在输入时回显。 */
function hideInput(): void {
  if (!input.isTTY) return;
  input.setRawMode(true);
  input.on("data", suppressEcho);
}

/** 恢复终端输入模式，确保 CLI 结束后终端可正常使用。 */
function showInput(): void {
  if (!input.isTTY) return;
  input.off("data", suppressEcho);
  input.setRawMode(false);
}

/** 捕获 Ctrl+C 并保持终端换行，不处理其它输入内容。 */
function suppressEcho(chunk: Buffer): void {
  const bytes = Buffer.from(chunk);
  if (bytes.includes(3)) {
    output.write("\n");
    process.exit(130);
  }
}
