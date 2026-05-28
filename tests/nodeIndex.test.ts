import { describe, expect, it } from "vitest";
import { buildNodeIndex, findNodeById, summarizeNode } from "../src/nodeIndex.js";

const file = {
  document: {
    id: "0:0",
    name: "Document",
    type: "DOCUMENT",
    children: [
      {
        id: "1:1",
        name: "Frame",
        type: "FRAME",
        children: [{ id: "2:2", name: "Button", type: "COMPONENT", children: [] }]
      }
    ]
  }
};

describe("node index", () => {
  it("indexes nodes by id with paths", () => {
    const index = buildNodeIndex(file);
    expect(index["2:2"]).toMatchObject({
      id: "2:2",
      name: "Button",
      path: ["Document", "Frame", "Button"]
    });
  });

  it("finds nodes recursively", () => {
    expect(findNodeById(file, "1:1")).toMatchObject({ name: "Frame" });
  });

  it("summarizes direct children", () => {
    expect(summarizeNode(file.document.children[0])).toMatchObject({
      id: "1:1",
      children: [{ id: "2:2", childCount: 0 }]
    });
  });
});
