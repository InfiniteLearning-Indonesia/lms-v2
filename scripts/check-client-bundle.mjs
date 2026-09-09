import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const clientRoot = ".next/static/chunks";
const forbidden = [
  "auth_token",
  "NEXT_PUBLIC_API_URL",
  "LMS_API_ORIGIN",
  "/auth/login-local",
  "/auth/setup-password",
  "/auth/exchange",
  "?token=",
  "Bearer ",
  "sessionStorage",
  "mockServiceWorker.js",
  "setupWorker",
];

function filesWithin(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? filesWithin(child) : child.endsWith(".js") ? [child] : [];
  });
}

const findings = [];
for (const file of filesWithin(clientRoot)) {
  const source = readFileSync(file, "utf8");
  for (const value of forbidden) {
    if (source.includes(value)) findings.push(`${value} in ${file}`);
  }
}

if (findings.length > 0) {
  throw new Error(`Forbidden client bundle content:\n${findings.join("\n")}`);
}

console.log(`bundle:check PASS (${forbidden.length} forbidden patterns absent)`);
