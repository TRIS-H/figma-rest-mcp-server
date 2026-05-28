import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface KeychainOptions {
  service?: string;
  account?: string;
}

export async function readFigmaPatFromKeychain(options: KeychainOptions = {}): Promise<string> {
  const service = options.service ?? "figma-mcp-server";
  const account = options.account ?? "figma-pat";

  try {
    const { stdout } = await execFileAsync("security", ["find-generic-password", "-s", service, "-a", account, "-w"], {
      encoding: "utf8",
      maxBuffer: 1024 * 64
    });
    const token = stdout.trim();
    if (!token) {
      throw new Error("Keychain item is empty");
    }
    return token;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read Figma PAT from macOS Keychain (${service}/${account}): ${message}`);
  }
}
