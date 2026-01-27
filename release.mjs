
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync } from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";

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
const v = process.argv[2];
const pkg = readJsonFile("package.json");
const currentVersion = pkg.version;

if (!v) {
	console.error(`Current version: ${currentVersion}\nUsage: npm run release <version>`);
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

// --- Preflight: check cross-zip works ---
// (already checked above)

// --- Preflight: git sanity ---
if (!runSilent("git rev-parse --is-inside-work-tree")) {
	console.error("Not a git repo.");
	process.exit(1);
}

// Check working tree is clean
const status = runCapture("git status --porcelain");
if (status) {
	console.error("Working tree not clean. Commit or stash changes before releasing.");
	console.error("\nModified files:");
	console.error(status);
	process.exit(1);
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

// --- Track what we've changed for recovery ---
const changedFiles = [];

try {
	// --- 1) bump package.json and package-lock.json using npm version ---
	console.log("Updating package.json and package-lock.json...");
	run(`npm version ${v} --no-git-tag-version --allow-same-version`);
	changedFiles.push("package.json", "package-lock.json");

	// --- 2) sync manifest.json ---
	console.log("Updating manifest.json...");
	manifest.version = v;
	writeJsonFile("manifest.json", manifest);
	changedFiles.push("manifest.json");

	// --- 3) update versions.json ---
	if (existsSync("versions.json")) {
		console.log("Updating versions.json...");
		const versions = readJsonFile("versions.json");
		versions[v] = manifest.minAppVersion;
		writeJsonFile("versions.json", versions);
		changedFiles.push("versions.json");
	}

	// --- 4) build ---
	console.log("Building...");
	run("node esbuild.config.mjs production");

	// --- 5) zip payload ---
	console.log("Creating zip...");
	const tempDir = ".release-temp";
	rmSync(tempDir, { recursive: true, force: true });
	mkdirSync(tempDir);
	copyFileSync("main.js", `${tempDir}/main.js`);
	copyFileSync("manifest.json", `${tempDir}/manifest.json`);
	if (existsSync("styles.css")) { copyFileSync("styles.css", `${tempDir}/styles.css`); }
	crossZip.zipSync(tempDir, "z2k-plugin-templates.zip");
	rmSync(tempDir, { recursive: true });
	changedFiles.push("z2k-plugin-templates.zip");

	// --- 6) commit, tag, push ---
	console.log("Committing...");
	run('git add package.json package-lock.json manifest.json');
	fileAddIfExists("versions.json");
	fileAddIfExists("z2k-plugin-templates.zip");
	run(`git commit -m "release: v${v}"`);
	run(`git tag "v${v}"`);

	console.log("Pushing...");
	run("git push");
	run("git push --tags");

	console.log(`\n✅ Released v${v}`);
	console.log("\nNext steps:");
	console.log("  1. Go to the GitHub repository");
	console.log("  2. Create a new release from tag v" + v);
	console.log("  3. Upload: main.js, manifest.json, styles.css, z2k-plugin-templates.zip");

} catch (err) {
	console.error("\n❌ Release failed!\n");
	if (changedFiles.length > 0) {
		console.error("The following files were modified before the failure:");
		changedFiles.forEach(f => console.error(`  - ${f}`));
		console.error("\nTo recover, run:");
		console.error(`  git checkout -- ${changedFiles.join(" ")}`);
		console.error("\nOr if a commit was made:");
		console.error("  git reset --soft HEAD~1");
		console.error(`  git tag -d v${v}`);
	}
	process.exit(1);
}
