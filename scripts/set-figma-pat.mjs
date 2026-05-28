#!/usr/bin/env node
import { spawn } from "node:child_process";

/** 开发期兼容脚本：复用 TypeScript CLI 的 auth 子命令。 */
const child = spawn("pnpm", ["tsx", "src/cli.ts", "auth"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
