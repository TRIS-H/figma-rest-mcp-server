import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool
} from "@modelcontextprotocol/sdk/types.js";
import { FigmaRestClient } from "./figmaClient.js";
import { readFigmaPatFromKeychain } from "./keychain.js";
import { FileSnapshotStore } from "./snapshotStore.js";
import {
  figmaExportAssets,
  figmaFetchSnapshot,
  figmaGetNode,
  figmaReadSnapshot,
  type ToolContext
} from "./toolHandlers.js";

const tools: Tool[] = [
  {
    name: "figma_fetch_snapshot",
    description: "Fetch a Figma file snapshot through the Figma REST API and cache it under .figma-cache.",
    inputSchema: {
      type: "object",
      properties: {
        figmaUrl: { type: "string" },
        fileKey: { type: "string" },
        nodeId: { type: "string" },
        exportFormat: { type: "string", enum: ["jpg", "png", "svg", "pdf"], default: "png" },
        scale: { type: "number", minimum: 0, maximum: 4 }
      }
    }
  },
  {
    name: "figma_read_snapshot",
    description: "Read summary, index, and optional node/file/variables data from a cached snapshot.",
    inputSchema: {
      type: "object",
      required: ["snapshotId"],
      properties: {
        snapshotId: { type: "string" },
        nodeId: { type: "string" },
        includeFile: { type: "boolean", default: false },
        includeVariables: { type: "boolean", default: false }
      }
    }
  },
  {
    name: "figma_get_node",
    description: "Read an exact node payload from a cached snapshot by node id.",
    inputSchema: {
      type: "object",
      required: ["snapshotId", "nodeId"],
      properties: {
        snapshotId: { type: "string" },
        nodeId: { type: "string" },
        summarized: { type: "boolean", default: false }
      }
    }
  },
  {
    name: "figma_export_assets",
    description: "Export Figma asset image URLs for node ids, or download them into the snapshot cache.",
    inputSchema: {
      type: "object",
      required: ["snapshotId", "nodeIds"],
      properties: {
        snapshotId: { type: "string" },
        nodeIds: { type: "array", items: { type: "string" }, minItems: 1 },
        mode: { type: "string", enum: ["url", "download"], default: "url" },
        format: { type: "string", enum: ["jpg", "png", "svg", "pdf"], default: "png" },
        scale: { type: "number", minimum: 0, maximum: 4 }
      }
    }
  }
];

export async function createServer(context?: Partial<ToolContext>): Promise<Server> {
  const toolContext: ToolContext = {
    client: context?.client ?? new FigmaRestClient(readFigmaPatFromKeychain),
    store: context?.store ?? new FileSnapshotStore()
  };

  const server = new Server(
    {
      name: "figma-rest-mcp-server",
      version: "0.1.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await callTool(request.params.name, request.params.arguments ?? {}, toolContext);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  });

  return server;
}

export async function runServer(): Promise<void> {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function callTool(name: string, args: unknown, context: ToolContext): Promise<unknown> {
  switch (name) {
    case "figma_fetch_snapshot":
      return figmaFetchSnapshot(args, context);
    case "figma_read_snapshot":
      return figmaReadSnapshot(args, context);
    case "figma_get_node":
      return figmaGetNode(args, context);
    case "figma_export_assets":
      return figmaExportAssets(args, context);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
