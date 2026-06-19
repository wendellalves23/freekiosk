#!/usr/bin/env node
/**
 * Build (optional) and publish FreeKiosk APK + OTA manifest to Cloudflare R2.
 *
 * Prerequisites (.env in repo root):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 *
 * Usage:
 *   node scripts/push-apk-r2.mjs --build
 *   node scripts/push-apk-r2.mjs --apk android/app/build/outputs/apk/release/app-release.apk
 *   node scripts/push-apk-r2.mjs --build --beta --notes "Correções de kiosk"
 *   node scripts/push-apk-r2.mjs --dry-run --build
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";

import {
  copyVersionedApk,
  gradleReleaseApkPath,
  readPackageVersion,
  runGradleRelease,
  versionedApkFileName,
} from "./apk-build-utils.mjs";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(repoRoot, ".env");

if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}

function readEnv(name) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readAndroidVersionCode() {
  const gradle = readFileSync(path.join(repoRoot, "android/app/build.gradle"), "utf8");
  const match = gradle.match(/versionCode\s+(\d+)/);
  if (!match) {
    throw new Error("versionCode not found in android/app/build.gradle");
  }
  return Number.parseInt(match[1], 10);
}

function parseArgs(argv) {
  const options = {
    build: false,
    beta: false,
    dryRun: false,
    apk: "",
    notes: "",
    prefix: readEnv("FREEKIOSK_R2_RELEASE_PREFIX") ?? "releases/freekiosk",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--build") {
      options.build = true;
    } else if (arg === "--beta") {
      options.beta = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--apk" && argv[i + 1]) {
      options.apk = argv[i + 1];
      i += 1;
    } else if (arg === "--notes" && argv[i + 1]) {
      options.notes = argv[i + 1];
      i += 1;
    } else if (arg === "--prefix" && argv[i + 1]) {
      options.prefix = argv[i + 1].replace(/^\/+|\/+$/g, "");
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/push-apk-r2.mjs [options]

Options:
  --build              Run ./gradlew assembleRelease before upload
  --apk <path>         APK file to upload (default: release output path)
  --beta               Publish to latest-beta.json instead of latest.json
  --notes <text>       Release notes stored in the manifest
  --prefix <path>      R2 key prefix (default: releases/freekiosk)
  --dry-run            Print actions without uploading
`);
      process.exit(0);
    }
  }

  return options;
}

function getR2Config() {
  const accountId = readEnv("R2_ACCOUNT_ID");
  const accessKeyId = readEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = readEnv("R2_SECRET_ACCESS_KEY");
  const bucketName = readEnv("R2_BUCKET_NAME");
  const publicUrl = readEnv("R2_PUBLIC_URL");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error(
      "Missing R2_* env vars. Copy .env.example to .env and configure Cloudflare R2.",
    );
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl: publicUrl.replace(/\/+$/, ""),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  };
}

function runBuildAndCopyVersionedApk() {
  runGradleRelease(repoRoot);
  return copyVersionedApk(repoRoot);
}

function resolveApkPath(explicitPath, version) {
  if (explicitPath) {
    const resolved = path.isAbsolute(explicitPath)
      ? explicitPath
      : path.join(repoRoot, explicitPath);
    if (!existsSync(resolved)) {
      throw new Error(`APK not found: ${resolved}`);
    }
    return resolved;
  }

  const versionedPath = path.join(repoRoot, versionedApkFileName(version));
  if (existsSync(versionedPath)) {
    return versionedPath;
  }

  const defaultPath = gradleReleaseApkPath(repoRoot);
  if (!existsSync(defaultPath)) {
    throw new Error(
      `APK not found. Run with --build or pass --apk. Expected ${versionedPath} or ${defaultPath}.`,
    );
  }
  return defaultPath;
}

function buildManifest({ version, versionCode, downloadUrl, notes, isPrerelease }) {
  return {
    version,
    versionCode,
    name: `WD Kiosk ${version}`,
    notes,
    publishedAt: new Date().toISOString(),
    downloadUrl,
    isPrerelease,
  };
}

async function uploadFile(client, bucketName, key, filePath, contentType, cacheControl) {
  const body = createReadStream(filePath);
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
}

async function uploadJson(client, bucketName, key, payload, cacheControl) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(payload, null, 2),
      ContentType: "application/json; charset=utf-8",
      CacheControl: cacheControl,
    }),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.build) {
    runBuildAndCopyVersionedApk();
  }

  const version = readPackageVersion(repoRoot);
  const versionCode = readAndroidVersionCode();
  const apkPath = resolveApkPath(options.apk, version);
  const apkSize = statSync(apkPath).size;
  const apkFileName = versionedApkFileName(version);
  const prefix = options.prefix.replace(/\/+$/g, "");
  const apkKey = `${prefix}/${apkFileName}`;
  const manifestKey = `${prefix}/${options.beta ? "latest-beta.json" : "latest.json"}`;

  const r2 = getR2Config();
  const downloadUrl = `${r2.publicUrl}/${apkKey}`;
  const manifest = buildManifest({
    version,
    versionCode,
    downloadUrl,
    notes: options.notes,
    isPrerelease: options.beta,
  });

  console.log("==> OTA publish plan");
  console.log(`    version:      ${version} (${versionCode})`);
  console.log(`    apk:          ${apkPath} (${apkSize} bytes)`);
  console.log(`    r2 apk key:   ${apkKey}`);
  console.log(`    manifest key: ${manifestKey}`);
  console.log(`    downloadUrl:  ${downloadUrl}`);

  if (options.dryRun) {
    console.log("==> Dry run — no upload performed");
    console.log(JSON.stringify(manifest, null, 2));
    return;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: r2.endpoint,
    credentials: {
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
    },
  });

  console.log("==> Uploading APK...");
  await uploadFile(
    client,
    r2.bucketName,
    apkKey,
    apkPath,
    "application/vnd.android.package-archive",
    "public, max-age=31536000, immutable",
  );

  console.log("==> Uploading manifest...");
  await uploadJson(
    client,
    r2.bucketName,
    manifestKey,
    manifest,
    "no-cache, no-store, must-revalidate",
  );

  console.log("==> Done");
  console.log(`    Manifest URL: ${r2.publicUrl}/${manifestKey}`);
  console.log(
    `    Configure app (gradle.properties): FREEKIOSK_UPDATE_MANIFEST_URL=${r2.publicUrl}/${prefix}/latest.json`,
  );
}

main().catch((error) => {
  console.error(`push-apk-r2: ${error.message}`);
  process.exit(1);
});
