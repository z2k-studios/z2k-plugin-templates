
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { execSync } from "child_process";

const BUILT_MAIN = "release/main.js";
const MAX_PROD_SIZE = 5 * 1024 * 1024; // 5 MB — generous; real prod builds are ~1-2 MB

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
const tagExists = runSilent(`git rev-parse "${v}" --`);
if (tagExists) {
	console.error(`Tag ${v} already exists. Choose a different version.`);
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
run("node scripts/esbuild.config.mjs production");

// --- Verify the build is actually a production build ---
// Catches dev-watcher contamination (separate outfile prevents it now, but keep the check)
// and any future build misconfiguration that disables minification or leaves sourcemaps in.
console.log("Verifying production build...");
if (!existsSync(BUILT_MAIN)) {
	console.error(`Build output not found at ${BUILT_MAIN}.`);
	process.exit(1);
}
const builtContents = readFileSync(BUILT_MAIN, "utf8");
if (builtContents.includes("//# sourceMappingURL=data:")) {
	console.error(`${BUILT_MAIN} contains an inline sourcemap — not a production build.`);
	console.error("Check scripts/esbuild.config.mjs — the prod path should set sourcemap: false.");
	process.exit(1);
}
const builtSize = statSync(BUILT_MAIN).size;
if (builtSize > MAX_PROD_SIZE) {
	console.error(`${BUILT_MAIN} is ${(builtSize / 1024 / 1024).toFixed(1)} MB — too large for a production build.`);
	console.error("Check scripts/esbuild.config.mjs — minify and sourcemap settings should both gate on the prod flag.");
	process.exit(1);
}
console.log(`✓ Build looks healthy: ${(builtSize / 1024).toFixed(0)} KB, no inline sourcemap`);

// --- Track state for recovery ---
let commitMade = false;
const changedFiles = [];

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

	// --- 5) commit and tag ---
	console.log("Committing...");
	run('git add package.json package-lock.json manifest.json');
	fileAddIfExists("versions.json");
	run(`git commit -m "release: v${v}"`);
	run(`git tag "${v}"`);
	commitMade = true;

	// --- 6) push ---
	console.log("Pushing...");
	run("git push");
	run("git push --tags");

	console.log(`\n✅ Released v${v}`);
	console.log("\nNext steps:");
	console.log("  1. Go to the GitHub repository");
	console.log("  2. Create a new release from tag v" + v);
	console.log("  3. Upload these files as loose release assets:");
	console.log(`     - ${BUILT_MAIN}`);
	console.log("     - manifest.json");
	console.log("     - styles.css");

} catch (err) {
	console.error("\n❌ Release failed!\n");
	console.error("Error:", err.message || err);

	if (commitMade) {
		// Commit was made but push failed
		console.error("\nCommit was created but push failed. To recover:");
		console.error(`  git reset --soft HEAD~1`);
		console.error(`  git tag -d ${v}`);
		console.error(`  git checkout -- ${changedFiles.join(" ")}`);
	} else if (changedFiles.length > 0) {
		// Files were modified but no commit yet
		console.error("\nTo recover, run:");
		console.error(`  git checkout -- ${changedFiles.join(" ")}`);
	}
	// If neither, build failed before any changes - no recovery needed

	process.exit(1);
}
