export type FigmaFileKey = string;
export type FigmaNodeId = string;

export interface FigmaLocation {
  fileKey: FigmaFileKey;
  nodeId?: FigmaNodeId;
}

export interface SnapshotRequest extends Partial<FigmaLocation> {
  figmaUrl?: string;
  exportFormat?: AssetFormat;
  scale?: number;
}

export type AssetFormat = "jpg" | "png" | "svg" | "pdf";

export interface FigmaClient {
  getFile(fileKey: string): Promise<unknown>;
  getNodes(fileKey: string, nodeIds: string[]): Promise<unknown>;
  getImageUrls(fileKey: string, nodeIds: string[], options?: ExportOptions): Promise<Record<string, string | null>>;
  getLocalVariables(fileKey: string): Promise<unknown>;
  download(url: string): Promise<Uint8Array>;
}

export interface ExportOptions {
  format?: AssetFormat;
  scale?: number;
}

export interface SnapshotSummary {
  id: string;
  fileKey: string;
  requestedNodeId?: string;
  createdAt: string;
  rootName?: string;
  nodeCount: number;
  componentCount: number;
  styleCount: number;
  variableCount: number;
  exportedImageCount: number;
}

export interface NodeIndexEntry {
  id: string;
  name?: string;
  type?: string;
  path: string[];
  childCount: number;
}

export interface SnapshotIndex {
  nodes: Record<string, NodeIndexEntry>;
  requestedNodeId?: string;
  imageUrls: Record<string, string | null>;
}

export interface SnapshotManifest {
  summary: SnapshotSummary;
  paths: SnapshotPaths;
  index: SnapshotIndex;
}

export interface SnapshotPaths {
  dir: string;
  fileJson: string;
  nodeJson?: string;
  variablesJson?: string;
  manifestJson: string;
  assetsDir: string;
}

export interface SnapshotData {
  manifest: SnapshotManifest;
  file: unknown;
  node?: unknown;
  variables?: unknown;
}

export interface SnapshotStore {
  saveSnapshot(input: SaveSnapshotInput): Promise<SnapshotManifest>;
  readSnapshot(id: string): Promise<SnapshotData>;
  readManifest(id: string): Promise<SnapshotManifest>;
  getNode(id: string, nodeId: string): Promise<unknown>;
  writeAsset(id: string, nodeId: string, bytes: Uint8Array, format: AssetFormat): Promise<string>;
}

export interface SaveSnapshotInput {
  id?: string;
  fileKey: string;
  requestedNodeId?: string;
  file: unknown;
  node?: unknown;
  variables?: unknown;
  imageUrls?: Record<string, string | null>;
}

export interface ExportAssetResult {
  nodeId: string;
  url: string | null;
  path?: string;
}
