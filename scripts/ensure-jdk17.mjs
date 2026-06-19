#!/usr/bin/env node
/**
 * Download Eclipse Temurin JDK 17 into .jdk/ (gitignored) for local Android builds.
 * Usage: node scripts/ensure-jdk17.mjs
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveJavaHome } from "./apk-build-utils.mjs";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const jdkDir = path.join(repoRoot, ".jdk");

const ADOPTIUM_URL =
  "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse?project=jdk";

async function download(url, dest) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }
  await pipeline(response.body, createWriteStream(dest));
}

async function main() {
  const existing = resolveJavaHome(repoRoot);
  if (existing && existing !== jdkDir && !existing.includes("/java-25")) {
    console.log(`==> JDK already available: ${existing}`);
    return;
  }

  if (existsSync(path.join(jdkDir, "bin", "java"))) {
    console.log(`==> Bundled JDK already present: ${jdkDir}`);
    return;
  }

  mkdirSync(jdkDir, { recursive: true });
  const archive = path.join(repoRoot, ".jdk-download.tar.gz");
  console.log("==> Downloading Eclipse Temurin JDK 17...");
  await download(ADOPTIUM_URL, archive);
  console.log("==> Extracting...");
  execSync(`tar xzf "${archive}" -C "${jdkDir}" --strip-components=1`, { stdio: "inherit" });
  execSync(`rm -f "${archive}"`);
  console.log(`==> JDK 17 ready at ${jdkDir}`);
}

main().catch((error) => {
  console.error(`ensure-jdk17: ${error.message}`);
  process.exit(1);
});
