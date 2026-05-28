import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AssetFormat,
  SaveSnapshotInput,
  SnapshotData,
  SnapshotManifest,
  SnapshotStore,
  SnapshotSummary
} from "./types.js";
import { buildNodeIndex, getRootName } from "./nodeIndex.js";

export class FileSnapshotStore implements SnapshotStore {
  constructor(private readonly rootDir = getDefaultCacheRoot()) {}

  async saveSnapshot(input: SaveSnapshotInput): Promise<SnapshotManifest> {
    const id = input.id ?? createSnapshotId(input.fileKey);
    const dir = path.join(this.rootDir, id);
    const assetsDir = path.join(dir, "assets");
    await mkdir(assetsDir, { recursive: true });

    const fileJson = path.join(dir, "file.json");
    const nodeJson = input.node ? path.join(dir, "node.json") : undefined;
    const variablesJson = input.variables ? path.join(dir, "variables.json") : undefined;
    const manifestJson = path.join(dir, "manifest.json");

    await writeJson(fileJson, input.file);
    if (nodeJson) await writeJson(nodeJson, input.node);
    if (variablesJson) await writeJson(variablesJson, input.variables);

    const index = buildNodeIndex(input.file);
    const imageUrls = input.imageUrls ?? {};
    const summary: SnapshotSummary = {
      id,
      fileKey: input.fileKey,
      requestedNodeId: input.requestedNodeId,
      createdAt: new Date().toISOString(),
      rootName: getRootName(input.file),
      nodeCount: Object.keys(index).length,
      componentCount: countTopLevelMap(input.file, "components"),
      styleCount: countTopLevelMap(input.file, "styles"),
      variableCount: countVariables(input.variables),
      exportedImageCount: Object.keys(imageUrls).length
    };

    const manifest: SnapshotManifest = {
      summary,
      paths: {
        dir,
        fileJson,
        nodeJson,
        variablesJson,
        manifestJson,
        assetsDir
      },
      index: {
        nodes: index,
        requestedNodeId: input.requestedNodeId,
        imageUrls
      }
    };

    await writeJson(manifestJson, manifest);
    return manifest;
  }

  async readSnapshot(id: string): Promise<SnapshotData> {
    const manifest = await this.readManifest(id);
    return {
      manifest,
      file: await readJson(manifest.paths.fileJson),
      node: manifest.paths.nodeJson ? await readJson(manifest.paths.nodeJson) : undefined,
      variables: manifest.paths.variablesJson ? await readJson(manifest.paths.variablesJson) : undefined
    };
  }

  async readManifest(id: string): Promise<SnapshotManifest> {
    const manifestPath = path.join(this.rootDir, id, "manifest.json");
    return (await readJson(manifestPath)) as SnapshotManifest;
  }

  async getNode(id: string, nodeId: string): Promise<unknown> {
    const { findNodeById } = await import("./nodeIndex.js");
    const snapshot = await this.readSnapshot(id);
    const node = findNodeById(snapshot.file, nodeId);
    if (!node) {
      throw new Error(`Node not found in snapshot: ${nodeId}`);
    }
    return node;
  }

  async writeAsset(id: string, nodeId: string, bytes: Uint8Array, format: AssetFormat): Promise<string> {
    const manifest = await this.readManifest(id);
    const fileName = `${sanitizeFileName(nodeId)}.${format}`;
    const outputPath = path.join(manifest.paths.assetsDir, fileName);
    await mkdir(manifest.paths.assetsDir, { recursive: true });
    await writeFile(outputPath, bytes);
    return outputPath;
  }
}

export function getDefaultCacheRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".figma-cache");
}

function createSnapshotId(fileKey: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${timestamp}-${fileKey}`;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function countTopLevelMap(value: unknown, key: string): number {
  if (!isRecord(value) || !isRecord(value[key])) return 0;
  return Object.keys(value[key]).length;
}

function countVariables(value: unknown): number {
  if (!isRecord(value) || !isRecord(value.meta) || !isRecord(value.meta.variables)) return 0;
  return Object.keys(value.meta.variables).length;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^A-Za-z0-9_.-]/g, "_");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
