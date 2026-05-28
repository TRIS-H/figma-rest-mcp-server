#!/usr/bin/env node
import { runServer } from "./server.js";

runServer().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
