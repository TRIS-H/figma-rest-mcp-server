import { z } from "zod";
import type { FigmaLocation } from "./types.js";

const FILE_KEY_PATTERN = /^[A-Za-z0-9_-]{6,}$/;

export const FigmaLocationSchema = z
  .object({
    figmaUrl: z.string().url().optional(),
    fileKey: z.string().regex(FILE_KEY_PATTERN).optional(),
    nodeId: z.string().min(1).optional()
  })
  .refine((value) => value.figmaUrl || value.fileKey, {
    message: "Provide either figmaUrl or fileKey"
  });

export function parseFigmaLocation(input: z.infer<typeof FigmaLocationSchema>): FigmaLocation {
  const parsed = FigmaLocationSchema.parse(input);
  if (parsed.fileKey) {
    return { fileKey: parsed.fileKey, nodeId: normalizeNodeId(parsed.nodeId) };
  }

  const url = new URL(parsed.figmaUrl!);
  const key = extractFileKey(url);
  if (!key) {
    throw new Error("Unable to extract Figma file key from URL");
  }

  const nodeId = normalizeNodeId(parsed.nodeId ?? url.searchParams.get("node-id") ?? undefined);
  return { fileKey: key, nodeId };
}

export function normalizeNodeId(nodeId?: string | null): string | undefined {
  if (!nodeId) return undefined;
  return nodeId.replace("-", ":");
}

function extractFileKey(url: URL): string | undefined {
  const parts = url.pathname.split("/").filter(Boolean);
  const fileMarkerIndex = parts.findIndex((part) => part === "file" || part === "design");
  const candidate = fileMarkerIndex >= 0 ? parts[fileMarkerIndex + 1] : undefined;
  return candidate && FILE_KEY_PATTERN.test(candidate) ? candidate : undefined;
}
