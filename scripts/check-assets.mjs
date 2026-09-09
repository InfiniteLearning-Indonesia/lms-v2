import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const assets = new Map([
  ["app/fonts/LexendDeca[wght].ttf", "d11c12298f431d7e416a1e615d33f2c2b98bda2318a0c186c8c94f08c2d90ce8"],
  ["app/fonts/LexendDeca-OFL.txt", "5da8505887d0fa7fe963445fd58852707fda34adfeb65af25c99d152bab285bd"],
  ["app/fonts/InclusiveSans[wght].ttf", "52ae5fdb8eda45633f1e9817ebdb07d8075c89081d51204f16f78394608a5c4e"],
  ["app/fonts/InclusiveSans-OFL.txt", "0690e0819628a20c5ee68388a7bae621e5c3e53be57276169decd00111d8f2cf"],
]);

for (const [path, expected] of assets) {
  const actual = createHash("sha256").update(readFileSync(path)).digest("hex");
  if (actual !== expected) throw new Error(`${path} checksum mismatch: ${actual}`);
}

console.log(`assets:check PASS (${assets.size} local font/license files)`);
