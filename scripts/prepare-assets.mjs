import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, ".cloudflare-assets");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const path of [
  "index.html",
  "_next/static/chunks",
  "cdn-cgi",
  "cursor",
  "media",
]) {
  await cp(join(root, path), join(output, path), {
    recursive: true,
    filter: (source) => !source.endsWith(".DS_Store"),
  });
}
