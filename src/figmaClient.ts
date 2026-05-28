import type { AssetFormat, ExportOptions, FigmaClient } from "./types.js";

const DEFAULT_BASE_URL = "https://api.figma.com/v1";

export class FigmaRestClient implements FigmaClient {
  constructor(
    private readonly token: string | (() => Promise<string>),
    private readonly baseUrl = DEFAULT_BASE_URL
  ) {}

  async getFile(fileKey: string): Promise<unknown> {
    return this.requestJson(`/files/${encodeURIComponent(fileKey)}`);
  }

  async getNodes(fileKey: string, nodeIds: string[]): Promise<unknown> {
    const params = new URLSearchParams({ ids: nodeIds.join(",") });
    return this.requestJson(`/files/${encodeURIComponent(fileKey)}/nodes?${params.toString()}`);
  }

  async getImageUrls(fileKey: string, nodeIds: string[], options: ExportOptions = {}): Promise<Record<string, string | null>> {
    if (nodeIds.length === 0) return {};
    const format: AssetFormat = options.format ?? "png";
    const params = new URLSearchParams({
      ids: nodeIds.join(","),
      format
    });
    if (options.scale) {
      params.set("scale", String(options.scale));
    }

    const response = await this.requestJson(`/images/${encodeURIComponent(fileKey)}?${params.toString()}`);
    if (isRecord(response) && isRecord(response.images)) {
      return response.images as Record<string, string | null>;
    }
    return {};
  }

  async getLocalVariables(fileKey: string): Promise<unknown> {
    return this.requestJson(`/files/${encodeURIComponent(fileKey)}/variables/local`);
  }

  async download(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  private async requestJson(path: string): Promise<unknown> {
    const token = typeof this.token === "string" ? this.token : await this.token();
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "X-Figma-Token": token
      }
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Figma API request failed: HTTP ${response.status} ${response.statusText}${body ? `: ${body}` : ""}`);
    }

    return response.json() as Promise<unknown>;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
