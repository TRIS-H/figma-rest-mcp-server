import type { NodeIndexEntry } from "./types.js";

interface FigmaLikeNode {
  id?: string;
  name?: string;
  type?: string;
  children?: FigmaLikeNode[];
  document?: FigmaLikeNode;
}

export function buildNodeIndex(file: unknown): Record<string, NodeIndexEntry> {
  const root = getDocumentNode(file);
  const index: Record<string, NodeIndexEntry> = {};
  if (root) {
    visitNode(root, [], index);
  }
  return index;
}

export function findNodeById(file: unknown, nodeId: string): unknown | undefined {
  const root = getDocumentNode(file);
  if (!root) return undefined;
  return findNode(root, nodeId);
}

export function summarizeNode(node: unknown): unknown {
  if (!isRecord(node)) return node;
  const children = Array.isArray(node.children) ? node.children : [];
  return {
    ...node,
    children: children.map((child) => {
      if (!isRecord(child)) return child;
      return {
        id: child.id,
        name: child.name,
        type: child.type,
        childCount: Array.isArray(child.children) ? child.children.length : 0
      };
    })
  };
}

export function getRootName(file: unknown): string | undefined {
  const root = getDocumentNode(file);
  return typeof root?.name === "string" ? root.name : undefined;
}

function visitNode(node: FigmaLikeNode, path: string[], index: Record<string, NodeIndexEntry>): void {
  const nodePath = [...path, node.name ?? node.id ?? "unnamed"];
  if (node.id) {
    index[node.id] = {
      id: node.id,
      name: node.name,
      type: node.type,
      path: nodePath,
      childCount: Array.isArray(node.children) ? node.children.length : 0
    };
  }

  for (const child of node.children ?? []) {
    visitNode(child, nodePath, index);
  }
}

function findNode(node: FigmaLikeNode, nodeId: string): unknown | undefined {
  if (node.id === nodeId) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, nodeId);
    if (found) return found;
  }
  return undefined;
}

function getDocumentNode(file: unknown): FigmaLikeNode | undefined {
  if (!isRecord(file)) return undefined;
  const document = file.document;
  return isFigmaLikeNode(document) ? document : undefined;
}

function isFigmaLikeNode(value: unknown): value is FigmaLikeNode {
  return isRecord(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
