import { z } from "zod";
import { parseFigmaLocation } from "./figmaUrl.js";
import { summarizeNode } from "./nodeIndex.js";
import type { AssetFormat, ExportAssetResult, FigmaClient, SnapshotStore } from "./types.js";

const AssetFormatSchema = z.enum(["jpg", "png", "svg", "pdf"]);

export const FetchSnapshotInputSchema = z.object({
  figmaUrl: z.string().url().optional(),
  fileKey: z.string().optional(),
  nodeId: z.string().optional(),
  exportFormat: AssetFormatSchema.default("png"),
  scale: z.number().positive().max(4).optional()
});

export const ReadSnapshotInputSchema = z.object({
  snapshotId: z.string().min(1),
  nodeId: z.string().optional(),
  includeFile: z.boolean().default(false),
  includeVariables: z.boolean().default(false)
});

export const GetNodeInputSchema = z.object({
  snapshotId: z.string().min(1),
  nodeId: z.string().min(1),
  summarized: z.boolean().default(false)
});

export const ExportAssetsInputSchema = z.object({
  snapshotId: z.string().min(1),
  nodeIds: z.array(z.string().min(1)).min(1),
  mode: z.enum(["url", "download"]).default("url"),
  format: AssetFormatSchema.default("png"),
  scale: z.number().positive().max(4).optional()
});

export interface ToolContext {
  client: FigmaClient;
  store: SnapshotStore;
}

export async function figmaFetchSnapshot(input: unknown, context: ToolContext): Promise<unknown> {
  const args = FetchSnapshotInputSchema.parse(input);
  const location = parseFigmaLocation(args);
  const file = await context.client.getFile(location.fileKey);
  const node = location.nodeId ? await context.client.getNodes(location.fileKey, [location.nodeId]) : undefined;
  const imageUrls = location.nodeId
    ? await context.client.getImageUrls(location.fileKey, [location.nodeId], {
        format: args.exportFormat,
        scale: args.scale
      })
    : {};
  const variables = await context.client.getLocalVariables(location.fileKey).catch((error: unknown) => ({
    unavailable: true,
    reason: error instanceof Error ? error.message : String(error)
  }));

  const manifest = await context.store.saveSnapshot({
    fileKey: location.fileKey,
    requestedNodeId: location.nodeId,
    file,
    node,
    variables,
    imageUrls
  });

  return {
    summary: manifest.summary,
    paths: manifest.paths,
    index: compactIndex(manifest.index.nodes),
    imageUrls: manifest.index.imageUrls
  };
}

export async function figmaReadSnapshot(input: unknown, context: ToolContext): Promise<unknown> {
  const args = ReadSnapshotInputSchema.parse(input);
  const snapshot = await context.store.readSnapshot(args.snapshotId);
  const node = args.nodeId ? await context.store.getNode(args.snapshotId, args.nodeId) : undefined;
  return {
    summary: snapshot.manifest.summary,
    paths: snapshot.manifest.paths,
    index: compactIndex(snapshot.manifest.index.nodes),
    node: node ? summarizeNode(node) : undefined,
    file: args.includeFile ? snapshot.file : undefined,
    variables: args.includeVariables ? snapshot.variables : undefined
  };
}

export async function figmaGetNode(input: unknown, context: ToolContext): Promise<unknown> {
  const args = GetNodeInputSchema.parse(input);
  const node = await context.store.getNode(args.snapshotId, args.nodeId);
  return args.summarized ? summarizeNode(node) : node;
}

export async function figmaExportAssets(input: unknown, context: ToolContext): Promise<unknown> {
  const args = ExportAssetsInputSchema.parse(input);
  const manifest = await context.store.readManifest(args.snapshotId);
  const urls = await context.client.getImageUrls(manifest.summary.fileKey, args.nodeIds, {
    format: args.format,
    scale: args.scale
  });

  const results: ExportAssetResult[] = [];
  for (const nodeId of args.nodeIds) {
    const url = urls[nodeId] ?? null;
    if (args.mode === "download" && url) {
      const bytes = await context.client.download(url);
      const filePath = await context.store.writeAsset(args.snapshotId, nodeId, bytes, args.format as AssetFormat);
      results.push({ nodeId, url, path: filePath });
    } else {
      results.push({ nodeId, url });
    }
  }

  return { snapshotId: args.snapshotId, assets: results };
}

function compactIndex(nodes: Record<string, unknown>): unknown {
  return {
    nodeCount: Object.keys(nodes).length,
    nodes
  };
}
