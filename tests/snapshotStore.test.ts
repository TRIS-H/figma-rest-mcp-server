import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FileSnapshotStore } from "../src/snapshotStore.js";

describe("FileSnapshotStore", () => {
  it("saves and reads cached snapshots", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "figma-cache-test-"));
    const store = new FileSnapshotStore(root);
    const manifest = await store.saveSnapshot({
      id: "snapshot-1",
      fileKey: "abc123",
      requestedNodeId: "1:1",
      file: {
        document: {
          id: "0:0",
          name: "Document",
          type: "DOCUMENT",
          children: [{ id: "1:1", name: "Target", type: "FRAME", children: [] }]
        },
        components: { c1: {} },
        styles: { s1: {} }
      },
      variables: { meta: { variables: { v1: {} } } },
      imageUrls: { "1:1": "https://example.test/image.png" }
    });

    expect(manifest.summary).toMatchObject({
      id: "snapshot-1",
      fileKey: "abc123",
      requestedNodeId: "1:1",
      nodeCount: 2,
      componentCount: 1,
      styleCount: 1,
      variableCount: 1,
      exportedImageCount: 1
    });

    await expect(store.getNode("snapshot-1", "1:1")).resolves.toMatchObject({ name: "Target" });
    await expect(store.readSnapshot("snapshot-1")).resolves.toMatchObject({
      manifest: { summary: { id: "snapshot-1" } }
    });
  });
});
