
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync, statSync } from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);
let crossZip;
try {
	crossZip = require("cross-zip");
} catch {
	console.error("cross-zip not found. Run 'npm install' first.");
	process.exit(1);
}

// --- Helpers ---
function run(cmd, opts = {}) {
	return execSync(cmd, { stdio: "inherit", ...opts });
}
function runCapture(cmd) {
	return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}
function runSilent(cmd) {
	try {
		execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] });
		return true;
	} catch {
		return false;
	}
}
function fileAddIfExists(path) {
	if (existsSync(path)) { run(`git add "${path}"`); }
}
function isValidSemver(version) {
	return /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(version);
}
function readJsonFile(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}
function writeJsonFile(path, data, indent = "\t") {
	writeFileSync(path, JSON.stringify(data, null, indent) + "\n");
}

// --- Parse args ---
const args = process.argv.slice(2);
const forceFlag = args.includes("--force");
const v = args.find(a => !a.startsWith("--"));
const pkg = readJsonFile("package.json");
const currentVersion = pkg.version;

if (!v) {
	console.error(`Current version: ${currentVersion}\nUsage: npm run release <version> [-- --force]`);
	process.exit(1);
}

// --- Validate version ---
if (!isValidSemver(v)) {
	console.error(`Invalid version format: "${v}". Expected semver (e.g., 1.2.3)`);
	process.exit(1);
}
if (v === currentVersion) {
	console.error(`Version ${v} is already the current version.`);
	process.exit(1);
}

// --- Preflight: git sanity ---
if (!runSilent("git rev-parse --is-inside-work-tree")) {
	console.error("Not a git repo.");
	process.exit(1);
}

// Check working tree is clean
const status = runCapture("git status --porcelain");
if (status && !forceFlag) {
	console.error("Working tree not clean. Commit or stash changes, or use --force to skip this check.");
	console.error("\nModified files:");
	console.error(status);
	process.exit(1);
} else if (status && forceFlag) {
	console.warn("Warning: Working tree not clean (continuing due to --force)");
}

// Check remote sync
run("git fetch --tags --prune");
let upstream = "";
try {
	upstream = runCapture("git rev-parse --abbrev-ref --symbolic-full-name @{u}");
} catch {
	console.warn("No upstream configured; skipping remote ahead/behind check.");
}
if (upstream) {
	const aheadBehind = runCapture(`git rev-list --left-right --count HEAD...${upstream}`).split(/\s+/);
	const [ahead, behind] = aheadBehind.map(n => parseInt(n, 10) || 0);
	if (behind > 0) {
		console.error(`Your branch is behind ${upstream} by ${behind} commit(s). Pull/merge first.`);
		process.exit(1);
	}
}

// Check tag doesn't already exist
const tagExists = runSilent(`git rev-parse "v${v}" --`);
if (tagExists) {
	console.error(`Tag v${v} already exists. Choose a different version.`);
	process.exit(1);
}

// --- Verify current version sync ---
const manifest = readJsonFile("manifest.json");
const lockfile = existsSync("package-lock.json") ? readJsonFile("package-lock.json") : null;

const versionMismatches = [];
if (manifest.version !== currentVersion) {
	versionMismatches.push(`manifest.json: ${manifest.version}`);
}
if (lockfile && lockfile.version !== currentVersion) {
	versionMismatches.push(`package-lock.json: ${lockfile.version}`);
}
if (versionMismatches.length > 0) {
	console.warn(`Version mismatch detected (package.json: ${currentVersion}):`);
	versionMismatches.forEach(m => console.warn(`  - ${m}`));
	console.warn("Continuing anyway - will sync all files to new version.\n");
}

console.log(`\nReleasing v${v} (current: ${currentVersion})\n`);

// --- 1) Build first (before any file changes) ---
// If build fails, nothing has been modified yet - no recovery needed
console.log("Building...");
run("node esbuild.config.mjs production");

// --- Track state for recovery ---
let commitMade = false;
const changedFiles = [];
const zipFile = "z2k-plugin-templates.zip";
const tempDir = ".release-temp";

(async () => {
try {
	// --- 2) bump package.json and package-lock.json ---
	console.log("Updating package.json and package-lock.json...");
	run(`npm version ${v} --no-git-tag-version --allow-same-version`);
	changedFiles.push("package.json", "package-lock.json");

	// --- 3) sync manifest.json ---
	console.log("Updating manifest.json...");
	manifest.version = v;
	writeJsonFile("manifest.json", manifest);
	changedFiles.push("manifest.json");

	// --- 4) update versions.json ---
	if (existsSync("versions.json")) {
		console.log("Updating versions.json...");
		const versions = readJsonFile("versions.json");
		versions[v] = manifest.minAppVersion;
		writeJsonFile("versions.json", versions);
		changedFiles.push("versions.json");
	}

	// --- 5) zip payload ---
	console.log("Creating zip...");
	rmSync(tempDir, { recursive: true, force: true });
	rmSync(zipFile, { force: true });
	mkdirSync(tempDir);
	copyFileSync("main.js", `${tempDir}/main.js`);
	copyFileSync("manifest.json", `${tempDir}/manifest.json`);
	if (existsSync("styles.css")) { copyFileSync("styles.css", `${tempDir}/styles.css`); }
	// Use async zip with promise wrapper for better error handling
	await new Promise((res, rej) => {
		crossZip.zip(resolve(tempDir), resolve(zipFile), (err) => {
			if (err) { rej(err); }
			else { res(); }
		});
	});
	rmSync(tempDir, { recursive: true });
	// Verify zip was created
	if (!existsSync(zipFile)) {
		throw new Error("Zip file was not created");
	}
	const zipSize = statSync(zipFile).size;
	if (zipSize < 1000) {
		throw new Error(`Zip file seems too small (${zipSize} bytes)`);
	}
	// Note: zip file is NOT committed - it's uploaded to GitHub release page

	// --- 6) commit and tag ---
	console.log("Committing...");
	run('git add package.json package-lock.json manifest.json');
	fileAddIfExists("versions.json");
	run(`git commit -m "release: v${v}"`);
	run(`git tag "v${v}"`);
	commitMade = true;

	// --- 7) push ---
	console.log("Pushing...");
	run("git push");
	run("git push --tags");

	console.log(`\n✅ Released v${v}`);
	console.log("\nNext steps:");
	console.log("  1. Go to the GitHub repository");
	console.log("  2. Create a new release from tag v" + v);
	console.log("  3. Upload: main.js, manifest.json, styles.css, " + zipFile);

} catch (err) {
	// Clean up temp directory
	rmSync(tempDir, { recursive: true, force: true });

	console.error("\n❌ Release failed!\n");
	console.error("Error:", err.message || err);

	if (commitMade) {
		// Commit was made but push failed
		console.error("\nCommit was created but push failed. To recover:");
		console.error(`  git reset --soft HEAD~1`);
		console.error(`  git tag -d v${v}`);
		console.error(`  git checkout -- ${changedFiles.join(" ")}`);
	} else if (changedFiles.length > 0) {
		// Files were modified but no commit yet
		console.error("\nTo recover, run:");
		console.error(`  git checkout -- ${changedFiles.join(" ")}`);
	}
	// If neither, build failed before any changes - no recovery needed

	process.exit(1);
}
})();
