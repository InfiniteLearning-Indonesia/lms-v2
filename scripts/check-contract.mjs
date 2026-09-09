import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, existsSync, unlinkSync } from "node:fs";

const contract = "contracts/cp11-cp12.openapi.json";
const generated = "lib/api/generated.ts";
const checksum = "contracts/cp11-cp12.openapi.sha256";

if (!existsSync(contract) || !existsSync(generated) || !existsSync(checksum)) {
  throw new Error("Contract snapshot, generated types, and checksum are required");
}

const hash = createHash("sha256").update(readFileSync(contract)).digest("hex");
const expected = readFileSync(checksum, "utf8").trim().split(/\s+/)[0];
if (hash !== expected) throw new Error(`Contract checksum mismatch: ${hash} != ${expected}`);

const temp = `${generated}.check`;
execFileSync("npx", ["openapi-typescript", contract, "-o", temp], { stdio: "ignore" });
const current = readFileSync(generated, "utf8");
const regenerated = readFileSync(temp, "utf8");
if (current !== regenerated) throw new Error("Generated OpenAPI types are stale; run npm run contract:generate");
unlinkSync(temp);
console.log(`contract:check PASS (${hash.slice(0, 12)})`);
