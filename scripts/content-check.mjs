#!/usr/bin/env node
// Fails the build if the site copy names a client that must stay unnamed,
// or contains an em-dash. Scans content/, app/ and components/.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["content", "app", "components"];
const extensions = [".ts", ".tsx", ".md", ".mdx", ".json"];

const rules = [
  { id: "unnamed-client", pattern: /\b(Qatar Foundation|Optic|Dream Team|Fulcrum|IRFU|ECB|LIV Golf|WSC)\b/ },
  { id: "em-dash", pattern: /—/ },
];

const hits = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (extensions.some((e) => p.endsWith(e))) scan(p);
  }
}

function scan(path) {
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const rule of rules) {
      const m = line.match(rule.pattern);
      if (m) hits.push(`${path}:${i + 1} [${rule.id}] "${m[0]}"`);
    }
  });
}

roots.forEach(walk);

if (hits.length) {
  console.error("content-check failed:\n" + hits.join("\n"));
  process.exit(1);
}
console.log("content-check: clean");
