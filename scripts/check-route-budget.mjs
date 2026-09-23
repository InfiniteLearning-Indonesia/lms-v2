import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const routeChunkRoot = ".next/static/chunks/app";
const maxRouteChunkBytes = 96 * 1024;
const maxAllRouteChunksBytes = 768 * 1024;

function filesWithin(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? filesWithin(child) : child.endsWith(".js") ? [child] : [];
  });
}

const files = filesWithin(routeChunkRoot).map((file) => ({ file, bytes: statSync(file).size }));
const totalBytes = files.reduce((total, item) => total + item.bytes, 0);
const oversized = files.filter((item) => item.bytes > maxRouteChunkBytes);

if (totalBytes > maxAllRouteChunksBytes || oversized.length > 0) {
  const details = oversized.map((item) => `${relative(routeChunkRoot, item.file)}: ${item.bytes} bytes`).join("\n");
  throw new Error([
    `Route bundle budget exceeded: ${totalBytes}/${maxAllRouteChunksBytes} bytes total.`,
    details || "No individual route chunk exceeded its budget.",
  ].join("\n"));
}

const largest = files.sort((a, b) => b.bytes - a.bytes)[0];
console.log(`performance:check PASS (${totalBytes}/${maxAllRouteChunksBytes} route bytes; largest ${relative(routeChunkRoot, largest.file)} ${largest.bytes}/${maxRouteChunkBytes})`);
