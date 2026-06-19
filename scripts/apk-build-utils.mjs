import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import path from "node:path";

/** @param {string} repoRoot */
export function readPackageVersion(repoRoot) {
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  return String(pkg.version);
}

export const APK_BASENAME = "wdkiosk";

/** @param {string} version */
export function versionedApkFileName(version) {
  return `${APK_BASENAME}-v${version}.apk`;
}

function isUsableJavaHome(home) {
  if (!home || home.includes("java-25")) {
    return false;
  }
  return existsSync(path.join(home, "bin", "java"));
}

/**
 * @param {string} repoRoot
 * @returns {string | undefined}
 */
export function resolveJavaHome(repoRoot) {
  const bundled = path.join(repoRoot, ".jdk");
  const envHome = process.env.JAVA_HOME;
  const candidates = [
    process.env.FREEKIOSK_JAVA_HOME,
    bundled,
    isUsableJavaHome(envHome) ? envHome : undefined,
    path.join(repoRoot, ".jdk", "Contents", "Home"),
    "/usr/lib/jvm/java-17-openjdk",
    "/usr/lib/jvm/java-17",
    "/usr/lib/jvm/java-21-openjdk",
    "/usr/lib/jvm/java-21",
  ].filter(Boolean);

  for (const home of candidates) {
    if (isUsableJavaHome(home)) {
      return home;
    }
  }
  return undefined;
}

/**
 * @param {string} repoRoot
 * @param {{ noDaemon?: boolean; stopDaemon?: boolean }} [options]
 */
export function runGradleRelease(repoRoot, options = {}) {
  const { noDaemon = true, stopDaemon = true } = options;
  const androidDir = path.join(repoRoot, "android");
  const javaHome = resolveJavaHome(repoRoot);
  const env = { ...process.env };

  if (javaHome) {
    env.JAVA_HOME = javaHome;
    const javaBin = path.join(javaHome, "bin");
    env.PATH = `${javaBin}${path.delimiter}${env.PATH ?? ""}`;
    console.log(`==> JAVA_HOME=${javaHome}`);
  } else {
    console.warn(
      "==> Warning: JDK 17 not found. Install java-17-openjdk-devel or run: node scripts/ensure-jdk17.mjs",
    );
  }

  const gradleArgs = noDaemon ? ["--no-daemon", "assembleRelease"] : ["assembleRelease"];
  console.log(`==> Gradle ${gradleArgs.join(" ")}...`);

  try {
    const result = spawnSync("./gradlew", gradleArgs, {
      cwd: androidDir,
      stdio: "inherit",
      shell: false,
      env,
    });
    if (result.status !== 0) {
      throw new Error("Gradle assembleRelease failed");
    }
  } finally {
    if (stopDaemon) {
      console.log("==> Stopping Gradle daemon (freeing Java memory)...");
      spawnSync("./gradlew", ["--stop"], {
        cwd: androidDir,
        stdio: "inherit",
        shell: false,
        env,
      });
    }
  }
}

/** @param {string} repoRoot */
export function gradleReleaseApkPath(repoRoot) {
  return path.join(repoRoot, "android/app/build/outputs/apk/release/app-release.apk");
}

/**
 * Copy release APK to repo root with version in filename.
 * @param {string} repoRoot
 * @param {string} [version]
 * @returns {string} absolute path to versioned APK
 */
export function copyVersionedApk(repoRoot, version = readPackageVersion(repoRoot)) {
  const src = gradleReleaseApkPath(repoRoot);
  if (!existsSync(src)) {
    throw new Error(`APK not found: ${src}. Run Gradle assembleRelease first.`);
  }
  const fileName = versionedApkFileName(version);
  const dest = path.join(repoRoot, fileName);
  copyFileSync(src, dest);
  console.log(`==> Versioned APK: ${dest}`);
  return dest;
}
