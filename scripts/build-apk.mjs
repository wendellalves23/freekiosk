#!/usr/bin/env node
/**
 * Build release APK and copy to repo root as wdkiosk-v{version}.apk.
 * Uses --no-daemon and stops Gradle afterward so Java does not keep consuming RAM.
 *
 * Usage:
 *   node scripts/build-apk.mjs
 *   npm run apk:build
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  copyVersionedApk,
  readPackageVersion,
  resolveJavaHome,
  runGradleRelease,
} from "./apk-build-utils.mjs";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function main() {
  const version = readPackageVersion(repoRoot);
  console.log(`==> Building FreeKiosk v${version}`);

  if (!resolveJavaHome(repoRoot)) {
    console.log("==> JDK 17 not found — downloading Temurin into .jdk/ ...");
    execSync("node scripts/ensure-jdk17.mjs", { cwd: repoRoot, stdio: "inherit" });
  }

  if (!resolveJavaHome(repoRoot)) {
    console.error("JDK 17 still unavailable after ensure-jdk17.mjs");
    process.exit(1);
  }

  runGradleRelease(repoRoot);
  const apkPath = copyVersionedApk(repoRoot, version);
  console.log("==> Build complete");
  console.log(`    ${apkPath}`);
}

main();
